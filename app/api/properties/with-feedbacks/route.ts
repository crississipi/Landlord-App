import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log("🔍 Fetching all properties with feedbacks and tenant counts...");

    const properties = await prisma.property.findMany({
      include: {
        users: {
          where: {
            hasLeftProperty: false
          },
          select: {
            userID: true
          }
        },
        feedbacks: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            dateIssued: 'desc'
          }
        },
        resources: {
          select: {
            resourceId: true,
            url: true,
            fileName: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ Found ${properties.length} properties`);

    // Format the response
    const formattedProperties = properties.map(property => ({
      propertyId: property.propertyId,
      name: property.name,
      rent: property.rent,
      area: property.area,
      address: property.address,
      description: property.description,
      yearBuilt: property.yearBuilt,
      renovated: property.renovated,
      currentTenants: property.users.length,
      isAvailable: property.users.length === 0,
      images: property.resources.map(resource => ({
        resourceId: resource.resourceId,
        url: resource.url,
        fileName: resource.fileName
      })),
      feedbacks: property.feedbacks.map(feedback => ({
        feedbackID: feedback.feedbackID,
        ratings: feedback.ratings,
        message: feedback.message,
        dateIssued: feedback.dateIssued,
        userName: feedback.user ? 
          `${feedback.user.firstName} ${feedback.user.lastName}`.trim() || 'Anonymous' 
          : feedback.name || 'Anonymous'
      })),
      totalFeedbacks: property.feedbacks.length,
      averageRating: property.feedbacks.length > 0 
        ? property.feedbacks.reduce((sum, fb) => sum + fb.ratings, 0) / property.feedbacks.length
        : 0
    }));

    console.log("📊 Properties with feedbacks:", JSON.stringify(formattedProperties, null, 2));

    return NextResponse.json({ 
      success: true,
      properties: formattedProperties 
    });
  } catch (error) {
    console.error("❌ Error fetching properties with feedbacks:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch properties",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}