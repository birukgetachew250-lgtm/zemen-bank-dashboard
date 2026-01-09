// src/scripts/test-db.js
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });
const oracledb = require('oracledb');

// On Windows, you need to tell Node.js where to find the Oracle Instant Client libraries.
// If you are not on Windows, or if your Oracle libraries are in the system path, you can comment this out.
// try {
//   oracledb.initOracleClient({ libDir: 'C:\\path\\to\\your\\instantclient' });
// } catch (err) {
//   console.error('Whoops!');
//   console.error(err);
//   process.exit(1);
// }


async function runTest() {
    let connection;
    const connectString = process.env.USER_MODULE_DB_CONNECTION_STRING;
    
    if (!connectString) {
        console.error("Error: USER_MODULE_DB_CONNECTION_STRING is not defined in your .env file.");
        return;
    }
    
    const [user, passwordPart] = connectString.split('/');
    const [password, server] = passwordPart.split('@');

    console.log(`Attempting to connect to Oracle database...`);
    console.log(`- Connect String: ${server}`);
    console.log(`- User: ${user}`);

    try {
        connection = await oracledb.getConnection({
            user: user,
            password: password,
            connectString: server,
        });

        console.log("\n✅ Success! Connection to Oracle database was established.");

        // Optional: Run a simple query to verify
        const result = await connection.execute(
            `SELECT 'Connection successful!' AS message FROM DUAL`
        );
        console.log("Query result:", result.rows[0]);

    } catch (err) {
        console.error("\n❌ Failure! Could not connect to the database.");
        console.error("Error Details:", err.message);
        console.log("\nTroubleshooting tips:");
        console.log("1. Verify the USER_MODULE_DB_CONNECTION_STRING in your .env file is correct.");
        console.log("2. Ensure the Oracle database is running and accessible from your machine.");
        console.log("3. Check for any firewalls blocking the connection to the database server and port.");
        console.log("4. If on Windows, ensure you have the Oracle Instant Client installed and the path is correctly set in this script if needed.");

    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log("\nConnection closed.");
            } catch (err) {
                console.error("Error closing the connection:", err);
            }
        }
    }
}

runTest();
