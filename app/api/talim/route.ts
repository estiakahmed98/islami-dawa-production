// Faysal Updated by Juwel

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ✅ Make sure this is your Prisma client file

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, ...data } = body as {
      email: string;
      mohilaTalim?: number;
      mohilaOnshogrohon?: number;
      editorContent?: string;
    };

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    // 🔍 Find user by email
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const userId = user.id;

    // 📅 Get today's date (YYYY-MM-DD only)
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    // ❌ Check if already submitted today
    const existing = await prisma.talimBisoyRecord.findFirst({
      where: {
        userId,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already submitted data today." },
        { status: 400 }
      );
    }

    // ✅ Create new TalimBisoyRecord
    const newRecord = await prisma.talimBisoyRecord.create({
      data: {
        userId,
        date: new Date(),
        mohilaTalim: data.mohilaTalim ?? 0,
        mohilaOnshogrohon: data.mohilaOnshogrohon ?? 0,
        editorContent: data.editorContent ?? "",
      },
    });

    return NextResponse.json(newRecord, {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error saving TalimBisoyRecord:", error);
    return new NextResponse("Failed to save TalimBisoyRecord", { status: 500 });
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const userId = user.id;

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const record = await prisma.talimBisoyRecord.findFirst({
      where: {
        userId,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const isSubmittedToday = !!record;

    return NextResponse.json(
      {
        isSubmittedToday,
        data: record ?? null, // ✅ send the actual record (null if not found)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/talim:", error);
    return new NextResponse("Failed to fetch data", { status: 500 });
  }
}
