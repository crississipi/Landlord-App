import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch maintenance requests
// Query params:
// - status: filter by status (pending, scheduled, fixed)
// - month: filter by month (1-12)
// - year: filter by year
// - date: filter by specific date (YYYY-MM-DD)
// - propertyId: filter by property
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const date = searchParams.get('date');
    const propertyId = searchParams.get('propertyId');

    let whereClause: any = {};

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Filter by property
    if (propertyId) {
      whereClause.propertyId = parseInt(propertyId);
    }

    // Filter by specific date (for calendar day view)
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      
      whereClause.schedule = {
        gte: startOfDay,
        lte: endOfDay
      };
    }
    // Filter by month and year (for calendar month view)
    else if (month && year) {
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      
      whereClause.schedule = {
        gte: startOfMonth,
        lte: endOfMonth
      };
    }

    const maintenances = await prisma.maintenance.findMany({
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
            name: true
          }
        },
        documentations: {
          select: {
            docuID: true,
            dateFixed: true
          }
        },
        availabilities: true
      },
      orderBy: [
        { schedule: 'asc' },
        { urgency: 'desc' },
        { dateIssued: 'desc' }
      ]
    });

    // Transform data to include urgency color mapping
    const transformedMaintenances = maintenances.map(m => ({
      ...m,
      urgencyColor: getUrgencyColor(m.urgency),
      isFixed: m.status === 'fixed' || m.documentations !== null,
      tenantName: m.user ? `${m.user.firstName || ''} ${m.user.lastName || ''}`.trim() : 'Unknown'
    }));

    // Check for critical maintenances and create notification if needed
    const criticalMaintenances = transformedMaintenances.filter(m => m.urgency === 'critical' && !m.isFixed);
    if (criticalMaintenances.length > 0) {
      // Assume session exists, but since GET doesn't require auth, perhaps skip or add auth
      // For now, assume landlord id is known, but since this is a landlord app, perhaps hardcode or find another way
      // Skip for now
    }

    return NextResponse.json({
      success: true,
      maintenances: transformedMaintenances
    });
  } catch (error) {
    console.error('Error fetching maintenances:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch maintenance requests',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH: Update maintenance schedule
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { maintenanceId, schedule, scheduleStart, scheduleEnd, status } = body;

    if (!maintenanceId) {
      return NextResponse.json(
        { success: false, error: 'Maintenance ID is required' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {};
    
    if (schedule) {
      updateData.schedule = new Date(schedule);
    }
    
    if (status) {
      updateData.status = status;
    }

    const updatedMaintenance = await prisma.maintenance.update({
      where: { maintenanceId: parseInt(maintenanceId) },
      data: updateData,
      include: {
        user: {
          select: {
            userID: true,
            firstName: true,
            lastName: true
          }
        },
        property: {
          select: {
            propertyId: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      maintenance: updatedMaintenance
    });
  } catch (error) {
    console.error('Error updating maintenance:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update maintenance',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to map urgency to color
function getUrgencyColor(urgency: string): string {
  const urgencyMap: Record<string, string> = {
    'low': 'emerald',
    'medium': 'blue', 
    'high': 'orange',
    'critical': 'red',
    // Fallback mappings
    'green': 'emerald',
    'yellow': 'orange',
    'red': 'red'
  };
  
  return urgencyMap[urgency.toLowerCase()] || 'blue';
}
