import oracledb from 'oracledb';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
    const cs = process.env.APP_CONTROL_DB_CONNECTION_STRING;
    if (!cs) {
        console.error('Error: APP_CONTROL_DB_CONNECTION_STRING is not defined in .env');
        process.exit(1);
    }

    const userMatch = cs.match(/^(.*?)\//);
    const passwordMatch = cs.match(/\/(.*?)@/);
    const serverMatch = cs.match(/@(.*?)$/);

    if (!userMatch || !passwordMatch || !serverMatch) {
      console.error("Invalid Oracle connection string format. Expected format: user/password@host:port/service");
      process.exit(1);
    }

    const user = userMatch[1];
    const password = passwordMatch[1];
    const connectString = serverMatch[1];

    let connection;
    try {
        console.log(`Connecting to Oracle DB at ${connectString} as ${user}...`);
        connection = await oracledb.getConnection({
            user,
            password,
            connectString,
        });

        console.log('Connected. Running migrations...');

        const tables = [
            `CREATE TABLE "APP_CONTROL_MODULE"."Schools" (
                "Id" VARCHAR2(64) PRIMARY KEY,
                "SchoolName" VARCHAR2(255) NOT NULL,
                "SchoolImage" VARCHAR2(255),
                "SchoolExternalId" VARCHAR2(100) UNIQUE NOT NULL,
                "SchoolFlexAccount" VARCHAR2(100) NOT NULL,
                "SchoolProductId" VARCHAR2(100) NOT NULL,
                "Status" VARCHAR2(50) DEFAULT 'Active',
                "Description" VARCHAR2(1000),
                "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "CreatedBy" VARCHAR2(255) DEFAULT 'system',
                "UpdatedBy" VARCHAR2(255) DEFAULT 'system'
            )`,
            `CREATE TABLE "APP_CONTROL_MODULE"."OnlineLinking" (
                "Id" VARCHAR2(64) PRIMARY KEY,
                "FullName" VARCHAR2(255) NOT NULL,
                "DateOfBirth" VARCHAR2(50),
                "NationalId" VARCHAR2(100),
                "Phone" VARCHAR2(50) NOT NULL,
                "Email" VARCHAR2(255),
                "HomeBranch" VARCHAR2(100) NOT NULL,
                "FaydaVerified" NUMBER(1) DEFAULT 0,
                "FaydaData" CLOB,
                "LivenessCheckPassed" NUMBER(1) DEFAULT 0,
                "VideoUrl" VARCHAR2(500),
                "VideoWord" VARCHAR2(100),
                "SignatureUrl" VARCHAR2(500),
                "AccountNumber" VARCHAR2(100),
                "AccountType" VARCHAR2(100),
                "Status" VARCHAR2(50) DEFAULT 'Pending',
                "SubmittedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "ReviewedAt" TIMESTAMP,
                "ApprovedAt" TIMESTAMP,
                "RejectedAt" TIMESTAMP,
                "RejectionReason" VARCHAR2(1000),
                "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE "APP_CONTROL_MODULE"."LinkingReview" (
                "Id" VARCHAR2(64) PRIMARY KEY,
                "LinkingId" VARCHAR2(64) NOT NULL,
                "ReviewerName" VARCHAR2(255) NOT NULL,
                "ReviewerEmail" VARCHAR2(255) NOT NULL,
                "Action" VARCHAR2(100) NOT NULL,
                "Notes" VARCHAR2(1000),
                "ReviewedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (const sql of tables) {
            try {
                await connection.execute(sql);
                const tableNameMatch = sql.match(/TABLE "APP_CONTROL_MODULE"."(.*?)"/);
                console.log(`Successfully created table: ${tableNameMatch ? tableNameMatch[1] : 'Unknown'}`);
            } catch (err: any) {
                if (err.message.includes('ORA-00955')) {
                    const tableNameMatch = sql.match(/TABLE "APP_CONTROL_MODULE"."(.*?)"/);
                    console.log(`Table already exists, skipping: ${tableNameMatch ? tableNameMatch[1] : 'Unknown'}`);
                } else {
                    console.error('Failed to run query:', err.message);
                }
            }
        }

        console.log('Migration complete.');
    } catch (err: any) {
        console.error('Migration failed:', err.message);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
}

migrate();
