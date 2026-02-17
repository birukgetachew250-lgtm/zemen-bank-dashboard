const oracledb = require('oracledb');

(async () => {
  const c = await oracledb.getConnection({
    user: 'app_control_module',
    password: 'test',
    connectString: 'localhost:1521/FREEPDB1'
  });
  
  const tables = ['BillFormField', 'BillFlowStep', 'BillApiConfig', 'BillDisplayField', 'BillProvider', 'BillCategory', 'BillSubcategory'];
  
  for (const t of tables) {
    const r = await c.execute(
      `SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH FROM ALL_TAB_COLUMNS WHERE TABLE_NAME = :t AND OWNER = 'APP_CONTROL_MODULE' ORDER BY COLUMN_ID`,
      { t },
      { outFormat: oracledb.OBJECT }
    );
    console.log(`\n=== ${t} (${r.rows.length} columns) ===`);
    r.rows.forEach(row => console.log(`  ${row.COLUMN_NAME} : ${row.DATA_TYPE}(${row.DATA_LENGTH})`));
  }
  
  await c.close();
})();
