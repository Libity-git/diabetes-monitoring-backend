/* // 📁 File: src/utils/prisma.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
module.exports = prisma; */

// 📁 File: src/utils/prisma.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.$connect()
  .then(() => console.log('Prisma connected successfully'))
  .catch(err => console.error('Prisma connection error:', err));

module.exports = prisma;