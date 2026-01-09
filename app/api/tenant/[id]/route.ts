// app/api/tenant/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = parseInt(id, 10);

    if (isNaN(tenantId)) {
      return NextResponse.json({ error: "Invalid tenant ID" }, { status: 400 });
    }

    // Get tenant with property info
    const tenant = await prisma.users.findUnique({
      where: { userID: tenantId },
      include: {
        property: {
          select: {
            propertyId: true,
            name: true,
            address: true,
            rent: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Get profile image from Resource table
    const resources = await prisma.resource.findMany({
      where: {
        referenceId: tenant.userID,
        referenceType: "Users", // Make sure you store it this way in DB
      },
      select: {
        url: true,
        fileName: true,
      },
    });

    // Calculate age
    const calculateAge = (bday: Date | null) => {
      if (!bday) return null;
      const today = new Date();
      const birthDate = new Date(bday);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age;
    };

    // Format response
    const formattedTenant = {
      userID: tenant.userID,
      firstName: tenant.firstName,
      lastName: tenant.lastName,
      middleInitial: tenant.middleInitial,
      sex: tenant.sex,
      email: tenant.email,
      firstNumber: tenant.firstNumber,
      secondNumber: tenant.secondNumber,
      created_at: tenant.created_at?.toISOString() ?? "",
      age: calculateAge(tenant.bday),
      birthDate: tenant.bday
        ? tenant.bday.toISOString().split("T")[0]
        : null,
      unitNumber: tenant.property?.name ?? null,
      moveInDate: tenant.created_at
        ? tenant.created_at.toISOString().split("T")[0]
        : null,
      rentAmount: tenant.property?.rent ?? 0,
      property: tenant.property
        ? {
            propertyId: tenant.property.propertyId,
            name: tenant.property.name,
            address: tenant.property.address,
            rent: tenant.property.rent,
          }
        : null,
      resources: resources.map((res) => ({
        url: res.url,
        fileName: res.fileName,
      })),
    };

    console.log(tenant.property);

    return NextResponse.json({ tenant: formattedTenant });
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenant details" },
      { status: 500 }
    );
  }
}
