import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

interface BillingHistoryItem {
  month: string | null;
  dateIssued: Date;
  rent: number;
  water: number;
  electric: number;
  total: number;
}

interface TenantInfo {
  userID: number;
  name: string;
  email: string | null;
  phone: string | null;
}

interface PotentialTenant {
  userID: number;
  name: string;
  fullName: string;
  email: string | null;
  phone: string | null;
}

interface UnitDetailsResponse {
  unitNumber: string;
  propertyId: number;
  propertyName: string;
  baseRent: number;
  currentRent: number;
  currentTenant: TenantInfo | null;
  potentialTenants: PotentialTenant[];
  billingHistory: BillingHistoryItem[];
  averageWater: number;
  averageElectric: number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unitNumber = searchParams.get('unit');
    const propertyId = searchParams.get('propertyId');

    if (!unitNumber || !propertyId) {
      return NextResponse.json(
        { error: 'Unit number and propertyId are required' },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { propertyId: parseInt(propertyId) },
      select: { rent: true, name: true }
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const recentBilling = await prisma.billing.findFirst({
      where: {
        propertyId: parseInt(propertyId),
        unit: unitNumber
      },
      orderBy: { dateIssued: 'desc' },
      include: {
        user: {
          select: {
            userID: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            firstNumber: true
          }
        }
      }
    });

    const potentialTenants = await prisma.users.findMany({
      where: {
        propertyId: parseInt(propertyId),
        role: 'tenant',
        hasLeftProperty: false
      },
      select: {
        userID: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        firstNumber: true
      }
    });

    const recentBillings = await prisma.billing.findMany({
      where: {
        propertyId: parseInt(propertyId),
        unit: unitNumber
      },
      orderBy: { dateIssued: 'desc' },
      take: 6,
      select: {
        totalRent: true,
        totalWater: true,
        totalElectric: true,
        month: true,
        dateIssued: true
      }
    });

    const billingHistory: BillingHistoryItem[] = recentBillings.map((b: { totalRent: number; totalWater: number; totalElectric: number; month: string | null; dateIssued: Date }): BillingHistoryItem => ({
      month: b.month,
      dateIssued: b.dateIssued,
      rent: b.totalRent,
      water: b.totalWater,
      electric: b.totalElectric,
      total: b.totalRent + b.totalWater + b.totalElectric
    }));

    const averageWater = billingHistory.length > 0 
      ? billingHistory.reduce((sum: number, b: BillingHistoryItem) => sum + b.water, 0) / billingHistory.length
      : 0;

    const averageElectric = billingHistory.length > 0
      ? billingHistory.reduce((sum: number, b: BillingHistoryItem) => sum + b.electric, 0) / billingHistory.length
      : 0;

    const mappedPotentialTenants: PotentialTenant[] = potentialTenants.map((t: any): PotentialTenant => ({
      userID: t.userID,
      name: t.firstName && t.lastName
        ? `${t.firstName} ${t.lastName}`.trim()
        : t.username,
      fullName: t.firstName && t.lastName
        ? `${t.firstName} ${t.lastName}`.trim()
        : t.username,
      email: t.email,
      phone: t.firstNumber
    }));

    const response: UnitDetailsResponse = {
      unitNumber,
      propertyId: parseInt(propertyId),
      propertyName: property.name,
      baseRent: property.rent,
      currentRent: recentBilling?.totalRent || property.rent,
      currentTenant: recentBilling?.user ? {
        userID: recentBilling.user.userID,
        name: recentBilling.user.firstName && recentBilling.user.lastName
          ? `${recentBilling.user.firstName} ${recentBilling.user.lastName}`.trim()
          : recentBilling.user.username,
        email: recentBilling.user.email,
        phone: recentBilling.user.firstNumber
      } : null,
      potentialTenants: mappedPotentialTenants,
      billingHistory,
      averageWater,
      averageElectric
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching unit details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unit details' },
      { status: 500 }
    );
  }
}