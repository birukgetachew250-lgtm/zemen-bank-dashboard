const { PrismaClient: AdminPrismaClient } = require('@prisma/client');
const { PrismaClient: SystemPrismaClient } = require('@prisma/client-system');
const { faker } = require('@faker-js/faker');
const crypto = require('crypto');

const adminDb = new AdminPrismaClient();
const systemDb = new SystemPrismaClient();

async function main() {
    console.log('Start seeding...');

    // === Seeding Admin Database ===
    console.log('Seeding admin database (users, roles, etc.)...');
    await adminDb.user.deleteMany();
    await adminDb.role.deleteMany();
    await adminDb.branch.deleteMany();
    await adminDb.department.deleteMany();
    await adminDb.miniApp.deleteMany();
    
    // Seed Branches
    const branch1 = await adminDb.branch.create({ data: { name: 'Bole Branch', location: 'Bole, Addis Ababa' } });
    const branch2 = await adminDb.branch.create({ data: { name: 'Head Office', location: 'HQ, Addis Ababa' } });
    const branch3 = await adminDb.branch.create({ data: { name: 'Arada Branch', location: 'Arada, Addis Ababa' } });
    console.log('Seeded 3 branches.');

    // Seed Departments
    await adminDb.department.createMany({
        data: [
            { name: 'IT Department', branchId: branch2.id },
            { name: 'Branch Operations', branchId: branch1.id },
            { name: 'Human Resources', branchId: branch2.id },
            { name: 'Customer Service', branchId: branch3.id },
        ],
    });
    console.log('Seeded 4 departments.');

    // Seed Roles
    await adminDb.role.createMany({
        data: [
            { name: 'Super Admin', description: 'Full system access.' },
            { name: 'Operations Lead', description: 'Manages approvals.' },
            { name: 'Support Staff', description: 'Customer support.' },
            { name: 'Compliance Officer', description: 'Handles risk and compliance.' },
        ],
    });
    console.log('Seeded 4 roles.');

    // Seed Admin Users
    await adminDb.user.create({ data: { employeeId: 'admin001', name: 'Admin User', email: 'admin@zemen.com', password: 'password', role: 'Super Admin', department: 'IT Department', branch: 'Head Office' } });
    await adminDb.user.create({ data: { employeeId: 'ops001', name: 'Operations Lead User', email: 'ops@zemen.com', password: 'password', role: 'Operations Lead', department: 'Branch Operations', branch: 'Bole Branch' } });
    console.log('Seeded 2 admin users.');
    
    // Seed Mini Apps
    await adminDb.miniApp.createMany({
        data: [
            { name: "Cinema Ticket", url: "https://cinema.example.com", logo_url: "https://picsum.photos/seed/cinema/100/100", username: "cinema_api", password: "secure_password_1", encryption_key: crypto.randomBytes(32).toString('hex') },
            { name: "Event Booking", url: "https://events.example.com", logo_url: "https://picsum.photos/seed/events/100/100", username: "event_api_user", password: "secure_password_2", encryption_key: crypto.randomBytes(32).toString('hex') }
        ]
    });
    console.log('Seeded 2 mini-apps.');


    // === Seeding System Database ===
    console.log('\nSeeding system database (customers, transactions)...');
    await systemDb.pendingApproval.deleteMany();
    await systemDb.transaction.deleteMany();
    await systemDb.customer.deleteMany();
    console.log('Cleared existing system data.');

    const customersToCreate = [
        { name: 'John Adebayo Doe', phone: '+2348012345678', status: 'Active' },
        { name: 'Jane Smith', phone: '+2348012345679', status: 'Active' },
        { name: 'Samson Tsegaye', phone: '+251911223344', status: 'Registered' },
        { name: 'AKALEWORK TAMENE KEBEDE', phone: '+251911223345', status: 'Active' },
        { name: 'Sara Connor', phone: '+251911123456', status: 'Inactive' },
        { name: 'Kyle Reese', phone: '+251911654321', status: 'Dormant' },
    ];
    
    await systemDb.customer.createMany({
        data: customersToCreate
    });
    const createdCustomers = await systemDb.customer.findMany();
    console.log(`Seeded ${createdCustomers.length} customers.`);

    // Seed Pending Approvals
    const approvalTypes = ['unblock', 'pin-reset', 'new-customer', 'updated-customer', 'customer-account', 'reset-security-questions'];
    for (let i = 0; i < 15; i++) {
        const randomCustomer = faker.helpers.arrayElement(createdCustomers);
        await systemDb.pendingApproval.create({
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
    const transactionsToCreate = [];
    for (let i = 0; i < 250; i++) {
        const isAnomalous = faker.datatype.boolean(0.05);
        transactionsToCreate.push({
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
        });
    }
    await systemDb.transaction.createMany({ data: transactionsToCreate });
    console.log(`Seeded ${transactionsToCreate.length} transactions.`);
    
    console.log('\nSeeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await adminDb.$disconnect();
        await systemDb.$disconnect();
    });
