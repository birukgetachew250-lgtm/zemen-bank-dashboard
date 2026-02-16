const oracledb = require('oracledb');

async function main() {
  const connStr = 'app_control_module/test@localhost:1521/FREEPDB1';
  const user = connStr.match(/^(.*?)\//)[1];
  const password = connStr.match(/\/(.*?)@/)[1];
  const connectString = connStr.match(/@(.*?)$/)[1];
  
  const conn = await oracledb.getConnection({ user, password, connectString });
  
  // List all tables in the schema
  const tables = await conn.execute(
    'SELECT table_name FROM user_tables ORDER BY table_name',
    [], { outFormat: oracledb.OBJECT }
  );
  console.log('=== TABLES ===');
  console.log(JSON.stringify(tables.rows, null, 2));
  
  // For each Bill* table, get columns
  const billTables = tables.rows.filter(r => r.TABLE_NAME.startsWith('Bill'));
  for (const t of billTables) {
    const cols = await conn.execute(
      'SELECT column_name, data_type, data_length, data_precision, data_scale, nullable FROM user_tab_columns WHERE table_name = :t ORDER BY column_id',
      { t: t.TABLE_NAME }, { outFormat: oracledb.OBJECT }
    );
    console.log('\n=== ' + t.TABLE_NAME + ' ===');
    console.log(JSON.stringify(cols.rows, null, 2));
  }
  
  // Also check for any sample data
  for (const t of billTables) {
    const data = await conn.execute(
      'SELECT * FROM "' + t.TABLE_NAME + '" WHERE ROWNUM <= 2',
      [], { outFormat: oracledb.OBJECT }
    );
    console.log('\n=== SAMPLE DATA: ' + t.TABLE_NAME + ' ===');
    console.log(JSON.stringify(data.rows, null, 2));
  }
  
  await conn.close();
}
main().catch(e => console.error(e));
