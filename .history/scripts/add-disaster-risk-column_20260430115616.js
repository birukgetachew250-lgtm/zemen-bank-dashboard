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
    process.exit(1);
  }

  const match = cs.match(/^(.*?)\/(.*?)@(.*)$/);
  if (!match) {
    throw new Error(`Invalid connection string format: ${cs}`);
  }

  const [, user, password, connectString] = match;
  const connection = await oracledb.getConnection({ user, password, connectString });

  const checkSql = `
    SELECT COUNT(*) AS CNT
    FROM ALL_TAB_COLUMNS
    WHERE OWNER = 'LIMIT_CHARGE_MODULE'
      AND TABLE_NAME = 'ChargeRules'
      AND UPPER(COLUMN_NAME) = 'DISASTERRISKPERCENTAGE'
  `;

  const check = await connection.execute(checkSql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
  const count = Number(check.rows?.[0]?.CNT || 0);

  if (count > 0) {
    console.log('DisasterRiskPercentage column already exists. No changes made.');
    await connection.close();
    return;
  }

  const alterSql = `
    ALTER TABLE "LIMIT_CHARGE_MODULE"."ChargeRules"
    ADD "DisasterRiskPercentage" NUMBER(18,6)
  `;

  await connection.execute(alterSql);
  await connection.commit();
  console.log('Added column: "DisasterRiskPercentage" NUMBER(18,6)');

  await connection.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
