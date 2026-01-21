import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, rent, area, yearBuilt, renovated, address, description, imageUrls } = body;

    // ✅ Basic validation
    if (!name || !rent || !area || !yearBuilt || !address || !description) {
      return NextResponse.json({ success: false, message: "All fields are required." }, { status: 400 });
    }

    if (isNaN(Number(rent)) || Number(rent) <= 0) {
      return NextResponse.json({ success: false, message: "Rent must be a positive number." }, { status: 400 });
    }

    if (isNaN(Number(area)) || Number(area) <= 0) {
      return NextResponse.json({ success: false, message: "Area must be a positive number." }, { status: 400 });
    }

    // 🏡 Create Property record
    const newProperty = await prisma.property.create({
      data: {
        name,
        rent: parseFloat(rent),
        area: parseFloat(area),
        yearBuilt: Number(yearBuilt),
        renovated,
        address,
        description,
      },
    });

    // 📸 Create separate resource entries
    if (imageUrls && imageUrls.length > 0) {
      try {
        await prisma.resource.createMany({
          data: imageUrls.map((url: string) => ({
            referenceId: newProperty.propertyId,
            referenceType: 'property',
            url,
            fileName: url.split("/").pop() || "unknown",
          })),
        });
      } catch (resourceError) {
        console.error("Error creating resources:", resourceError);
        // Continue even if resource creation fails
      }
    }

    return NextResponse.json({ success: true, propertyId: newProperty.propertyId });
  } catch (error) {
    console.error("Error creating property:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Detailed error:", errorMessage);
    return NextResponse.json({ 
      success: false, 
      message: "Server error.", 
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

