const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Find tenants without unitNumber
  const tenants = await prisma.users.findMany({
    where: {
      role: 'tenant',
      unitNumber: null,
      hasLeftProperty: false
    },
    select: { userID: true, firstName: true, lastName: true }
  });

  console.log('Tenants to update:', tenants);

  // Assign unit numbers
  const unitNumbers = ['101', '102', '103', '104']; // Add more if needed
  let index = 0;

  for (const tenant of tenants) {
    if (index < unitNumbers.length) {
      await prisma.users.update({
        where: { userID: tenant.userID },
        data: { unitNumber: unitNumbers[index] },
      });
      console.log(`Updated ${tenant.firstName} ${tenant.lastName} with unit ${unitNumbers[index]}`);
      index++;
    }
  }

  console.log('Occupied units added successfully.');

  await prisma.$disconnect();
}

main().catch(console.error);