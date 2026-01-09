
const sqlite3 = require('sqlite3').verbose();
const { faker } = require('@faker-js/faker');
const crypto = require('crypto');
const fs = require('fs');

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

const dbPath = 'zemen.db';

// Delete the old DB file if it exists to ensure a clean seed
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Deleted existing database file.');
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    }
    console.log('Connected to the zemen.db SQLite database.');
});

const runQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) {
                console.error('Error running query:', query);
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
};

const getQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const allQuery = (query, params = []) => {
     return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

async function seed() {
    console.log('Seeding Zemen DB...');

    // No need to drop tables since we delete the file

    await runQuery('BEGIN TRANSACTION');

    try {
        await runQuery(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                employeeId TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                branch TEXT,
                department TEXT NOT NULL
            );
        `);

        await runQuery(`
            CREATE TABLE IF NOT EXISTS AppUsers (
                Id TEXT PRIMARY KEY, 
                CIFNumber TEXT UNIQUE NOT NULL, 
                FirstName TEXT, 
                SecondName TEXT, 
                LastName TEXT, 
                Email TEXT, 
                PhoneNumber TEXT, 
                AddressLine1 TEXT, 
                AddressLine2 TEXT, 
                AddressLine3 TEXT, 
                AddressLine4 TEXT, 
                Nationality TEXT, 
                BranchCode TEXT, 
                BranchName TEXT, 
                Status TEXT, 
                SignUp2FA TEXT, 
                SignUpMainAuth TEXT, 
                Channel TEXT,
                InsertDate DATETIME DEFAULT CURRENT_TIMESTAMP, 
                UpdateDate DATETIME DEFAULT CURRENT_TIMESTAMP, 
                InsertUser TEXT DEFAULT 'system', 
                UpdateUser TEXT DEFAULT 'system', 
                Version TEXT DEFAULT (lower(hex(randomblob(16))))
            );
        `);

        await runQuery(`
            CREATE TABLE IF NOT EXISTS Accounts (
                Id TEXT PRIMARY KEY, 
                CIFNumber TEXT NOT NULL, 
                AccountNumber TEXT, 
                HashedAccountNumber TEXT, 
                FirstName TEXT, 
                SecondName TEXT, 
                LastName TEXT, 
                BranchCode TEXT, 
                BranchName TEXT, 
                AccountType TEXT, 
                Currency TEXT, 
                Status TEXT, 
                InsertDate DATETIME DEFAULT CURRENT_TIMESTAMP, 
                UpdateDate DATETIME DEFAULT CURRENT_TIMESTAMP, 
                InsertUser TEXT DEFAULT 'system', 
                UpdateUser TEXT DEFAULT 'system', 
                Version TEXT DEFAULT (lower(hex(randomblob(16)))),
                FOREIGN KEY (CIFNumber) REFERENCES AppUsers(CIFNumber) ON DELETE CASCADE
            );
        `);

        await runQuery(`
            CREATE TABLE IF NOT EXISTS SecurityQuestions (
                Id TEXT PRIMARY KEY, 
                Question TEXT UNIQUE, 
                InsertDate DATETIME DEFAULT CURRENT_TIMESTAMP, 
                UpdateDate DATETIME DEFAULT CURRENT_TIMESTAMP, 
                InsertUser TEXT DEFAULT 'system', 
                UpdateUser TEXT DEFAULT 'system', 
                Version TEXT DEFAULT (lower(hex(randomblob(16))))
            );
        `);

        await runQuery(`
            CREATE TABLE IF NOT EXISTS UserSecurities (
                UserId TEXT PRIMARY KEY, 
                CIFNumber TEXT UNIQUE NOT NULL, 
                PinHash TEXT, 
                Status TEXT, 
                SecurityQuestionId TEXT, 
                SecurityAnswer TEXT, 
                IsLoggedIn INTEGER DEFAULT 0, 
                FailedAttempts INTEGER DEFAULT 0, 
                LastLoginAttempt DATETIME, 
                IsLocked INTEGER DEFAULT 0, 
                UnlockedTime DATETIME, 
                LockedIntervalMinutes INTEGER, 
                EncKey TEXT, 
                EncIV TEXT, 
                IsBiometricsLogin INTEGER DEFAULT 0, 
                IsBiometricsPayment INTEGER DEFAULT 0, 
                DeviceSwitchConsent INTEGER DEFAULT 0, 
                OnTmpPassword INTEGER DEFAULT 0, 
                IsActivationUsed INTEGER DEFAULT 0, 
                ActivationExpiredAt DATETIME DEFAULT CURRENT_TIMESTAMP, 
                InsertDate DATETIME DEFAULT CURRENT_TIMESTAMP, 
                UpdateDate DATETIME DEFAULT CURRENT_TIMESTAMP, 
                InsertUser TEXT DEFAULT 'system', 
                UpdateUser TEXT DEFAULT 'system', 
                Version TEXT DEFAULT (lower(hex(randomblob(16)))),
                FOREIGN KEY(UserId) REFERENCES AppUsers(Id),
                FOREIGN KEY(CIFNumber) REFERENCES AppUsers(CIFNumber),
                FOREIGN KEY(SecurityQuestionId) REFERENCES SecurityQuestions(Id) ON DELETE SET NULL
            );
        `);
        
        await runQuery(`
            CREATE TABLE IF NOT EXISTS OtpCodes (
                Id TEXT,
                UserId TEXT,
                CodeHash TEXT,
                Secret TEXT,
                OtpType TEXT,
                Purpose TEXT,
                IsUsed INTEGER DEFAULT 0,
                Attempts INTEGER,
                ExpiresAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                InsertDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                UpdateDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                InsertUser TEXT DEFAULT 'system',
                UpdateUser TEXT DEFAULT 'system',
                Version TEXT
            );
        `);

        await runQuery(`
            CREATE TABLE IF NOT EXISTS OtpUsers (
                UserId TEXT PRIMARY KEY,
                Status INTEGER,
                LockedUntil DATETIME DEFAULT CURRENT_TIMESTAMP,
                InsertDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                UpdateDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                OtpCodeId TEXT
            );
        `);

        await runQuery(`
            CREATE TABLE IF NOT EXISTS customers (
                id TEXT PRIMARY KEY,
                name TEXT,
                phone TEXT,
                status TEXT,
                registeredAt DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await runQuery(`
            CREATE TABLE IF NOT EXISTS pending_approvals (
                id TEXT PRIMARY KEY,
                customerId TEXT,
                type TEXT,
                requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'pending',
                customerName TEXT,
                customerPhone TEXT,
                details TEXT, 
                FOREIGN KEY (customerId) REFERENCES customers(id)
            );
        `);

        await runQuery(`
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                customerId TEXT,
                amount REAL,
                fee REAL,
                status TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                type TEXT,
                channel TEXT,
                to_account TEXT,
                is_anomalous BOOLEAN DEFAULT FALSE,
                anomaly_reason TEXT,
                FOREIGN KEY (customerId) REFERENCES customers(id)
            );
        `);

        await runQuery(`
            CREATE TABLE IF NOT EXISTS corporates (
                id TEXT PRIMARY KEY,
                name TEXT,
                industry TEXT,
                status TEXT,
                internet_banking_status TEXT,
                logo_url TEXT
            );
        `);

        await runQuery(`
            CREATE TABLE IF NOT EXISTS branches (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                location TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await runQuery(`
            CREATE TABLE IF NOT EXISTS departments (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                branchId TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await runQuery(`
            CREATE TABLE IF NOT EXISTS mini_apps (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                logo_url TEXT,
                username TEXT NOT NULL,
                password TEXT NOT NULL,
                encryption_key TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Tables created successfully.');

        // Seed Security Questions
        const securityQuestions = [
            { id: '294b2da0-1613-4263-961b-c07cef56a346', question: 'Your primary school name ?' },
            { id: '294b2da0-1613-4263-961b-c09cef56a346', question: 'Your nick name ?' },
            { id: '294b2da0-1613-4263-961b-c01cef56a346', question: 'Your faviourite subject at primary school?' },
        ];
        for (const q of securityQuestions) {
            await runQuery('INSERT INTO SecurityQuestions (Id, Question) VALUES (?, ?)', [q.id, q.question]);
        }
        console.log(`Seeded ${securityQuestions.length} security questions.`);

        // Seed AppUsers
        const userList = [
            { id: 'c1d47bce-71cc-4396-a256-22a079b2810a', cif: '0005995', name: 'John Adebayo Doe', email: 'john.doe@example.com', phone: '+2348012345678', branch: 'Head Office', status: 'Active' },
            { id: '74560d63-770b-412d-9f22-7f68ee6afec8', cif: '0052347', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '+2348012345679', branch: 'Bole Branch', status: 'Active' },
            { id: '9719ea6c-9c16-4a84-8e20-3237ccd13238', cif: '0058322', name: 'Samson Tsegaye', email: 'samson.t@example.com', phone: '+251911223344', branch: 'Arada', status: 'Registered' },
            { id: '39bab503-2714-4cd4-a4bd-6379f0a69fd8', cif: '0048533', name: 'AKALEWORK TAMENE KEBEDE', email: 'akalework.t@example.com', phone: '+251911223345', branch: 'Arada', status: 'Active' },
            { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', cif: '0061234', name: 'Sara Connor', email: 'sara.c@example.com', phone: '+251911123456', branch: 'Bole Branch', status: 'Inactive' },
            { id: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210', cif: '0078901', name: 'Kyle Reese', email: 'kyle.r@example.com', phone: '+251911654321', branch: 'Head Office', status: 'Dormant' },
        ];
        
        for (const u of userList) {
            const nameParts = u.name.split(' ');
            const params = [
                u.id, u.cif, encrypt(nameParts[0]), 
                encrypt(nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : nameParts[1]),
                encrypt(nameParts[nameParts.length - 1]),
                encrypt(u.email), encrypt(u.phone), u.status, 'PIN', 'SMSOTP',
                u.branch, faker.location.streetAddress(), faker.location.secondaryAddress(),
                faker.location.city(), faker.location.state(), 'Ethiopian'
            ];
            await runQuery(`
                INSERT INTO AppUsers (Id, CIFNumber, FirstName, SecondName, LastName, Email, PhoneNumber, Status, SignUpMainAuth, SignUp2FA, BranchName, AddressLine1, AddressLine2, AddressLine3, AddressLine4, Nationality) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, params);
        }
        console.log(`Seeded ${userList.length} app users.`);

        // Seed Customers (Legacy) & UserSecurities
        const customers = [];
        for (const u of userList) {
            const customer = { id: `cust_${u.cif}`, name: u.name, phone: u.phone, status: u.status, registeredAt: new Date() };
            customers.push(customer);
            await runQuery('INSERT INTO customers (id, name, phone, status, registeredAt) VALUES (?, ?, ?, ?, ?)', [customer.id, customer.name, customer.phone, customer.status, customer.registeredAt.toISOString()]);
            
            const security = {
                UserId: u.id, CIFNumber: u.cif,
                PinHash: crypto.createHash('sha256').update(faker.string.numeric(4)).digest('hex'),
                Status: u.status, SecurityQuestionId: faker.helpers.arrayElement(securityQuestions).id,
                SecurityAnswer: encrypt(faker.lorem.word()), EncKey: crypto.randomBytes(64).toString('base64'),
                EncIV: crypto.randomBytes(64).toString('base64'),
            };
            await runQuery(`
                INSERT INTO UserSecurities (UserId, CIFNumber, PinHash, Status, SecurityQuestionId, SecurityAnswer, EncKey, EncIV) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [security.UserId, security.CIFNumber, security.PinHash, security.Status, security.SecurityQuestionId, security.SecurityAnswer, security.EncKey, security.EncIV]
            );
        }
        console.log(`Seeded ${customers.length} customers (legacy) and user securities.`);

        // Seed Pending Approvals
        const approvalTypes = ['unblock', 'pin-reset', 'new-customer', 'updated-customer', 'customer-account', 'reset-security-questions'];
        let pendingApprovalsCount = 0;
        for (let i = 0; i < 15; i++) {
            const randomCustomer = faker.helpers.arrayElement(customers);
            const approval = {
                id: `appr_${crypto.randomUUID()}`, customerId: randomCustomer.id,
                type: faker.helpers.arrayElement(approvalTypes), requestedAt: faker.date.recent({ days: 10 }),
                customerName: randomCustomer.name, customerPhone: randomCustomer.phone,
            };
            await runQuery('INSERT INTO pending_approvals (id, customerId, type, requestedAt, customerName, customerPhone) VALUES (?, ?, ?, ?, ?, ?)',
                [approval.id, approval.customerId, approval.type, approval.requestedAt.toISOString(), approval.customerName, approval.customerPhone]
            );
            pendingApprovalsCount++;
        }
        console.log(`Seeded ${pendingApprovalsCount} pending approvals.`);

        // Seed Transactions
        const transactionTypes = ['P2P', 'Bill Payment', 'Airtime', 'Merchant Payment', 'Remittance'];
        const statuses = ['Successful', 'Failed', 'Pending', 'Reversed'];
        const channels = ['App', 'USSD', 'Agent', 'EthSwitch'];
        let transactionsCount = 0;
        for (let i = 0; i < 250; i++) {
            const isAnomalous = faker.datatype.boolean(0.05);
            const transaction = {
                id: `txn_${crypto.randomUUID()}`, customerId: faker.helpers.arrayElement(customers).id,
                amount: faker.finance.amount({ min: 10, max: 50000 }), fee: faker.finance.amount({ min: 0, max: 50 }),
                status: faker.helpers.arrayElement(statuses), timestamp: faker.date.recent({ days: 90 }),
                type: faker.helpers.arrayElement(transactionTypes), channel: faker.helpers.arrayElement(channels),
                to_account: faker.finance.accountNumber(12), is_anomalous: isAnomalous,
                anomaly_reason: isAnomalous ? faker.lorem.sentence() : null,
            };
            await runQuery('INSERT INTO transactions (id, customerId, amount, fee, status, timestamp, type, channel, to_account, is_anomalous, anomaly_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [transaction.id, transaction.customerId, transaction.amount, transaction.fee, transaction.status, transaction.timestamp.toISOString(), transaction.type, transaction.channel, transaction.to_account, transaction.is_anomalous ? 1 : 0, transaction.anomaly_reason]
            );
            transactionsCount++;
        }
        console.log(`Seeded ${transactionsCount} transactions.`);
        
        await runQuery('COMMIT');
        console.log('Seeding complete!');
    } catch (error) {
        console.error('Failed to seed database:', error);
        await runQuery('ROLLBACK');
    } finally {
        db.close((err) => {
            if (err) console.error('Error closing database', err.message);
            else console.log('Database connection closed.');
        });
    }
}

seed();
