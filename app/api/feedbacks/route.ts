import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Create new feedback
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyId, userID, name, ratings, message, userType } = body;

    // Validation
    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    if (!ratings || ratings < 1 || ratings > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Feedback message is required" },
        { status: 400 }
      );
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        propertyId: parseInt(propertyId),
        userID: userID ? parseInt(userID) : null,
        name: name || `Anonymous ${userType || "Visitor"}`,
        ratings: parseFloat(ratings),
        message: message.trim(),
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Feedback submitted successfully",
        feedback 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

// GET - Fetch feedbacks for a property
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    const feedbacks = await prisma.feedback.findMany({
      where: {
        propertyId: parseInt(propertyId),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
      orderBy: {
        dateIssued: "desc",
      },
    });

    return NextResponse.json({ feedbacks }, { status: 200 });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedbacks" },
      { status: 500 }
    );
  }
}
