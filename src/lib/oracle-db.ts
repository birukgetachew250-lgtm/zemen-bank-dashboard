
'use server';

import oracledb from 'oracledb';

async function getOracleConnection(connectionString: string | undefined) {
    if (!connectionString) {
        throw new Error("Oracle connection string is not defined in the environment variables.");
    }
    
    // This parsing logic might need to be adjusted based on your exact connection string format.
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

export async function executeQuery(connectionString: string | undefined, query: string, binds: any[] = []) {
    let connection;
    try {
        connection = await getOracleConnection(connectionString);

        // Determine if autoCommit should be used.
        // It's crucial for DML statements (INSERT, UPDATE, DELETE) to persist changes.
        const isDML = /^\s*(insert|update|delete)/i.test(query);

        const options = {
            outFormat: oracledb.OBJECT,
            autoCommit: isDML,
        };

        console.log(`[Oracle DB] Executing query (autoCommit: ${isDML}): ${query}`);
        const result = await connection.execute(query, binds, options);
        
        console.log(`[Oracle DB] Execution result:`, { rowsAffected: result.rowsAffected, rows: result.rows ? 'omitted for brevity' : 'none' });

        return result.rows;
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
