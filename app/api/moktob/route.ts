import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/** Start/end of the current Dhaka day for duplicate checks */
function getDhakaDayRange(now = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [y, m, d] = fmt.format(now).split("-"); // "YYYY-MM-DD"
  // Dhaka is UTC+06:00 year-round (no DST)
  const start = new Date(`${y}-${m}-${d}T00:00:00+06:00`);
  const end = new Date(`${y}-${m}-${d}T24:00:00+06:00`);
  return { start, end };
}

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

    // ✅ Dhaka-day duplicate check (don’t save normalized midnight)
    const { start, end } = getDhakaDayRange();
    const existing = await prisma.moktobBisoyRecord.findFirst({
      where: {
        userId: user.id,
        date: { gte: start, lt: end },
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already submitted data today." },
        { status: 400 }
      );
    }

    // ✅ Make date EXACTLY the same as createdAt (same instant)
    const now = new Date();

    const created = await prisma.moktobBisoyRecord.create({
      data: {
        userId: user.id,
        createdAt: now,  // mirror createdAt
        date: now,       // EXACT same timestamp
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
      { error: "Failed to submit data", details: `${error}` },
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
      { error: "Failed to fetch Moktob records", details: `${error}` },
      { status: 500 }
    );
  }
}
