import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

interface TenantInfo {
  userID: number;
  name: string;
  fullName: string;
  email: string | null;
  phone: string | null;
}

interface UnitResponse {
  propertyId: number;
  baseRent: number;
  units: Array<{ unitNumber: string }>;
  tenants: TenantInfo[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const propertyId = parseInt(params.propertyId);
    
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
      }
    });

    const recentBillings = await prisma.billing.findMany({
      where: { propertyId },
      select: { unit: true },
      distinct: ['unit'],
      take: 50
    });

    const units = Array.from(new Set(
      recentBillings
        .map((b: { unit: string | null }) => b.unit)
        .filter((unit: string | null): unit is string => unit !== null)
    )).sort();

    const mappedTenants: TenantInfo[] = tenants.map((t: any): TenantInfo => ({
      userID: t.userID,
      name: t.firstName && t.lastName 
        ? `${t.firstName} ${t.lastName}`.trim()
        : t.username,
      fullName: t.firstName && t.lastName 
        ? `${t.firstName} ${t.middleInitial ? t.middleInitial + '. ' : ''}${t.lastName}`.trim()
        : t.username,
      email: t.email,
      phone: t.firstNumber
    }));

    return NextResponse.json({
      propertyId,
      baseRent: property?.rent || 0,
      units: units.map(unitNumber => ({ unitNumber })),
      tenants: mappedTenants
    });
  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch units and tenants' },
      { status: 500 }
    );
  }
}