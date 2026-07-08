const oracledb = require('oracledb');

const ROLES = {
  'Admin': {
    main: 'Full system access — can manage users, roles, settings, and all modules',
    permissions: ['all']
  },
  'Maker': {
    main: 'Can create and submit customer requests for approval',
    permissions: ['customers:read', 'customers:create', 'customers:pin-reset', 'approvals:request', 'users:read']
  },
  'Checker': {
    main: 'Can approve or reject requests submitted by Makers',
    permissions: ['customers:read', 'approvals:action', 'users:read']
  },
  'Viewer': {
    main: 'Read-only access to reports and dashboards',
    permissions: ['users:read', 'roles:read', 'customers:read']
  },
  'Risk Officer': {
    main: 'Access to fraud monitoring and risk management modules',
    permissions: ['security:manage', 'customers:read', 'users:read']
  },
  'Support': {
    main: 'Customer support — limited customer search and view access',
    permissions: ['customers:read', 'users:read']
  }
};

async function run() {
  let c;
  try {
    c = await oracledb.getConnection({
      user: 'dash_module',
      password: 'test',
      connectString: 'localhost:1521/FREEPDB1'
    });

    console.log('Connected to Oracle. Updating roles...');

    for (const [name, config] of Object.entries(ROLES)) {
      const jsonStr = JSON.stringify(config);
      await c.execute(
        `UPDATE DASH_ROLES SET DESCRIPTION = :1 WHERE NAME = :2`,
        [jsonStr, name]
      );
      console.log(`Updated role: ${name}`);
    }

    await c.commit();
    console.log('All roles successfully updated with JSON permission matrices.');

  } catch (err) {
    console.error('Error updating roles:', err);
  } finally {
    if (c) {
      await c.close();
    }
  }
}

run();
