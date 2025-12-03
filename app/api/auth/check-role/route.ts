// app/api/auth/check-role/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Tenant web app URL - update this with your actual tenant app URL
const TENANT_APP_URL = process.env.NEXT_PUBLIC_TENANT_APP_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user by username
    const user = await prisma.users.findUnique({
      where: { username },
      select: {
        userID: true,
        username: true,
        password: true,
        role: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Check user role
    const role = user.role?.toLowerCase();

    if (role === 'landlord' || role === 'admin') {
      // Landlord/Admin - allow login to this app
      return NextResponse.json({
        success: true,
        allowLogin: true,
        role: user.role,
        user: {
          id: user.userID,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } else if (role === 'tenant') {
      // Tenant - redirect to tenant app
      return NextResponse.json({
        success: true,
        allowLogin: false,
        role: user.role,
        redirectUrl: TENANT_APP_URL,
        message: 'This account is for tenants. Redirecting to tenant portal...',
      });
    } else {
      // Unknown role
      return NextResponse.json(
        { success: false, error: 'Account role not recognized' },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('Error checking user role:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while checking credentials' },
      { status: 500 }
    );
  }
}
