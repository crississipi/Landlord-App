// app/api/add-tenant/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from '@/lib/prisma';

type Body = {
  username: string; // email
  password: string; // plain text password
  role?: string;
  firstName?: string | null;
  lastName?: string | null;
  middleInitial?: string | null;
  sex?: string | null;
  bday?: string | null | Date;
  propertyId?: number | null;
  email?: string | null;
  firstNumber?: string | null;
  secondNumber?: string | null;
  unitNumber?: string | null;
  imageUrls?: string[]; // uploaded images from GitHub (profile + IDs)
  signedRulesUrl?: string; // Add document URLs
  signedContractUrl?: string; // Add document URLs
};

function isProbablyBcryptHash(s: string) {
  return typeof s === "string" && /^\$2[aby]\$[0-9]{2}\$/.test(s);
}

// Function to remove the word "Unit" from the string
function removeUnitWord(str: string): string {
  return str.replace(/Unit /gi, '').replace(/\s+/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const body: Body = await req.json();

    // Basic validation
    if (!body || !body.username || !body.password) {
      return NextResponse.json(
        { success: false, message: "username and password are required" },
        { status: 400 }
      );
    }

    const requiredFields = ['firstName', 'lastName', 'unitNumber'];
    const missingFields = requiredFields.filter(field => !body[field as keyof Body]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Normalize username/email
    const username = (body.username ?? "").trim().toLowerCase();

    // Check if username/email already exists
    const existing = await prisma.users.findUnique({
      where: { username },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email/username already exists" },
        { status: 409 }
      );
    }

    // Remove the word "Unit" and any spaces from the password
    const cleanedPassword = removeUnitWord(body.password);

    // Hash the cleaned password for database storage
    let passwordToStore = cleanedPassword;
    if (!isProbablyBcryptHash(passwordToStore)) {
      const saltRounds = 10;
      passwordToStore = await bcrypt.hash(passwordToStore, saltRounds);
    }

    // Parse bday if provided
    const parsedBday = body.bday ? new Date(body.bday) : undefined;

    // Create the user with document URLs
    const createdUser = await prisma.users.create({
      data: {
        username,
        password: passwordToStore, // Store hashed password in DB
        role: body.role ?? "tenant",
        firstName: body.firstName ?? null,
        lastName: body.lastName ?? null,
        middleInitial: body.middleInitial ?? null,
        sex: body.sex ?? null,
        bday: parsedBday ?? null,
        propertyId: body.propertyId ?? null,
        email: body.email ?? username,
        firstNumber: body.firstNumber ?? null,
        secondNumber: body.secondNumber ?? null,
        signedRulesUrl: body.signedRulesUrl ?? null, // Save document URLs
        signedContractUrl: body.signedContractUrl ?? null, // Save document URLs
        rulesSignedAt: body.signedRulesUrl ? new Date() : null, // Timestamp when signed
        contractSignedAt: body.signedContractUrl ? new Date() : null, // Timestamp when signed
      },
    });

    // Email is sent separately via /api/send-credentials from AddTenant.tsx
    // to avoid duplicate emails

    // If imageUrls provided, create Resource rows referencing this user
    const imageUrls = Array.isArray(body.imageUrls) ? body.imageUrls : [];
    if (imageUrls.length > 0) {
      const resourcesData = imageUrls.map((url) => {
        // try to infer filename from url
        let fileName = url;
        try {
          const u = new URL(url);
          fileName = u.pathname.split("/").pop() || url;
        } catch {
          // ignore
        }

        return {
          referenceId: createdUser.userID,
          referenceType: "Users",
          url,
          fileName,
        };
      });

      // Bulk create resources
      await prisma.resource.createMany({
        data: resourcesData,
        skipDuplicates: true,
      });
    }

    return NextResponse.json(
      { success: true, userId: createdUser.userID },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("add-tenant error:", err);
    // Prisma unique constraint errors might have code P2002
    if (err?.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "A record with that value already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}