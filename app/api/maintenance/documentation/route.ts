import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET: Fetch documentation for a maintenance request
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const maintenanceId = searchParams.get('maintenanceId');
    const docuId = searchParams.get('docuId');

    if (!maintenanceId && !docuId) {
      return NextResponse.json(
        { success: false, error: 'Maintenance ID or Documentation ID is required' },
        { status: 400 }
      );
    }

    let whereClause: any = {};
    
    if (docuId) {
      whereClause.docuID = parseInt(docuId);
    } else if (maintenanceId) {
      whereClause.maintenanceID = parseInt(maintenanceId);
    }

    const documentation = await prisma.documentation.findFirst({
      where: whereClause,
      include: {
        maintenance: {
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
            }
          }
        },
        materials: true,
        images: true
      }
    });

    if (!documentation) {
      return NextResponse.json(
        { success: false, error: 'Documentation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      documentation
    });
  } catch (error) {
    console.error('Error fetching documentation:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch documentation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST: Create documentation for a fixed maintenance request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      maintenanceId, 
      remarks, 
      inChargeName, 
      inChargeNumber, 
      inChargePayment,
      materials, // Array of { material: string, cost: number }
      images // Array of { url: string, fileName: string }
    } = body;

    if (!maintenanceId || !remarks) {
      return NextResponse.json(
        { success: false, error: 'Maintenance ID and remarks are required' },
        { status: 400 }
      );
    }

    // Check if maintenance exists
    const maintenance = await prisma.maintenance.findUnique({
      where: { maintenanceId: parseInt(maintenanceId) }
    });

    if (!maintenance) {
      return NextResponse.json(
        { success: false, error: 'Maintenance request not found' },
        { status: 404 }
      );
    }

    // Check if documentation already exists
    const existingDoc = await prisma.documentation.findFirst({
      where: { maintenanceID: parseInt(maintenanceId) }
    });

    if (existingDoc) {
      return NextResponse.json(
        { success: false, error: 'Documentation already exists for this maintenance request' },
        { status: 409 }
      );
    }

    // Calculate total material cost
    const totalMaterialCost = materials?.reduce((sum: number, m: { cost: number }) => sum + (parseFloat(String(m.cost)) || 0), 0) || 0;

    // Create documentation with materials and images in a transaction
    const documentation = await prisma.$transaction(async (tx) => {
      // Create documentation
      const doc = await tx.documentation.create({
        data: {
          maintenanceID: parseInt(maintenanceId),
          remarks,
          inChargeName: inChargeName || null,
          inChargeNumber: inChargeNumber || null,
          inChargePayment: inChargePayment ? parseFloat(inChargePayment) : null,
          totalMaterialCost,
          dateFixed: new Date()
        }
      });

      // Create materials if provided
      if (materials && materials.length > 0) {
        await tx.documentationMaterial.createMany({
          data: materials.map((m: { material: string; cost: number }) => ({
            documentationID: doc.docuID,
            material: m.material,
            cost: parseFloat(String(m.cost)) || 0
          }))
        });
      }

      // Create images if provided
      if (images && images.length > 0) {
        await tx.documentationImage.createMany({
          data: images.map((img: { url: string; fileName: string }) => ({
            documentationID: doc.docuID,
            url: img.url,
            fileName: img.fileName
          }))
        });
      }

      // Update maintenance status to fixed
      await tx.maintenance.update({
        where: { maintenanceId: parseInt(maintenanceId) },
        data: { status: 'fixed' }
      });

      return doc;
    });

    // Send message to tenant about the fixed maintenance
    const messageText = `Maintenance: Your maintenance request '${maintenance.rawRequest}' has been fixed. Remarks: ${remarks}, Total cost: ₱${totalMaterialCost.toLocaleString()}. MaintenanceID: ${maintenanceId}`;

    await prisma.messages.create({
      data: {
        senderID: parseInt(session.user.id),
        receiverID: maintenance.userId,
        message: messageText,
        dateSent: new Date(),
        read: false
      }
    });

    // Fetch complete documentation with relations
    const completeDoc = await prisma.documentation.findUnique({
      where: { docuID: documentation.docuID },
      include: {
        maintenance: {
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
        },
        materials: true,
        images: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Documentation created successfully',
      documentation: completeDoc
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating documentation:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create documentation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT: Update existing documentation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      docuId,
      remarks, 
      inChargeName, 
      inChargeNumber, 
      inChargePayment,
      materials,
      images
    } = body;

    if (!docuId) {
      return NextResponse.json(
        { success: false, error: 'Documentation ID is required' },
        { status: 400 }
      );
    }

    // Calculate total material cost
    const totalMaterialCost = materials?.reduce((sum: number, m: { cost: number }) => sum + (parseFloat(String(m.cost)) || 0), 0) || 0;

    // Update documentation in a transaction
    const documentation = await prisma.$transaction(async (tx) => {
      // Update documentation
      const doc = await tx.documentation.update({
        where: { docuID: parseInt(docuId) },
        data: {
          remarks: remarks || undefined,
          inChargeName: inChargeName || undefined,
          inChargeNumber: inChargeNumber || undefined,
          inChargePayment: inChargePayment ? parseFloat(inChargePayment) : undefined,
          totalMaterialCost
        }
      });

      // Delete existing materials and recreate
      if (materials) {
        await tx.documentationMaterial.deleteMany({
          where: { documentationID: doc.docuID }
        });

        if (materials.length > 0) {
          await tx.documentationMaterial.createMany({
            data: materials.map((m: { material: string; cost: number }) => ({
              documentationID: doc.docuID,
              material: m.material,
              cost: parseFloat(String(m.cost)) || 0
            }))
          });
        }
      }

      // Add new images if provided (don't delete existing)
      if (images && images.length > 0) {
        await tx.documentationImage.createMany({
          data: images.map((img: { url: string; fileName: string }) => ({
            documentationID: doc.docuID,
            url: img.url,
            fileName: img.fileName
          }))
        });
      }

      return doc;
    });

    // Fetch complete documentation
    const completeDoc = await prisma.documentation.findUnique({
      where: { docuID: documentation.docuID },
      include: {
        maintenance: true,
        materials: true,
        images: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Documentation updated successfully',
      documentation: completeDoc
    });
  } catch (error) {
    console.error('Error updating documentation:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update documentation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
