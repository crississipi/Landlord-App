// app/api/user/profile/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// GET - Fetch user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    
    const user = await prisma.users.findUnique({
      where: { userID: userId },
      select: {
        userID: true,
        username: true,
        firstName: true,
        lastName: true,
        middleInitial: true,
        email: true,
        firstNumber: true,
        secondNumber: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch user profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    
    const {
      firstName,
      lastName,
      middleInitial,
      email,
      firstNumber,
      secondNumber,
      username,
      currentPassword,
      newPassword,
      useEmailAsUsername,
    } = body;

    // Fetch current user data
    const currentUser = await prisma.users.findUnique({
      where: { userID: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build update data object
    const updateData: {
      firstName?: string;
      lastName?: string;
      middleInitial?: string;
      email?: string;
      firstNumber?: string;
      secondNumber?: string;
      username?: string;
      password?: string;
    } = {};

    // Update personal info fields if provided
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (middleInitial !== undefined) updateData.middleInitial = middleInitial;
    if (firstNumber !== undefined) updateData.firstNumber = firstNumber;
    if (secondNumber !== undefined) updateData.secondNumber = secondNumber;

    // Handle email update with uniqueness check
    if (email !== undefined && email !== currentUser.email) {
      const existingEmail = await prisma.users.findUnique({
        where: { email },
      });
      if (existingEmail && existingEmail.userID !== userId) {
        return NextResponse.json(
          { success: false, error: 'Email already in use' },
          { status: 400 }
        );
      }
      updateData.email = email;
    }

    // Handle username update
    if (useEmailAsUsername && email) {
      // Check if email is already used as username by another user
      const existingUsername = await prisma.users.findUnique({
        where: { username: email },
      });
      if (existingUsername && existingUsername.userID !== userId) {
        return NextResponse.json(
          { success: false, error: 'This email is already used as a username' },
          { status: 400 }
        );
      }
      updateData.username = email;
    } else if (username !== undefined && username !== currentUser.username) {
      // Check username uniqueness
      const existingUsername = await prisma.users.findUnique({
        where: { username },
      });
      if (existingUsername && existingUsername.userID !== userId) {
        return NextResponse.json(
          { success: false, error: 'Username already taken' },
          { status: 400 }
        );
      }
      updateData.username = username;
    }

    // Handle password change
    if (currentPassword && newPassword) {
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Validate new password length
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'New password must be at least 6 characters' },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Perform update if there are changes
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No changes to update' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.users.update({
      where: { userID: userId },
      data: updateData,
      select: {
        userID: true,
        username: true,
        firstName: true,
        lastName: true,
        middleInitial: true,
        email: true,
        firstNumber: true,
        secondNumber: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
