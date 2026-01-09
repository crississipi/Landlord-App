import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface UnitUnbilled {
  unitNumber: string;
  rent: number;
  tenants: {
    userID: number;
    name: string;
  }[];
}

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
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');

    // Determine month in YYYY-MM format; default to current
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = `${now.getMonth() + 1}`.padStart(2, '0');
    const currentMonth = monthParam || `${yyyy}-${mm}`;

    // 1. Units that already have billing for the month
    const billedUnitsRaw = await prisma.billing.findMany({
      where: {
        propertyId,
        month: currentMonth,
      },
      select: { unit: true },
      distinct: ['unit'],
    });

    const billedUnitSet = new Set(
      billedUnitsRaw
        .map((b: { unit: string | null }) => b.unit)
        .filter((u: string | null): u is string => u !== null)
    );

    // 2. All historical units for the property from billing
    const allUnitsRaw = await prisma.billing.findMany({
      where: { propertyId },
      select: { unit: true },
      distinct: ['unit'],
    });

    const historicalUnits: string[] = Array.from(
      new Set(
        allUnitsRaw
          .map((b: { unit: string | null }) => b.unit)
          .filter((u: string | null): u is string => u !== null)
      )
    );

    // 2b. Also get active tenants who may not have billing history yet
    // We'll create "virtual" units for them based on property name or a default unit
    const activeTenants = await prisma.users.findMany({
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
      },
    });

    // If there are active tenants but no historical units, create a default unit
    // This handles the case where tenants exist but no billing has been created yet
    const allUnits = historicalUnits.length > 0 
      ? historicalUnits 
      : (activeTenants.length > 0 ? ['1'] : []); // Default unit '1' if tenants exist but no billing history

    // 3. Units without billing for the month
    const unbilledUnits: string[] = allUnits.filter((u) => !billedUnitSet.has(u));

    // Fetch base rent
    const property = await prisma.property.findUnique({
      where: { propertyId },
      select: { rent: true },
    });
    const baseRent = property?.rent || 0;

    // Build detailed info
    const result: UnitUnbilled[] = [];

    for (const unitNumber of unbilledUnits) {
      // Last billing to get rent & tenant IDs
      const lastBilling = await prisma.billing.findFirst({
        where: { propertyId, unit: unitNumber },
        orderBy: { dateIssued: 'desc' },
        select: {
          totalRent: true,
          userID: true,
        },
      });

      // All historical tenants for the unit from billing
      const tenantIdsRaw = await prisma.billing.findMany({
        where: { propertyId, unit: unitNumber },
        select: { userID: true },
        distinct: ['userID'],
      });

      const tenantIds = tenantIdsRaw.map((t: { userID: number }) => t.userID);

      let tenants: { userID: number; firstName: string | null; lastName: string | null; username: string }[] = [];
      
      if (tenantIds.length > 0) {
        // Get tenants from billing history (only active ones)
        tenants = await prisma.users.findMany({
          where: { 
            userID: { in: tenantIds },
            hasLeftProperty: false,
          },
          select: {
            userID: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        });
      }
      
      // If no tenants from billing history, use active tenants from property
      if (tenants.length === 0) {
        tenants = activeTenants;
      }

      const mappedTenants = tenants.map((t: { userID: number; firstName: string | null; lastName: string | null; username: string }) => ({
        userID: t.userID,
        name:
          t.firstName && t.lastName
            ? `${t.firstName} ${t.lastName}`.trim()
            : t.username,
      }));

      result.push({
        unitNumber,
        rent: lastBilling?.totalRent || baseRent,
        tenants: mappedTenants,
      });
    }

    return NextResponse.json({
      propertyId,
      month: currentMonth,
      units: result.sort((a: UnitUnbilled, b: UnitUnbilled) => a.unitNumber.localeCompare(b.unitNumber)),
    });
  } catch (error) {
    console.error('Error fetching unbilled units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unbilled units' },
      { status: 500 }
    );
  }
}
