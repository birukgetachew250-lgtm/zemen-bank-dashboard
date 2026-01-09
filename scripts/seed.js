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
    await prisma.pendingApproval.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.userSecurity.deleteMany();
    await prisma.account.deleteMany();
    await prisma.appUser.deleteMany();
    await prisma.securityQuestion.deleteMany();
    await prisma.corporate.deleteMany();
    await prisma.department.deleteMany();
    await prisma.branch.deleteMany();
    await prisma.miniApp.deleteMany();
    await prisma.user.deleteMany();
    console.log('Cleared existing data.');

    // Seed Branches
    const branch1 = await prisma.branch.create({
        data: { name: 'Bole Branch', location: 'Bole, Addis Ababa' },
    });
    const branch2 = await prisma.branch.create({
        data: { name: 'Head Office', location: 'HQ, Addis Ababa' },
    });
    const branch3 = await prisma.branch.create({
        data: { name: 'Arada Branch', location: 'Arada, Addis Ababa' },
    });
    console.log('Seeded 3 branches.');

    // Seed Departments
    await prisma.department.createMany({
        data: [
            { name: 'IT Department', branchId: branch2.id },
            { name: 'Branch Operations', branchId: branch1.id },
            { name: 'Human Resources', branchId: branch2.id },
            { name: 'Customer Service', branchId: branch3.id },
        ],
    });
    console.log('Seeded 4 departments.');


    // Seed Admin Users
    await prisma.user.create({
        data: {
            employeeId: 'admin001',
            name: 'Admin User',
            email: 'admin@zemen.com',
            password: 'password', // In a real app, this would be hashed
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
            password: 'password', // In a real app, this would be hashed
            role: 'Operations Lead',
            department: 'Branch Operations',
            branch: 'Bole Branch',
        },
    });
    console.log('Seeded 2 admin users.');

    // Seed Security Questions
    const sq1 = await prisma.securityQuestion.create({ data: { question: 'Your primary school name ?' } });
    const sq2 = await prisma.securityQuestion.create({ data: { question: 'Your nick name ?' } });
    const sq3 = await prisma.securityQuestion.create({ data: { question: 'Your faviourite subject at primary school?' } });
    const securityQuestions = [sq1, sq2, sq3];
    console.log(`Seeded ${securityQuestions.length} security questions.`);

    // Seed AppUsers, Accounts, UserSecurities, and legacy Customers
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
        const appUser = await prisma.appUser.create({
            data: {
                cifNumber: u.cif,
                firstName: encrypt(nameParts[0]),
                secondName: encrypt(nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : nameParts[1]),
                lastName: encrypt(nameParts[nameParts.length - 1]),
                email: encrypt(u.email),
                phoneNumber: encrypt(u.phone),
                status: u.status,
                signUpMainAuth: 'PIN',
                signUp2FA: 'SMSOTP',
                branchName: u.branch,
                addressLine1: faker.location.streetAddress(),
                nationality: 'Ethiopian'
            }
        });
        
        await prisma.userSecurity.create({
            data: {
                userId: appUser.id,
                cifNumber: u.cif,
                status: u.status,
                pinHash: crypto.createHash('sha256').update(faker.string.numeric(4)).digest('hex'),
                securityQuestionId: faker.helpers.arrayElement(securityQuestions).id,
                securityAnswer: encrypt(faker.lorem.word()),
            }
        });
        
        const customer = await prisma.customer.create({
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

    // Seed Mini Apps
    await prisma.miniApp.createMany({
        data: [
            { name: "Cinema Ticket", url: "https://cinema.example.com", logo_url: "https://picsum.photos/seed/cinema/100/100", username: "cinema_api", password: "secure_password_1", encryption_key: crypto.randomBytes(32).toString('hex') },
            { name: "Event Booking", url: "https://events.example.com", logo_url: "https://picsum.photos/seed/events/100/100", username: "event_api_user", password: "secure_password_2", encryption_key: crypto.randomBytes(32).toString('hex') }
        ]
    });
    console.log('Seeded 2 mini-apps.');


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
