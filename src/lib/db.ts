
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';

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
    details TEXT, -- JSON blob for extra info like accounts
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

  CREATE TABLE IF NOT EXISTS corporates (
    id TEXT PRIMARY KEY,
    name TEXT,
    industry TEXT,
    status TEXT,
    internet_banking_status TEXT,
    logo_url TEXT
  );
`;

// Drop pending_approvals if details column does not exist
const hasDetailsColumn = db.prepare("PRAGMA table_info(pending_approvals)").all().some(col => col.name === 'details');
if (!hasDetailsColumn) {
    db.exec('DROP TABLE IF EXISTS pending_approvals');
    console.log("Dropped pending_approvals table to add 'details' column.");
}


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

// Seed corporates if table is empty
const corporateCount = db.prepare('SELECT COUNT(*) as count FROM corporates').get().count;
if (corporateCount === 0) {
    const insertCorporate = db.prepare('INSERT INTO corporates (id, name, industry, status, internet_banking_status, logo_url) VALUES (?, ?, ?, ?, ?, ?)');
    const corporates = [
        { id: "corp_1", name: "Dangote Cement", industry: "Manufacturing", status: "Active", internet_banking_status: "Active", logo_url: "https://picsum.photos/seed/dangote/40/40" },
        { id: "corp_2", name: "MTN Nigeria", industry: "Telecommunications", status: "Active", internet_banking_status: "Active", logo_url: "https://picsum.photos/seed/mtn/40/40" },
        { id: "corp_3", name: "Zenith Bank", industry: "Finance", status: "Inactive", internet_banking_status: "Disabled", logo_url: "https://picsum.photos/seed/zenith/40/40" },
        { id: "corp_4_new", name: "Jumia Group", industry: "E-commerce", status: "Active", internet_banking_status: "Pending", logo_url: "https://picsum.photos/seed/jumia/40/40" },
        { id: "corp_5", name: "Flutterwave", industry: "Fintech", status: "Active", internet_banking_status: "Active", logo_url: "https://picsum.photos/seed/flutterwave/40/40" },
        { id: "corp_6", name: "Andela", industry: "Technology", status: "Active", internet_banking_status: "Active", logo_url: "https://picsum.photos/seed/andela/40/40" },
        { id: "corp_7", name: "Oando Plc", industry: "Oil & Gas", status: "Inactive", internet_banking_status: "Disabled", logo_url: "https://picsum.photos/seed/oando/40/40" },
        { id: "corp_8", name: "Paystack", industry: "Fintech", status: "Active", internet_banking_status: "Active", logo_url: "https://picsum.photos/seed/paystack/40/40" },
    ];

    const insertMany = db.transaction((items) => {
        for (const item of items) {
            insertCorporate.run(item.id, item.name, item.industry, item.status, item.internet_banking_status, item.logo_url);
        }
    });

    insertMany(corporates);
}


console.log("Database initialized.");
