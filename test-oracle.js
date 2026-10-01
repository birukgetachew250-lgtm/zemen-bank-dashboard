const oracledb = require('oracledb');

async function runTest() {
    console.log("=========================================");
    console.log("1. Starting Thick mode initialization...");
    try {
        oracledb.initOracleClient({ libDir: '/usr/lib/oracle/21/client64/lib' });
        console.log("2. SUCCESS: Thick mode initialized.");
    } catch (err) {
        console.error("2. ERROR: Failed to initialize Thick mode.");
        console.error("   Details:", err.message);
        console.log("=========================================");
        return;
    }

    console.log("3. Is OracleDB in Thin mode? ", oracledb.thin);

    console.log("4. Attempting to connect to FlexDB...");
    try {
        const connection = await oracledb.getConnection({
            user: 'SUPERAPP',
            password: '1Ethiopia@859522',
            connectString: '10.1.1.142:1521/FCUBSPRD'
        });
        console.log("5. SUCCESS: Connected to FlexDB in Thick mode!");
        await connection.close();
    } catch (err) {
        console.error("5. ERROR: Failed to connect.");
        console.error("   Details:", err.message);
    }
    console.log("=========================================");
}

runTest();
