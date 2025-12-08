import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET /api/messages/[conversationId] - Get messages with a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationID: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const partnerId = parseInt(params.conversationID);

    const { searchParams } = new URL(request.url);
    const allParam = searchParams.get('all');
    const limitParam = searchParams.get('limit');
    const cursorParam = searchParams.get('cursor');

    const isAll = allParam === 'true';
    let limit = Math.min(parseInt(limitParam || '10') || 10, 50);
    const cursor = cursorParam ? parseInt(cursorParam) : undefined;

    const baseWhere = {
      OR: [
        {
          senderID: userId,
          receiverID: partnerId
        },
        {
          senderID: partnerId,
          receiverID: userId
        }
      ]
    };

    let rawMessages;

    if (isAll) {
      rawMessages = await prisma.messages.findMany({
        where: baseWhere,
        include: {
          sender: {
            select: {
              userID: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          dateSent: 'asc'
        }
      });
    } else {
      rawMessages = await prisma.messages.findMany({
        where: baseWhere,
        include: {
          sender: {
            select: {
              userID: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          messageID: 'desc'
        },
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor
          ? {
              messageID: cursor
            }
          : undefined
      });
    }

    // Group messages by batchId
    const batchMap = new Map();
    const groupedMessages: any[] = [];

    rawMessages.forEach((msg: any) => {
      if (msg.batchId) {
        if (!batchMap.has(msg.batchId)) {
          // First message in batch - create the grouped message
          batchMap.set(msg.batchId, {
            messageID: msg.messageID,
            senderID: msg.senderID,
            receiverID: msg.receiverID,
            message: msg.message,
            dateSent: msg.dateSent,
            read: msg.read,
            sender: msg.sender,
            batchId: msg.batchId,
            files: []
          });
          groupedMessages.push(batchMap.get(msg.batchId));
        }
        
        // Add file to the batch
        if (msg.fileUrl) {
          batchMap.get(msg.batchId).files.push({
            url: msg.fileUrl,
            fileName: msg.fileName,
            fileType: msg.fileType,
            fileSize: msg.fileSize
          });
        }
      } else {
        // Message without batch - add as is
        groupedMessages.push({
          ...msg,
          files: msg.fileUrl ? [{
            url: msg.fileUrl,
            fileName: msg.fileName,
            fileType: msg.fileType,
            fileSize: msg.fileSize
          }] : []
        });
      }
    });

    groupedMessages.sort((a, b) => a.messageID - b.messageID);

    const hasMore = !isAll && rawMessages.length === limit;
    const nextCursor = !isAll && hasMore
      ? rawMessages[rawMessages.length - 1].messageID
      : null;

    // Mark messages as read
    await prisma.messages.updateMany({
      where: {
        senderID: partnerId,
        receiverID: userId,
        read: false
      },
      data: {
        read: true
      }
    });

    return NextResponse.json({
      messages: groupedMessages,
      nextCursor,
      hasMore
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}