import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// GET: Fetch billings for units
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get('unit');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let whereClause: any = {};

    if (unitId) {
      const user = await prisma.users.findFirst({
        where: { propertyId: parseInt(unitId) }
      });
      if (user) {
        whereClause.userID = user.userID;
      }
    }

    const billings = await prisma.billing.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            userID: true,
            firstName: true,
            lastName: true,
            propertyId: true
          }
        },
        property: {
          select: {
            propertyId: true,
            name: true,
            rent: true
          }
        }
      },
      orderBy: { dateIssued: 'desc' }
    });

    return NextResponse.json(billings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch billings' },
      { status: 500 }
    );
  }
}

// POST: Create new billing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { unit, electric, water, month, year } = body;

    // Find user by property/unit
    const user = await prisma.users.findFirst({
      where: { propertyId: unit }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User/Unit not found' },
        { status: 404 }
      );
    }

    // Get property rent
    const property = await prisma.property.findFirst({
      where: { propertyId: unit }
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Create billing record
    const billing = await prisma.billing.create({
      data: {
        userID: user.userID,
        propertyId: unit,
        totalRent: property.rent,
        totalWater: water,
        totalElectric: electric,
        dateIssued: new Date(parseInt(year), parseInt(month) - 1, 1)
      }
    });

    return NextResponse.json(billing);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create billing' },
      { status: 500 }
    );
  }
}