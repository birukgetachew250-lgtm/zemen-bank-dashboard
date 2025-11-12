const Database = require('better-sqlite3');
const { faker } = require('@faker-js/faker');
const crypto = require('crypto');

const db = new Database('zemen.db', { verbose: console.log });

function seed() {
  console.log('Seeding Zemen DB...');

  // Clear existing data
  db.exec('DELETE FROM pending_approvals');
  db.exec('DELETE FROM transactions');
  db.exec('DELETE FROM customers');
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('pending_approvals', 'transactions', 'customers');");
  
  console.log('Cleared existing data.');

  // Seed Customers
  const customers = [];
  const insertCustomer = db.prepare('INSERT INTO customers (id, name, phone, status, registeredAt) VALUES (?, ?, ?, ?, ?)');

  for (let i = 0; i < 50; i++) {
    const customer = {
      id: `cust_${crypto.randomUUID()}`,
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      status: faker.helpers.arrayElement(['registered', 'active', 'inactive', 'failed', 'dormant']),
      registeredAt: faker.date.past({ years: 2 }),
    };
    customers.push(customer);
  }
  
  const insertManyCustomers = db.transaction((customers) => {
    for (const customer of customers) {
      insertCustomer.run(customer.id, customer.name, customer.phone, customer.status, customer.registeredAt.toISOString());
    }
  });

  insertManyCustomers(customers);
  console.log(`Seeded ${customers.length} customers.`);

  // Seed Pending Approvals
  const approvalTypes = [
    'unblock',
    'pin-reset',
    'new-customer',
    'updated-customer',
    'customer-account',
    'reset-security-questions',
    'transaction-pin',
    'new-device',
    'disabled-customer',
  ];

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
    const isAnomalous = faker.datatype.boolean(0.1); // 10% chance of being anomalous
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
      insertTransaction.run(txn.id, txn.customerId, txn.amount, txn.status, txn.timestamp.toISOString(), txn.is_anomalous, txn.anomaly_reason);
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
