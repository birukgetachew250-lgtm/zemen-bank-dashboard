
'server-only';

import sqlite3 from 'sqlite3';
import oracledb from 'oracledb';
import path from 'path';
import fs from 'fs';
import config from './config';
import { PrismaClient } from '@prisma/client';

// Prisma Client for User Management
// This will connect using the USER_MODULE_DATABASE_URL from .env
export const prisma = new PrismaClient();


// NOTE: This setup uses SQLite for the demo environment for all non-user services.
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
    // ---- DEMO/FALLBACK SQLITE DATABASE using sqlite3 ----
    const dbPath = 'zemen.db';
    const sqlite = sqlite3.verbose();
    
    if (!fs.existsSync(dbPath)) {
        console.error(`Database file not found at ${dbPath}. Please run 'npm run seed' to create and populate it.`);
    }

    const instance = new sqlite.Database(dbPath, (err) => {
        if (err) {
            console.error('Failed to open SQLite database:', err.message);
            throw err;
        }
        console.log(`Using demo SQLite database at ${dbPath}. Run 'npm run seed' to (re)populate it.`);
    });
    
    // Create a wrapper to mimic the better-sqlite3 API for compatibility
    db = {
        prepare: (sql: string) => {
            return {
                get: (...params: any[]) => {
                    return new Promise((resolve, reject) => {
                        instance.get(sql, params, (err, row) => {
                            if (err) reject(err);
                            else resolve(row);
                        });
                    });
                },
                all: (...params: any[]) => {
                    return new Promise((resolve, reject) => {
                        instance.all(sql, params, (err, rows) => {
                            if (err) reject(err);
                            else resolve(rows);
                        });
                    });
                },
                run: (...params: any[]) => {
                    return new Promise((resolve, reject) => {
                        instance.run(sql, params, function(err) {
                            if (err) reject(err);
                            else resolve({ changes: this.changes });
                        });
                    });
                },
                 // Add a transaction method that mimics better-sqlite3
                transaction: (fn: (...args: any[]) => any) => {
                    return (...args: any[]) => {
                        return new Promise<void>((resolve, reject) => {
                            instance.serialize(() => {
                                instance.run('BEGIN TRANSACTION');
                                try {
                                    fn(...args);
                                    instance.run('COMMIT', (err) => {
                                      if (err) throw err;
                                      resolve();
                                    });
                                } catch (e) {
                                    console.error('Transaction failed, rolling back.', e);
                                    instance.run('ROLLBACK', (err) => {
                                      if (err) reject(err);
                                      else reject(e);
                                    });
                                }
                            });
                        });
                    };
                }
            };
        },
        close: () => {
             return new Promise<void>((resolve, reject) => {
                instance.close((err) => {
                    if (err) reject(err);
                    else resolve();
                });
             });
        }
    };
}


export { db };
