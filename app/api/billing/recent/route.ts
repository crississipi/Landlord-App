// app/api/billing/recent/route.ts
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const recentBillings = await prisma.billing.findMany({
      take: 5,
      orderBy: {
        dateIssued: 'desc'
      },
      include: {
        user: {
          select: {
            userID: true,
            firstName: true,
            lastName: true,
          }
        },
        property: {
          select: {
            propertyId: true,
            name: true,
          }
        }
      }
    });

    const formattedBillings = recentBillings.map(billing => ({
      billingID: billing.billingID,
      unit: billing.unit,
      month: billing.month,
      totalRent: billing.totalRent,
      totalWater: billing.totalWater,
      totalElectric: billing.totalElectric,
      totalAmount: billing.totalRent + billing.totalWater + billing.totalElectric,
      dateIssued: billing.dateIssued.toISOString(),
      paymentStatus: billing.paymentStatus,
      tenant: {
        userID: billing.user.userID,
        name: `${billing.user.firstName || ''} ${billing.user.lastName || ''}`.trim() || 'Unknown',
      },
      property: {
        propertyId: billing.property.propertyId,
        name: billing.property.name,
      }
    }));

    return NextResponse.json({
      success: true,
      billings: formattedBillings
    });

  } catch (error) {
    console.error("Error fetching recent billings:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch recent billings",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
