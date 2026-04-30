const oracledb = require('oracledb');
const fs = require('fs');
const path = require('path');

function getConnectionString() {
  if (process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING) {
    return process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING;
  }

  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return '';
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith('LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING=')) {
      return line.split('=').slice(1).join('=').trim();
    }
  }
  return '';
}

(async () => {
  const cs = getConnectionString();
  if (!cs) {
    console.log('NO_CONN_STRING');
    return;
  }

  const connection = await oracledb.getConnection(cs);
  const allColumnsSql = `
    SELECT COLUMN_NAME, DATA_TYPE
    FROM ALL_TAB_COLUMNS
    WHERE OWNER = 'LIMIT_CHARGE_MODULE'
      AND TABLE_NAME = 'ChargeRules'
    ORDER BY COLUMN_ID
  `;

  const disasterColumnSql = `
    SELECT COLUMN_NAME
    FROM ALL_TAB_COLUMNS
    WHERE OWNER = 'LIMIT_CHARGE_MODULE'
      AND TABLE_NAME = 'ChargeRules'
      AND UPPER(COLUMN_NAME) LIKE '%DISASTER%'
    ORDER BY COLUMN_ID
  `;

  const allColumns = await connection.execute(allColumnsSql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
  const disasterColumns = await connection.execute(disasterColumnSql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

  console.log('COLUMNS', JSON.stringify(allColumns.rows, null, 2));
  console.log('DISASTER_MATCH', JSON.stringify(disasterColumns.rows, null, 2));

  await connection.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
