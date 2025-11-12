import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve('zemen.db');

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);

const schema = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    avatar_url TEXT
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
    FOREIGN KEY (customerId) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    customerId TEXT,
    amount REAL,
    status TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_anomalous BOOLEAN DEFAULT FALSE,
    anomaly_reason TEXT,
    FOREIGN KEY (customerId) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    userId TEXT,
    action TEXT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
`;

db.exec(schema);

// Seed a default admin user if not exists
const admin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@zemen.com');
if (!admin) {
  db.prepare(
    "INSERT INTO users (id, name, email, password, avatar_url) VALUES (?, ?, ?, ?, ?)"
  ).run(
    'user_ck_admin_001',
    'Admin User',
    'admin@zemen.com',
    'zemen2025', // In a real app, this should be a hashed password
    'https://picsum.photos/seed/admin/100/100'
  );
}

console.log("Database initialized.");
