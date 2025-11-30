import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp, password } = body;

    if (!email || !otp || !password) {
      return NextResponse.json({ 
        success: false, 
        error: "Email, OTP and password are required" 
      }, { status: 400 });
    }

    // Verify OTP again and check if it's been used
    const user = await prisma.users.findFirst({
      where: {
        email,
        otpCode: otp,
        otpExpires: {
          gt: new Date(),
        },
        otpUsed: true, // OTP should be marked as used from verification step
      },
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid, expired, or not verified OTP" 
      }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and clear OTP fields
    await prisma.users.update({
      where: { email },
      data: {
        password: hashedPassword,
        otpCode: null,
        otpExpires: null,
        otpUsed: false, // Reset for future use
      },
    });

    console.log(`Password reset successfully for user: ${email}`);

    return NextResponse.json({ 
      success: true, 
      message: "Password reset successfully" 
    });

  } catch (error) {
    console.error("Error in reset password API:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}