
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { executeQuery } from '@/lib/oracle-db';
import { encrypt } from '@/lib/crypto';
import crypto from 'crypto';
import { Prisma } from "@prisma/client";

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
            // This is a conceptual fallback. In reality, AppUsers might not exist yet.
            // The logic primarily relies on details from the approval request itself.
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

        if (!cif && approval.type !== 'new-customer') {
             // For new customers, CIF comes from details, not a pre-existing record.
            console.error(`Could not determine CIF for approvalId: ${approvalId}. Approval removed without action.`);
            await db.pendingApproval.delete({ where: { id: approvalId } });
            throw new Error(`Could not determine customer CIF for approval ID ${approvalId}. The request was cleared without action.`);
        }
            
        const updateUserStatusQuery = `UPDATE "USER_MODULE"."AppUsers" SET "Status" = :status WHERE "CIFNumber" = :cif`;
        let successMessage = 'Request has been approved and actioned.';
        let responseData: any = { success: true };

        switch (approval.type) {
             case 'new-customer':
                const approvalDetails = JSON.parse(approval.details || '{}');
                const { customerData, linkedAccounts, onboardingData } = approvalDetails;
                
                if (!customerData || !linkedAccounts || !onboardingData) {
                    throw new Error('Incomplete customer, account, or onboarding data in approval request.');
                }
                
                const appUserId = crypto.randomUUID();
                const nameParts = customerData.full_name.split(' ');
                
                // --- Create AppUser ---
                const appUserQuery = `
                    INSERT INTO USER_MODULE."AppUsers" ("Id","CIFNumber","FirstName","SecondName","LastName","Email","PhoneNumber","AddressLine1","AddressLine2","AddressLine3","AddressLine4","Nationality","BranchCode","BranchName","Status","SignUp2FA","SignUpMainAuth","InsertDate","UpdateDate","InsertUser","UpdateUser","Version", "Channel") VALUES (SYS_GUID(),:CIFNumber,:FirstName,:SecondName,:LastName,:Email,:PhoneNumber,:AddressLine1,:AddressLine2,:AddressLine3,:AddressLine4,:Nationality,:BranchCode,:BranchName,:Status,:SignUp2FA,:SignUpMainAuth,SYSTIMESTAMP,SYSTIMESTAMP,'system','system',SYS_GUID(), :Channel)`;
                
                const appUserBinds = {
                    CIFNumber: customerData.customer_number,
                    FirstName: encrypt(nameParts[0])!,
                    SecondName: encrypt(nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : (nameParts[1] || ''))!,
                    LastName: encrypt(nameParts[nameParts.length - 1])!,
                    Email: encrypt(customerData.email_id)!,
                    PhoneNumber: encrypt(customerData.mobile_number)!,
                    AddressLine1: customerData.address_line_1,
                    AddressLine2: customerData.address_line_2,
                    AddressLine3: customerData.address_line_3,
                    AddressLine4: customerData.address_line_4,
                    Nationality: customerData.country,
                    BranchCode: customerData.branch,
                    BranchName: customerData.branch, // This might need a lookup in a real scenario
                    Status: 'Pending',
                    SignUp2FA: onboardingData.twoFactorAuthMethod,
                    SignUpMainAuth: onboardingData.mainAuthMethod,
                    Channel: onboardingData.channel,
                };

                await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, appUserQuery, appUserBinds);

                // --- Create Accounts ---
                for (const acc of linkedAccounts) {
                    const accountQuery = `INSERT INTO "USER_MODULE"."Accounts" ("Id","CIFNumber","AccountNumber","HashedAccountNumber","FirstName","SecondName","LastName","BranchCode","BranchName","AccountType","Currency","Status","InsertDate","UpdateDate","InsertUser","UpdateUser","Version") VALUES (SYS_GUID(),:CIFNumber,:AccountNumber,:HashedAccountNumber,:FirstName,:SecondName,:LastName,:BranchCode,:BranchName,:AccountType,:Currency,:Status,SYSTIMESTAMP,SYSTIMESTAMP,'system','system',SYS_GUID())`;
                    
                    const accountBinds = {
                        CIFNumber: customerData.customer_number,
                        AccountNumber: encrypt(acc.CUSTACNO)!,
                        HashedAccountNumber: crypto.createHash('sha256').update(acc.CUSTACNO).digest('hex'),
                        FirstName: encrypt(nameParts[0])!,
                        SecondName: encrypt(nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : (nameParts[1] || ''))!,
                        LastName: encrypt(nameParts[nameParts.length - 1])!,
                        BranchCode: acc.BRANCH_CODE,
                        BranchName: acc.BRANCH_CODE, // Assuming branch name can be same as code for now
                        AccountType: encrypt(acc.ACCLASSDESC)!,
                        Currency: encrypt(acc.CCY)!,
                        Status: 'Active',
                    };
                    await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, accountQuery, accountBinds);
                }

                // --- Create UserSecurity with temp password ---
                const tempPassword = Math.floor(100000 + Math.random() * 900000).toString();
                
                const userSecurityQuery = `INSERT INTO SECURITY_MODULE."UserSecurities" ("UserId","CIFNumber","PinHash","Status","SecurityQuestionId","SecurityAnswer","IsLoggedIn","FailedAttempts","LastLoginAttempt","IsLocked","UnlockedTime","LockedIntervalMinutes","EncKey","EncIV","IsBiometricsLogin","IsBiometricsPayment","DeviceSwitchConsent","OnTmpPassword","IsActivationUsed","ActivationExpiredAt","InsertDate","UpdateDate","InsertUser","UpdateUser","Version") VALUES ('${appUserId}','${customerData.customer_number}',NULL,'Active',NULL,NULL,0,0,NULL,0,NULL,0,NULL,NULL,0,0,1,1,0,SYSTIMESTAMP + 7,SYSTIMESTAMP,SYSTIMESTAMP,'system','system',SYS_GUID())`;
                await executeQuery(process.env.SECURITY_MODULE_DB_CONNECTION_STRING, userSecurityQuery, {});
                
                // --- Create OTP for Temp Password ---
                const otpId = crypto.randomUUID();
                const codeHash = crypto.createHash('sha256').update(tempPassword).digest('hex').toLowerCase();
                
                await executeQuery(process.env.OTP_MODULE_DB_CONNECTION_STRING, `INSERT INTO OTP_MODULE."OtpCodes" ("Id","UserId","CodeHash","Secret","OtpType","Purpose","IsUsed","Attempts","ExpiresAt","InsertDate","UpdateDate","InsertUser","UpdateUser","Version") VALUES ('${otpId}','${customerData.customer_number}','${codeHash}',NULL,'SmsCode','LoginMFA',0,0,SYSTIMESTAMP + INTERVAL '10' MINUTE,SYSTIMESTAMP,SYSTIMESTAMP,'system','system',SYS_GUID())`, {});
                await executeQuery(process.env.OTP_MODULE_DB_CONNECTION_STRING, `INSERT INTO OTP_MODULE."OtpUsers" ("UserId","Status","LockedUntil","InsertDate","UpdateDate","OtpCodeId") VALUES ('${customerData.customer_number}',0,NULL,SYSTIMESTAMP,SYSTIMESTAMP,'${otpId}')`, {});

                
                await db.customer.updateMany({ where: { phone: approval.customerPhone }, data: { status: 'Active' } });
                
                responseData.tempPassword = tempPassword;
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
                const newPin = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit PIN
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
                    VALUES (SYS_GUID(), :CIFNumber, :AccountNumber, :HashedAccountNumber, :FirstName, :SecondName, :LastName, :AccountType, :Currency, :Status, :BranchName)`;
                
                const accNameParts = linkDetails.customerName.split(' ');
                
                const accBinds = {
                    CIFNumber: linkDetails.cif,
                    AccountNumber: encrypt(linkDetails.accountNumber)!,
                    HashedAccountNumber: crypto.createHash('sha256').update(linkDetails.accountNumber).digest('hex'),
                    FirstName: encrypt(accNameParts[0])!,
                    SecondName: encrypt(accNameParts.length > 2 ? accNameParts.slice(1, -1).join(' ') : (accNameParts[1] || ''))!,
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

    