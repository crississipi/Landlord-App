import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

// GET /api/users - Get online tenants for chat heads (excluding current user)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get only online tenants (excluding current user who is landlord)
    const users = await prisma.users.findMany({
      where: {
        userID: {
          not: parseInt(session.user.id)
        },
        role: 'tenant', // Only tenants
        isOnline: true, // Only online users
        hasLeftProperty: false // Only active tenants
      },
      select: {
        userID: true,
        firstName: true,
        lastName: true,
        isOnline: true,
        email: true
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    // Fetch profile images for all users
    const userIds = users.map(u => u.userID);
    const resources = await prisma.resource.findMany({
      where: {
        referenceId: { in: userIds },
        referenceType: 'Users',
        fileName: { contains: '_profile_' }
      },
      select: {
        referenceId: true,
        url: true,
        fileName: true
      }
    });

    // Create a map of userId to profile image URL
    const profileImageMap = new Map(
      resources.map(r => [r.referenceId, r.url])
    );

    const usersWithFullName = users.map(user => ({
      ...user,
      name: `${user.firstName || ''}`.trim() || user.email || 'Unknown',
      profileImage: profileImageMap.get(user.userID) || null
    }));

    return NextResponse.json(usersWithFullName);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}