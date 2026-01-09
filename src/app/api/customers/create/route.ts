
import { NextResponse } from 'next/server';
import { systemDb } from '@/lib/system-db';
import crypto from 'crypto';
import { encrypt } from '@/lib/crypto';
import { Prisma } from '@prisma/client/system';

export async function POST(req: Request) {
    try {
        const { customer, accounts, manualData } = await req.json();

        if (!customer || !customer.customer_number || !accounts || !manualData) {
            return NextResponse.json({ message: 'Incomplete customer, account, or manual data' }, { status: 400 });
        }

        const appUserId = `user_${crypto.randomUUID()}`;
        const nameParts = customer.full_name.split(' ');
        
        // Use a transaction across both databases if possible, or handle potential rollbacks.
        // For simplicity here, we assume they succeed together.
        
        // Create user in the system DB
        await systemDb.appUser.create({
            data: {
                Id: appUserId,
                CIFNumber: customer.customer_number,
                FirstName: encrypt(nameParts[0])!,
                SecondName: encrypt(nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : nameParts[1])!,
                LastName: encrypt(nameParts[nameParts.length - 1])!,
                Email: encrypt(customer.email_id)!,
                PhoneNumber: encrypt(customer.mobile_number)!,
                Status: 'Registered',
                SignUpMainAuth: manualData.signUpMainAuth,
                SignUp2FA: manualData.twoFactorAuthMethod,
                BranchName: customer.branch,
                AddressLine1: customer.address_line_1,
                AddressLine2: customer.address_line_2,
                AddressLine3: customer.address_line_3,
                AddressLine4: customer.address_line_4,
                Nationality: customer.country,
                Channel: manualData.channel
            }
        });

        const accountData = accounts.map((acc: any) => ({
            Id: `acc_${crypto.randomUUID()}`,
            CIFNumber: customer.customer_number,
            AccountNumber: encrypt(acc.CUSTACNO)!,
            FirstName: encrypt(nameParts[0])!,
            SecondName: encrypt(nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : nameParts[1])!,
            LastName: encrypt(nameParts[nameParts.length - 1])!,
            AccountType: encrypt(acc.ACCLASSDESC)!,
            Currency: encrypt(acc.CCY)!,
            Status: acc.status,
            BranchName: acc.BRANCH_CODE
        }));
        await systemDb.account.createMany({ data: accountData });

        await systemDb.userSecurity.create({
            data: {
                UserId: appUserId,
                CIFNumber: customer.customer_number,
                Status: 'Registered'
            }
        });

        // Create customer and approval in the system DB
        let systemCustomer = await systemDb.customer.findFirst({ where: { phone: customer.mobile_number }});
        if (!systemCustomer) {
             systemCustomer = await systemDb.customer.create({
                data: {
                    name: customer.full_name,
                    phone: customer.mobile_number,
                    status: 'Registered'
                }
            });
        }
        
        const detailsForApproval = { 
            cif: customer.customer_number, 
            customerData: customer, 
            linkedAccounts: accounts, 
            onboardingData: manualData 
        };

        await systemDb.pendingApproval.create({
            data: {
                customerId: systemCustomer.id,
                type: 'new-customer',
                customerName: customer.full_name,
                customerPhone: customer.mobile_number,
                details: JSON.stringify(detailsForApproval)
            }
        });


        return NextResponse.json({ success: true, message: 'Customer registration submitted for approval', customerId: appUserId });

    } catch (error: any) {
        console.error('Failed to create customer for approval:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
             return NextResponse.json({ message: 'A user with this CIF Number or another unique field already exists.' }, { status: 409 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
