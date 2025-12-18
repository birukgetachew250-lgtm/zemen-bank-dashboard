
'server-only';

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';
import config from './config';

// NOTE: This setup uses SQLite for the demo environment.
// In a production environment (when config.db.isProduction is true),
// you would replace this with a connection to your Oracle databases
// using the connection strings from config.db.

let db: Database.Database;

if (config.db.isProduction) {
    // ---- PRODUCTION DATABASE CONNECTION ----
    // This is where you would initialize your Oracle DB connections.
    // For example, using the 'oracledb' package:
    //
    // import oracledb from 'oracledb';
    //
    // try {
    //   const userModuleConnection = await oracledb.getConnection(config.db.userModuleConnectionString);
    //   const securityModuleConnection = await oracledb.getConnection(config.db.securityModuleConnectionString);
    //   console.log("Successfully connected to Oracle databases.");
    //   // You would then export these connections or a DB client instance.
    // } catch (err) {
    //   console.error("Oracle connection failed: ", err);
    //   process.exit(1);
    // }
    
    // For now, we'll throw an error if IS_PRODUCTION_DB is true because the Oracle driver isn't implemented.
    // In a real scenario, we would fall back to the demo DB or handle this gracefully.
    console.warn("IS_PRODUCTION_DB is true, but Oracle connection is not implemented. The application will not connect to a database.");
} else {
    // ---- DEMO/FALLBACK SQLITE DATABASE ----
    // Place the database in node_modules to prevent Next.js from watching it and restarting on change.
    const dbDir = path.resolve(process.cwd(), 'node_modules', '.db');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const dbPath = path.join(dbDir, 'zemen.db');
    db = new Database(dbPath);
    console.log(`Initialized demo SQLite database at ${dbPath}`);

    const schema = `
      -- Admin Panel Tables
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        employeeId TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        avatar_url TEXT,
        branch TEXT,
        department TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        permissions TEXT NOT NULL 
      );

      -- USER_MODULE Tables (Translated from Oracle DDL for SQLite)
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

      -- SECURITY_MODULE Tables (Translated from Oracle DDL for SQLite)
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

      -- Legacy/Demo Tables (to be consolidated)
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
        status TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
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
    `;

    db.exec(schema);

    // Seed admin user, roles, and other demo data
    const admin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@zemen.com');
    if (!admin) {
      db.prepare(
        "INSERT INTO users (id, employeeId, name, email, password, role, avatar_url, branch, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(
        'user_ck_admin_001', '0001', 'Admin User', 'admin@zemen.com', 'zemen2025', 'Admin',
        'https://picsum.photos/seed/admin/100/100', 'Head Office', 'IT Department'
      );
    }

    if (db.prepare('SELECT COUNT(*) as count FROM roles').get().count === 0) {
        const insert = db.prepare('INSERT INTO roles (id, name, permissions) VALUES (?, ?, ?)');
        const items = [
          { id: "role_1", name: "Admin", permissions: JSON.stringify(["manage-users", "manage-roles", "view-reports", "manage-settings", "approve-all"]) },
          { id: "role_2", name: "Support Lead", permissions: JSON.stringify(["approve-pin-reset", "approve-new-device", "view-customer-audit", "manage-tickets"]) },
          { id: "role_3", name: "Support Staff", permissions: JSON.stringify(["view-customers", "handle-tickets", "request-pin-reset"]) },
          { id: "role_4", name: "Compliance Officer", permissions: JSON.stringify(["view-reports", "view-audit-trails", "flag-transaction"]) },
        ];
        db.transaction(() => {
            if (items && items.length) {
                items.forEach(item => insert.run(item.id, item.name, item.permissions));
            }
        })();
    }
    
    // Seed security questions if they don't exist
    if (db.prepare('SELECT COUNT(Id) as count FROM SecurityQuestions').get().count === 0) {
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
    }


    if (db.prepare('SELECT COUNT(*) as count FROM corporates').get().count === 0) {
        const insertCorporate = db.prepare('INSERT INTO corporates (id, name, industry, status, internet_banking_status, logo_url) VALUES (?, ?, ?, ?, ?, ?)');
        const corporates = [
            { id: "corp_1", name: "Dangote Cement", industry: "Manufacturing", status: "Active", internet_banking_status: "Active", logo_url: "https://picsum.photos/seed/dangote/40/40" },
            { id: "corp_2", name: "MTN Nigeria", industry: "Telecommunications", status: "Active", internet_banking_status: "Active", logo_url: "https://picsum.photos/seed/mtn/40/40" },
        ];
        db.transaction((items) => {
            if (items && items.length > 0) {
                items.forEach(item => insertCorporate.run(item.id, item.name, item.industry, item.status, item.internet_banking_status, item.logo_url))
            }
        })(corporates);
    }

    if (db.prepare('SELECT COUNT(*) as count FROM branches').get().count === 0) {
        const insertBranch = db.prepare('INSERT INTO branches (id, name, location) VALUES (?, ?, ?)');
        const branches = [
            { id: `br_${crypto.randomUUID()}`, name: "Bole Branch", location: "Bole, Addis Ababa" },
            { id: `br_${crypto.randomUUID()}`, name: "Head Office", location: "HQ, Addis Ababa" },
        ];
        db.transaction((items) => {
            if (items && items.length > 0) {
                items.forEach(item => insertBranch.run(item.id, item.name, item.location))
            }
        })(branches);
    }

    if (db.prepare('SELECT COUNT(*) as count FROM departments').get().count === 0) {
        const insertDepartment = db.prepare('INSERT INTO departments (id, name) VALUES (?, ?)');
        const departments = [
            { id: `dep_${crypto.randomUUID()}`, name: "Branch Operations" },
            { id: `dep_${crypto.randomUUID()}`, name: "IT Department" },
        ];
         db.transaction((items) => {
            if (items && items.length > 0) {
                items.forEach(item => insertDepartment.run(item.id, item.name))
            }
        })(departments);
    }

    if (db.prepare('SELECT COUNT(*) as count FROM mini_apps').get().count === 0) {
        const insertMiniApp = db.prepare('INSERT INTO mini_apps (id, name, url, logo_url, username, password, encryption_key) VALUES (?, ?, ?, ?, ?, ?, ?)');
        const miniApps = [ { id: `mapp_${crypto.randomUUID()}`, name: "Cinema Ticket", url: "https://cinema.example.com", logo_url: "https://picsum.photos/seed/cinema/100/100", username: "cinema_api", password: "secure_password_1", encryption_key: crypto.randomBytes(32).toString('hex') }];
        db.transaction((items) => {
            if (items && items.length > 0) {
                items.forEach(item => insertMiniApp.run(item.id, item.name, item.url, item.logo_url, item.username, item.password, item.encryption_key))
            }
        })(miniApps);
    }

    console.log("Database initialized with new schema.");
}


export { db };
