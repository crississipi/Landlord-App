// app/api/properties/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      propertyId, 
      name, 
      address, 
      rent, 
      area, 
      yearBuilt, 
      renovated, 
      description,
      existingImageIds 
    } = body;

    console.log("📝 Updating property:", { propertyId, name, address, rent });

    // Validate required fields
    if (!propertyId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Missing required field: propertyId" 
        },
        { status: 400 }
      );
    }

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { propertyId: parseInt(propertyId) },
      include: { resources: true }
    });

    if (!existingProperty) {
      return NextResponse.json(
        { 
          success: false,
          error: "Property not found" 
        },
        { status: 404 }
      );
    }

    // Update property
    const updatedProperty = await prisma.property.update({
      where: { propertyId: parseInt(propertyId) },
      data: {
        name: name || existingProperty.name,
        address: address || existingProperty.address,
        rent: rent ? parseFloat(rent) : existingProperty.rent,
        area: area ? parseFloat(area) : existingProperty.area,
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : existingProperty.yearBuilt,
        renovated: renovated !== undefined ? renovated : existingProperty.renovated,
        description: description !== undefined ? description : existingProperty.description,
      },
      include: {
        resources: true
      }
    });

    // If existingImageIds is provided, remove images not in the list
    if (existingImageIds && Array.isArray(existingImageIds)) {
      const currentResourceIds = existingProperty.resources.map(r => r.resourceId);
      const imagesToRemove = currentResourceIds.filter(id => !existingImageIds.includes(id));
      
      if (imagesToRemove.length > 0) {
        await prisma.resource.deleteMany({
          where: {
            resourceId: { in: imagesToRemove },
            propertyId: parseInt(propertyId)
          }
        });
        console.log(`🗑️ Removed ${imagesToRemove.length} images from property`);
      }
    }

    console.log("✅ Property updated successfully:", updatedProperty);

    return NextResponse.json({
      success: true,
      property: {
        propertyId: updatedProperty.propertyId,
        name: updatedProperty.name,
        address: updatedProperty.address,
        rent: updatedProperty.rent,
        area: updatedProperty.area,
        yearBuilt: updatedProperty.yearBuilt,
        renovated: updatedProperty.renovated,
        description: updatedProperty.description,
        images: updatedProperty.resources.map(r => ({
          resourceId: r.resourceId,
          url: r.url,
          fileName: r.fileName
        }))
      }
    });

  } catch (error) {
    console.error("❌ Error updating property:", error);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to update property",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
