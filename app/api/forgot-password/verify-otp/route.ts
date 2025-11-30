import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json({ 
        success: false, 
        error: "Email and OTP are required" 
      }, { status: 400 });
    }

    // Find user with this email and OTP
    const user = await prisma.users.findFirst({
      where: {
        email,
        otpCode: otp,
        otpExpires: {
          gt: new Date(), // OTP not expired
        },
        otpUsed: false, // OTP hasn't been used yet
      },
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid, expired, or already used OTP" 
      }, { status: 400 });
    }

    // Mark OTP as used
    await prisma.users.update({
      where: { 
        userID: user.userID 
      },
      data: {
        otpUsed: true,
        // Optionally, you can also clear the OTP code and expiration
        // otpCode: null,
        // otpExpires: null,
      },
    });

    console.log(`OTP verified and marked as used for user: ${email}`);

    return NextResponse.json({ 
      success: true, 
      message: "OTP verified successfully" 
    });

  } catch (error) {
    console.error("Error in verify-otp API:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}