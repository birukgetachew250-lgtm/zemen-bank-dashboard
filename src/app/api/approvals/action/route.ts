
'use server';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { executeQuery } from '@/lib/oracle-db';
import { encrypt } from '@/lib/crypto';
import crypto from 'crypto';
import { Prisma } from "@prisma/client";
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import { logActivity, type ActivityLogAction } from '@/lib/activity-log';
import { sendSms } from '@/services/sms-service';

const extractRequesterBranch = (details?: string | null): string | null => {
    if (!details) return null;

    try {
        const parsed = JSON.parse(details);
        return parsed?.requestContext?.requesterBranch || parsed?.customerData?.branch || null;
    } catch {
        return null;
    }
};

const approvalTypeToActionMap: Record<string, ActivityLogAction> = {
    'new-customer': 'CUSTOMER_CREATE_APPROVED',
    'updated-customer': 'CUSTOMER_UPDATE_APPROVED',
    'suspend-customer': 'CUSTOMER_SUSPEND_APPROVED',
    'unsuspend-customer': 'CUSTOMER_UNSUSPEND_APPROVED',
    'resend-activation-code': 'CUSTOMER_RESEND_ACTIVATION_APPROVED',
    'pin-reset': 'PIN_RESET_APPROVED',
    'customer-account': 'ACCOUNT_LINK_APPROVED',
    'unlink-account': 'ACCOUNT_UNLINK_APPROVED',
    'reset-security-questions': 'SECURITY_RESET_APPROVED',
};

const requireNonEmptyString = (value: unknown, fieldName: string): string => {
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`${fieldName} is required.`);
    }

    return value.trim();
};

const hashSha256 = (value: unknown, fieldName: string): string => {
    const normalizedValue = requireNonEmptyString(value, fieldName);
    return crypto.createHash('sha256').update(normalizedValue).digest('hex');
};

const getLinkedAccountNumber = (account: any): string => {
    if (typeof account === 'string') return account;
    if (typeof account === 'number') return String(account);

    return (
        account?.CUSTACNO ||
        account?.custacno ||
        account?.accountNumber ||
        account?.account_number ||
        account?.accountNo ||
        account?.acctNo ||
        account?.account?.CUSTACNO ||
        account?.account?.custacno ||
        account?.account?.accountNumber ||
        ''
    );
};

const getLinkedAccountType = (account: any): string => {
    if (typeof account === 'string' || typeof account === 'number') return 'Unknown';

    return account?.ACCLASSDESC || account?.acclassdesc || account?.accountType || account?.account_type || 'Unknown';
};

const getLinkedAccountCurrency = (account: any): string => {
    if (typeof account === 'string' || typeof account === 'number') return 'ETB';

    return account?.CCY || account?.ccy || account?.currency || 'ETB';
};

