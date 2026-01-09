

const Database = require('better-sqlite3');
const { faker } = require('@faker-js/faker');
const crypto = require('crypto');
const config = {
    security: {
        encryptionMasterKey: process.env.ENCRYPTION_MASTER_KEY || 'mUbnc+YQ+V9RjdmWdLMG4QxULn3wGuozxlQpo/jj9Pk='
    }
}

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
const db = new Database(dbPath, { verbose: console.log });

function seed() {
  console.log('Seeding Zemen DB...');

  // Drop all tables to ensure a clean slate
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';").all();
  for (const table of tables) {
    db.exec(`DROP TABLE IF EXISTS ${table.name}`);
  }
  console.log('Dropped existing tables.');
  
  
  // Recreate tables with the correct schema
  db.exec(`
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
      
      CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        permissions TEXT NOT NULL 
      );

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

      CREATE TABLE IF NOT EXISTS SecurityQuestions (
        Id TEXT PRIMARY KEY, 
        Question TEXT UNIQUE, 
        InsertDate DATETIME DEFAULT CURRENT_TIMESTAMP, 
        UpdateDate DATETIME DEFAULT CURRENT_TIMESTAMP, 
        InsertUser TEXT DEFAULT 'system', 
        UpdateUser TEXT DEFAULT 'system', 
        Version TEXT DEFAULT (lower(hex(randomblob(16))))
      );

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

      CREATE TABLE IF NOT EXISTS OtpUsers (
          UserId TEXT PRIMARY KEY,
          Status INTEGER,
          LockedUntil DATETIME DEFAULT CURRENT_TIMESTAMP,
          InsertDate DATETIME DEFAULT CURRENT_TIMESTAMP,
          UpdateDate DATETIME DEFAULT CURRENT_TIMESTAMP,
          OtpCodeId TEXT
      );

      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT,
        phone TEXT,
        status TEXT,
        registeredAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

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

      CREATE TABLE IF NOT EXISTS corporates (
        id TEXT PRIMARY KEY,
        name TEXT,
        industry TEXT,
        status TEXT,
        internet_banking_status TEXT,
        logo_url TEXT
      );

      CREATE TABLE IF NOT EXISTS branches (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        branchId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

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
  const insertSecQuestion = db.prepare('INSERT INTO SecurityQuestions (Id, Question) VALUES (?, ?)');
  const insertManySecQuestions = db.transaction((questions) => {
    for (const q of questions) insertSecQuestion.run(q.id, q.question);
  });
  insertManySecQuestions(securityQuestions);
  console.log(`Seeded ${securityQuestions.length} security questions.`);


  // Seed AppUsers
  const appUsers = [];
  const insertAppUser = db.prepare(`
    INSERT INTO AppUsers (Id, CIFNumber, FirstName, SecondName, LastName, Email, PhoneNumber, Status, SignUpMainAuth, SignUp2FA, BranchName, AddressLine1, AddressLine2, AddressLine3, AddressLine4, Nationality) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
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
      const appUser = {
        Id: u.id,
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
        AddressLine2: faker.location.secondaryAddress(),
        AddressLine3: faker.location.city(),
        AddressLine4: faker.location.state(),
        Nationality: 'Ethiopian'
      };
      appUsers.push(appUser);
  }
  
  const insertManyAppUsers = db.transaction((users) => {
    for (const user of users) {
      insertAppUser.run(user.Id, user.CIFNumber, user.FirstName, user.SecondName, user.LastName, user.Email, user.PhoneNumber, user.Status, user.SignUpMainAuth, user.SignUp2FA, user.BranchName, user.AddressLine1, user.AddressLine2, user.AddressLine3, user.AddressLine4, user.Nationality);
    }
  });
  insertManyAppUsers(appUsers);
  console.log(`Seeded ${appUsers.length} app users.`);
  

  // Seed Customers (Legacy) & UserSecurities
  const customers = [];
  const userSecurities = [];
  const insertCustomer = db.prepare('INSERT INTO customers (id, name, phone, status, registeredAt) VALUES (?, ?, ?, ?, ?)');
  const insertUserSecurity = db.prepare(`
    INSERT INTO UserSecurities (UserId, CIFNumber, PinHash, Status, SecurityQuestionId, SecurityAnswer, EncKey, EncIV) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of userList) {
      const nameParts = u.name.split(' ');
      const customer = {
        id: `cust_${u.cif}`,
        name: u.name,
        phone: u.phone,
        status: u.status,
        registeredAt: new Date(),
      };
      customers.push(customer);

      const security = {
        UserId: u.id,
        CIFNumber: u.cif,
        PinHash: crypto.createHash('sha256').update(faker.string.numeric(4)).digest('hex'),
        Status: u.status,
        SecurityQuestionId: faker.helpers.arrayElement(securityQuestions).id,
        SecurityAnswer: encrypt(faker.lorem.word()),
        EncKey: crypto.randomBytes(64).toString('base64'),
        EncIV: crypto.randomBytes(64).toString('base64'),
      };
      userSecurities.push(security);
  }
  
  const insertManyCustomers = db.transaction((custs) => {
    for (const c of custs) {
      insertCustomer.run(c.id, c.name, c.phone, c.status, c.registeredAt.toISOString());
    }
  });
  insertManyCustomers(customers);
  console.log(`Seeded ${customers.length} customers (legacy).`);

  const insertManyUserSecurities = db.transaction((secs) => {
    for (const s of secs) {
      insertUserSecurity.run(s.UserId, s.CIFNumber, s.PinHash, s.Status, s.SecurityQuestionId, s.SecurityAnswer, s.EncKey, s.EncIV);
    }
  });
  insertManyUserSecurities(userSecurities);
  console.log(`Seeded ${userSecurities.length} user securities.`);

  // Seed Pending Approvals
  const approvalTypes = ['unblock', 'pin-reset', 'new-customer', 'updated-customer', 'customer-account', 'reset-security-questions'];
  const pendingApprovals = [];
  const insertApproval = db.prepare('INSERT INTO pending_approvals (id, customerId, type, requestedAt, customerName, customerPhone) VALUES (?, ?, ?, ?, ?, ?)');

  for (let i = 0; i < 15; i++) {
    const randomCustomer = faker.helpers.arrayElement(customers);
    const approval = {
      id: `appr_${crypto.randomUUID()}`,
      customerId: randomCustomer.id,
      type: faker.helpers.arrayElement(approvalTypes),
      requestedAt: faker.date.recent({ days: 10 }),
      customerName: randomCustomer.name,
      customerPhone: randomCustomer.phone,
    };
    pendingApprovals.push(approval);
  }

  const insertManyApprovals = db.transaction((approvals) => {
    for (const approval of approvals) {
      insertApproval.run(approval.id, approval.customerId, approval.type, approval.requestedAt.toISOString(), approval.customerName, approval.customerPhone);
    }
  });
  insertManyApprovals(pendingApprovals);
  console.log(`Seeded ${pendingApprovals.length} pending approvals.`);

  // Seed Transactions
  const transactions = [];
  const insertTransaction = db.prepare('INSERT INTO transactions (id, customerId, amount, fee, status, timestamp, type, channel, to_account, is_anomalous, anomaly_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const transactionTypes = ['P2P', 'Bill Payment', 'Airtime', 'Merchant Payment', 'Remittance'];
  const statuses = ['Successful', 'Failed', 'Pending', 'Reversed'];
  const channels = ['App', 'USSD', 'Agent', 'EthSwitch'];

  for (let i = 0; i < 250; i++) {
    const isAnomalous = faker.datatype.boolean(0.05); 
    const transaction = {
      id: `txn_${crypto.randomUUID()}`,
      customerId: faker.helpers.arrayElement(customers).id,
      amount: faker.finance.amount({ min: 10, max: 50000 }),
      fee: faker.finance.amount({ min: 0, max: 50 }),
      status: faker.helpers.arrayElement(statuses),
      timestamp: faker.date.recent({ days: 90 }),
      type: faker.helpers.arrayElement(transactionTypes),
      channel: faker.helpers.arrayElement(channels),
      to_account: faker.finance.accountNumber(12),
      is_anomalous: isAnomalous,
      anomaly_reason: isAnomalous ? faker.lorem.sentence() : null,
    };
    transactions.push(transaction);
  }
  
  const insertManyTransactions = db.transaction((txns) => {
    for (const txn of txns) {
      insertTransaction.run(txn.id, txn.customerId, txn.amount, txn.fee, txn.status, txn.timestamp.toISOString(), txn.type, txn.channel, txn.to_account, txn.is_anomalous ? 1 : 0, txn.anomaly_reason);
    }
  });
  insertManyTransactions(transactions);
  console.log(`Seeded ${transactions.length} transactions.`);
  
  console.log('Seeding complete!');
}

try {
  seed();
} catch (error) {
  console.error('Failed to seed database:', error);
} finally {
  db.close();
}

    