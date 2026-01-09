import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ userID: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.userID);
    
    const user = await prisma.users.findUnique({
      where: {
        userID: userId
      },
      select: {
        userID: true,
        firstName: true,
        lastName: true,
        middleInitial: true,
        sex: true,
        bday: true,
        isOnline: true,
        email: true,
        firstNumber: true,
        secondNumber: true,
        role: true,
        propertyId: true,
        signedContractUrl: true,
        signedRulesUrl: true,
        property: {
          select: {
            propertyId: true,
            name: true,
            address: true,
            rent: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch all resources for this user (profile, primary_id, secondary_id)
    const resources = await prisma.resource.findMany({
      where: {
        referenceId: userId,
        referenceType: 'Users'
      },
      select: {
        resourceId: true,
        url: true,
        fileName: true
      },
      orderBy: {
        fileName: 'asc'
      }
    });

    // Categorize resources by type
    const profileImage = resources.find(r => r.fileName.includes('_profile_'))?.url || null;
    const primaryId = resources.find(r => r.fileName.includes('_primary_id_'))?.url || null;
    const secondaryId = resources.find(r => r.fileName.includes('_secondary_id_'))?.url || null;

    return NextResponse.json({
      ...user,
      profileImage,
      primaryId,
      secondaryId,
      resources: resources.map(r => ({ url: r.url, fileName: r.fileName, resourceId: r.resourceId }))
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
