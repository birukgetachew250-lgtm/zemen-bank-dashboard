const oracledb = require('oracledb');

async function main() {
  const connStr = 'app_control_module/test@localhost:1521/FREEPDB1';
  const user = connStr.match(/^(.*?)\//)[1];
  const password = connStr.match(/\/(.*?)@/)[1];
  const connectString = connStr.match(/@(.*?)$/)[1];
  
  const conn = await oracledb.getConnection({ user, password, connectString });
  
  const tablesToCheck = ['BillApiConfig', 'BillDisplayField', 'BillCategory'];
  
  for (const t of tablesToCheck) {
    const cols = await conn.execute(
      'SELECT column_name, data_type, data_length, data_precision, data_scale, nullable FROM user_tab_columns WHERE table_name = :t ORDER BY column_id',
      { t }, { outFormat: oracledb.OBJECT }
    );
    console.log('\n=== ' + t + ' COLUMNS ===');
    cols.rows.forEach(r => {
      console.log('  ' + r.COLUMN_NAME + ' (' + r.DATA_TYPE + (r.DATA_PRECISION ? '(' + r.DATA_PRECISION + (r.DATA_SCALE ? ',' + r.DATA_SCALE : '') + ')' : '') + ') ' + (r.NULLABLE === 'Y' ? 'NULL' : 'NOT NULL'));
    });
  }

  // Also check BillFlowStep first few columns we missed
  const fsCols = await conn.execute(
    'SELECT column_name, data_type, data_precision, nullable FROM user_tab_columns WHERE table_name = :t ORDER BY column_id',
    { t: 'BillFlowStep' }, { outFormat: oracledb.OBJECT }
  );
  console.log('\n=== BillFlowStep ALL COLUMNS ===');
  fsCols.rows.forEach(r => {
    console.log('  ' + r.COLUMN_NAME + ' (' + r.DATA_TYPE + ') ' + (r.NULLABLE === 'Y' ? 'NULL' : 'NOT NULL'));
  });

  // Check row counts
  for (const t of ['BillCategory', 'BillSubcategory', 'BillProvider', 'BillFormField', 'BillFlowStep', 'BillApiConfig', 'BillDisplayField']) {
    const cnt = await conn.execute('SELECT COUNT(*) AS cnt FROM "' + t + '"', [], { outFormat: oracledb.OBJECT });
    console.log(t + ' rows: ' + cnt.rows[0].CNT);
  }

  await conn.close();
}
main().catch(e => console.error(e));
