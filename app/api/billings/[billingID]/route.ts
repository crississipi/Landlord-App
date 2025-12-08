import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { billingID: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const billingID = parseInt(params.billingID);

    if (isNaN(billingID)) {
      return NextResponse.json({ error: 'Invalid billing ID' }, { status: 400 });
    }

    // Fetch billing with tenant and property info
    const billing = await prisma.billing.findUnique({
      where: { billingID },
      include: {
        user: {
          select: {
            userID: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        property: {
          select: {
            propertyId: true,
            name: true,
            address: true
          }
        }
      }
    });

    if (!billing) {
      return NextResponse.json({ error: 'Billing not found' }, { status: 404 });
    }

    return NextResponse.json({
      billing: {
        billingID: billing.billingID,
        unit: billing.unit,
        month: billing.month,
        totalRent: billing.totalRent,
        totalWater: billing.totalWater,
        totalElectric: billing.totalElectric,
        totalAmount: billing.totalRent + billing.totalWater + billing.totalElectric,
        dateIssued: billing.dateIssued.toISOString(),
        billingType: billing.billingType,
        paymentStatus: billing.paymentStatus,
        amountPaid: billing.amountPaid,
        dueDate: billing.dueDate?.toISOString() || null,
        tenant: billing.user,
        property: billing.property
      }
    });
  } catch (error) {
    console.error('Error fetching billing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
