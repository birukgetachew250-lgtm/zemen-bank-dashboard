
'use server';

import oracledb from 'oracledb';

async function getOracleConnection(connectionString: string | undefined) {
    if (!connectionString) {
        // During build, env var may not be available. Return null to avoid crashing build.
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

export async function executeQuery(connectionString: string | undefined, query: string, binds: any[] | Record<string, any> = []) {
    let connection;
    try {
        connection = await getOracleConnection(connectionString);
        
        if (!connection) {
            // Gracefully return empty during build if connection is not available
            return { rows: [], rowsAffected: 0, outBinds: undefined };
        }

        const isDML = /^\s*(insert|update|delete)/i.test(query);

        const options: oracledb.ExecuteOptions = {
            outFormat: oracledb.OBJECT,
            autoCommit: isDML,
        };

        console.log(`[Oracle DB] Executing query (autoCommit: ${isDML}): ${query}`);
        const result = await connection.execute(query, binds, options);
        
        console.log(`[Oracle DB] Execution result:`, { rowsAffected: result.rowsAffected, rows: result.rows ? 'omitted for brevity' : 'none' });

        return {
          rows: result.rows,
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
