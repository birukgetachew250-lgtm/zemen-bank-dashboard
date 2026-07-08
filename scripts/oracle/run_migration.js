#!/usr/bin/env node
/**
 * Oracle Migration Runner
 * Usage:
 *   node scripts/oracle/run_migration.js            -- runs DDL + seed
 *   node scripts/oracle/run_migration.js --ddl-only -- runs DDL only
 *   node scripts/oracle/run_migration.js --seed-only -- runs seed only
 *   node scripts/oracle/run_migration.js --drop      -- drops all tables first (DANGER)
 */

const oracledb = require('oracledb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const CONNECTION_STRING = process.env.DASH_MODULE_ORACLE_CONNECTION_STRING;

if (!CONNECTION_STRING) {
  console.error('❌  DASH_MODULE_ORACLE_CONNECTION_STRING is not set in .env');
  process.exit(1);
}

// Parse "user/password@host:port/service"
const userMatch = CONNECTION_STRING.match(/^(.*?)\//);
const passwordMatch = CONNECTION_STRING.match(/\/(.*?)@/);
const serverMatch = CONNECTION_STRING.match(/@(.*?)$/);

if (!userMatch || !passwordMatch || !serverMatch) {
  console.error('❌  Invalid connection string format. Expected: user/password@host:port/service_name');
  process.exit(1);
}

const DB_CONFIG = {
  user: userMatch[1],
  password: passwordMatch[1],
  connectString: serverMatch[1],
};

const args = process.argv.slice(2);
const DDL_ONLY  = args.includes('--ddl-only');
const SEED_ONLY = args.includes('--seed-only');
const DROP      = args.includes('--drop');

// Tables to drop (in reverse FK order)
const DROP_STATEMENTS = [
  'DROP TABLE DASH_CONFIG_BACKUPS',
  'DROP TABLE DASH_IPS_WALLETS',
  'DROP TABLE DASH_IPS_BANKS',
  'DROP TABLE DASH_OTP_CODES',
  'DROP TABLE DASH_IP_WHITELIST',
  'DROP TABLE DASH_SECURITY_POLICY',
  'DROP TABLE DASH_PASSWORD_HISTORY',
  'DROP TABLE DASH_ACTIVITY_LOG',
  'DROP TABLE DASH_TRANSACTIONS',
  'DROP TABLE DASH_PENDING_APPROVALS',
  'DROP TABLE DASH_CUSTOMERS',
  'DROP TABLE DASH_DEPARTMENTS',
  'DROP TABLE DASH_BRANCHES',
  'DROP TABLE DASH_ROLES',
  'DROP TABLE DASH_USERS',
];

/**
 * Split a SQL file into individual statements, ignoring comments and blank lines.
 * Handles multi-line statements split by semicolons.
 */
function splitSqlStatements(sql) {
  // Remove single-line comments
  sql = sql.replace(/--[^\n]*/g, '');
  
  const statements = [];
  let current = '';
  
  for (const char of sql) {
    current += char;
    if (char === ';') {
      const stmt = current.trim().replace(/;$/, '').trim();
      if (stmt.length > 0) {
        statements.push(stmt);
      }
      current = '';
    }
  }
  
  // Handle last statement without semicolon
  const last = current.trim();
  if (last.length > 0) statements.push(last);
  
  return statements.filter(s => s.length > 2);
}

async function runFile(connection, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const statements = splitSqlStatements(sql);
  
  console.log(`\n📄  Running: ${path.basename(filePath)} (${statements.length} statements)`);
  
  let success = 0;
  let skipped = 0;
  let failed  = 0;
  
  for (const stmt of statements) {
    const preview = stmt.replace(/\s+/g, ' ').slice(0, 80);
    try {
      await connection.execute(stmt);
      console.log(`  ✅  ${preview}...`);
      success++;
    } catch (err) {
      // ORA-00955: name already used by an existing object (table/sequence already exists)
      // ORA-02260: table can have only one primary key
      if (err.errorNum === 955 || err.errorNum === 2260) {
        console.log(`  ⚠️   SKIP (already exists): ${preview}...`);
        skipped++;
      } else {
        console.error(`  ❌  FAILED: ${preview}...`);
        console.error(`     Error: ${err.message}`);
        failed++;
      }
    }
  }
  
  console.log(`\n     Summary: ${success} succeeded, ${skipped} skipped, ${failed} failed`);
  return failed === 0;
}

async function dropAllTables(connection) {
  console.log('\n⚠️   DROPPING all DASH_ tables...');
  for (const stmt of DROP_STATEMENTS) {
    try {
      await connection.execute(stmt);
      console.log(`  🗑️   Dropped: ${stmt}`);
    } catch (err) {
      if (err.errorNum === 942) { // ORA-00942: table or view does not exist
        console.log(`  ⚠️   Skip (not found): ${stmt}`);
      } else {
        console.error(`  ❌  ${stmt}: ${err.message}`);
      }
    }
  }
  await connection.execute('COMMIT');
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Zemen Bank Dashboard — Oracle Migration Runner');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Connecting to: ${DB_CONFIG.user}@${DB_CONFIG.connectString}`);

  let connection;
  try {
    oracledb.fetchAsString = [oracledb.CLOB];
    connection = await oracledb.getConnection(DB_CONFIG);
    console.log('  ✅  Connected to Oracle DB\n');
    
    if (DROP) {
      await dropAllTables(connection);
    }
    
    const ddlFile  = path.join(__dirname, '01_create_tables.sql');
    const seedFile = path.join(__dirname, '02_seed.sql');
    
    if (!SEED_ONLY) {
      const ddlOk = await runFile(connection, ddlFile);
      if (!ddlOk) {
        console.error('\n❌  DDL had failures. Fix errors before seeding.');
        process.exit(1);
      }
      await connection.execute('COMMIT');
    }
    
    if (!DDL_ONLY) {
      const seedOk = await runFile(connection, seedFile);
      if (!seedOk) {
        console.error('\n❌  Seed had failures.');
        process.exit(1);
      }
      await connection.execute('COMMIT');
    }
    
    console.log('\n🎉  Migration complete!');
    
    // Show table count as verification
    const result = await connection.execute(
      `SELECT table_name FROM user_tables WHERE table_name LIKE 'DASH_%' ORDER BY table_name`,
      [],
      { outFormat: oracledb.OBJECT }
    );
    console.log(`\n📊  Tables in Oracle (DASH_ schema):`);
    result.rows.forEach(r => console.log(`    • ${r.TABLE_NAME}`));
    
  } catch (err) {
    console.error('\n❌  Migration failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) {
      try { await connection.close(); } catch {}
    }
  }
}

main();
