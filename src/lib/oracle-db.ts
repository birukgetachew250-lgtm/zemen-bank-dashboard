
'use server';

import oracledb from 'oracledb';

// Force CLOBs to be fetched as strings to avoid Lob objects/circular structures
if (typeof oracledb !== 'undefined' && oracledb.CLOB) {
    oracledb.fetchAsString = [oracledb.CLOB];
}

async function getOracleConnection(connectionString: string | undefined) {
    if (!connectionString) {
        if (process.env.NODE_ENV === 'production') {
            console.warn("[Oracle DB] Connection string is not defined. Skipping connection during build.");
            return null;
        }
        throw new Error("Oracle connection string is not defined in the environment variables.");
    }
    
    const userMatch = connectionString.match(/^(.*?)\//);
    const passwordMatch = connectionString.match(/\/(.*?)@/);
    const serverMatch = connectionString.match(/@(.*?)$/);

    if (!userMatch || !passwordMatch || !serverMatch) {
      throw new Error("Invalid Oracle connection string format. Expected format: user/password@host:port/service");
    }

    const user = userMatch[1];
    const password = passwordMatch[1];
    const connectString = serverMatch[1];
    
    return await oracledb.getConnection({
        user,
        password,
        connectString,
    });
}

/**
 * Sanitizes a row from Oracle DB to ensure it is a plain object 
 * and handles types like Uint8Array that are not JSON-serializable.
 * Prevents circular structure errors by safely handling objects.
 */
function sanitizeRow(row: any) {
    if (!row || typeof row !== 'object') return row;
    
    const sanitized: any = {};
    for (const key in row) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
            let value = row[key];
            
            // Handle Uint8Array (RAW types) - convert to Hex string
            if (value instanceof Uint8Array) {
                sanitized[key] = Buffer.from(value).toString('hex');
            } 
            // Dates are fine for RSC but sometimes need stringification for specific APIs
            else if (value instanceof Date) {
                sanitized[key] = value;
            }
            // Safely handle other objects/arrays to avoid circular refs (like NVPair)
            else if (value !== null && typeof value === 'object') {
                try {
                    // Verify it's serializable
                    const str = JSON.stringify(value);
                    sanitized[key] = JSON.parse(str);
                } catch (e) {
                    // Fallback for non-serializable objects (like internal driver types)
                    sanitized[key] = String(value);
                }
            }
            else {
                sanitized[key] = value;
            }
        }
    }
    return sanitized;
}

export async function executeQuery(connectionString: string | undefined, query: string, binds: any[] | Record<string, any> = []) {
    let connection;
    try {
        connection = await getOracleConnection(connectionString);
        
        if (!connection) {
            return { rows: [], rowsAffected: 0, outBinds: undefined };
        }

        const isDML = /^\s*(insert|update|delete)/i.test(query);

        const options: oracledb.ExecuteOptions = {
            outFormat: oracledb.OBJECT,
            autoCommit: isDML,
        };

        console.log(`[Oracle DB] Executing query (autoCommit: ${isDML}): ${query}`);
        const result = await connection.execute(query, binds, options);
        
        // Ensure rows are sanitized and free of circular references
        const sanitizedRows = result.rows ? result.rows.map(sanitizeRow) : [];

        console.log(`[Oracle DB] Execution result:`, { rowsAffected: result.rowsAffected, rowCount: sanitizedRows.length });

        return {
          rows: sanitizedRows,
          rowsAffected: result.rowsAffected,
          outBinds: result.outBinds,
        };
    } catch (err) {
        console.error("Oracle DB query failed:", err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing Oracle connection:", err);
            }
        }
    }
}
