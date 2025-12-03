// app/api/billings/unit-tenants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET: Fetch tenants for a specific unit based on billing history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = parseInt(searchParams.get('propertyId') || '0');
    const unit = searchParams.get('unit');

    if (!propertyId || !unit) {
      return NextResponse.json(
        { error: 'Property ID and unit are required' },
        { status: 400 }
      );
    }

    // Get all tenant IDs who have been billed for this unit
    const billingTenants = await prisma.billing.findMany({
      where: {
        propertyId,
        unit,
      },
      select: { userID: true },
      distinct: ['userID'],
    });

    const tenantIds = billingTenants.map((b) => b.userID);

    // Get tenant details - prioritize active tenants
    const tenants = tenantIds.length
      ? await prisma.users.findMany({
          where: {
            userID: { in: tenantIds },
            hasLeftProperty: false, // Only active tenants
          },
          select: {
            userID: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
          },
        })
      : [];

    // If no active tenants found from billing, get all active tenants for the property
    let activeTenants = tenants;
    if (tenants.length === 0) {
      activeTenants = await prisma.users.findMany({
        where: {
          propertyId,
          role: 'tenant',
          hasLeftProperty: false,
        },
        select: {
          userID: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
        },
      });
    }

    const formattedTenants = activeTenants.map((t) => ({
      userID: t.userID,
      name: t.firstName && t.lastName
        ? `${t.firstName} ${t.lastName}`.trim()
        : t.username,
      email: t.email,
    }));

    // Get the rent for this unit from the last billing or property default
    const lastBilling = await prisma.billing.findFirst({
      where: { propertyId, unit },
      orderBy: { dateIssued: 'desc' },
      select: { totalRent: true },
    });

    const property = await prisma.property.findUnique({
      where: { propertyId },
      select: { rent: true },
    });

    return NextResponse.json({
      success: true,
      unit,
      tenants: formattedTenants,
      rent: lastBilling?.totalRent || property?.rent || 0,
    });
  } catch (error) {
    console.error('Error fetching unit tenants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unit tenants' },
      { status: 500 }
    );
  }
}
