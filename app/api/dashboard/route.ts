// app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper function to map urgency to color
function getUrgencyColor(urgency: string): string {
  const urgencyMap: Record<string, string> = {
    'low': 'emerald',
    'medium': 'blue', 
    'high': 'orange',
    'critical': 'red',
    'green': 'emerald',
    'yellow': 'orange',
    'red': 'red'
  };
  return urgencyMap[urgency.toLowerCase()] || 'blue';
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current month for billing
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // 1. Fetch recent billings (last 10 billings issued)
    const recentBillings = await prisma.billing.findMany({
      take: 10,
      orderBy: { dateIssued: 'desc' },
      include: {
        user: {
          select: {
            userID: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        property: {
          select: {
            propertyId: true,
            name: true,
          },
        },
      },
    });

    // Format billings
    const formattedBillings = recentBillings.map((b) => ({
      billingID: b.billingID,
      unit: b.unit,
      month: b.month,
      totalRent: b.totalRent,
      totalWater: b.totalWater,
      totalElectric: b.totalElectric,
      totalAmount: b.totalRent + b.totalWater + b.totalElectric,
      dateIssued: b.dateIssued.toISOString(),
      tenant: {
        userID: b.user.userID,
        name: b.user.firstName && b.user.lastName
          ? `${b.user.firstName} ${b.user.lastName}`.trim()
          : b.user.username,
      },
      property: {
        propertyId: b.property.propertyId,
        name: b.property.name,
      },
    }));

    // 2. Fetch maintenance requests summary (new requests - pending status)
    const maintenanceRequests = await prisma.maintenance.findMany({
      where: {
        status: 'pending'
      },
      select: {
        maintenanceId: true,
        urgency: true,
        rawRequest: true,
        processedRequest: true,
        dateIssued: true,
        property: {
          select: {
            name: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { dateIssued: 'desc' }
    });

    // Group maintenance by urgency
    const maintenanceSummary = {
      total: maintenanceRequests.length,
      byUrgency: {
        critical: { count: 0, color: 'red', label: 'Critical' },
        high: { count: 0, color: 'orange', label: 'High' },
        medium: { count: 0, color: 'blue', label: 'Medium' },
        low: { count: 0, color: 'emerald', label: 'Low' },
      } as Record<string, { count: number; color: string; label: string }>,
      recentRequests: maintenanceRequests.slice(0, 5).map(m => ({
        maintenanceId: m.maintenanceId,
        request: m.processedRequest || m.rawRequest,
        urgency: m.urgency,
        urgencyColor: getUrgencyColor(m.urgency),
        dateIssued: m.dateIssued.toISOString(),
        property: m.property?.name || 'Unknown',
        tenant: m.user ? `${m.user.firstName || ''} ${m.user.lastName || ''}`.trim() : 'Unknown'
      }))
    };

    // Count by urgency
    maintenanceRequests.forEach(m => {
      const urgencyKey = m.urgency.toLowerCase();
      if (maintenanceSummary.byUrgency[urgencyKey]) {
        maintenanceSummary.byUrgency[urgencyKey].count++;
      } else {
        // Default to medium if unknown urgency
        maintenanceSummary.byUrgency.medium.count++;
      }
    });

    // 3. Fetch properties with feedback summary
    const properties = await prisma.property.findMany({
      include: {
        users: {
          where: {
            hasLeftProperty: false
          },
          select: {
            userID: true
          }
        },
        feedbacks: {
          select: {
            feedbackID: true,
            ratings: true,
            dateIssued: true
          },
          orderBy: {
            dateIssued: 'desc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Format properties with feedback counts
    const formattedProperties = properties.map(property => {
      // Count feedbacks from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentFeedbacks = property.feedbacks.filter(
        fb => new Date(fb.dateIssued) >= thirtyDaysAgo
      );

      return {
        propertyId: property.propertyId,
        name: property.name,
        currentTenants: property.users.length,
        totalFeedbacks: property.feedbacks.length,
        recentFeedbacks: recentFeedbacks.length,
        averageRating: property.feedbacks.length > 0 
          ? Math.round((property.feedbacks.reduce((sum, fb) => sum + fb.ratings, 0) / property.feedbacks.length) * 10) / 10
          : 0
      };
    });

    // 4. Get overall stats
    const totalTenants = await prisma.users.count({
      where: {
        role: 'tenant',
        hasLeftProperty: false
      }
    });

    const totalProperties = properties.length;
    
    const thisMonthBillings = await prisma.billing.aggregate({
      where: { month: currentMonth },
      _sum: {
        totalRent: true,
        totalWater: true,
        totalElectric: true
      },
      _count: true
    });

    const totalRevenue = (thisMonthBillings._sum.totalRent || 0) + 
                         (thisMonthBillings._sum.totalWater || 0) + 
                         (thisMonthBillings._sum.totalElectric || 0);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalTenants,
          totalProperties,
          totalRevenue,
          billedUnits: thisMonthBillings._count,
          pendingMaintenance: maintenanceSummary.total
        },
        recentBillings: formattedBillings,
        maintenanceSummary,
        properties: formattedProperties
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
