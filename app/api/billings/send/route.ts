// app/api/billings/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import nodemailer from "nodemailer";

// ====== GITHUB CONFIG ======
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME!;
const GITHUB_REPO = process.env.GITHUB_REPO!;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

// ====== EMAIL CONFIG ======
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST!,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASSWORD!,
    },
  });
};

// ============================================================================
// 1. GENERATE BILLING PDF (pdf-lib)
// ============================================================================
async function generateBillingPDF(billing: any, tenant: any) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const line = (text: string, size = 11, bold = false) => {
    page.drawText(text, {
      x: 40,
      y,
      size,
      font: bold ? boldFont : font,
      color: rgb(0, 0, 0)
    });
    y -= 18;
  };

  // Title
  line("BILLING STATEMENT", 16, true);
  y -= 10;

  // Customer info
  line(`Tenant: ${tenant.firstName} ${tenant.lastName}`, 12);
  line(`Email: ${tenant.email}`, 12);
  line(`Billing ID: ${billing.billingID}`, 12);
  line(`Date Issued: ${new Date(billing.dateIssued).toLocaleDateString("fil-PH")}`, 12);

  y -= 15;
  line("------------------------------------------------------------");

  // Billing details
  line("Charges Summary", 13, true);
  y -= 10;

  line(`Rent: PHP ${billing.totalRent.toLocaleString()}`);
  line(`Water: PHP ${billing.totalWater.toLocaleString()}`);
  line(`Electric: PHP ${billing.totalElectric.toLocaleString()}`);

  y -= 10;
  line("------------------------------------------------------------");

  const total =
    billing.totalRent + billing.totalWater + billing.totalElectric;

  line(`TOTAL DUE: PHP ${total.toLocaleString()}`, 14, true);

  // Footer
  y -= 30;
  line("Thank you for your payment.", 10);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

// ============================================================================
// 2. UPLOAD TO GITHUB (same style as your tenancy system)
// ============================================================================
async function uploadBillingPDFtoGithub(buffer: Buffer, fileName: string) {
  try {
    const folder = `billing-documents`;
    const filePath = `${folder}/${fileName}`;

    const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${filePath}`;

    const requestBody = {
      message: `Upload ${fileName}`,
      content: buffer.toString("base64"),
      branch: GITHUB_BRANCH,
    };

    const uploadResponse = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "NextJS-App",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await uploadResponse.json();
    if (!uploadResponse.ok) throw new Error(data.message);

    return `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;
  } catch (error) {
    console.error("GitHub upload error:", error);
    return null;
  }
}

// ============================================================================
// 3. SEND EMAIL WITH ATTACHMENT
// ============================================================================
async function sendBillingEmail(tenant: any, pdfBuffer: Buffer) {
  const transporter = createTransporter();

  const emailTemplate = `
    <p>Dear ${tenant.firstName},</p>
    <p>Please find attached your billing statement.</p>
    <p>Thank you.</p>
  `;

  return transporter.sendMail({
    from: {
      name: process.env.EMAIL_FROM_NAME || "Rodriguez Properties Billing",
      address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER!,
    },
    to: tenant.email,
    subject: "Your Billing Statement",
    html: emailTemplate,
    attachments: [
      {
        filename: "Billing.pdf",
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}

// ============================================================================
// ✔ MAIN ENDPOINT
// ============================================================================
export async function POST(req: NextRequest) {
  try {
    const { billingID } = await req.json();

    if (!billingID)
      return NextResponse.json({ success: false, message: "billingID is required" }, { status: 400 });

    // Fetch billing + tenant
    const billing = await prisma.billing.findUnique({
      where: { billingID: Number(billingID) },
    });

    if (!billing)
      return NextResponse.json({ success: false, message: "Billing not found" }, { status: 404 });

    const tenant = await prisma.users.findUnique({
      where: { userID: billing.userID },
      select: {
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!tenant)
      return NextResponse.json({ success: false, message: "Tenant not found" }, { status: 404 });

    // 1) Generate PDF
    const pdfBuffer = await generateBillingPDF(billing, tenant);

    // 2) Upload PDF to GitHub (optional)
    const fileName = `Billing_${billing.billingID}.pdf`;
    const githubUrl = await uploadBillingPDFtoGithub(pdfBuffer, fileName);

    // 3) Email the tenant
    await sendBillingEmail(tenant, pdfBuffer);

    return NextResponse.json({
      success: true,
      message: "Billing sent successfully",
      githubUrl, // optional
    });
  } catch (error: any) {
    console.error("Billing send error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
