// src/scripts/seed-prod.js

const { PrismaClient } = require('@prisma/client');

// This seed script is ONLY for the production user management database (users and roles).
// It uses Prisma and connects via the DASH_PROD_MODULE_DATABASE_URL when NODE_ENV is 'production'.

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding PRODUCTION users and roles...');

    if (process.env.NODE_ENV !== 'production') {
        throw new Error(
            'This script is for production seeding only. Set NODE_ENV=production to run.'
        );
    }
    
    // Check if roles already exist to prevent duplicates
    const existingRolesCount = await prisma.role.count();
    if (existingRolesCount > 0) {
        console.log('Roles already exist, skipping role seeding.');
    } else {
        await prisma.role.createMany({
            data: [
                { name: 'Super Admin', description: 'Full access to all system features, including security settings.' },
                { name: 'Operations Lead', description: 'Manages day-to-day customer and transaction approvals.' },
                { name: 'Support Staff', description: 'Handles customer inquiries and first-level support tickets.' },
                { name: 'Compliance Officer', description: 'Audits trails, reviews high-risk transactions, and generates NBE reports.' },
                { name: 'Read-Only Auditor', description: 'View-only access to all transactional and user data for auditing purposes.' },
            ],
        });
        console.log('Seeded 5 roles.');
    }
    
    // Check if users already exist to prevent duplicates
    const existingUsersCount = await prisma.user.count();
    if (existingUsersCount > 0) {
        console.log('Users already exist, skipping user seeding.');
    } else {
        await prisma.user.createMany({
            data: [
                {
                    employeeId: 'admin001',
                    name: 'Admin User',
                    email: 'admin@zemen.com',
                    password: 'password', // In a real app, this should be a securely hashed password
                    role: 'Super Admin',
                    department: 'IT Department',
                    branch: 'Head Office',
                },
                {
                    employeeId: 'ops001',
                    name: 'Operations Lead User',
                    email: 'ops@zemen.com',
                    password: 'password', // In a real app, this should be a securely hashed password
                    role: 'Operations Lead',
                    department: 'Branch Operations',
                    branch: 'Bole Branch',
                },
            ],
        });
        console.log('Seeded 2 admin users.');
    }

    console.log('Production seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
