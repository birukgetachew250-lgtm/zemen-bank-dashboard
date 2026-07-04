import oracledb from 'oracledb';
import dotenv from 'dotenv';
dotenv.config();

async function seed() {
    const cs = process.env.APP_CONTROL_DB_CONNECTION_STRING;
    if (!cs) {
        console.error('Error: APP_CONTROL_DB_CONNECTION_STRING is not defined in .env');
        process.exit(1);
    }

    const userMatch = cs.match(/^(.*?)\//);
    const passwordMatch = cs.match(/\/(.*?)@/);
    const serverMatch = cs.match(/@(.*?)$/);

    if (!userMatch || !passwordMatch || !serverMatch) {
      console.error("Invalid Oracle connection string format.");
      process.exit(1);
    }

    const user = userMatch[1];
    const password = passwordMatch[1];
    const connectString = serverMatch[1];

    let connection;
    try {
        console.log(`Connecting to Oracle DB at ${connectString}...`);
        connection = await oracledb.getConnection({ user, password, connectString });
        
        console.log('Seeding Demo Applications...');

        const apps = [
            { id: 'app_lk_demo1', name: 'Abebe Kebede', phone: '+251911223344', branch: 'Addis Ababa', status: 'Pending', fayda: 1, liveness: 1 },
            { id: 'app_lk_demo2', name: 'Sara Tadesse', phone: '+251922334455', branch: 'Hawassa', status: 'Verified', fayda: 1, liveness: 1 },
            { id: 'app_lk_demo3', name: 'Dawit Mekonnen', phone: '+251933445566', branch: 'Dire Dawa', status: 'Approved', fayda: 1, liveness: 1 },
        ];

        for (const app of apps) {
            try {
                await connection.execute(`
                    INSERT INTO "APP_CONTROL_MODULE"."OnlineLinking" (
                        "Id", "FullName", "Phone", "HomeBranch", "Status", "FaydaVerified", "LivenessCheckPassed", "SubmittedAt", "FaydaData"
                    ) VALUES (
                        :id, :name, :phone, :branch, :status, :fayda, :liveness, SYSDATE, :faydaData
                    )
                `, { 
                    id: app.id, name: app.name, phone: app.phone, branch: app.branch, 
                    status: app.status, fayda: app.fayda, liveness: app.liveness,
                    faydaData: '{"nationalId":"1234567890","firstName":"' + app.name.split(' ')[0] + '","lastName":"' + app.name.split(' ')[1] + '","dateOfBirth":"1990-01-01"}'
                }, { autoCommit: true });
                console.log(`Inserted: ${app.name} (${app.status})`);
            } catch (err: any) {
                if (err.message.includes('ORA-00001')) {
                    console.log(`Already exists: ${app.name}`);
                } else {
                    console.error('Error inserting:', err.message);
                }
            }
        }

        // Add a mock review for the verified one
        try {
            await connection.execute(`
                INSERT INTO "APP_CONTROL_MODULE"."LinkingReview" (
                    "Id", "LinkingId", "ReviewerName", "ReviewerEmail", "Action", "Notes", "ReviewedAt"
                ) VALUES (
                    'rev_demo1', 'app_lk_demo2', 'System Verifier', 'verifier@zemen.com', 'verified', 'All documents look authentic. Fayda matches.', SYSDATE
                )
            `, [], { autoCommit: true });
        } catch (e) {}

        console.log('Seeding complete.');
    } catch (err: any) {
        console.error('Seeding failed:', err.message);
    } finally {
        if (connection) await connection.close();
    }
}

seed();
