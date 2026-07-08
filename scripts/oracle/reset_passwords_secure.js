const oracledb = require('oracledb');
const bcrypt = require('bcryptjs');

async function run() {
  const c = await oracledb.getConnection({
    user: 'dash_module',
    password: 'test',
    connectString: 'localhost:1521/FREEPDB1'
  });
  
  const hash = bcrypt.hashSync('Admin@1234', 10);
  console.log('Generated hash for Admin@1234:', hash);
  
  await c.execute("UPDATE DASH_USERS SET PASSWORD = :1", [hash]);
  await c.commit();
  console.log('Passwords securely updated to bcrypt hash in Oracle.');
  
  await c.close();
}
run();
