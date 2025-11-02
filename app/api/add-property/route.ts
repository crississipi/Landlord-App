import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
      await prisma.resource.createMany({
        data: imageUrls.map((url: string) => ({
          propertyId: newProperty.propertyId,
          url,
          fileName: url.split("/").pop() || "unknown",
        })),
      });
    }

    return NextResponse.json({ success: true, propertyId: newProperty.propertyId });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json({ success: false, message: "Server error." }, { status: 500 });
  }
}

