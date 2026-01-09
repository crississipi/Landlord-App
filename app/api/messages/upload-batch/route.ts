import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME!;
const GITHUB_REPO = process.env.GITHUB_REPO!;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

interface FileData {
  name: string;
  content: string;
  type?: string;
  size?: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverID, message, files } = await request.json();

    if (!files || files.length === 0 || !receiverID) {
      return NextResponse.json(
        { error: 'At least one file and receiver ID are required' },
        { status: 400 }
      );
    }

    // Generate a unique batch ID for this group of files
    const batchId = `batch_${Date.now()}_${session.user.id}`;
    const uploadedFiles = [];
    const folderName = `messages/${session.user.id}`;

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file: FileData = files[i];
      
      if (!file.name || !file.content) {
        return NextResponse.json(
          { error: `Invalid file data at index ${i}: missing name or content` },
          { status: 400 }
        );
      }

      // Generate unique filename for GitHub
      const timestamp = Date.now();
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${i}_${originalName}`;
      const filePath = `${folderName}/${fileName}`;
      
      const githubApiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${filePath}`;

      // Upload file to GitHub
      const githubResponse = await fetch(githubApiUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Upload message file: ${fileName}`,
          content: file.content.replace(/\s/g, ""), // must be base64 string
          branch: GITHUB_BRANCH,
        }),
      });

      const githubData = await githubResponse.json();

      if (!githubResponse.ok) {
        console.error("GitHub upload failed:", githubData);
        return NextResponse.json(
          { error: githubData?.message || `Failed to upload ${file.name} to GitHub.` },
          { status: 500 }
        );
      }

      // Create the GitHub raw URL
      const fileUrl = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;

      uploadedFiles.push({
        url: fileUrl,
        fileName: file.name,
        fileType: file.type || null,
        fileSize: file.size?.toString() || null
      });

      // Save each file as a separate message with the same batchId
      const newMessage = await prisma.messages.create({
        data: {
          senderID: parseInt(session.user.id),
          receiverID: parseInt(receiverID),
          message: i === 0 && message ? message : null, // Only first message gets the text
          fileUrl: fileUrl,
          fileName: file.name,
          fileType: file.type || null,
          fileSize: file.size?.toString() || null,
          batchId: batchId,
          dateSent: new Date(),
          read: false
        }
      });

      // Save file reference to Resource table
      await prisma.resource.create({
        data: {
          referenceId: newMessage.messageID,
          referenceType: 'Messages',
          url: fileUrl,
          fileName: file.name,
          createdAt: new Date()
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
