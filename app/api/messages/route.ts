import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createMessageNotification } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';

// GET /api/messages - Get all conversations with tenants for the landlord, sorted by most recent
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
            isOnline: true,
            email: true,
            role: true
          }
        },
        receiver: {
          select: {
            userID: true,
            firstName: true,
            lastName: true,
            isOnline: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        dateSent: 'desc'
      }
    });

    // Group by conversation partner and get latest message
    const conversationMap = new Map();
    const partnerIds = new Set<number>();
    
    conversations.forEach(message => {
      const partnerId = message.senderID === userId ? message.receiverID : message.senderID;
      const partner = message.senderID === userId ? message.receiver : message.sender;
      
      // Only include tenants in the conversation list
      if (partner.role !== 'tenant') {
        return;
      }
      
      partnerIds.add(partnerId);
      
      if (!conversationMap.has(partnerId)) {
        const partnerName = `${partner.firstName || ''} ${partner.lastName || ''}`.trim() || partner.email || 'Unknown';
        conversationMap.set(partnerId, {
          partner: {
            userID: partner.userID,
            name: partnerName,
            isOnline: partner.isOnline
          },
          lastMessage: message.message || '',
          timestamp: message.dateSent,
          unreadCount: 0,
          lastMessageSender: message.senderID === userId ? 'You' : (partner.firstName || 'Tenant')
        });
      }
    });

    // Fetch profile images for all conversation partners
    const resources = await prisma.resource.findMany({
      where: {
        referenceId: { in: Array.from(partnerIds) },
        referenceType: 'Users',
        fileName: { contains: '_profile_' }
      },
      select: {
        referenceId: true,
        url: true
      }
    });

    const profileImageMap = new Map(
      resources.map(r => [r.referenceId, r.url])
    );

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

    // Convert to array, add profile images, and sort by most recent timestamp
    const conversationList = Array.from(conversationMap.values()).map(conv => ({
      ...conv,
      partner: {
        ...conv.partner,
        profileImage: profileImageMap.get(conv.partner.userID) || null
      }
    })).sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

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
            lastName: true,
            role: true
          }
        },
        receiver: {
          select: {
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });

    // Create notification for receiver if sender is landlord and receiver is tenant
    const senderName = newMessage.sender.firstName && newMessage.sender.lastName
      ? `${newMessage.sender.firstName} ${newMessage.sender.lastName}`.trim()
      : 'Landlord';
    
    if (newMessage.sender.role === 'landlord' && newMessage.receiver.role === 'tenant') {
      await createMessageNotification({
        receiverId: parseInt(receiverID),
        senderName,
        messagePreview: message,
        messageId: newMessage.messageID
      });
    }

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}