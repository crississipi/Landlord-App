import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Step 1: Get all properties
    const properties = await prisma.property.findMany();

    // Step 2: Get all resources where referenceType = 'Property'
    const resources = await prisma.resource.findMany({
      where: { referenceType: "Property" },
    });

    // Step 3: Attach matching resources to each property
    const propertiesWithResources = properties.map((property) => {
      const relatedResources = resources.filter(
        (res) => res.referenceId === property.propertyId
      );
      return { ...property, resources: relatedResources };
    });

    // Step 4: Return merged data
    return NextResponse.json(propertiesWithResources);
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
