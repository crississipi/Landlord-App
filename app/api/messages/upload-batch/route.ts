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
    const files = formData.getAll('files') as File[];
    const receiverID = formData.get('receiverID') as string;
    const message = formData.get('message') as string | null;

    if (files.length === 0 || !receiverID) {
      return NextResponse.json(
        { error: 'At least one file and receiver ID are required' },
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

    // Generate a unique batch ID for this group of files
    const batchId = `batch_${Date.now()}_${session.user.id}`;
    const uploadedFiles = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Generate unique filename
      const timestamp = Date.now();
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${i}_${originalName}`;
      const filePath = path.join(uploadsDir, fileName);

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Create file URL
      const fileUrl = `/uploads/messages/${fileName}`;

      uploadedFiles.push({
        url: fileUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size.toString()
      });

      // Save each file as a separate message with the same batchId
      await prisma.messages.create({
        data: {
          senderID: parseInt(session.user.id),
          receiverID: parseInt(receiverID),
          message: i === 0 && message ? message : null, // Only first message gets the text
          fileUrl: fileUrl,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size.toString(),
          batchId: batchId,
          dateSent: new Date(),
          read: false
        }
      });
    }

    // Fetch all messages in this batch to return
    const batchMessages = await prisma.messages.findMany({
      where: {
        batchId: batchId
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
      },
      orderBy: {
        messageID: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      batchId,
      messages: batchMessages,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
