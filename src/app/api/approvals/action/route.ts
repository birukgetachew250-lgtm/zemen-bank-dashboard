
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { executeQuery } from '@/lib/oracle-db';
import { encrypt } from '@/lib/crypto';
import crypto from 'crypto';

const getCifFromApproval = async (approval: any) => {
    // 1. Try to get CIF from the details JSON
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

    // 2. Fallback: Get phone from approval, then query Oracle for CIF
    if (approval.customerPhone) {
        try {
            console.log(`[Oracle Fallback] Searching for CIF with phone number: ${approval.customerPhone}`);
            const encryptedPhone = encrypt(approval.customerPhone);
            const userResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, `SELECT "CIFNumber" FROM "USER_MODULE"."AppUsers" WHERE "PhoneNumber" = :phone`, [encryptedPhone]);
            if (userResult && userResult.length > 0) {
                return userResult[0].CIFNumber;
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

        if (!cif && approval.type !== 'new-customer') { // For new customers, CIF is in details
            await db.pendingApproval.delete({ where: { id: approvalId } });
            console.error(`Could not determine CIF for approvalId: ${approvalId}. Approval removed without action.`);
            throw new Error(`Could not determine customer CIF for approval ID ${approvalId}. The request was cleared without action.`);
        }
            
        const updateUserStatusQuery = `UPDATE "USER_MODULE"."AppUsers" SET "Status" = :status WHERE "CIFNumber" = :cif`;
        let statusToSet = '';

        switch (approval.type) {
            case 'new-customer':
                statusToSet = 'Active';
                break;
            case 'suspend-customer':
                statusToSet = 'Suspended';
                break;
            case 'unsuspend-customer':
                statusToSet = 'Active';
                break;
            case 'pin-reset':
                console.log(`PIN reset approved for customer CIF ${cif}`);
                // Placeholder for actual PIN reset logic, no status change needed.
                break;
            case 'customer-account':
                const details = JSON.parse(approval.details || '{}');
                const accountQuery = `INSERT INTO "USER_MODULE"."Accounts" 
                    ("Id", "CIFNumber", "AccountNumber", "HashedAccountNumber", "FirstName", "SecondName", "LastName", "AccountType", "Currency", "Status", "BranchName") 
                    VALUES (:Id, :CIFNumber, :AccountNumber, :HashedAccountNumber, :FirstName, :SecondName, :LastName, :AccountType, :Currency, :Status, :BranchName)`;
                
                const nameParts = details.customerName.split(' ');
                const accountId = `acc_${crypto.randomUUID()}`;
                
                const accountBinds = {
                    Id: accountId,
                    CIFNumber: details.cif,
                    AccountNumber: encrypt(details.accountNumber),
                    HashedAccountNumber: crypto.createHash('sha256').update(details.accountNumber).digest('hex'),
                    FirstName: encrypt(nameParts[0]),
                    SecondName: encrypt(nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : nameParts[1]),
                    LastName: encrypt(nameParts[nameParts.length - 1]),
                    AccountType: encrypt(details.accountType),
                    Currency: encrypt(details.currency),
                    Status: 'Active',
                    BranchName: 'MAIN' // Placeholder
                };

                const accountResult = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, accountQuery, accountBinds);
                console.log(`Successfully linked account for CIF ${details.cif}. Result:`, accountResult);
                break;
            case 'unlink-account':
                const unlinkDetails = JSON.parse(approval.details || '{}');
                const unlinkQuery = `UPDATE "USER_MODULE"."Accounts" SET "Status" = 'Inactive' WHERE "AccountNumber" = :accountNumber`;
                const unlinkResult = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, unlinkQuery, { accountNumber: encrypt(unlinkDetails.accountNumber) });
                console.log(`Successfully unlinked account ${unlinkDetails.accountNumber}. Result:`, unlinkResult);
                break;
        }

        if (statusToSet) {
             const result: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, updateUserStatusQuery, { status: statusToSet, cif });
             console.log(`Successfully updated status to '${statusToSet}' for CIF ${cif} in Oracle DB. Rows affected: ${result?.rowsAffected || 0}`);
        }

        await db.pendingApproval.delete({ where: { id: approvalId } });

        return NextResponse.json({ success: true, message: `Request has been approved and actioned.` });

    } catch (error: any) {
        console.error('Approval action failed:', error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
