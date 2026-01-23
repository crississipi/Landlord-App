const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const properties = await prisma.property.findMany({
    select: { propertyId: true, name: true }
  });
  console.log('Properties:', JSON.stringify(properties, null, 2));
  
  const tenants = await prisma.users.findMany({
    where: { role: 'tenant' },
    select: { userID: true, firstName: true, lastName: true, propertyId: true, unitNumber: true }
  });
  console.log('Tenants:', JSON.stringify(tenants, null, 2));
}

main().finally(() => prisma.$disconnect());
