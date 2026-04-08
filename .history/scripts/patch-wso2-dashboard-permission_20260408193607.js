/**
 * One-time patch: adds /wso2/dashboard to any role that already has
 * at least one of the other WSO2 routes in its permissions.
 *
 * Run from the project root:
 *   node scripts/patch-wso2-dashboard-permission.js
 */

const { PrismaClient } = require('./prisma/system-client');

const prisma = new PrismaClient({
  datasources: { db: { url: 'file:./src/prisma/zemen.db' } },
});

const WSO2_ROUTES = [
  '/wso2/configurations',
  '/wso2/oauth-credentials',
  '/wso2/request-logs',
  '/wso2/dashboard',
];

const NEW_PERMISSION = '/wso2/dashboard';

async function main() {
  const roles = await prisma.role.findMany();
  let updated = 0;

  for (const role of roles) {
    // Super Admin already has 'all' — skip
    if (role.name === 'Super Admin') continue;

    let parsed;
    try {
      parsed = JSON.parse(role.description);
    } catch {
      // plain string description — no permissions array, skip
      continue;
    }

    const permissions = parsed.permissions || [];

    // Only patch if they already have at least one WSO2 route
    const hasWso2Access = WSO2_ROUTES.some(r => r !== NEW_PERMISSION && permissions.includes(r));
    if (!hasWso2Access) continue;

    // Already has the permission — skip
    if (permissions.includes(NEW_PERMISSION)) {
      console.log(`  [skip]    ${role.name} — already has ${NEW_PERMISSION}`);
      continue;
    }

    // Insert /wso2/dashboard right after /wso2/configurations (or at end)
    const cfgIdx = permissions.indexOf('/wso2/configurations');
    if (cfgIdx >= 0) {
      permissions.splice(cfgIdx + 1, 0, NEW_PERMISSION);
    } else {
      permissions.push(NEW_PERMISSION);
    }

    await prisma.role.update({
      where: { id: role.id },
      data: {
        description: JSON.stringify({ ...parsed, permissions }),
      },
    });

    console.log(`  [patched] ${role.name} — added ${NEW_PERMISSION}`);
    updated++;
  }

  console.log(`\nDone. ${updated} role(s) updated.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
