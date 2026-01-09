import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ userID: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userID = parseInt(params.userID);
    const body = await request.json();
    const { username, password } = body;

    // Build update data
    const updateData: {
      username?: string;
      password?: string;
    } = {};

    // Check if username is being changed and if it's unique
    if (username) {
      const existingUser = await prisma.users.findUnique({
        where: { username }
      });
      
      if (existingUser && existingUser.userID !== userID) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
      
      updateData.username = username;
    }

    // Hash password if provided
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Update user credentials
    const updatedUser = await prisma.users.update({
      where: { userID },
      data: updateData,
      select: {
        userID: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating credentials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
