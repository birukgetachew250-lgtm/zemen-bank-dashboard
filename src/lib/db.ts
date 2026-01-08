

'server-only';

import Database from 'better-sqlite3';
import oracledb from 'oracledb';
import path from 'path';
import fs from 'fs';
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
    console.log(`Using demo SQLite database at ${dbPath}. Run 'npm run seed' to populate it.`);
}


export { db };
