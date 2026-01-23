// app/api/units/occupied/[propertyId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ propertyId: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const propertyId = parseInt(params.propertyId);

    // Fetch all tenants who are currently occupying units in this property
    const tenants = await prisma.users.findMany({
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
        unitNumber: true,
      },
      orderBy: {
        unitNumber: 'asc',
      },
    });

    // Group tenants by unit number
    const unitsMap = new Map<string, {
      unitNumber: string;
      tenants: {
        userID: number;
        name: string;
        email: string;
      }[];
      totalTenants: number;
    }>();

    for (const tenant of tenants) {
      const unitNumber = tenant.unitNumber || 'Unassigned';
      
      if (!unitsMap.has(unitNumber)) {
        unitsMap.set(unitNumber, {
          unitNumber,
          tenants: [],
          totalTenants: 0,
        });
      }

      const unit = unitsMap.get(unitNumber)!;
      unit.tenants.push({
        userID: tenant.userID,
        name: `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim() || tenant.username,
        email: tenant.email || '',
      });
      unit.totalTenants = unit.tenants.length;
    }

    const units = Array.from(unitsMap.values());

    // Fetch property details to get base rent
    const property = await prisma.property.findUnique({
      where: { propertyId },
      select: { rent: true, name: true },
    });

    return NextResponse.json({
      propertyId,
      propertyName: property?.name || 'Unknown Property',
      baseRent: property?.rent || 0,
      units,
      totalUnits: units.length,
      totalTenants: tenants.length,
    });
  } catch (error) {
    console.error('Error fetching occupied units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch occupied units' },
      { status: 500 }
    );
  }
}