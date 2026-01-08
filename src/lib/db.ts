

'server-only';

import Database from 'better-sqlite3';
import oracledb from 'oracledb';
import path from 'path';
import fs from 'fs';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';
import config from './config';

// NOTE: This setup uses SQLite for the demo environment.
// In a production environment (when config.db.isProduction is true),
// you would replace this with a connection to your Oracle databases
// using the connection strings from config.db.

let db: any;

if (config.db.isProduction) {
    // ---- PRODUCTION DATABASE CONNECTION ----
    console.log("Production mode enabled. Initializing Oracle connection logic...");

    // Set oracledb defaults
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

    // This is a placeholder for a more robust connection pool.
    // In a real app, you would manage connections more carefully.
    // For now, we are creating a mock of the 'better-sqlite3' API
    // to minimize changes in the data access code.
    
    // This is a simplified mock of the 'better-sqlite3' API for demonstration.
    // A real implementation would require a full translation layer or different DAO logic.
    db = {
        prepare: (sql: string) => {
            const isUserModuleQuery = sql.includes('"USER_MODULE"');
            const isSecurityModuleQuery = sql.includes('"SECURITY_MODULE"');
            const isOtpModuleQuery = sql.includes('"OTP_MODULE"');

            const getConnection = async () => {
                if (!config.db.connectString || !config.db.user || !config.db.password) {
                    throw new Error("Database credentials are not set in the .env file for production.");
                }

                // Determine which user to connect as. This is a simplification.
                // A real app might have different users/passwords per module.
                let user = config.db.user;
                if (isSecurityModuleQuery) user = 'security_module';
                else if (isOtpModuleQuery) user = 'otp_module';
                
                console.log(`[DB] Getting connection for user: ${user}`);

                return await oracledb.getConnection({ 
                    user: user,
                    password: config.db.password,
                    connectString: config.db.connectString 
                });
            };
            
            const transformSql = (sql: string) => {
                let i = 0;
                // Replaces '?' with ':1', ':2', etc. for Oracle binding
                return sql.replace(/\?/g, () => `:${++i}`);
            };

            return {
                get: async (...params: any[]) => {
                    let connection;
                    const oracleSql = transformSql(sql);
                    try {
                        console.log("Executing SQL Query:", oracleSql, "with params:", params);
                        connection = await getConnection();
                        const result = await connection.execute(oracleSql, params);
                        const row = result.rows ? result.rows[0] : undefined;
                        
                        // Handle count queries which may have different casing in Oracle
                        if (row) {
                           const countKey = Object.keys(row).find(k => k.toLowerCase() === 'count');
                            if (countKey) {
                                return { count: row[countKey] };
                            }
                        }
                        
                        return row;
                    } finally {
                        if (connection) {
                            try {
                                await connection.close();
                            } catch (err) {
                                console.error("Error closing Oracle connection: ", err);
                            }
                        }
                    }
                },
                all: async (...params: any[]) => {
                    let connection;
                    const oracleSql = transformSql(sql);
                    try {
                        console.log("Executing SQL Query:", oracleSql, "with params:", params);
                        connection = await getConnection();
                        const result = await connection.execute(oracleSql, params);
                        return result.rows || [];
                    } finally {
                        if (connection) {
                           try {
                                await connection.close();
                            } catch (err) {
                                console.error("Error closing Oracle connection: ", err);
                            }
                        }
                    }
                },
                run: async (...params: any[]) => {
                    let connection;
                    const oracleSql = transformSql(sql);
                    try {
                        console.log("Executing SQL Command:", oracleSql, "with params:", params);
                        connection = await getConnection();
                        const result = await connection.execute(oracleSql, params, { autoCommit: true });
                        return { changes: result.rowsAffected || 0 };
                    } finally {
                        if (connection) {
                            try {
                                await connection.close();
                            } catch (err) {
                                console.error("Error closing Oracle connection: ", err);
                            }
                        }
                    }
                },
            };
        }
    };
    
    console.warn(
      "IS_PRODUCTION_DB is true. App will try to connect to Oracle. " +
      "If the connection fails, an error will be thrown. Ensure Oracle Instant Client is properly installed and configured."
    );

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

      -- OTP_MODULE Tables (Translated from Oracle DDL for SQLite)
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

    // --- FIX: START ---
    // One-time migration to add branchId column to departments table if it doesn't exist
    try {
        const columns = db.pragma('table_info(departments)');
        const hasBranchId = columns.some((col: any) => col.name === 'branchId');
        if (!hasBranchId) {
            db.exec('ALTER TABLE departments ADD COLUMN branchId TEXT');
            console.log("Applied migration: Added 'branchId' to 'departments' table.");
        }
    } catch (e) {
        // This might fail if the table doesn't exist yet, which is fine.
        // The CREATE TABLE statement will handle it.
        console.warn("Could not check/alter departments table, probably because it doesn't exist yet. This is likely safe.");
    }
    // --- FIX: END ---


    // Seed admin user, roles, and other demo data
    const admin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@zemen.com');
    if (!admin) {
      db.prepare(
        "INSERT INTO users (id, employeeId, name, email, password, role, branch, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(
        'user_ck_admin_001', '0001', 'Admin User', 'admin@zemen.com', 'zemen2025', 'Admin',
        'Head Office', 'IT Department'
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
        db.transaction((items) => {
            if (items && items.length > 0) {
                items.forEach(item => insert.run(item.id, item.name, item.permissions));
            }
        })(items);
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
        if (questions && questions.length > 0) {
          for (const q of questions) insertSecQuestion.run(q.id, q.question);
        }
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
        const insertDepartment = db.prepare('INSERT INTO departments (id, name, branchId) VALUES (?, ?, ?)');
        
        const headOffice = db.prepare("SELECT id FROM branches WHERE name = 'Head Office'").get();
        
        const departments = [
            { id: `dep_${crypto.randomUUID()}`, name: "Branch Operations", branchId: headOffice.id },
            { id: `dep_${crypto.randomUUID()}`, name: "IT Department", branchId: headOffice.id },
        ];
         db.transaction((items) => {
            if (items && items.length > 0) {
                items.forEach(item => insertDepartment.run(item.id, item.name, item.branchId))
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
    
    // Seed OTP data
    if (db.prepare('SELECT COUNT(*) as count FROM OtpCodes').get().count === 0) {
        const insertOtpCode = db.prepare(`
            INSERT INTO OtpCodes (Id, UserId, CodeHash, Secret, OtpType, Purpose, IsUsed, Attempts, ExpiresAt, InsertDate, UpdateDate, InsertUser, UpdateUser, Version) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const otpCodes = [
            { "Id": "78fc45dc-9e36-419c-b2df-93baff7e4e09", "UserId": "0058322", "CodeHash": "0951885f722d1adaaff8f844f4caf2b01329dd7769fff4c606d2fabaf184ef1c", "Secret": null, "OtpType": "SmsCode", "Purpose": "LoginMFA", "IsUsed": 1, "Attempts": 0, "ExpiresAt": "2025-11-28 17:30:11", "InsertDate": "2025-11-28 17:20:11", "UpdateDate": "2025-11-29 07:04:34", "InsertUser": "system", "UpdateUser": "system", "Version": "44ABB8931602BCC6E063430B10ACCF92" },
            { "Id": "b8ac902d-9816-4fb4-b9b2-7250382eb764", "UserId": "0034047", "CodeHash": "5eb7554bb84c10d7840c6263936b8a5d33c4e61ab4b743253f70261cf08b1ea5", "Secret": null, "OtpType": "SmsCode", "Purpose": "LoginMFA", "IsUsed": 1, "Attempts": 0, "ExpiresAt": "2025-12-12 00:40:54", "InsertDate": "2025-11-28 17:21:42", "UpdateDate": "2025-12-12 11:39:55", "InsertUser": "system", "UpdateUser": "system", "Version": "44ABB8931604BCC6E063430B10ACCF92" },
            { "Id": "cf2c4008-4e0d-4795-a042-978d71db675b", "UserId": "0048533", "CodeHash": "ec254ff4ba7183e6dc11db9e5a63c92315def262cf820be07a9d3a622bed094f", "Secret": null, "OtpType": "SmsCode", "Purpose": "LoginMFA", "IsUsed": 1, "Attempts": 2, "ExpiresAt": "2025-11-28 17:31:47", "InsertDate": "2025-11-28 17:21:47", "UpdateDate": "2025-11-29 10:08:45", "InsertUser": "system", "UpdateUser": "system", "Version": "44ABB8931605BCC6E063430B10ACCF92" },
        ];
         db.transaction((items) => {
            if (items && items.length > 0) {
                items.forEach(item => insertOtpCode.run(item.Id, item.UserId, item.CodeHash, item.Secret, item.OtpType, item.Purpose, item.IsUsed, item.Attempts, item.ExpiresAt, item.InsertDate, item.UpdateDate, item.InsertUser, item.UpdateUser, item.Version))
            }
        })(otpCodes);
    }


    console.log("Database initialized with new schema.");
}


export { db };

    