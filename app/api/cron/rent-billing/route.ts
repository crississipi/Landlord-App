// app/api/cron/rent-billing/route.ts
// Automatic rent billing cron job - sends rent bills on tenant's move-in anniversary date
import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import nodemailer from 'nodemailer';
import { createBillingNotification } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';

// Verify cron secret for security
const CRON_SECRET = process.env.CRON_SECRET;

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

interface TenantForBilling {
  userID: number;
  firstName: string | null;
  lastName: string | null;
  username: string;
  email: string | null;
  moveInDate: Date | null;
  unitNumber: string | null;
  propertyId: number | null;
  property: {
    propertyId: number;
    name: string;
    address: string;
    rent: number;
  } | null;
}

// Generate Rent Billing PDF
async function generateRentBillingPDF(
  tenant: TenantForBilling,
  rentAmount: number,
  billingMonth: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let yPosition = height - 50;
  const margin = 50;
  const lineHeight = 18;

  const addText = (text: string, size: number, isBold: boolean = false) => {
    page.drawText(text, {
      x: margin,
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
  addText('MONTHLY RENT BILLING', 14, true);
  yPosition -= 10;
  addLine();
  yPosition -= 10;

  // Billing Info
  const monthDate = new Date(billingMonth + '-01');
  const monthName = monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const dueDate = new Date(monthDate);
  dueDate.setDate(dueDate.getDate() + 7); // Due 7 days from billing date

  addText(`Statement Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 10);
  addText(`Billing Period: ${monthName}`, 10);
  addText(`Due Date: ${dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 10);
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
  addText(`Unit: ${tenant.unitNumber || 'N/A'}`, 10);
  addText(`Property: ${tenant.property?.name || 'N/A'}`, 10);
  addText(`Address: ${tenant.property?.address || 'N/A'}`, 10);
  if (tenant.email) addText(`Email: ${tenant.email}`, 10);
  yPosition -= 10;

  // Billing Details
  addLine();
  yPosition -= 5;
  addText('BILLING DETAILS', 12, true);
  yPosition -= 10;

  const formatCurrency = (amount: number) => `PHP ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  page.drawText('Monthly Rent', { x: margin, y: yPosition, size: 10, font, color: rgb(0, 0, 0) });
  page.drawText(formatCurrency(rentAmount), { x: margin + 250, y: yPosition, size: 10, font, color: rgb(0, 0, 0) });
  yPosition -= lineHeight;

  addLine();
  yPosition -= 5;

  // Total
  page.drawText('TOTAL AMOUNT DUE', { x: margin, y: yPosition, size: 12, font: boldFont, color: rgb(0, 0, 0) });
  page.drawText(formatCurrency(rentAmount), { x: margin + 250, y: yPosition, size: 12, font: boldFont, color: rgb(0.8, 0.2, 0.2) });
  yPosition -= lineHeight * 2;

  // Footer
  yPosition = 100;
  addLine();
  yPosition -= 10;
  addText('Payment Instructions:', 10, true);
  addText('Please settle your rent payment on or before the due date.', 9);
  addText('For inquiries, contact the property management.', 9);
  yPosition -= 10;
  addText('This is an automated billing statement. No signature required.', 8);

  return await pdfDoc.save();
}

// Send rent billing email
async function sendRentBillingEmail(
  tenant: TenantForBilling,
  rentAmount: number,
  billingMonth: string,
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

    const monthDate = new Date(billingMonth + '-01');
    const monthName = monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .billing-summary { background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #8b5cf6; margin: 20px 0; }
        .total-row { display: flex; justify-content: space-between; padding: 15px 0; font-weight: bold; font-size: 18px; color: #8b5cf6; }
        .notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Monthly Rent Billing</h1>
            <p>${monthName}</p>
        </div>
        <div class="content">
            <p>Hello ${tenantName},</p>
            <p>Your monthly rent billing for <strong>${monthName}</strong> is now due. Please find the details below:</p>
            
            <div class="billing-summary">
                <h3 style="margin-top: 0;">Unit ${tenant.unitNumber || 'N/A'} - ${tenant.property?.name || 'Property'}</h3>
                <div class="total-row">
                    <span>MONTHLY RENT</span>
                    <span>PHP ${rentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>

            <div class="notice">
                <strong>📎 Rent Billing Statement Attached</strong>
                <p>Your complete rent billing statement is attached to this email as a PDF document.</p>
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
      subject: `Monthly Rent Billing - Unit ${tenant.unitNumber || 'N/A'} - ${monthName}`,
      html: emailTemplate,
      attachments: [
        {
          filename: `Rent_Billing_${tenant.unitNumber || 'Unit'}_${billingMonth}.pdf`,
          content: Buffer.from(pdfBytes),
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending rent billing email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security (optional but recommended)
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    // Find all active tenants whose move-in day matches today's day
    const tenantsToNotify = await prisma.users.findMany({
      where: {
        role: 'tenant',
        hasLeftProperty: false,
        moveInDate: { not: null },
        propertyId: { not: null },
      },
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

    // Filter tenants whose move-in day matches today
    const eligibleTenants = tenantsToNotify.filter((tenant) => {
      if (!tenant.moveInDate) return false;
      const moveInDay = new Date(tenant.moveInDate).getDate();
      return moveInDay === currentDay;
    });

    const results: { userID: number; name: string; success: boolean; error?: string }[] = [];

    for (const tenant of eligibleTenants) {
      // Check if we already sent billing for this tenant this month
      const existingLog = await prisma.expenseLog.findUnique({
        where: {
          userID_month: {
            userID: tenant.userID,
            month: currentMonth,
          },
        },
      });

      if (existingLog) {
        results.push({
          userID: tenant.userID,
          name: `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim() || tenant.username,
          success: false,
          error: 'Already sent this month',
        });
        continue;
      }

      const rentAmount = tenant.property?.rent || 0;

      if (rentAmount === 0) {
        results.push({
          userID: tenant.userID,
          name: `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim() || tenant.username,
          success: false,
          error: 'No rent amount configured for property',
        });
        continue;
      }

      // Create billing record for rent
      const billing = await prisma.billing.create({
        data: {
          userID: tenant.userID,
          propertyId: tenant.propertyId!,
          unit: tenant.unitNumber || '1',
          month: currentMonth,
          totalRent: rentAmount,
          totalWater: 0,
          totalElectric: 0,
          billingType: 'rent',
          paymentStatus: 'pending',
          dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      });

      // Generate PDF
      const pdfBytes = await generateRentBillingPDF(
        tenant as TenantForBilling,
        rentAmount,
        currentMonth
      );

      // Send email
      const emailResult = await sendRentBillingEmail(
        tenant as TenantForBilling,
        rentAmount,
        currentMonth,
        pdfBytes
      );

      // Log the billing attempt
      await prisma.expenseLog.create({
        data: {
          userID: tenant.userID,
          propertyId: tenant.propertyId!,
          billingID: billing.billingID,
          month: currentMonth,
          paidRent: 0,
          paidWater: 0,
          paidElectric: 0,
          emailSent: emailResult.success,
          error: emailResult.error,
        },
      });

      // Create notification for tenant about the rent billing
      const tenantName = tenant.firstName && tenant.lastName
        ? `${tenant.firstName} ${tenant.lastName}`.trim()
        : tenant.username;
      
      await createBillingNotification({
        tenantId: tenant.userID,
        billingId: billing.billingID,
        unit: tenant.unitNumber || '1',
        month: currentMonth,
        totalAmount: rentAmount,
        tenantName
      });

      results.push({
        userID: tenant.userID,
        name: `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim() || tenant.username,
        success: emailResult.success,
        error: emailResult.error,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${eligibleTenants.length} tenant(s) for rent billing`,
      date: today.toISOString(),
      currentDay,
      results,
    });
  } catch (error) {
    console.error('Error in rent billing cron:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process rent billing' },
      { status: 500 }
    );
  }
}

// POST method for manual trigger (for testing)
export async function POST(request: NextRequest) {
  return GET(request);
}
