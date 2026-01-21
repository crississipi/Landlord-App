import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Define the type for maintenance with included relations
type MaintenanceWithRelations = Prisma.MaintenanceGetPayload<{
  include: {
    documentations: {
      include: {
        materials: true;
        images: true;
      };
    };
    user: {
      select: {
        userID: true;
        firstName: true;
        lastName: true;
      };
    };
    property: {
      select: {
        propertyId: true;
        name: true;
      };
    };
  };
}>;

// GET: Fetch maintenance history (completed maintenances with documentation) for a property
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Fetch all maintenances with documentation for this property
    const maintenanceHistory = await prisma.maintenance.findMany({
      where: {
        propertyId: parseInt(propertyId),
        status: 'fixed',
        documentations: {
          isNot: null
        }
      },
      include: {
        documentations: {
          include: {
            materials: true,
            images: true
          }
        },
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
      },
      orderBy: {
        updatedAt: 'desc'
      }
    }) as MaintenanceWithRelations[];

    // Transform data to include documentation details
    const history = maintenanceHistory.map((maintenance) => {
      const documentation = maintenance.documentations;
      return {
        maintenanceId: maintenance.maintenanceId,
        requestDescription: maintenance.processedRequest || maintenance.rawRequest,
        tenantName: `${maintenance.user.firstName} ${maintenance.user.lastName}`,
        propertyName: maintenance.property.name,
        dateRequested: maintenance.dateIssued,
        dateFixed: documentation?.dateFixed || maintenance.updatedAt,
        remarks: documentation?.remarks || '',
        aiDescription: documentation?.aiDescription || null,
        aiDescriptionTl: documentation?.aiDescriptionTl || null,
        totalMaterialCost: documentation?.totalMaterialCost || 0,
        inChargePayment: documentation?.inChargePayment || 0,
        inChargeName: documentation?.inChargeName || null,
        materials: documentation?.materials || [],
        images: documentation?.images || [],
        totalCost: (documentation?.totalMaterialCost || 0) + (documentation?.inChargePayment || 0)
      };
    });

    return NextResponse.json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    console.error('Error fetching maintenance history:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch maintenance history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
