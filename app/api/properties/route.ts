// app/api/properties/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log("🔍 Fetching all properties with tenant counts...");

    const properties = await prisma.property.findMany({
      select: {
        propertyId: true,
        name: true,
        // Include other fields if needed
        rent: true,
        address: true,
        users: {
          where: {
            hasLeftProperty: false // Only count tenants who haven't left
          },
          select: {
            userID: true // Only need the ID for counting
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ Found ${properties.length} properties`);

    // Format the response with tenant counts
    const formattedProperties = properties.map(property => ({
      propertyId: property.propertyId,
      name: property.name,
      rent: property.rent,
      address: property.address,
      currentTenants: property.users.length, // Count of current tenants
      isAvailable: property.users.length === 0 // Additional flag for availability
    }));

    console.log("📊 Properties with tenant counts:", JSON.stringify(formattedProperties, null, 2));

    return NextResponse.json({ 
      success: true,
      properties: formattedProperties 
    });
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch properties",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: POST method to create new properties
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, address, rent, area, yearBuilt, renovated, description } = body;

    console.log("📝 Creating new property:", { name, address, rent });

    // Validate required fields
    if (!name || !address || !rent) {
      return NextResponse.json(
        { 
          success: false,
          error: "Missing required fields: name, address, rent" 
        },
        { status: 400 }
      );
    }

    const newProperty = await prisma.property.create({
      data: {
        name,
        address,
        rent: parseFloat(rent),
        area: area ? parseFloat(area) : 0,
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : 0,
        renovated: renovated || false,
        description: description || "",
      },
    });

    console.log("✅ Property created successfully:", newProperty);

    return NextResponse.json({
      success: true,
      property: {
        propertyId: newProperty.propertyId,
        name: newProperty.name,
        address: newProperty.address,
        rent: newProperty.rent,
        area: newProperty.area,
        yearBuilt: newProperty.yearBuilt,
        renovated: newProperty.renovated,
        description: newProperty.description,
        createdAt: newProperty.createdAt?.toISOString() || null,
      }
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Error creating property:", error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { 
          success: false,
          error: "Property with this name already exists" 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: "Failed to create property",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}