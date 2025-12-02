// pages/api/billings/create.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

type Data = { success: boolean; billing?: any; message?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const {
      userID,
      propertyId,
      unit = '',
      month,
      totalRent = 0,
      totalWater = 0,
      totalElectric = 0,
      note,
    } = req.body;

    if (!userID || !propertyId) {
      return res.status(400).json({ success: false, message: 'userID and propertyId are required' });
    }

    // Save Billing (dateIssued defaults to now in schema)
    const billing = await prisma.billing.create({
      data: {
        userID: Number(userID),
        propertyId: Number(propertyId),
        totalRent: Number(totalRent),
        totalWater: Number(totalWater),
        totalElectric: Number(totalElectric),
        // optional: if you want to record month in a lightweight way,
        // add it to a Resource or another table. Your Billing model doesn't have 'unit' or 'month' fields.
      },
    });

    // Optional: create a Resource entry that references this billing (useful to store generated PDF later)
    await prisma.resource.create({
      data: {
        referenceId: billing.billingID,
        referenceType: 'Billing',
        url: '', // fill after generating PDF slip
        fileName: `billing-${billing.billingID}.pdf`,
      },
    });

    return res.status(201).json({ success: true, billing });
  } catch (err) {
    console.error('create billing error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}