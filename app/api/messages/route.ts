import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET /api/messages - Get all conversations for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Get all unique conversations (people the user has messaged or received messages from)
    const conversations = await prisma.messages.findMany({
      where: {
        OR: [
          { senderID: userId },
          { receiverID: userId }
        ]
      },
      include: {
        sender: {
          select: {
            userID: true,
            firstName: true,
            lastName: true,
            isOnline: true
          }
        },
        receiver: {
          select: {
            userID: true,
            firstName: true,
            lastName: true,
            isOnline: true
          }
        }
      },
      orderBy: {
        dateSent: 'desc'
      }
    });

    // Group by conversation partner and get latest message
    const conversationMap = new Map();
    
    conversations.forEach(message => {
      const partnerId = message.senderID === userId ? message.receiverID : message.senderID;
      const partner = message.senderID === userId ? message.receiver : message.sender;
      
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner: {
            userID: partner.userID,
            name: `${partner.firstName} ${partner.lastName}`,
            isOnline: partner.isOnline
          },
          lastMessage: message.message,
          timestamp: message.dateSent,
          unreadCount: 0,
          lastMessageSender: message.senderID === userId ? 'You' : partner.firstName
        });
      }
    });

    // Count unread messages for each conversation
    for (const [partnerId] of conversationMap) {
      const unreadCount = await prisma.messages.count({
        where: {
          senderID: partnerId,
          receiverID: userId,
          read: false
        }
      });
      
      const conversation = conversationMap.get(partnerId);
      conversation.unreadCount = unreadCount;
      conversationMap.set(partnerId, conversation);
    }

    const conversationList = Array.from(conversationMap.values());

    return NextResponse.json(conversationList);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a new message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverID, message } = await request.json();
    
    if (!receiverID || !message) {
      return NextResponse.json(
        { error: 'Receiver ID and message are required' },
        { status: 400 }
      );
    }

    const newMessage = await prisma.messages.create({
      data: {
        senderID: parseInt(session.user.id),
        receiverID: parseInt(receiverID),
        message: message,
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

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}