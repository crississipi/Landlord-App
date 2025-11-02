// app/api/get-tenants/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Step 1: Get all tenants
    const tenants = await prisma.users.findMany({
      where: { role: "tenant" },
      include: {
        property: {
          select: {
            propertyId: true,
            name: true,
            address: true,
          },
        },
      },
    });

    // Step 2: Attach image resources manually (based on referenceType and referenceId)
    const tenantsWithImages = await Promise.all(
      tenants.map(async (tenant) => {
        const images = await prisma.resource.findMany({
          where: {
            referenceId: tenant.userID,
            referenceType: "Users", // or whatever you use when saving profile images
          },
          select: { url: true },
        });

        return { ...tenant, resources: images };
      })
    );

    return NextResponse.json({ tenants: tenantsWithImages });
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenants" },
      { status: 500 }
    );
  }
}
