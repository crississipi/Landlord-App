// app/api/billings/unpaid/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Fetch unpaid billings for specific user IDs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userIdsParam = searchParams.get('userIds');

    if (!userIdsParam) {
      return NextResponse.json({ error: 'User IDs required' }, { status: 400 });
    }

    // Parse user IDs from comma-separated string
    const userIds = userIdsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    if (userIds.length === 0) {
      return NextResponse.json({ error: 'Valid user IDs required' }, { status: 400 });
    }

    // Fetch unpaid billings for the specified users
    const billings = await prisma.billing.findMany({
      where: {
        userID: { in: userIds },
        paymentStatus: { in: ['pending', 'partial'] },
      },
      include: {
        user: {
          select: {
            userID: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
          },
        },
        property: {
          select: {
            name: true,
            address: true,
          },
        },
      },
      orderBy: { dateIssued: 'desc' },
    });

    // Transform billings for frontend
    const formattedBillings = billings.map((b) => {
      // Calculate total based on billing type
      const billingType = (b as { billingType?: string }).billingType || 'utility';
      const totalAmount = billingType === 'rent' 
        ? b.totalRent 
        : b.totalRent + b.totalWater + b.totalElectric;
      
      return {
        billingID: b.billingID,
        unit: b.unit,
        month: b.month,
        totalRent: b.totalRent,
        totalWater: b.totalWater,
        totalElectric: b.totalElectric,
        totalAmount,
        dateIssued: b.dateIssued.toISOString(),
        billingType,
        paymentStatus: (b as { paymentStatus?: string }).paymentStatus || 'pending',
        amountPaid: (b as { amountPaid?: number }).amountPaid || 0,
        dueDate: (b as { dueDate?: Date | null }).dueDate?.toISOString() || null,
        tenant: {
          userID: b.user.userID,
          name: b.user.firstName && b.user.lastName
            ? `${b.user.firstName} ${b.user.lastName}`.trim()
            : b.user.username,
          email: b.user.email,
        },
        property: {
          name: b.property.name,
          address: b.property.address,
        },
      };
    });

    return NextResponse.json({
      success: true,
      billings: formattedBillings,
    });
  } catch (error) {
    console.error('Error fetching unpaid billings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unpaid billings' },
      { status: 500 }
    );
  }
}
