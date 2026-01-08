
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { encrypt } from '@/lib/crypto';

export async function POST(req: Request) {
    try {
        const { customer, accounts, manualData } = await req.json();

        // `customer` is from Flexcube query
        // `accounts` is the list of selected accounts
        // `manualData` contains fields like signUp2FA, signUpMainAuth
        if (!customer || !customer.customer_number || !accounts || !manualData) {
            return NextResponse.json({ message: 'Incomplete customer, account, or manual data' }, { status: 400 });
        }

        const appUserId = `user_${crypto.randomUUID()}`;
        const approvalId = `appr_${crypto.randomUUID()}`;
        const nameParts = customer.full_name.split(' ');
        
        const transaction = db.transaction(() => {
            // 1. Insert into AppUsers table with a 'registered' status.
            db.prepare(
                `INSERT INTO AppUsers 
                (Id, CIFNumber, FirstName, SecondName, LastName, Email, PhoneNumber, Status, SignUpMainAuth, SignUp2FA, BranchName, AddressLine1, AddressLine2, AddressLine3, AddressLine4, Nationality, Channel) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).run(
                appUserId,
                customer.customer_number,
                encrypt(nameParts[0]),
                encrypt(nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : nameParts[1]),
                encrypt(nameParts[nameParts.length - 1]),
                encrypt(customer.email_id),
                encrypt(customer.mobile_number),
                'Registered', // Initial status
                manualData.signUpMainAuth,
                manualData.signUp2FA,
                customer.branch,
                customer.address_line_1,
                customer.address_line_2,
                customer.address_line_3,
                customer.address_line_4,
                customer.country,
                manualData.channel // Add channel
            );

            // 2. Link accounts
            const insertAccount = db.prepare(
                'INSERT INTO Accounts (Id, CIFNumber, AccountNumber, FirstName, SecondName, LastName, AccountType, Currency, Status, BranchName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            for (const acc of accounts) {
                insertAccount.run(
                    `acc_${crypto.randomUUID()}`,
                    customer.customer_number,
                    encrypt(acc.CUSTACNO),
                    encrypt(nameParts[0]), // Encrypting name parts for account table
                    encrypt(nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : nameParts[1]),
                    encrypt(nameParts[nameParts.length - 1]),
                    encrypt(acc.ACCLASSDESC),
                    encrypt(acc.CCY),
                    acc.status,
                    acc.BRANCH_CODE
                );
            }

            // 3. Create initial security record
            db.prepare(
                'INSERT INTO UserSecurities (UserId, CIFNumber, Status) VALUES (?, ?, ?)'
            ).run(appUserId, customer.customer_number, 'Registered');
            
            // 4. Create a pending approval request for this new customer registration.
            const legacyCustomerId = `cust_${customer.customer_number}`; // for compatibility with approvals page
            db.prepare(
                'INSERT INTO customers (id, name, phone, status) VALUES (?, ?, ?, ?)'
            ).run(legacyCustomerId, customer.full_name, customer.mobile_number, 'registered');

            db.prepare(
                'INSERT INTO pending_approvals (id, customerId, type, customerName, customerPhone, details) VALUES (?, ?, ?, ?, ?, ?)'
            ).run(
                approvalId, 
                legacyCustomerId, 
                'new-customer', 
                customer.full_name, 
                customer.mobile_number, 
                JSON.stringify({ customerData: customer, linkedAccounts: accounts, onboardingData: manualData })
            );
        });

        transaction();

        return NextResponse.json({ success: true, message: 'Customer registration submitted for approval', customerId: appUserId });

    } catch (error: any) {
        console.error('Failed to create customer for approval:', error);
        // Better error for unique constraint violation
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return NextResponse.json({ message: 'A user with this CIF Number already exists.' }, { status: 409 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

    