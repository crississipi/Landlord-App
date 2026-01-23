const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAPI(propertyId) {
  // Simulate the API logic
  const property = await prisma.property.findUnique({
    where: { propertyId },
    select: { rent: true }
  });

  const tenants = await prisma.users.findMany({
    where: {
      propertyId: propertyId,
      role: 'tenant',
      hasLeftProperty: false
    },
    select: {
      userID: true,
      username: true,
      firstName: true,
      lastName: true,
      middleInitial: true,
      email: true,
      firstNumber: true,
      unitNumber: true
    }
  });

  const mappedTenants = tenants.map((t) => ({
    userID: t.userID,
    name: t.firstName && t.lastName
      ? `${t.firstName} ${t.lastName}`.trim()
      : t.username,
    fullName: t.firstName && t.lastName
      ? `${t.firstName} ${t.middleInitial ? t.middleInitial + '. ' : ''}${t.lastName}`.trim()
      : t.username,
    email: t.email,
    phone: t.firstNumber,
    unitNumber: t.unitNumber
  }));

  console.log(`For propertyId ${propertyId}:`);
  console.log('Property rent:', property?.rent);
  console.log('Tenants:', mappedTenants);

  await prisma.$disconnect();
}

(async () => {
  await testAPI(5);
  await testAPI(6);
})();