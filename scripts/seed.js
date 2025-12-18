
const Database = require('better-sqlite3');
const { faker } = require('@faker-js/faker');
const crypto = require('crypto');

const db = new Database('zemen.db', { verbose: console.log });

function seed() {
  console.log('Seeding Zemen DB...');

  // Clear existing data from legacy tables
  db.exec('DELETE FROM pending_approvals');
  db.exec('DELETE FROM transactions');
  db.exec('DELETE FROM customers');
  
  // Clear data from new tables
  db.exec('DELETE FROM UserSecurities');
  db.exec('DELETE FROM Accounts');
  db.exec('DELETE FROM AppUsers');
  db.exec('DELETE FROM SecurityQuestions');
  
  db.exec("DELETE FROM sqlite_sequence");
  
  console.log('Cleared existing data.');

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
    INSERT INTO AppUsers (Id, CIFNumber, FirstName, SecondName, LastName, Email, PhoneNumber, Status, SignUpMainAuth, SignUp2FA, BranchName) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        FirstName: nameParts[0],
        SecondName: nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : nameParts[1],
        LastName: nameParts[nameParts.length - 1],
        Email: u.email,
        PhoneNumber: u.phone,
        Status: u.status,
        SignUpMainAuth: 'PIN',
        SignUp2FA: 'SMSOTP',
        BranchName: u.branch,
      };
      appUsers.push(appUser);
  }
  
  const insertManyAppUsers = db.transaction((users) => {
    for (const user of users) {
      insertAppUser.run(user.Id, user.CIFNumber, user.FirstName, user.SecondName, user.LastName, user.Email, user.PhoneNumber, user.Status, user.SignUpMainAuth, user.SignUp2FA, user.BranchName);
    }
  });
  insertManyAppUsers(appUsers);
  console.log(`Seeded ${appUsers.length} app users.`);
  

  // Seed Customers (Legacy) & UserSecurities
  const customers = [];
  const userSecurities = [];
  const insertCustomer = db.prepare('INSERT INTO customers (id, name, phone, status, registeredAt) VALUES (?, ?, ?, ?, ?)');
  const insertUserSecurity = db.prepare('INSERT INTO UserSecurities (UserId, CIFNumber, PinHash, Status, SecurityQuestionId, SecurityAnswer) VALUES (?, ?, ?, ?, ?, ?)');

  for (const appUser of appUsers) {
    const customer = {
      id: `cust_${appUser.CIFNumber}`,
      name: `${appUser.FirstName} ${appUser.LastName}`,
      phone: appUser.PhoneNumber,
      status: appUser.Status,
      registeredAt: new Date(),
    };
    customers.push(customer);

    const security = {
        UserId: appUser.Id,
        CIFNumber: appUser.CIFNumber,
        PinHash: crypto.createHash('sha256').update(faker.string.numeric(4)).digest('hex'),
        Status: appUser.Status,
        SecurityQuestionId: faker.helpers.arrayElement(securityQuestions).id,
        SecurityAnswer: faker.lorem.word(),
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
      insertUserSecurity.run(s.UserId, s.CIFNumber, s.PinHash, s.Status, s.SecurityQuestionId, s.SecurityAnswer);
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
  const insertTransaction = db.prepare('INSERT INTO transactions (id, customerId, amount, status, timestamp, is_anomalous, anomaly_reason) VALUES (?, ?, ?, ?, ?, ?, ?)');

  for (let i = 0; i < 100; i++) {
    const isAnomalous = faker.datatype.boolean(0.1); 
    const transaction = {
      id: `txn_${crypto.randomUUID()}`,
      customerId: faker.helpers.arrayElement(customers).id,
      amount: faker.finance.amount({ min: 10, max: 5000 }),
      status: faker.helpers.arrayElement(['successful', 'failed']),
      timestamp: faker.date.recent({ days: 30 }),
      is_anomalous: isAnomalous,
      anomaly_reason: isAnomalous ? faker.lorem.sentence() : null,
    };
    transactions.push(transaction);
  }
  
  const insertManyTransactions = db.transaction((txns) => {
    for (const txn of txns) {
      insertTransaction.run(txn.id, txn.customerId, txn.amount, txn.status, txn.timestamp.toISOString(), txn.is_anomalous ? 1 : 0, txn.anomaly_reason);
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
