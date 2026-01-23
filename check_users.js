const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const allUsers = await prisma.users.findMany({
    select: {
      userID: true,
      firstName: true,
      lastName: true,
      unitNumber: true,
      propertyId: true,
      hasLeftProperty: true,
      role: true
    }
  });

  console.log('All Users:');
  allUsers.forEach(user => {
    console.log(`${user.role}: ${user.firstName} ${user.lastName} - Unit: ${user.unitNumber}, Left: ${user.hasLeftProperty}, Property: ${user.propertyId}`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);