const getLinkedAccountBranchCode = (account: any): string => {
    if (typeof account === 'string' || typeof account === 'number') return '';

    return account?.BRANCH_CODE || account?.branch_code || account?.branchCode || '';
};

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
    const session = await requirePermission(PERMISSIONS.APPROVALS_ACTION);
    if (session instanceof NextResponse) return session;

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    let approvalId: number | undefined;

    try {
        const { approvalId: id, action } = await req.json();
        approvalId = id;

        if (!approvalId || !action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
        }
        
        const approval = await db.pendingApproval.findUnique({ where: { id: approvalId } });
        
        if (!approval) {
             return NextResponse.json({ message: 'Approval not found' }, { status: 404 });
        }

        const sessionEmail = session?.user?.email;
        if (!sessionEmail) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const approver = await db.user.findUnique({
            where: { email: sessionEmail },
            select: { role: true, branch: true },
        });

        if (!approver) {
            return NextResponse.json({ message: 'Approver account not found' }, { status: 403 });
        }

        const requesterBranch = extractRequesterBranch(approval.details);
        const isSuperAdmin = approver.role === 'Super Admin';
        const isSameBranch = Boolean(approver.branch && requesterBranch && approver.branch === requesterBranch);

        // ── Maker-Checker: block self-approval for ALL roles ──────────────────
        // The same user who submitted the request (maker) must not approve it (checker).
        const makerEmail = (approval as any).requestedByEmail;
        if (makerEmail && makerEmail === sessionEmail) {
            await logActivity({
                userEmail: sessionEmail,
                action: 'REQUEST_REJECTED',
                status: 'Failure',
                details: `Self-approval attempt blocked for request ID ${approval.id} (type: ${approval.type}). Maker and checker must be different users.`,
                ipAddress: typeof ip === 'string' ? ip : undefined,
            });
            return NextResponse.json({
                message: 'Maker-Checker violation: you cannot approve a request that you submitted.',
            }, { status: 403 });
        }
        // ─────────────────────────────────────────────────────────────────────

        if (!isSuperAdmin && !isSameBranch) {

            return NextResponse.json({
                message: 'This request can only be actioned by users from the same branch as the requester.',
            }, { status: 403 });
        }

        const logDetails = `Request ID: ${approval.id}, Type: ${approval.type}, Customer: ${approval.customerName} (${approval.customerPhone})`;

        if (action === 'reject') {
            await db.pendingApproval.delete({ where: { id: approvalId } });
             await logActivity({
                userEmail: session?.user?.email || 'system',
                action: 'REQUEST_REJECTED',
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
            
        const updateUserStatusQuery = `UPDATE "USER_MODULE"."AppUsers" SET "MobileStatus" = :status, "UssdStatus" = :status WHERE "CIFNumber" = :cif`;
        let successMessage = 'Request has been approved and actioned.';
        let responseData: any = { success: true };

        switch (approval.type) {
             case 'new-customer':
                console.log('[APPROVAL_ACTION] Processing new-customer approval for ID:', approval.id);
                if (!approval.details) {
                    throw new Error(`Approval request ${approval.id} is missing details.`);
                }
                const approvalDetails = JSON.parse(approval.details);
                console.log('[APPROVAL_ACTION] Parsed approvalDetails:', JSON.stringify(approvalDetails, null, 2));

                const { customerData, linkedAccounts, onboardingData } = approvalDetails;

                if (!customerData || !linkedAccounts || !onboardingData) {
                    console.error('[APPROVAL_ACTION] Incomplete data for approval:', { customerData: !!customerData, linkedAccounts: !!linkedAccounts, onboardingData: !!onboardingData });
                    throw new Error('Incomplete customer, account, or onboarding data in approval request.');
                }
                
                const appUserId = crypto.randomUUID();
                
                const fullName = customerData.full_name || '';
                console.log('[APPROVAL_ACTION] Customer full name from details:', `"${fullName}"`);

                const nameParts = fullName.trim().split(' ').filter(Boolean);
                console.log('[APPROVAL_ACTIONS] Parsed name parts:', nameParts);
 
                if (nameParts.length === 0) {
                    console.error('[APPROVAL_ACTION] Error: nameParts array is empty. fullName was:', `"${fullName}"`);
                    throw new Error(`Invalid or empty customer name provided: "${fullName}"`);
                }

                let firstName, secondName = '', lastName;
                if (nameParts.length === 1) {
                    firstName = nameParts[0];
                    lastName = nameParts[0]; 
                } else if (nameParts.length === 2) {
                    firstName = nameParts[0];
                    lastName = nameParts[1];
                } else {
                    firstName = nameParts[0];
                    secondName = nameParts.slice(1, -1).join(' ');
                    lastName = nameParts[nameParts.length - 1];
                }

                if (!lastName) {
                    console.warn(`[APPROVAL_ACTION] lastName was falsy for fullName: "${fullName}". Using firstName as fallback.`);
                    lastName = firstName;
                }

                console.log('[APPROVAL_ACTION] Derived names:', { firstName, secondName, lastName });
                
                const normalizedPhone = requireNonEmptyString(customerData.mobile_number, 'Customer mobile number').replace(/\D/g, '');
                const phoneHash = hashSha256(normalizedPhone, 'Customer mobile number');

                const appUserQuery = `
                    INSERT INTO "USER_MODULE"."AppUsers" ("Id","CIFNumber","FirstName","SecondName","LastName","Email","PhoneNumber","PhoneNumberHashed","AddressLine1","AddressLine2","AddressLine3","AddressLine4","Nationality","BranchCode","BranchName","MobileStatus","UssdStatus","SignUp2FA","SignUpMainAuth","InsertDate","UpdateDate","InsertUser","UpdateUser","Version", "Channel") VALUES (SYS_GUID(),:CIFNumber,:FirstName,:SecondName,:LastName,:Email,:PhoneNumber,:PhoneNumberHashed,:AddressLine1,:AddressLine2,:AddressLine3,:AddressLine4,:Nationality,:BranchCode,:BranchName,:MobileStatus,:UssdStatus,:SignUp2FA,:SignUpMainAuth,SYSTIMESTAMP,SYSTIMESTAMP,'system','system',SYS_GUID(), :Channel)`;
                
                const appUserBinds = {
                    CIFNumber: customerData.customer_number,
                    FirstName: encrypt(firstName)!,
                    SecondName: encrypt(secondName)!,
                    LastName: encrypt(lastName)!,
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
                    MobileStatus: 'Pending',
                    UssdStatus: 'Pending',
                    SignUp2FA: onboardingData.twoFactorAuthMethod,
                    SignUpMainAuth: onboardingData.mainAuthMethod,
                    Channel: onboardingData.channel,
                };
                
                console.log('[APPROVAL_ACTION] AppUsers Binds:', { ...appUserBinds, PhoneNumber: '***', FirstName: '***', SecondName: '***', LastName: '***', Email: '***' });
                await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, appUserQuery, appUserBinds);

                for (const acc of linkedAccounts) {
                    const rawAccountNumber = getLinkedAccountNumber(acc);
                    const rawAccountType = getLinkedAccountType(acc);
                    const rawCurrency = getLinkedAccountCurrency(acc);
                    const rawBranchCode = getLinkedAccountBranchCode(acc);

                    const accountQuery = `INSERT INTO "USER_MODULE"."Accounts" ("Id","CIFNumber","AccountNumber","HashedAccountNumber","FirstName","SecondName","LastName","AccountType","Currency","Status","BranchCode","BranchName") VALUES (SYS_GUID(),:CIFNumber,:AccountNumber,:HashedAccountNumber,:FirstName,:SecondName,:LastName,:AccountType,:Currency,:Status,:BranchCode,:BranchName)`;
                    
                    const accBinds = {
                        CIFNumber: customerData.customer_number,
                        AccountNumber: encrypt(requireNonEmptyString(rawAccountNumber, 'Linked account number'))!,
                        HashedAccountNumber: hashSha256(rawAccountNumber, 'Linked account number'),
                        FirstName: encrypt(firstName)!,
                        SecondName: encrypt(secondName)!,
                        LastName: encrypt(lastName)!,
                        AccountType: encrypt(String(rawAccountType))!,
                        Currency: encrypt(String(rawCurrency))!,
                        Status: 'Active',
                        BranchCode: rawBranchCode,
                        BranchName: rawBranchCode
                    };
                    await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, accountQuery, accBinds);
                }

                const tempPassword = Math.floor(100000 + Math.random() * 900000).toString();
                
                const userSecurityQuery = `INSERT INTO SECURITY_MODULE."UserSecurities" ("UserId","CIFNumber","PinHash","Status","SecurityQuestionId","SecurityAnswer","IsLoggedIn","FailedAttempts","LastLoginAttempt","IsLocked","UnlockedTime","LockedIntervalMinutes","EncKey","EncIV","IsBiometricsLogin","IsBiometricsPayment","DeviceSwitchConsent","OnTmpPassword","IsActivationUsed","ActivationExpiredAt","InsertDate","UpdateDate","InsertUser","UpdateUser","Version") VALUES ('${appUserId}','${customerData.customer_number}',NULL,'Active',NULL,NULL,0,0,NULL,0,NULL,0,NULL,NULL,0,0,1,1,0,SYSTIMESTAMP + 7,SYSTIMESTAMP,SYSTIMESTAMP,'system','system',SYS_GUID())`;
                await executeQuery(process.env.SECURITY_MODULE_DB_CONNECTION_STRING, userSecurityQuery, {});
                
                const otpId = crypto.randomUUID();
                const codeHash = crypto.createHash('sha256').update(tempPassword).digest('hex').toLowerCase();
                
                await executeQuery(process.env.OTP_MODULE_DB_CONNECTION_STRING, `INSERT INTO OTP_MODULE."OtpCodes" ("Id","UserId","CodeHash","Secret","OtpType","Purpose","IsUsed","Attempts","ExpiresAt","InsertDate","UpdateDate","InsertUser","UpdateUser","Version") VALUES ('${otpId}','${customerData.customer_number}','${codeHash}',NULL,'SmsCode','LoginMFA',0,0,SYSTIMESTAMP + INTERVAL '10' MINUTE,SYSTIMESTAMP,SYSTIMESTAMP,'system','system',SYS_GUID())`, {});
                await executeQuery(process.env.OTP_MODULE_DB_CONNECTION_STRING, `INSERT INTO OTP_MODULE."OtpUsers" ("UserId","Status","LockedUntil","InsertDate","UpdateDate","OtpCodeId") VALUES ('${customerData.customer_number}',0,NULL,SYSTIMESTAMP,SYSTIMESTAMP,'${otpId}')`, {});
                
                await db.customer.updateMany({ where: { phone: approval.customerPhone }, data: { status: 'Pending' } });
                
                const smsMessage = `Welcome to Zemen Mobile Banking. Your temporary password is ${tempPassword}. Get the app to start: App Store: https://apple.co/2ABCDEF, Play Store: https://bit.ly/2ABCDEF`;
                const smsResult = await sendSms(approval.customerPhone, smsMessage);

                if (smsResult.success) {
                    successMessage = 'New customer onboarded and welcome SMS with temporary password has been sent.';
                } else {
                    console.warn(`SMS sending failed for new customer ${approval.customerPhone}, but customer was created in DB.`);
                    successMessage = `New customer onboarded, but the welcome SMS failed to send. Please follow up with the customer manually.`;
                }
                
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
                        "Channel" = :channel,
                        "UpdateDate" = SYSTIMESTAMP,
                        "UpdateUser" = 'admin'
                    WHERE "CIFNumber" = :cif
                `;
                
                const updateBinds = {
                    email: encrypt(changes.email.new),
                    phoneNumber: encrypt(changes.phoneNumber.new),
                    signUpMainAuth: changes.signUpMainAuth.new,
                    signUp2FA: changes.signUp2FA.new,
                    channel: changes.channel.new,
                    cif: cif,
                };
                
                await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, updateQuery, updateBinds);
                
                await db.customer.updateMany({ where: { phone: changes.phoneNumber.old }, data: { phone: changes.phoneNumber.new } });
                
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
            case 'resend-activation-code':
                const resendActivationCode = Math.floor(100000 + Math.random() * 900000).toString();
                const resendCodeHash = crypto.createHash('sha256').update(resendActivationCode).digest('hex').toLowerCase();
                const resendOtpId = crypto.randomUUID();

                await executeQuery(
                    process.env.OTP_MODULE_DB_CONNECTION_STRING,
                    `INSERT INTO OTP_MODULE."OtpCodes" ("Id","UserId","CodeHash","Secret","OtpType","Purpose","IsUsed","Attempts","ExpiresAt","InsertDate","UpdateDate","InsertUser","UpdateUser","Version") VALUES (:Id,:UserId,:CodeHash,NULL,'SmsCode','LoginMFA',0,0,SYSTIMESTAMP + INTERVAL '10' MINUTE,SYSTIMESTAMP,SYSTIMESTAMP,'system','system',SYS_GUID())`,
                    {
                        Id: resendOtpId,
                        UserId: cif,
                        CodeHash: resendCodeHash,
                    }
                );

                const otpUserExistsResult: any = await executeQuery(
                    process.env.OTP_MODULE_DB_CONNECTION_STRING,
                    `SELECT COUNT(1) AS "CNT" FROM OTP_MODULE."OtpUsers" WHERE "UserId" = :userId`,
                    { userId: cif }
                );

                const otpUserExists = Number(otpUserExistsResult?.rows?.[0]?.CNT || 0) > 0;

                if (otpUserExists) {
                    await executeQuery(
                        process.env.OTP_MODULE_DB_CONNECTION_STRING,
                        `UPDATE OTP_MODULE."OtpUsers" SET "Status" = 0, "LockedUntil" = NULL, "UpdateDate" = SYSTIMESTAMP, "OtpCodeId" = :otpCodeId WHERE "UserId" = :userId`,
                        {
                            otpCodeId: resendOtpId,
                            userId: cif,
                        }
                    );
                } else {
                    await executeQuery(
                        process.env.OTP_MODULE_DB_CONNECTION_STRING,
                        `INSERT INTO OTP_MODULE."OtpUsers" ("UserId","Status","LockedUntil","InsertDate","UpdateDate","OtpCodeId") VALUES (:userId,0,NULL,SYSTIMESTAMP,SYSTIMESTAMP,:otpCodeId)`,
                        {
                            userId: cif,
                            otpCodeId: resendOtpId,
                        }
                    );
                }

                await executeQuery(
                    process.env.SECURITY_MODULE_DB_CONNECTION_STRING,
                    `UPDATE SECURITY_MODULE."UserSecurities" SET "OnTmpPassword" = 1, "IsActivationUsed" = 0, "ActivationExpiredAt" = SYSTIMESTAMP + 7, "UpdateDate" = SYSTIMESTAMP WHERE "CIFNumber" = :cif`,
                    { cif }
                );

                const resendSmsMessage = `Welcome to Zemen Mobile Banking. Your temporary password is ${resendActivationCode}. Get the app to start: App Store: https://apple.co/2ABCDEF, Play Store: https://bit.ly/2ABCDEF`;
                const resendSmsResult = await sendSms(approval.customerPhone, resendSmsMessage);

                if (resendSmsResult.success) {
                    successMessage = `Activation code has been resent successfully to ${approval.customerPhone}.`;
                } else {
                    successMessage = `Activation code was regenerated and saved, but SMS sending failed. Please retry or follow up manually.`;
                }
                break;
            case 'pin-reset':
                const newPin = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit PIN
                const newPinHash = crypto.createHash('sha256').update(newPin).digest('hex');
                
                const updateSecurityQuery = `
                    UPDATE "SECURITY_MODULE"."UserSecurities" 
                    SET 
                        "PinHash" = :pinHash, 
                        "OnPinReset" = 1,
                        "FailedAttempts" = 0,
                        "Status" = 'Active', 
                        "IsLocked" = 0, 
                        "UnlockedTime" = :unlockedTime, 
                        "LockedIntervalMinutes" = 0,
                        "UpdateDate" = SYSTIMESTAMP,
                        "UpdateUser" = 'system'
                    WHERE "CIFNumber" = :cif`;
                
                await executeQuery(process.env.SECURITY_MODULE_DB_CONNECTION_STRING, updateSecurityQuery, {
                    pinHash: newPinHash,
                    unlockedTime: new Date(),
                    cif: cif,
                });
                
                const smsPinResetMessage = `Your new temporary PIN for Zemen Mobile is: ${newPin}. Please change it after your next login.`;
                const pinResetSmsResult = await sendSms(approval.customerPhone, smsPinResetMessage);

                if (pinResetSmsResult.success) {
                    successMessage = `PIN for customer ${approval.customerName} has been reset and sent via SMS.`;
                } else {
                    console.warn(`SMS sending failed for PIN reset to ${approval.customerPhone}, but PIN was reset in DB.`);
                    successMessage = `PIN reset was successful, but the SMS notification failed. Please provide the new PIN to the customer manually.`;
                }
                break;
            case 'customer-account':
                const linkDetails = JSON.parse(approval.details || '{}');
                const accountsToLink =
                    linkDetails.linkedAccounts ||
                    linkDetails.accountsToLink ||
                    linkDetails.accounts ||
                    [];
                
                const linkNameParts = (linkDetails.customerName || approval.customerName || '').trim().split(' ').filter(Boolean);
                if (linkNameParts.length === 0) throw new Error('Invalid customer name for account linking.');
                
                let linkFirstName, linkSecondName = '', linkLastName;
                 if (linkNameParts.length === 1) {
                    linkFirstName = linkNameParts[0];
                    linkLastName = linkNameParts[0];
                } else if (linkNameParts.length === 2) {
                    linkFirstName = linkNameParts[0];
                    linkLastName = linkNameParts[1];
                } else {
                    linkFirstName = linkNameParts[0];
                    linkSecondName = linkNameParts.slice(1, -1).join(' ');
                    linkLastName = linkNameParts[linkNameParts.length - 1];
                }
                
                if (!linkLastName) {
                    console.warn(`[APPROVAL_ACTION] linkLastName was falsy for customerName: "${linkDetails.customerName}". Using linkFirstName as fallback.`);
                    linkLastName = linkFirstName;
                }

                for (const acc of accountsToLink) {
                    const rawAccountNumber = getLinkedAccountNumber(acc);
                    const rawAccountType = getLinkedAccountType(acc);
                    const rawCurrency = getLinkedAccountCurrency(acc);
                    const rawBranchCode = getLinkedAccountBranchCode(acc);

                    const accountQuery = `INSERT INTO "USER_MODULE"."Accounts" ("Id", "CIFNumber", "AccountNumber", "HashedAccountNumber", "FirstName", "SecondName", "LastName", "AccountType", "Currency", "Status", "BranchCode", "BranchName") 
                        VALUES (SYS_GUID(), :CIFNumber, :AccountNumber, :HashedAccountNumber, :FirstName, :SecondName, :LastName, :AccountType, :Currency, :Status, :BranchCode, :BranchName)`;
                    
                    const accBinds = {
                        CIFNumber: linkDetails.cif || cif,
                        AccountNumber: encrypt(requireNonEmptyString(rawAccountNumber, 'Linked account number'))!,
                        HashedAccountNumber: hashSha256(rawAccountNumber, 'Linked account number'),
                        FirstName: encrypt(linkFirstName)!,
                        SecondName: encrypt(linkSecondName)!,
                        LastName: encrypt(linkLastName)!,
                        AccountType: encrypt(String(rawAccountType))!,
                        Currency: encrypt(String(rawCurrency))!,
                        Status: 'Active',
                        BranchCode: rawBranchCode,
                        BranchName: rawBranchCode
                    };
                    await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, accountQuery, accBinds);
                }
                successMessage = `Successfully linked ${accountsToLink.length} account(s).`;
                break;
            case 'unlink-account':
                const unlinkDetails = JSON.parse(approval.details || '{}');
                const hashedAccountNumber = hashSha256(unlinkDetails.accountNumber, 'Account number to unlink');
                const unlinkQuery = `UPDATE "USER_MODULE"."Accounts" SET "Status" = 'Unlinked' WHERE "HashedAccountNumber" = :hashedAccountNumber`;
                await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, unlinkQuery, { hashedAccountNumber });
                successMessage = `Successfully unlinked account ${unlinkDetails.accountNumber}.`;
                break;
        }

        await db.pendingApproval.delete({ where: { id: approvalId } });
        
        const logAction = approvalTypeToActionMap[approval.type];
        if (logAction) {
            await logActivity({
                userEmail: session?.user?.email || 'system',
                action: logAction,
                status: 'Success',
                details: `Approved: ${logDetails}`,
                ipAddress: typeof ip === 'string' ? ip : undefined,
            });
        }


        responseData.message = successMessage;
        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error('Approval action failed:', error);
         await logActivity({
            userEmail: session?.user?.email || 'system',
            action: 'REQUEST_REJECTED', // Fallback to a generic failure action
            status: 'Failure',
            details: `Failed to process approval for request ID ${approvalId}. Reason: ${error.message}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
