// app/api/payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME!;
const GITHUB_REPO = process.env.GITHUB_REPO!;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

// Upload image to GitHub
async function uploadImageToGitHub(
  imageBase64: string,
  fileName: string,
  folderPath: string
): Promise<string> {
  const filePath = `${folderPath}/${fileName}`;
  const githubApiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${filePath}`;

  // Extract base64 data
  const base64Data = imageBase64.includes(',') 
    ? imageBase64.split(',')[1] 
    : imageBase64;

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
    message: `Upload payment receipt: ${fileName}`,
    content: base64Data,
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
    throw new Error(errorData.message || 'Failed to upload image to GitHub');
  }

  return `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;
}

// GET: Fetch payments for a billing or property
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const billingId = searchParams.get('billingId');
    const propertyId = searchParams.get('propertyId');
    const month = searchParams.get('month');

    const whereClause: Record<string, unknown> = {};

    if (billingId) {
      whereClause.billingID = parseInt(billingId);
    }

    if (propertyId) {
      whereClause.billing = {
        propertyId: parseInt(propertyId),
        ...(month && { month }),
      };
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        billing: {
          select: {
            billingID: true,
            unit: true,
            month: true,
            totalRent: true,
            totalWater: true,
            totalElectric: true,
            billingType: true,
          },
        },
        user: {
          select: {
            userID: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
      orderBy: { datePaid: 'desc' },
    });

    const formattedPayments = payments.map((p) => ({
      paymentID: p.paymentID,
      billingID: p.billingID,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      paymentStatus: p.paymentStatus,
      gcashReceiptImage: p.gcashReceiptImage,
      gcashTransactionId: p.gcashTransactionId,
      datePaid: p.datePaid.toISOString(),
      notes: p.notes,
      billing: p.billing,
      user: {
        userID: p.user.userID,
        name: p.user.firstName && p.user.lastName
          ? `${p.user.firstName} ${p.user.lastName}`.trim()
          : p.user.username,
      },
    }));

    return NextResponse.json({
      success: true,
      payments: formattedPayments,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST: Create a new payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      billingID,
      userID,
      amount,
      paymentMethod,
      paymentStatus,
      gcashReceiptImage,
      gcashTransactionId,
      notes,
    } = body;

    // Validate required fields
    if (!billingID || !userID || !amount || !paymentMethod || !paymentStatus) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate GCash payment requirements
    if (paymentMethod === 'gcash') {
      if (!gcashReceiptImage && !gcashTransactionId) {
        return NextResponse.json(
          { success: false, message: 'GCash payment requires either a receipt image or transaction ID' },
          { status: 400 }
        );
      }
    }

    // Get billing to validate and calculate
    const billing = await prisma.billing.findUnique({
      where: { billingID },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });

    if (!billing) {
      return NextResponse.json(
        { success: false, message: 'Billing not found' },
        { status: 404 }
      );
    }

    // Calculate total amount for billing
    const totalBillingAmount = billing.billingType === 'rent' 
      ? billing.totalRent 
      : billing.totalRent + billing.totalWater + billing.totalElectric;

    // Get existing payments for this billing
    const existingPayments = await prisma.payment.findMany({
      where: { billingID },
    });

    const totalPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0);
    const newTotalPaid = totalPaid + amount;

    // Validate payment amount
    if (newTotalPaid > totalBillingAmount) {
      return NextResponse.json(
        { success: false, message: `Payment amount exceeds remaining balance. Remaining: ₱${(totalBillingAmount - totalPaid).toLocaleString()}` },
        { status: 400 }
      );
    }

    // Upload GCash receipt if provided
    let receiptUrl = null;
    if (gcashReceiptImage && gcashReceiptImage.startsWith('data:')) {
      try {
        const tenantName = billing.user.firstName && billing.user.lastName
          ? `${billing.user.firstName}_${billing.user.lastName}`.replace(/\s+/g, '_')
          : billing.user.username;
        
        const folderPath = `payment-receipts/${tenantName}`;
        const fileName = `GCash_Receipt_${billing.unit}_${Date.now()}.jpg`;
        receiptUrl = await uploadImageToGitHub(gcashReceiptImage, fileName, folderPath);
      } catch (uploadError) {
        console.error('Receipt upload failed:', uploadError);
        // Continue with base64 stored in DB if upload fails
        receiptUrl = gcashReceiptImage;
      }
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        billingID,
        userID,
        amount,
        paymentMethod,
        paymentStatus,
        gcashReceiptImage: receiptUrl || gcashReceiptImage,
        gcashTransactionId,
        notes,
      },
    });

    // Update billing payment status and amount paid
    const updatedPaymentStatus = newTotalPaid >= totalBillingAmount ? 'paid' : 'partial';
    
    await prisma.billing.update({
      where: { billingID },
      data: {
        amountPaid: newTotalPaid,
        paymentStatus: updatedPaymentStatus,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully',
      payment: {
        paymentID: payment.paymentID,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.paymentStatus,
        datePaid: payment.datePaid.toISOString(),
      },
      billing: {
        billingID,
        totalAmount: totalBillingAmount,
        amountPaid: newTotalPaid,
        remainingBalance: totalBillingAmount - newTotalPaid,
        paymentStatus: updatedPaymentStatus,
      },
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
