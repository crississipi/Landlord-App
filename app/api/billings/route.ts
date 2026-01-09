// app/api/billings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Fetch billings for a property (current month by default)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = parseInt(searchParams.get('propertyId') || '0');
    const monthParam = searchParams.get('month');

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID required' }, { status: 400 });
    }

    // Default to current month
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = `${now.getMonth() + 1}`.padStart(2, '0');
    const currentMonth = monthParam || `${yyyy}-${mm}`;

    const billings = await prisma.billing.findMany({
      where: {
        propertyId,
        month: currentMonth,
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
      const totalAmount = (b as { billingType?: string }).billingType === 'rent' 
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
        billingType: (b as { billingType?: string }).billingType || 'utility',
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
      month: currentMonth,
      billings: formattedBillings,
    });
  } catch (error) {
    console.error('Error fetching billings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billings' },
      { status: 500 }
    );
  }
}
