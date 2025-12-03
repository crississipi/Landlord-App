import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Schedule a maintenance request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { maintenanceId, scheduleDate, startTime, endTime } = body;

    if (!maintenanceId || !scheduleDate) {
      return NextResponse.json(
        { success: false, error: 'Maintenance ID and schedule date are required' },
        { status: 400 }
      );
    }

    // Parse the schedule date and time
    const [year, month, day] = scheduleDate.split('-').map(Number);
    const [startHour, startMin] = (startTime || '08:00').split(':').map(Number);
    const [endHour, endMin] = (endTime || '17:00').split(':').map(Number);

    const scheduleDateTime = new Date(year, month - 1, day, startHour, startMin);

    // Update the maintenance with schedule
    const updatedMaintenance = await prisma.maintenance.update({
      where: { maintenanceId: parseInt(maintenanceId) },
      data: {
        schedule: scheduleDateTime,
        status: 'scheduled'
      },
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
      message: 'Maintenance scheduled successfully',
      maintenance: updatedMaintenance
    });
  } catch (error) {
    console.error('Error scheduling maintenance:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to schedule maintenance',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET: Get scheduled maintenances for a specific date range
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let whereClause: any = {
      schedule: { not: null }
    };

    // Filter by date range
    if (startDate && endDate) {
      whereClause.schedule = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    // Filter by month and year
    else if (month && year) {
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      
      whereClause.schedule = {
        gte: startOfMonth,
        lte: endOfMonth
      };
    }

    const scheduledMaintenances = await prisma.maintenance.findMany({
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
        }
      },
      orderBy: { schedule: 'asc' }
    });

    // Group by date for calendar display
    const groupedByDate: Record<string, any[]> = {};
    
    scheduledMaintenances.forEach(m => {
      if (m.schedule) {
        const dateKey = m.schedule.toISOString().split('T')[0];
        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push({
          ...m,
          urgencyColor: getUrgencyColor(m.urgency),
          isFixed: m.status === 'fixed' || m.documentations.length > 0
        });
      }
    });

    return NextResponse.json({
      success: true,
      scheduled: scheduledMaintenances,
      groupedByDate
    });
  } catch (error) {
    console.error('Error fetching scheduled maintenances:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch scheduled maintenances',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getUrgencyColor(urgency: string): string {
  const urgencyMap: Record<string, string> = {
    'low': 'emerald',
    'medium': 'blue', 
    'high': 'orange',
    'critical': 'red'
  };
  
  return urgencyMap[urgency.toLowerCase()] || 'blue';
}
