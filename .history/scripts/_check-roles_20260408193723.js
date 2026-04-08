const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.role.findMany().then(roles => {
  roles.forEach(r => console.log(r.name, '|', r.description));
  p.$disconnect();
});
