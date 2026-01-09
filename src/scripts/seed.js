
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

// This seed script is now ONLY for the user management database (users and roles).
// The main dashboard data (customers, transactions) is assumed to come from the
// production Oracle DB connection or a separate seeding process for the local SQLite file.

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding users and roles...');

    // Clean up existing user/role data
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    console.log('Cleared existing user and role data.');

    // Seed Roles
    const superAdminRole = await prisma.role.create({
        data: { name: 'Super Admin', description: 'Full access to all system features, including security settings.' },
    });
    const opsLeadRole = await prisma.role.create({
        data: { name: 'Operations Lead', description: 'Manages day-to-day customer and transaction approvals.' },
    });
     await prisma.role.create({
        data: { name: 'Support Staff', description: 'Handles customer inquiries and first-level support tickets.' },
    });
     await prisma.role.create({
        data: { name: 'Compliance Officer', description: 'Audits trails, reviews high-risk transactions, and generates NBE reports.' },
    });
     await prisma.role.create({
        data: { name: 'Read-Only Auditor', description: 'View-only access to all transactional and user data for auditing purposes.' },
    });
    console.log('Seeded 5 roles.');


    // Seed Admin Users
    await prisma.user.create({
        data: {
            employeeId: 'admin001',
            name: 'Admin User',
            email: 'admin@zemen.com',
            password: 'password', // In a real app, this would be hashed
            role: superAdminRole.name,
            department: 'IT Department',
            branch: 'Head Office',
        },
    });
     await prisma.user.create({
        data: {
            employeeId: 'ops001',
            name: 'Operations Lead User',
            email: 'ops@zemen.com',
            password: 'password', // In a real app, this would be hashed
            role: opsLeadRole.name,
            department: 'Branch Operations',
            branch: 'Bole Branch',
        },
    });
    console.log('Seeded 2 admin users.');

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
