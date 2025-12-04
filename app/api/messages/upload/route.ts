import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const receiverID = formData.get('receiverID') as string;
    const message = formData.get('message') as string | null;

    if (!file || !receiverID) {
      return NextResponse.json(
        { error: 'File and receiver ID are required' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'messages');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${originalName}`;
    const filePath = path.join(uploadsDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create file URL
    const fileUrl = `/uploads/messages/${fileName}`;

    // Generate a batch ID for single file (for consistency)
    const batchId = `single_${Date.now()}_${session.user.id}`;

    // Save message with file to database
    const newMessage = await prisma.messages.create({
      data: {
        senderID: parseInt(session.user.id),
        receiverID: parseInt(receiverID),
        message: message || `Sent a file: ${file.name}`,
        fileUrl: fileUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size.toString(),
        batchId: batchId,
        dateSent: new Date(),
        read: false
      },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        receiver: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: newMessage,
      fileUrl
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
