
// src/scripts/seed-prod.js

const { PrismaClient } = require('@prisma/client');

// This seed script is ONLY for the production user management database (users and roles).
// It uses Prisma and connects via the DASH_MODULE_PROD_DATABASE_URL when NODE_ENV is 'production'.

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DASH_MODULE_PROD_DATABASE_URL,
        },
    },
});

async function main() {
    console.log('Start seeding PRODUCTION users and roles...');

    if (process.env.NODE_ENV !== 'production') {
        throw new Error(
            'This script is for production seeding only. Set NODE_ENV=production to run.'
        );
    }
    
    if (!process.env.DASH_MODULE_PROD_DATABASE_URL) {
        throw new Error(
            'DASH_MODULE_PROD_DATABASE_URL is not set. This is required for production seeding.'
        );
    }


    // Seed Branches
    await prisma.branch.upsert({
        where: { name: 'Bole Branch' },
        update: {},
        create: { id: 'br_1', name: 'Bole Branch', location: 'Bole, Addis Ababa' },
    });
    await prisma.branch.upsert({
        where: { name: 'Head Office' },
        update: {},
        create: { id: 'br_2', name: 'Head Office', location: 'HQ, Addis Ababa' },
    });
    console.log('Upserted 2 branches.');

    // Seed Departments
    await prisma.department.upsert({
        where: { name: 'IT Department' },
        update: {},
        create: { id: 'dept_1', name: 'IT Department', branchId: 'br_2' },
    });
    await prisma.department.upsert({
        where: { name: 'Branch Operations' },
        update: {},
        create: { id: 'dept_2', name: 'Branch Operations', branchId: 'br_1' },
    });
    console.log('Upserted 2 departments.');

    // Seed Roles
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
    
    // Seed Admin Users
    const existingUsersCount = await prisma.user.count();
    if (existingUsersCount > 0) {
        console.log('Users already exist, skipping user seeding.');
    } else {
        await prisma.user.create({
            data: {
                employeeId: 'admin001',
                name: 'Admin User',
                email: 'admin@zemen.com',
                password: 'password', // In a real app, this should be a securely hashed password
                role: 'Super Admin',
                department: 'IT Department',
                branch: 'Head Office',
            },
        });
        await prisma.user.create({
            data: {
                employeeId: 'ops001',
                name: 'Operations Lead User',
                email: 'ops@zemen.com',
                password: 'password', // In a real app, this should be a securely hashed password
                role: 'Operations Lead',
                department: 'Branch Operations',
                branch: 'Bole Branch',
            },
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
