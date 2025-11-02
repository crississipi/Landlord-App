import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch all tenants (users with role 'tenant')
    const tenants = await prisma.users.findMany({
    where: { role: "tenant" },
        include: {
            property: true,
            // Fetch Resource where referenceType is 'User' and referenceId = userID
            // assuming this is how you store profile images
            _count: false,
        },
    });

    // Transform data for frontend use
    const formattedTenants = tenants.map((tenant) => ({
      id: tenant.userID,
      name: `${tenant.firstName || ""} ${tenant.lastName || ""}`.trim(),
      profile:
        tenant.propertyId && tenant.property
          ? `/tenant-images/${tenant.userID}.png`
          : "/default-avatar.png", // Placeholder or dynamically replace if you store image URLs in Resource table
      unit: tenant.property?.name || "Unknown Unit",
      location: tenant.property?.address || "Unknown Address",
      email: tenant.email,
      contact: tenant.firstNumber,
    }));

    return NextResponse.json(formattedTenants);
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenants" },
      { status: 500 }
    );
  }
}
