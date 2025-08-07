// /app/api/moktob/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST: Submit MoktobBisoy Data
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, editorContent = "", ...data } = body;

    if (!email || Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Email and data are required." },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize date

    const existing = await prisma.moktobBisoyRecord.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already submitted data today." },
        { status: 400 }
      );
    }

    const created = await prisma.moktobBisoyRecord.create({
      data: {
        userId: user.id,
        date: today,
        editorContent,
        ...data,
      },
    });

    return NextResponse.json(
      { message: "Submitted successfully", data: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/moktob error:", error);
    return NextResponse.json(
      { error: "Failed to submit data", details: error },
      { status: 500 }
    );
  }
}

// GET: Return all Moktob records for the user
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const records = await prisma.moktobBisoyRecord.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ records }, { status: 200 });
  } catch (error) {
    console.error("GET /api/moktob error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Moktob records", details: error },
      { status: 500 }
    );
  }
}
