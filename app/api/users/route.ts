import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/users - Get all users for chat heads (excluding current user)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.users.findMany({
      where: {
        userID: {
          not: parseInt(session.user.id)
        }
      },
      select: {
        userID: true,
        firstName: true,
        lastName: true,
        isOnline: true
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    const usersWithFullName = users.map(user => ({
      ...user,
      name: `${user.firstName} ${user.lastName}`
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