
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { executeQuery } from '@/lib/oracle-db';
import { encrypt } from '@/lib/crypto';
import crypto from 'crypto';
import { Prisma } from "@prisma/client";
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { logActivity } from '@/lib/activity-log';

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
        try {
            const encryptedPhone = encrypt(approval.customerPhone);
        } catch (e) {
            console.error("Error during Oracle fallback to get CIF:", e);
        }
    }
    
    return null;
}


export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    
    try {
        const { approvalId, action } = await req.json();

        if (!approvalId || !action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
        }
        
        const approval = await db.pendingApproval.findUnique({ where: { id: approvalId } });
        
        if (!approval) {
             return NextResponse.json({ message: 'Approval not found' }, { status: 404 });
        }

        const logDetails = `Request ID: ${approval.id}, Type: ${approval.type}, Customer: ${approval.customerName} (${approval.customerPhone})`;

        if (action === 'reject') {
            await db.pendingApproval.delete({ where: { id: approvalId } });
             await logActivity({
                userEmail: session?.user?.email || 'system',
                action: 'APPROVAL_PROCESSED',
                status: 'Success',
                details: `Rejected: ${logDetails}`,
                ipAddress: typeof ip === 'string' ? ip : undefined,
            });
            return NextResponse.json({ success: true, message: `Request has been rejected` });
        }

        // --- Handle Approval ---
        
        const cif = await getCifFromApproval(approval);

        if (!cif && approval.type !== 'new-customer') {
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
                
                const normalizedPhone = customerData.mobile_number.replace(/\D/g, '');
                const phoneHash = crypto.createHash('sha256').update(normalizedPhone).digest('hex');

                const appUserQuery = `
                    INSERT INTO "USER_MODULE"."AppUsers" ("Id","CIFNumber","FirstName","SecondName","LastName","Email","PhoneNumber","PhoneNumberHashed","AddressLine1","AddressLine2","AddressLine3","AddressLine4","Nationality","BranchCode","BranchName","Status","SignUp2FA","SignUpMainAuth","InsertDate","UpdateDate","InsertUser","UpdateUser","Version", "Channel") VALUES (SYS_GUID(),:CIFNumber,:FirstName,:SecondName,:LastName,:Email,:PhoneNumber,:PhoneNumberHashed,:AddressLine1,:AddressLine2,:AddressLine3,:AddressLine4,:Nationality,:BranchCode,:BranchName,:Status,:SignUp2FA,:SignUpMainAuth,SYSTIMESTAMP,SYSTIMESTAMP,'system','system',SYS_GUID(), :Channel)`;
                
                const appUserBinds = {
                    CIFNumber: customerData.customer_number,
                    FirstName: encrypt(nameParts[0])!,
                    SecondName: encrypt(nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : (nameParts[1] || ''))!,
                    LastName: encrypt(nameParts[nameParts.length - 1])!,
                    Email: encrypt(customerData.email_id)!,
                    PhoneNumber: encrypt(normalizedPhone)!,
                    PhoneNumberHashed: phoneHash,
                    AddressLine1: customerData.address_line_1,
                    AddressLine2: customerData.address_line_2,
                    AddressLine3: customerData.address_line_3,
                    AddressLine4: customerData.address_line_4,
                    Nationality: customerData.country,
                    BranchCode: customerData.branch,
                    BranchName: customerData.branch,
                    Status: 'Pending',
                    SignUp2FA: onboardingData.twoFactorAuthMethod,
                    SignUpMainAuth: onboardingData.mainAuthMethod,
                    Channel: onboardingData.channel,
                };

                await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, appUserQuery, appUserBinds);

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
                        BranchName: acc.BRANCH_CODE, 
                        AccountType: encrypt(acc.ACCLASSDESC)!,
                        Currency: encrypt(acc.CCY)!,
                        Status: 'Active',
                    };
                    await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, accountQuery, accountBinds);
                }

                const tempPassword = Math.floor(100000 + Math.random() * 900000).toString();
                
                const userSecurityQuery = `INSERT INTO SECURITY_MODULE."UserSecurities" ("UserId","CIFNumber","PinHash","Status","SecurityQuestionId","SecurityAnswer","IsLoggedIn","FailedAttempts","LastLoginAttempt","IsLocked","UnlockedTime","LockedIntervalMinutes","EncKey","EncIV","IsBiometricsLogin","IsBiometricsPayment","DeviceSwitchConsent","OnTmpPassword","IsActivationUsed","ActivationExpiredAt","InsertDate","UpdateDate","InsertUser","UpdateUser","Version") VALUES ('${appUserId}','${customerData.customer_number}',NULL,'Active',NULL,NULL,0,0,NULL,0,NULL,0,NULL,NULL,0,0,1,1,0,SYSTIMESTAMP + 7,SYSTIMESTAMP,SYSTIMESTAMP,'system','system',SYS_GUID())`;
                await executeQuery(process.env.SECURITY_MODULE_DB_CONNECTION_STRING, userSecurityQuery, {});
                
                const otpId = crypto.randomUUID();
                const codeHash = crypto.createHash('sha256').update(tempPassword).digest('hex').toLowerCase();
                
                await executeQuery(process.env.OTP_MODULE_DB_CONNECTION_STRING, `INSERT INTO OTP_MODULE."OtpCodes" ("Id","UserId","CodeHash","Secret","OtpType","Purpose","IsUsed","Attempts","ExpiresAt","InsertDate","UpdateDate","InsertUser","UpdateUser","Version") VALUES ('${otpId}','${customerData.customer_number}','${codeHash}',NULL,'SmsCode','LoginMFA',0,0,SYSTIMESTAMP + INTERVAL '10' MINUTE,SYSTIMESTAMP,SYSTIMESTAMP,'system','system',SYS_GUID())`, {});
                await executeQuery(process.env.OTP_MODULE_DB_CONNECTION_STRING, `INSERT INTO OTP_MODULE."OtpUsers" ("UserId","Status","LockedUntil","InsertDate","UpdateDate","OtpCodeId") VALUES ('${customerData.customer_number}',0,NULL,SYSTIMESTAMP,SYSTIMESTAMP,'${otpId}')`, {});

                
                await db.customer.updateMany({ where: { phone: approval.customerPhone }, data: { status: 'Active' } });
                
                responseData.tempPassword = tempPassword;
                successMessage = 'New customer has been successfully onboarded and activated.';
                break;
            case 'updated-customer':
                const updateDetails = JSON.parse(approval.details || '{}');
                const { changes } = updateDetails;
                if (!changes) throw new Error('Update details are missing from approval request.');

                const updateQuery = `
                    UPDATE "USER_MODULE"."AppUsers" SET
                        "Email" = :email,
                        "PhoneNumber" = :phoneNumber,
                        "SignUpMainAuth" = :signUpMainAuth,
                        "SignUp2FA" = :signUp2FA,
                        "UpdateDate" = SYSTIMESTAMP,
                        "UpdateUser" = 'admin'
                    WHERE "CIFNumber" = :cif
                `;
                
                const updateBinds = {
                    email: encrypt(changes.email.new),
                    phoneNumber: encrypt(changes.phoneNumber.new),
                    signUpMainAuth: changes.signUpMainAuth.new,
                    signUp2FA: changes.signUp2FA.new,
                    cif: cif,
                };
                
                await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, updateQuery, updateBinds);
                
                await db.customer.updateMany({ where: { phone: changes.phoneNumber.old }, data: { phone: changes.phoneNumber.new, name: changes.email.new } });
                
                successMessage = `Customer profile for CIF ${cif} has been updated.`;
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
                const accountsToLink = linkDetails.linkedAccounts || [];
                
                const customerNameParts = linkDetails.customerName.split(' ');

                for (const acc of accountsToLink) {
                    const accountQuery = `INSERT INTO "USER_MODULE"."Accounts" 
                        ("Id", "CIFNumber", "AccountNumber", "HashedAccountNumber", "FirstName", "SecondName", "LastName", "AccountType", "Currency", "Status", "BranchCode", "BranchName") 
                        VALUES (SYS_GUID(), :CIFNumber, :AccountNumber, :HashedAccountNumber, :FirstName, :SecondName, :LastName, :AccountType, :Currency, :Status, :BranchCode, :BranchName)`;
                    
                    const accBinds = {
                        CIFNumber: linkDetails.cif,
                        AccountNumber: encrypt(acc.CUSTACNO)!,
                        HashedAccountNumber: crypto.createHash('sha256').update(acc.CUSTACNO).digest('hex'),
                        FirstName: encrypt(customerNameParts[0])!,
                        SecondName: encrypt(customerNameParts.length > 2 ? customerNameParts.slice(1, -1).join(' ') : (customerNameParts[1] || ''))!,
                        LastName: encrypt(customerNameParts[nameParts.length - 1])!,
                        AccountType: encrypt(acc.ACCLASSDESC)!,
                        Currency: encrypt(acc.CCY)!,
                        Status: 'Active',
                        BranchCode: acc.BRANCH_CODE,
                        BranchName: acc.BRANCH_CODE
                    };
                    await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, accountQuery, accBinds);
                }
                successMessage = `Successfully linked ${accountsToLink.length} account(s).`;
                break;
            case 'unlink-account':
                const unlinkDetails = JSON.parse(approval.details || '{}');
                const hashedAccountNumber = crypto.createHash('sha256').update(unlinkDetails.accountNumber).digest('hex');
                const unlinkQuery = `UPDATE "USER_MODULE"."Accounts" SET "Status" = 'Unlinked' WHERE "HashedAccountNumber" = :hashedAccountNumber`;
                await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, unlinkQuery, { hashedAccountNumber });
                successMessage = `Successfully unlinked account ${unlinkDetails.accountNumber}.`;
                break;
        }

        await db.pendingApproval.delete({ where: { id: approvalId } });
        
        await logActivity({
            userEmail: session?.user?.email || 'system',
            action: 'APPROVAL_PROCESSED',
            status: 'Success',
            details: `Approved: ${logDetails}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });


        responseData.message = successMessage;
        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error('Approval action failed:', error);
         await logActivity({
            userEmail: session?.user?.email || 'system',
            action: 'APPROVAL_PROCESSED',
            status: 'Failure',
            details: `Failed to process approval for request ID ${req.url}. Reason: ${error.message}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
