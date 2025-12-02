// app/api/check-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = global.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ available: false });

  const existing = await prisma.users.findUnique({
    where: { username: email.toLowerCase() },
    select: { userID: true }
  });

  return NextResponse.json({ available: !existing });
}