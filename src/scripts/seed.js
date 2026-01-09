const { PrismaClient } = require('@prisma/client');
const { PrismaClient: SystemPrismaClient } = require('@prisma/client/system');
const { faker } = require('@faker-js/faker');
const crypto = require('crypto');

const adminDb = new PrismaClient();
const systemDb = new SystemPrismaClient();

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

    // === Seeding Admin Database ===
    console.log('Seeding admin database (users, roles, etc.)...');
    await adminDb.user.deleteMany();
    await adminDb.role.deleteMany();
    await adminDb.department.deleteMany();
    await adminDb.branch.deleteMany();
    await adminDb.miniApp.deleteMany();
    
    // Seed Branches
    const branch1 = await adminDb.branch.create({ data: { id: 'br_1', name: 'Bole Branch', location: 'Bole, Addis Ababa' } });
    const branch2 = await adminDb.branch.create({ data: { id: 'br_2', name: 'Head Office', location: 'HQ, Addis Ababa' } });
    const branch3 = await adminDb.branch.create({ data: { id: 'br_3', name: 'Arada Branch', location: 'Arada, Addis Ababa' } });
    console.log('Seeded 3 branches.');

    // Seed Departments
    await adminDb.department.createMany({
        data: [
            { id: 'dept_1', name: 'IT Department', branchId: branch2.id },
            { id: 'dept_2', name: 'Branch Operations', branchId: branch1.id },
            { id: 'dept_3', name: 'Human Resources', branchId: branch2.id },
            { id: 'dept_4', name: 'Customer Service', branchId: branch3.id },
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
            { id: `mapp_${crypto.randomUUID()}`, name: "Cinema Ticket", url: "https://cinema.example.com", logo_url: "https://picsum.photos/seed/cinema/100/100", username: "cinema_api", password: "secure_password_1", encryption_key: crypto.randomBytes(32).toString('hex') },
            { id: `mapp_${crypto.randomUUID()}`, name: "Event Booking", url: "https://events.example.com", logo_url: "https://picsum.photos/seed/events/100/100", username: "event_api_user", password: "secure_password_2", encryption_key: crypto.randomBytes(32).toString('hex') }
        ]
    });
    console.log('Seeded 2 mini-apps.');


    // === Seeding System Database ===
    console.log('\nSeeding system database (customers, transactions)...');
    // Clean up existing data in system DB
    await systemDb.pendingApproval.deleteMany();
    await systemDb.transaction.deleteMany();
    await systemDb.customer.deleteMany();
    await systemDb.userSecurity.deleteMany();
    await systemDb.account.deleteMany();
    await systemDb.appUser.deleteMany();
    console.log('Cleared existing system data.');
    
    // Seed legacy Customers, AppUsers, Accounts, UserSecurities
    const userList = [
        { cif: '0005995', name: 'John Adebayo Doe', email: 'john.doe@example.com', phone: '+2348012345678', branch: 'Head Office', status: 'Active' },
        { cif: '0052347', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '+2348012345679', branch: 'Bole Branch', status: 'Active' },
        { cif: '0058322', name: 'Samson Tsegaye', email: 'samson.t@example.com', phone: '+251911223344', branch: 'Arada', status: 'Registered' },
        { cif: '0048533', name: 'AKALEWORK TAMENE KEBEDE', email: 'akalework.t@example.com', phone: '+251911223345', branch: 'Arada', status: 'Active' },
        { cif: '0061234', name: 'Sara Connor', email: 'sara.c@example.com', phone: '+251911123456', branch: 'Bole Branch', status: 'Inactive' },
        { cif: '0078901', name: 'Kyle Reese', email: 'kyle.r@example.com', phone: '+251911654321', branch: 'Head Office', status: 'Dormant' },
    ];
    
    let createdCustomers = [];
    
    for (const u of userList) {
        const nameParts = u.name.split(' ');
        const appUserId = `user_${u.cif}`;
        await systemDb.appUser.create({
            data: {
                Id: appUserId,
                CIFNumber: u.cif,
                FirstName: encrypt(nameParts[0]),
                SecondName: encrypt(nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : nameParts[1]),
                LastName: encrypt(nameParts[nameParts.length - 1]),
                Email: encrypt(u.email),
                PhoneNumber: encrypt(u.phone),
                Status: u.status,
                SignUpMainAuth: 'PIN',
                SignUp2FA: 'SMSOTP',
                BranchName: u.branch,
                AddressLine1: faker.location.streetAddress(),
                Nationality: 'Ethiopian'
            }
        });
        
        await systemDb.userSecurity.create({
            data: {
                UserId: appUserId,
                CIFNumber: u.cif,
                Status: u.status,
                PinHash: crypto.createHash('sha256').update(faker.string.numeric(4)).digest('hex'),
                SecurityAnswer: encrypt(faker.lorem.word()),
            }
        });
        
        const customer = await systemDb.customer.create({
            data: {
                name: u.name,
                phone: u.phone,
                status: u.status,
            }
        });
        createdCustomers.push(customer);
    }
    console.log(`Seeded ${userList.length} app users, securities, and legacy customers.`);
    

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
