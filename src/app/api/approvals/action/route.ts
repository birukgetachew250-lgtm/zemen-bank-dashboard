
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { executeQuery } from '@/lib/oracle-db';
import { encrypt } from '@/lib/crypto';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';

const getCifFromApproval = async (approval: any) => {
    if (approval.details) {
        try {
            const detailsObject = JSON.parse(approval.details);
            if (detailsObject.cif) {
                return detailsObject.cif;
            }
        } catch (e) {
            console.warn("Could not parse CIF from approval details JSON:", e);
        }
    }

    if (approval.customerPhone) {
        // This is a fallback and assumes the user is already in the Oracle DB,
        // which isn't true for 'new-customer'. We primarily rely on the details JSON.
        try {
            const encryptedPhone = encrypt(approval.customerPhone);
            const userResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, `SELECT "CIFNumber" FROM "USER_MODULE"."AppUsers" WHERE "PhoneNumber" = :phone`, {phone: encryptedPhone});
            if (userResult && userResult.rows && userResult.rows.length > 0) {
                return userResult.rows[0].CIFNumber;
            }
        } catch (e) {
            console.error("Error during Oracle fallback to get CIF:", e);
        }
    }
    
    return null;
}


export async function POST(req: Request) {
    try {
        const { approvalId, action } = await req.json();

        if (!approvalId || !action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
        }
        
        const approval = await db.pendingApproval.findUnique({ where: { id: approvalId } });
        
        if (!approval) {
             return NextResponse.json({ message: 'Approval not found' }, { status: 404 });
        }

        if (action === 'reject') {
            await db.pendingApproval.delete({ where: { id: approvalId } });
            return NextResponse.json({ success: true, message: `Request has been rejected` });
        }

        // --- Handle Approval ---
        
        const cif = await getCifFromApproval(approval);

        if (!cif) {
            await db.pendingApproval.delete({ where: { id: approvalId } });
            console.error(`Could not determine CIF for approvalId: ${approvalId}. Approval removed without action.`);
            throw new Error(`Could not determine customer CIF for approval ID ${approvalId}. The request was cleared without action.`);
        }
            
        const updateUserStatusQuery = `UPDATE "USER_MODULE"."AppUsers" SET "Status" = :status WHERE "CIFNumber" = :cif`;
        let successMessage = 'Request has been approved and actioned.';
        let responseData: any = { success: true };

        switch (approval.type) {
             case 'new-customer':
                const approvalDetails = JSON.parse(approval.details || '{}');
                const { customerData, linkedAccounts, onboardingData } = approvalDetails;
                
                const appUserId = `user_${crypto.randomUUID()}`;
                const nameParts = customerData.full_name.split(' ');
                
                // --- Create AppUser ---
                const appUserQuery = `
                    INSERT INTO "USER_MODULE"."AppUsers" 
                    ("Id", "CIFNumber", "FirstName", "SecondName", "LastName", "Email", "PhoneNumber", "Status", "SignUpMainAuth", "SignUp2FA", "BranchName", "AddressLine1", "Nationality", "Channel")
                    VALUES (:Id, :CIFNumber, :FirstName, :SecondName, :LastName, :Email, :PhoneNumber, :Status, :SignUpMainAuth, :SignUp2FA, :BranchName, :AddressLine1, :Nationality, :Channel)`;
                
                const appUserBinds = {
                    Id: appUserId,
                    CIFNumber: customerData.customer_number,
                    FirstName: encrypt(nameParts[0])!,
                    SecondName: encrypt(nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : nameParts[1])!,
                    LastName: encrypt(nameParts[nameParts.length - 1])!,
                    Email: encrypt(customerData.email_id)!,
                    PhoneNumber: encrypt(customerData.mobile_number)!,
                    Status: 'Active',
                    SignUpMainAuth: onboardingData.mainAuthMethod,
                    SignUp2FA: onboardingData.twoFactorAuthMethod,
                    BranchName: customerData.branch,
                    AddressLine1: customerData.address_line_1,
                    Nationality: customerData.country,
                    Channel: onboardingData.channel
                };

                await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, appUserQuery, appUserBinds);

                // --- Create Accounts ---
                for (const acc of linkedAccounts) {
                    const accountQuery = `
                        INSERT INTO "USER_MODULE"."Accounts" 
                        ("Id", "CIFNumber", "AccountNumber", "HashedAccountNumber", "FirstName", "SecondName", "LastName", "AccountType", "Currency", "Status", "BranchName") 
                        VALUES (:Id, :CIFNumber, :AccountNumber, :HashedAccountNumber, :FirstName, :SecondName, :LastName, :AccountType, :Currency, :Status, :BranchName)`;
                    
                    const accountId = `acc_${crypto.randomUUID()}`;
                    const accountBinds = {
                        Id: accountId,
                        CIFNumber: customerData.customer_number,
                        AccountNumber: encrypt(acc.CUSTACNO)!,
                        HashedAccountNumber: crypto.createHash('sha256').update(acc.CUSTACNO).digest('hex'),
                        FirstName: encrypt(nameParts[0])!,
                        SecondName: encrypt(nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : nameParts[1])!,
                        LastName: encrypt(nameParts[nameParts.length - 1])!,
                        AccountType: encrypt(acc.ACCLASSDESC)!,
                        Currency: encrypt(acc.CCY)!,
                        Status: 'Active',
                        BranchName: acc.BRANCH_CODE
                    };
                    await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, accountQuery, accountBinds);
                }

                // --- Create UserSecurity ---
                const userSecurityQuery = `
                    INSERT INTO "SECURITY_MODULE"."UserSecurities" 
                    ("UserId", "CIFNumber", "Status", "IsLocked") 
                    VALUES (:UserId, :CIFNumber, :Status, :IsLocked)`;
                
                await executeQuery(process.env.SECURITY_MODULE_DB_CONNECTION_STRING, userSecurityQuery, {
                    UserId: appUserId,
                    CIFNumber: customerData.customer_number,
                    Status: 'Active',
                    IsLocked: 0
                });
                
                await db.customer.updateMany({ where: { phone: approval.customerPhone }, data: { status: 'Active' } });
                successMessage = 'New customer has been successfully onboarded and activated.';
                break;
            case 'suspend-customer':
                await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, updateUserStatusQuery, { status: 'Suspended', cif });
                 await db.customer.updateMany({ where: { phone: approval.customerPhone }, data: { status: 'Suspended' } });
                break;
            case 'unsuspend-customer':
                 await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, updateUserStatusQuery, { status: 'Active', cif });
                 await db.customer.updateMany({ where: { phone: approval.customerPhone }, data: { status: 'Active' } });
                break;
            case 'pin-reset':
                const newPin = Math.floor(100000 + Math.random() * 900000).toString();
                const newPinHash = crypto.createHash('sha256').update(newPin).digest('hex');
                
                const updateSecurityQuery = `
                    UPDATE "SECURITY_MODULE"."UserSecurities" 
                    SET 
                        "PinHash" = :pinHash, 
                        "Status" = 'Active', 
                        "IsLocked" = 0, 
                        "UnlockedTime" = :unlockedTime, 
                        "LockedIntervalMinutes" = 0
                    WHERE "CIFNumber" = :cif`;
                
                await executeQuery(process.env.SECURITY_MODULE_DB_CONNECTION_STRING, updateSecurityQuery, {
                    pinHash: newPinHash,
                    unlockedTime: new Date(),
                    cif: cif,
                });
                
                responseData.newPin = newPin; // Add pin to response
                successMessage = `PIN for customer ${approval.customerName} has been reset.`
                break;
            case 'customer-account':
                const linkDetails = JSON.parse(approval.details || '{}');
                const accQuery = `INSERT INTO "USER_MODULE"."Accounts" 
                    ("Id", "CIFNumber", "AccountNumber", "HashedAccountNumber", "FirstName", "SecondName", "LastName", "AccountType", "Currency", "Status", "BranchName") 
                    VALUES (:Id, :CIFNumber, :AccountNumber, :HashedAccountNumber, :FirstName, :SecondName, :LastName, :AccountType, :Currency, :Status, :BranchName)`;
                
                const accNameParts = linkDetails.customerName.split(' ');
                const accId = `acc_${crypto.randomUUID()}`;
                
                const accBinds = {
                    Id: accId,
                    CIFNumber: linkDetails.cif,
                    AccountNumber: encrypt(linkDetails.accountNumber)!,
                    HashedAccountNumber: crypto.createHash('sha256').update(linkDetails.accountNumber).digest('hex'),
                    FirstName: encrypt(accNameParts[0])!,
                    SecondName: encrypt(accNameParts.length > 2 ? accNameParts.slice(1, -1).join(' ') : accNameParts[1])!,
                    LastName: encrypt(accNameParts[accNameParts.length - 1])!,
                    AccountType: encrypt(linkDetails.accountType)!,
                    Currency: encrypt(linkDetails.currency)!,
                    Status: 'Active',
                    BranchName: 'MAIN' // Placeholder
                };

                await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, accQuery, accBinds);
                successMessage = `Successfully linked account ${linkDetails.accountNumber}.`;
                break;
            case 'unlink-account':
                const unlinkDetails = JSON.parse(approval.details || '{}');
                const hashedAccountNumber = crypto.createHash('sha256').update(unlinkDetails.accountNumber).digest('hex');
                const unlinkQuery = `UPDATE "USER_MODULE"."Accounts" SET "Status" = 'Inactive' WHERE "HashedAccountNumber" = :hashedAccountNumber`;
                await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, unlinkQuery, { hashedAccountNumber });
                successMessage = `Successfully unlinked account ${unlinkDetails.accountNumber}.`;
                break;
        }

        await db.pendingApproval.delete({ where: { id: approvalId } });

        responseData.message = successMessage;
        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error('Approval action failed:', error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
