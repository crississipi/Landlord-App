// app/api/billings/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME!;
const GITHUB_REPO = process.env.GITHUB_REPO!;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

interface BillingPayload {
  userID: number;
  propertyId: number;
  unit: string;
  month: string;
  totalRent: number;
  totalWater: number;
  totalElectric: number;
  waterMeterImage?: string; // base64
  electricMeterImage?: string; // base64
  tenantNames?: string;
  billingType: 'rent' | 'utility';
}

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST!,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASSWORD!,
    },
  });
};

// Types for PDF generation
interface BillingData {
  month: string;
  unit: string;
  totalRent: number;
  totalWater: number;
  totalElectric: number;
}

interface TenantData {
  firstName: string | null;
  lastName: string | null;
  username: string;
  email: string | null;
}

interface PropertyData {
  name: string;
  address: string;
}

// Generate Billing Statement PDF
async function generateBillingPDF(
  billingData: BillingData,
  tenant: TenantData,
  property: PropertyData,
  waterMeterImage?: string,
  electricMeterImage?: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let yPosition = height - 50;
  const margin = 50;
  const lineHeight = 18;

  const addText = (text: string, size: number, isBold: boolean = false, x?: number) => {
    page.drawText(text, {
      x: x || margin,
      y: yPosition,
      size,
      font: isBold ? boldFont : font,
      color: rgb(0, 0, 0),
    });
    yPosition -= lineHeight;
  };

  const addLine = () => {
    page.drawLine({
      start: { x: margin, y: yPosition + 10 },
      end: { x: width - margin, y: yPosition + 10 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    yPosition -= 10;
  };

  // Header
  addText('RODRIGUEZ PROPERTIES', 18, true);
  addText('BILLING STATEMENT', 14, true);
  yPosition -= 10;
  addLine();
  yPosition -= 10;

  // Billing Info
  const monthDate = new Date(billingData.month + '-01');
  const monthName = monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  
  addText(`Statement Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 10);
  addText(`Billing Period: ${monthName}`, 10);
  addText(`Due Date: ${new Date(new Date(billingData.month + '-01').setMonth(monthDate.getMonth() + 1)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 10);
  yPosition -= 10;

  // Tenant Info
  addLine();
  yPosition -= 5;
  addText('TENANT INFORMATION', 12, true);
  yPosition -= 5;
  
  const tenantName = tenant.firstName && tenant.lastName
    ? `${tenant.firstName} ${tenant.lastName}`.trim()
    : tenant.username;
  
  addText(`Name: ${tenantName}`, 10);
  addText(`Unit: ${billingData.unit}`, 10);
  addText(`Property: ${property.name}`, 10);
  addText(`Address: ${property.address}`, 10);
  if (tenant.email) addText(`Email: ${tenant.email}`, 10);
  yPosition -= 10;

  // Billing Table
  addLine();
  yPosition -= 5;
  addText('BILLING DETAILS', 12, true);
  yPosition -= 10;

  // Table Header
  const col1 = margin;
  const col2 = margin + 250;
  // col3 reserved for future use

  page.drawText('Description', { x: col1, y: yPosition, size: 10, font: boldFont, color: rgb(0.3, 0.3, 0.3) });
  page.drawText('Amount', { x: col2, y: yPosition, size: 10, font: boldFont, color: rgb(0.3, 0.3, 0.3) });
  yPosition -= lineHeight;

  addLine();
  yPosition -= 5;

  // Table Rows
  const formatCurrency = (amount: number) => `PHP ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  page.drawText('Monthly Rent', { x: col1, y: yPosition, size: 10, font, color: rgb(0, 0, 0) });
  page.drawText(formatCurrency(billingData.totalRent), { x: col2, y: yPosition, size: 10, font, color: rgb(0, 0, 0) });
  yPosition -= lineHeight;

  page.drawText('Water Bill', { x: col1, y: yPosition, size: 10, font, color: rgb(0, 0, 0) });
  page.drawText(formatCurrency(billingData.totalWater), { x: col2, y: yPosition, size: 10, font, color: rgb(0, 0, 0) });
  yPosition -= lineHeight;

  page.drawText('Electric Bill', { x: col1, y: yPosition, size: 10, font, color: rgb(0, 0, 0) });
  page.drawText(formatCurrency(billingData.totalElectric), { x: col2, y: yPosition, size: 10, font, color: rgb(0, 0, 0) });
  yPosition -= lineHeight;

  addLine();
  yPosition -= 5;

  // Total
  const total = billingData.totalRent + billingData.totalWater + billingData.totalElectric;
  page.drawText('TOTAL AMOUNT DUE', { x: col1, y: yPosition, size: 12, font: boldFont, color: rgb(0, 0, 0) });
  page.drawText(formatCurrency(total), { x: col2, y: yPosition, size: 12, font: boldFont, color: rgb(0.8, 0.2, 0.2) });
  yPosition -= lineHeight * 2;

  // Meter Reading Images
  if (waterMeterImage || electricMeterImage) {
    addText('METER READINGS', 12, true);
    yPosition -= 10;

    const imageWidth = 200;
    const imageHeight = 150;

    if (electricMeterImage) {
      try {
        const electricData = electricMeterImage.includes(',') 
          ? electricMeterImage.split(',')[1] 
          : electricMeterImage;
        
        let electricImage;
        if (electricMeterImage.includes('image/png') || electricMeterImage.startsWith('iVBOR')) {
          electricImage = await pdfDoc.embedPng(Buffer.from(electricData, 'base64'));
        } else {
          electricImage = await pdfDoc.embedJpg(Buffer.from(electricData, 'base64'));
        }

        // Check if we need a new page
        if (yPosition - imageHeight < 100) {
          page = pdfDoc.addPage([595.28, 841.89]);
          yPosition = height - 50;
        }

        addText('Electric Meter Reading:', 10, true);
        yPosition -= 5;
        
        page.drawImage(electricImage, {
          x: margin,
          y: yPosition - imageHeight,
          width: imageWidth,
          height: imageHeight,
        });
        yPosition -= imageHeight + 20;
      } catch (error) {
        console.error('Error embedding electric meter image:', error);
        addText('Electric Meter: Image could not be displayed', 10);
      }
    }

    if (waterMeterImage) {
      try {
        const waterData = waterMeterImage.includes(',') 
          ? waterMeterImage.split(',')[1] 
          : waterMeterImage;
        
        let waterImage;
        if (waterMeterImage.includes('image/png') || waterMeterImage.startsWith('iVBOR')) {
          waterImage = await pdfDoc.embedPng(Buffer.from(waterData, 'base64'));
        } else {
          waterImage = await pdfDoc.embedJpg(Buffer.from(waterData, 'base64'));
        }

        // Check if we need a new page
        if (yPosition - imageHeight < 100) {
          page = pdfDoc.addPage([595.28, 841.89]);
          yPosition = height - 50;
        }

        addText('Water Meter Reading:', 10, true);
        yPosition -= 5;
        
        page.drawImage(waterImage, {
          x: margin,
          y: yPosition - imageHeight,
          width: imageWidth,
          height: imageHeight,
        });
        yPosition -= imageHeight + 20;
      } catch (error) {
        console.error('Error embedding water meter image:', error);
        addText('Water Meter: Image could not be displayed', 10);
      }
    }
  }

  // Footer
  if (yPosition < 150) {
    page = pdfDoc.addPage([595.28, 841.89]);
    yPosition = height - 50;
  }
  
  yPosition = 100;
  addLine();
  yPosition -= 10;
  addText('Payment Instructions:', 10, true);
  addText('Please settle your payment on or before the due date.', 9);
  addText('For inquiries, contact the property management.', 9);
  yPosition -= 10;
  addText('This is a computer-generated document. No signature required.', 8);

  return await pdfDoc.save();
}

// Upload PDF to GitHub
async function uploadPDFToGitHub(
  pdfBytes: Uint8Array,
  fileName: string,
  folderPath: string
): Promise<string> {
  const filePath = `${folderPath}/${fileName}`;
  const githubApiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${filePath}`;

  // Check if file exists
  let existingFileSha = null;
  const checkResponse = await fetch(githubApiUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'User-Agent': 'NextJS-App',
    },
  });

  if (checkResponse.status === 200) {
    const existingFileData = await checkResponse.json();
    existingFileSha = existingFileData.sha;
  }

  const requestBody: { message: string; content: string; branch: string; sha?: string } = {
    message: `Upload billing statement: ${fileName}`,
    content: Buffer.from(pdfBytes).toString('base64'),
    branch: GITHUB_BRANCH,
  };

  if (existingFileSha) {
    requestBody.sha = existingFileSha;
  }

  const uploadResponse = await fetch(githubApiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'NextJS-App',
    },
    body: JSON.stringify(requestBody),
  });

  if (!uploadResponse.ok) {
    const errorData = await uploadResponse.json();
    throw new Error(errorData.message || 'Failed to upload PDF to GitHub');
  }

  return `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;
}

// Send billing email
async function sendBillingEmail(
  tenant: TenantData,
  billingData: BillingData,
  property: PropertyData,
  pdfBytes: Uint8Array
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();

    if (!tenant.email) {
      return { success: false, error: 'Tenant has no email address' };
    }

    const tenantName = tenant.firstName && tenant.lastName
      ? `${tenant.firstName} ${tenant.lastName}`.trim()
      : tenant.username;

    const monthDate = new Date(billingData.month + '-01');
    const monthName = monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const total = billingData.totalRent + billingData.totalWater + billingData.totalElectric;

    const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .billing-summary { background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #4f46e5; margin: 20px 0; }
        .amount-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .total-row { display: flex; justify-content: space-between; padding: 15px 0; font-weight: bold; font-size: 18px; color: #dc2626; }
        .notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Billing Statement</h1>
            <p>${monthName}</p>
        </div>
        <div class="content">
            <p>Hello ${tenantName},</p>
            <p>Your billing statement for <strong>${monthName}</strong> is now available. Please find the details below:</p>
            
            <div class="billing-summary">
                <h3 style="margin-top: 0;">Unit ${billingData.unit} - ${property.name}</h3>
                <div class="amount-row">
                    <span>Monthly Rent</span>
                    <span>PHP ${billingData.totalRent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="amount-row">
                    <span>Water Bill</span>
                    <span>PHP ${billingData.totalWater.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="amount-row">
                    <span>Electric Bill</span>
                    <span>PHP ${billingData.totalElectric.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="total-row">
                    <span>TOTAL AMOUNT DUE</span>
                    <span>PHP ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>

            <div class="notice">
                <strong>📎 Billing Statement Attached</strong>
                <p>Your complete billing statement with meter readings is attached to this email as a PDF document.</p>
            </div>

            <p>Please settle your payment on or before the due date to avoid any inconvenience.</p>
            
            <div class="footer">
                <p>If you have any questions, please contact the property management.</p>
                <p>This is an automated message from Rodriguez Properties.</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'Rodriguez Properties Management',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER!,
      },
      to: tenant.email,
      subject: `Billing Statement - Unit ${billingData.unit} - ${monthName}`,
      html: emailTemplate,
      attachments: [
        {
          filename: `Billing_Statement_${billingData.unit}_${billingData.month}.pdf`,
          content: Buffer.from(pdfBytes),
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending billing email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: BillingPayload = await request.json();
    const {
      userID,
      propertyId,
      unit,
      month,
      totalRent,
      totalWater,
      totalElectric,
      waterMeterImage,
      electricMeterImage,
      billingType,
    } = body;

    // Validate required fields
    if (!userID || !propertyId || !unit || !month) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!totalRent && !totalWater && !totalElectric) {
      return NextResponse.json(
        { success: false, message: 'At least one billing amount is required' },
        { status: 400 }
      );
    }

    // Check if billing already exists for this unit and month
    const existingBilling = await prisma.billing.findFirst({
      where: {
        propertyId,
        unit,
        month,
      },
    });

    if (existingBilling) {
      return NextResponse.json(
        { success: false, message: 'Billing already exists for this unit and month' },
        { status: 400 }
      );
    }

    // Get tenant and property info
    const tenant = await prisma.users.findUnique({
      where: { userID },
      select: {
        userID: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, message: 'Tenant not found' },
        { status: 404 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { propertyId },
      select: {
        name: true,
        address: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, message: 'Property not found' },
        { status: 404 }
      );
    }

    // Calculate due date (7 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    // Create billing record
    const billing = await prisma.billing.create({
      data: {
        userID,
        propertyId,
        unit,
        month,
        totalRent: billingType === 'rent' ? (totalRent || 0) : 0,
        totalWater: billingType === 'utility' ? (totalWater || 0) : 0,
        totalElectric: billingType === 'utility' ? (totalElectric || 0) : 0,
        billingType: billingType || 'utility',
        paymentStatus: 'pending',
        amountPaid: 0,
        dueDate,
      },
    });

    // Generate PDF
    const pdfBytes = await generateBillingPDF(
      { ...body, totalRent: totalRent || 0, totalWater: totalWater || 0, totalElectric: totalElectric || 0 },
      tenant,
      property,
      waterMeterImage,
      electricMeterImage
    );

    // Upload PDF to GitHub
    const tenantName = tenant.firstName && tenant.lastName
      ? `${tenant.firstName}_${tenant.lastName}`.replace(/\s+/g, '_')
      : tenant.username;
    
    const folderPath = `billing-statements/${tenantName}`;
    const fileName = `Billing_${unit}_${month}.pdf`;
    
    let pdfUrl = '';
    try {
      pdfUrl = await uploadPDFToGitHub(pdfBytes, fileName, folderPath);
    } catch (uploadError) {
      console.error('PDF upload failed:', uploadError);
      // Continue even if upload fails
    }

    // Send email to tenant
    let emailResult: { success: boolean; error?: string } = { success: false, error: 'Email not sent' };
    if (tenant.email) {
      emailResult = await sendBillingEmail(tenant, body, property, pdfBytes);
    }

    // Create notification for landlord to remind about billing
    const landlordId = parseInt(session.user.id);
    const monthDate = new Date(month + '-01');
    const monthName = monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const totalAmount = (billing.totalRent || 0) + (billing.totalWater || 0) + (billing.totalElectric || 0);

    await prisma.notification.create({
      data: {
        userId: landlordId,
        type: 'billing_reminder',
        message: `New billing created for ${tenant.firstName || ''} ${tenant.lastName || ''} (${unit}) - ${monthName}: ₱${totalAmount.toLocaleString()}`,
        relatedId: billing.billingID,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Billing created successfully',
      billing: {
        billingID: billing.billingID,
        unit: billing.unit,
        month: billing.month,
        totalAmount,
      },
      pdfUrl,
      emailSent: emailResult.success,
      emailError: emailResult.error,
    });
  } catch (error) {
    console.error('Error creating billing:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create billing' },
      { status: 500 }
    );
  }
}
