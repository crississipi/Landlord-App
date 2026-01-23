const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const occupiedTenants = await prisma.users.findMany({
    where: {
      hasLeftProperty: false,
      unitNumber: { not: null },
      role: 'tenant'
    },
    select: {
      userID: true,
      firstName: true,
      lastName: true,
      unitNumber: true,
      propertyId: true
    }
  });

  console.log('Occupied Units:');
  occupiedTenants.forEach(tenant => {
    console.log(`Unit ${tenant.unitNumber}: ${tenant.firstName} ${tenant.lastName} (ID: ${tenant.userID}, Property: ${tenant.propertyId})`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);