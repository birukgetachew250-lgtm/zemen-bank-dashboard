const oracledb = require('oracledb');
async function run() {
  const c = await oracledb.getConnection({
    user: 'dash_module',
    password: 'test',
    connectString: 'localhost:1521/FREEPDB1'
  });
  await c.execute("UPDATE DASH_USERS SET PASSWORD = 'Admin@1234'");
  await c.commit();
  console.log('Passwords reset to Admin@1234');
  await c.close();
}
run();
