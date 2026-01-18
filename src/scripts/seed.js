
const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const crypto = require('crypto');

const prisma = new PrismaClient();

const config = {
    security: {
        encryptionMasterKey: process.env.ENCRYPTION_MASTER_KEY || 'mUbnc+YQ+V9RjdmWdLMG4QxULn3wGuozxlQpo/jj9Pk='
    }
};

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
const masterKey = Buffer.from(config.security.encryptionMasterKey, 'base64');

function encrypt(value) {
    if (!value) return null;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv);
    let encrypted = cipher.update(value, 'utf8', 'binary');
    encrypted += cipher.final('binary');
    const result = Buffer.concat([iv, Buffer.from(encrypted, 'binary')]);
    return result.toString('base64');
}

async function main() {
    console.log('Start seeding...');

    // Clean up existing data
    await prisma.systemActivityLog.deleteMany();
    await prisma.pendingApproval.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.corporate.deleteMany();
    await prisma.department.deleteMany();
    await prisma.branch.deleteMany();
    await prisma.role.deleteMany();
    await prisma.user.deleteMany();
    await prisma.integration.deleteMany();
    await prisma.securityPolicy.deleteMany();
    await prisma.ipWhitelist.deleteMany();
    console.log('Cleared existing data.');

    // Seed Branches
    const branch1 = await prisma.branch.create({ data: { id: 'br_1', name: 'Bole Branch', location: 'Bole, Addis Ababa' } });
    const branch2 = await prisma.branch.create({ data: { id: 'br_2', name: 'Head Office', location: 'HQ, Addis Ababa' } });
    const branch3 = await prisma.branch.create({ data: { id: 'br_3', name: 'Arada Branch', location: 'Arada, Addis Ababa' } });
    console.log('Seeded 3 branches.');

    // Seed Departments
    await prisma.department.createMany({
        data: [
            { id: 'dept_1', name: 'IT Department', branchId: branch2.id },
            { id: 'dept_2', name: 'Branch Operations', branchId: branch1.id },
            { id: 'dept_3', name: 'Human Resources', branchId: branch2.id },
            { id: 'dept_4', name: 'Customer Service', branchId: branch3.id },
        ],
    });
    console.log('Seeded 4 departments.');

    // Seed Roles
    await prisma.role.createMany({
        data: [
            { name: 'Super Admin', description: 'Full system access.' },
            { name: 'Operations Lead', description: 'Manages approvals.' },
            { name: 'Support Staff', description: 'Handles customer inquiries.' },
            { name: 'Compliance Officer', description: 'Handles risk and compliance.' },
        ],
    });
    console.log('Seeded 4 roles.');

    // Seed Admin Users
    await prisma.user.create({ data: { employeeId: 'admin001', name: 'Admin User', email: 'admin@zemenbank.com', password: 'password', role: 'Super Admin', department: 'IT Department', branch: 'Head Office', mfaEnabled: false } });
    await prisma.user.create({ data: { employeeId: 'ops001', name: 'Operations Lead User', email: 'ops@zemen.com', password: 'password', role: 'Operations Lead', department: 'Branch Operations', branch: 'Bole Branch', mfaEnabled: false } });
    console.log('Seeded 2 admin users.');

    const customerList = [
        { name: 'John Adebayo Doe', phone: '+2348012345678', status: 'Active' },
        { name: 'Jane Smith', phone: '+2348012345679', status: 'Active' },
        { name: 'Samson Tsegaye', phone: '+251911223344', status: 'Registered' },
        { name: 'AKALEWORK TAMENE KEBEDE', phone: '+251911223345', status: 'Active' },
        { name: 'Sara Connor', phone: '+251911123456', status: 'Inactive' },
        { name: 'Kyle Reese', phone: '+251911654321', status: 'Dormant' },
    ];
    
    const createdCustomers = await Promise.all(customerList.map(c => prisma.customer.create({ data: c })));
    console.log(`Seeded ${createdCustomers.length} customers.`);

    // Seed Pending Approvals
    const approvalTypes = ['unblock', 'pin-reset', 'new-customer', 'updated-customer', 'customer-account', 'reset-security-questions'];
    for (let i = 0; i < 15; i++) {
        const randomCustomer = faker.helpers.arrayElement(createdCustomers);
        await prisma.pendingApproval.create({
            data: {
                customerId: randomCustomer.id,
                type: faker.helpers.arrayElement(approvalTypes),
                requestedAt: faker.date.recent({ days: 10 }),
                customerName: randomCustomer.name,
                customerPhone: randomCustomer.phone,
            }
        });
    }
    console.log('Seeded 15 pending approvals.');

    // Seed Transactions
    const transactionTypes = ['P2P', 'Bill Payment', 'Airtime', 'Merchant Payment', 'Remittance'];
    const statuses = ['Successful', 'Failed', 'Pending', 'Reversed'];
    const channels = ['App', 'USSD', 'Agent', 'EthSwitch'];
    for (let i = 0; i < 250; i++) {
        const isAnomalous = faker.datatype.boolean(0.05);
        await prisma.transaction.create({
            data: {
                customerId: faker.helpers.arrayElement(createdCustomers).id,
                amount: parseFloat(faker.finance.amount({ min: 10, max: 50000 })),
                fee: parseFloat(faker.finance.amount({ min: 0, max: 50 })),
                status: faker.helpers.arrayElement(statuses),
                timestamp: faker.date.recent({ days: 90 }),
                type: faker.helpers.arrayElement(transactionTypes),
                channel: faker.helpers.arrayElement(channels),
                to_account: faker.finance.accountNumber(12),
                is_anomalous: isAnomalous,
                anomaly_reason: isAnomalous ? faker.lorem.sentence() : null,
            }
        });
    }
    console.log('Seeded 250 transactions.');
    
    // Seed Corporates
    await prisma.corporate.createMany({
        data: [
            { id: "corp_1", name: "Dangote Cement", industry: "Manufacturing", status: "Active", internet_banking_status: "Active", logo_url: "https://picsum.photos/seed/dangote/40/40" },
            { id: "corp_2", name: "MTN Nigeria", industry: "Telecommunications", status: "Active", internet_banking_status: "Active", logo_url: "https://picsum.photos/seed/mtn/40/40" },
            { id: "corp_3", name: "Zenith Bank", industry: "Finance", status: "Inactive", internet_banking_status: "Disabled", logo_url: "https://picsum.photos/seed/zenith/40/40" },
            { id: "corp_4_new", name: "Jumia Group", industry: "E-commerce", status: "Active", internet_banking_status: "Pending", logo_url: "https://picsum.photos/seed/jumia/40/40" },
        ]
    });
    console.log('Seeded 4 corporates.');
    
    // Seed Integrations
    await prisma.integration.createMany({
        data: [
        { name: 'Main WSO2 Gateway', service: 'WSO2', endpointUrl: 'https://wso2.zemenbank.com:8243/services', username: 'admin', password: encrypt('wso2-password'), status: 'Connected', isProduction: false },
        { name: 'Flexcube Core Service', service: 'Flexcube', endpointUrl: '192.168.1.10:9090', status: 'Connected', isProduction: false },
        { name: 'Primary SMS Provider', service: 'SMS', endpointUrl: 'https://sms.provider.com/api', username: 'smsuser', password: encrypt('sms-password'), status: 'Disconnected', isProduction: false },
        ]
    });
    console.log('Seeded 3 integration configs.');

    await prisma.securityPolicy.create({
        data: {
            id: 1,
            mfaRequired: true,
            allowedMfaMethods: ['email'],
            sessionTimeout: 30,
            concurrentSessions: 1,
        }
    });
    console.log('Seeded default security policy.');


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
