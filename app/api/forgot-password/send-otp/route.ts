import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from '@/lib/prisma';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

const createTransporter = () => {
  const config: EmailConfig = {
    host: process.env.EMAIL_HOST!,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASSWORD!,
    },
  };

  return nodemailer.createTransport(config);
};

const sendOtpEmail = async (to: string, otp: string) => {
  try {
    const transporter = createTransporter();

    const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #574964; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .otp-box { font-size: 2rem; font-weight: bold; text-align: center; padding: 15px; background: #fff; border-radius: 6px; margin: 20px 0; letter-spacing: 10px; border-left: 4px solid #574964; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset OTP</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>You requested to reset your password. Use the OTP below to verify your account:</p>
      <div class="otp-box">${otp}</div>
      <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      <div class="footer">
        <p>This is an automated message, please do not reply.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || "Co-Living Management",
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER!,
      },
      to,
      subject: "Your OTP for Password Reset",
      html: emailTemplate,
    };

    const result = await transporter.sendMail(mailOptions);

    console.log("✅ OTP email sent:", { to, messageId: result.messageId });
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    // Check if user exists with this email
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "No account found with this email" 
      }, { status: 404 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store OTP in database
    await prisma.users.update({
      where: { email },
      data: {
        otpCode: otp,
        otpExpires: otpExpires,
        otpUsed: false, // Reset to false when generating new OTP
      },
    });

    console.log(`Generated OTP for ${email}: ${otp}`);

    // Send OTP email
    const result = await sendOtpEmail(email, otp);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: "OTP sent successfully" 
      });
    } else {
      // Clear OTP if email failed to send
      await prisma.users.update({
        where: { email },
        data: {
          otpCode: null,
          otpExpires: null,
        },
      });

      return NextResponse.json({ 
        success: false, 
        error: result.error || "Failed to send OTP" 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in send-otp API:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}