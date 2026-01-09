import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME!;
const GITHUB_REPO = process.env.GITHUB_REPO!;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverID, message, file } = await request.json();

    if (!file || !receiverID) {
      return NextResponse.json(
        { error: 'File and receiver ID are required' },
        { status: 400 }
      );
    }

    if (!file.name || !file.content) {
      return NextResponse.json(
        { error: 'Invalid file data: missing name or content' },
        { status: 400 }
      );
    }

    // Generate unique filename for GitHub
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${originalName}`;
    const folderName = `messages/${session.user.id}`;
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

    // Generate a batch ID for single file (for consistency)
    const batchId = `single_${Date.now()}_${session.user.id}`;

    // Save message to database
    const newMessage = await prisma.messages.create({
      data: {
        senderID: parseInt(session.user.id),
        receiverID: parseInt(receiverID),
        message: message,
        fileUrl: fileUrl,
        fileName: file.name,
        fileType: file.type || null,
        fileSize: file.size?.toString() || null,
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
