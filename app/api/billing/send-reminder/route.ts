import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { billingID } = await request.json();

    if (!billingID) {
      return NextResponse.json(
        { error: 'Billing ID is required' },
        { status: 400 }
      );
    }

    // Fetch billing details with user and property info
    const billing = await prisma.billing.findUnique({
      where: { billingID: parseInt(billingID) },
      include: {
        user: {
          select: {
            userID: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        property: {
          select: {
            name: true
          }
        }
      }
    });

    if (!billing) {
      return NextResponse.json({ error: 'Billing not found' }, { status: 404 });
    }

    // Validate tenant email
    if (!billing.user.email) {
      return NextResponse.json({ error: 'Tenant email not found' }, { status: 400 });
    }

    // Validate billing month
    if (!billing.month) {
      return NextResponse.json({ error: 'Billing month not found' }, { status: 400 });
    }

    // Calculate totals
    const totalRent = billing.totalRent;
    const totalElectric = billing.totalElectric;
    const totalWater = billing.totalWater;
    const totalAmount = totalRent + totalElectric + totalWater;

    // Send email reminder
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const tenantEmail = billing.user.email;
    const billingMonth = billing.month;

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: tenantEmail,
      subject: `Billing Reminder - ${billingMonth} ${billing.dueDate?.getFullYear()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Billing Reminder</h2>
          <p>Dear ${billing.user.firstName} ${billing.user.lastName},</p>
          <p>Your billing for ${billingMonth} is now available.</p>
          
          <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Service</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Rent</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₱${totalRent.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Electric Bill</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₱${totalElectric.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Water Bill</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₱${totalWater.toLocaleString()}</td>
              </tr>
              <tr style="background-color: #f5f5f5; font-weight: bold;">
                <td style="border: 1px solid #ddd; padding: 8px;">Total</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₱${totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          
          <p><strong>Due Date:</strong> ${billing.dueDate ? billing.dueDate.toLocaleDateString() : 'N/A'}</p>
          <p><strong>Property:</strong> ${billing.property.name}</p>
          
          <p>Please settle your payment on time to avoid any penalties.</p>
          <p>Thank you!</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    // Update billing log
    await prisma.rentBillingLog.create({
      data: {
        userID: billing.user.userID,
        propertyId: billing.propertyId,
        billingID: billing.billingID,
        month: billingMonth,
        emailSent: true
      }
    });

    // Send message to tenant
    const messageText = `Billing: Your billing for ${billingMonth} is ready. Rent: ₱${totalRent.toLocaleString()}, Electric: ₱${totalElectric.toLocaleString()}, Water: ₱${totalWater.toLocaleString()}, Total: ₱${totalAmount.toLocaleString()}. Due: ${billing.dueDate ? billing.dueDate.toLocaleDateString() : 'N/A'}. BillingID: ${billingID}`;

    await prisma.messages.create({
      data: {
        senderID: parseInt(session.user.id),
        receiverID: billing.user.userID,
        message: messageText,
        dateSent: new Date(),
        read: false
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Billing reminder sent successfully'
    });
  } catch (error) {
    console.error('Error sending billing reminder:', error);
    return NextResponse.json(
      { error: 'Failed to send billing reminder' },
      { status: 500 }
    );
  }
}
