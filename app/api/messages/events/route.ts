import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

// Keep active SSE connections
const clients = new Map<string, ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  // Mark user as online in DB
  await prisma.users.update({
    where: { userID: parseInt(userId) },
    data: { isOnline: true },
  });

  // Broadcast to all listeners
  broadcast({ type: "user_status", userId, status: "online" });

  const stream = new ReadableStream({
    start(controller) {
      clients.set(userId, controller);

      // Send initial event
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected", userId })}\n\n`)
      );

      console.log(`✅ User connected: ${userId}. Total clients: ${clients.size}`);

      // Handle disconnects
      request.signal.addEventListener("abort", async () => {
        clients.delete(userId);
        console.log(`❌ User disconnected: ${userId}. Total clients: ${clients.size}`);

        await prisma.users.update({
          where: { userID: parseInt(userId) },
          data: { isOnline: false },
        });

        broadcast({ type: "user_status", userId, status: "offline" });
      });
    },
    cancel() {
      clients.delete(userId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

// Broadcast function (to all connected users)
function broadcast(message: any) {
  const data = `data: ${JSON.stringify(message)}\n\n`;
  const encoder = new TextEncoder();

  clients.forEach((controller) => {
    try {
      controller.enqueue(encoder.encode(data));
    } catch (error) {
      console.error("Failed to broadcast:", error);
    }
  });
}
