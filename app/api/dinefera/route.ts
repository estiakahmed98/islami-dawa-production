// app/api/dinefera/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Start/end of a Dhaka (Asia/Dhaka) calendar day */
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
  const end = new Date(`${y}-${m}-${d}T24:00:00+06:00`); // exclusive
  return { start, end };
}

/** Convert "YYYY-MM-DD" (interpreted in Asia/Dhaka) into [start,end) UTC range */
function dhakaDayRangeFromISODate(yyyyMmDd: string) {
  const [y, m, d] = yyyyMmDd.split("-");
  const start = new Date(`${y}-${m}-${d}T00:00:00+06:00`);
  const end = new Date(`${y}-${m}-${d}T24:00:00+06:00`);
  return { start, end };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const {
      email,
      nonMuslimMuslimHoise = 0,
      murtadIslamFireche = 0,
      editorContent = "",
    } = body ?? {};

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Enforce one submission per Dhaka calendar day
    const { start, end } = getDhakaDayRange();
    const exists = await prisma.dineFeraRecord.findFirst({
      where: { userId: user.id, date: { gte: start, lt: end } },
      select: { id: true },
    });

    if (exists) {
      return NextResponse.json(
        { error: "You have already submitted data today (Asia/Dhaka)." },
        { status: 409 }
      );
    }

    // Save exact submission instant for BOTH date and createdAt
    const now = new Date();
    const record = await prisma.dineFeraRecord.create({
      data: {
        userId: user.id,
        createdAt: now,             // mirror
        date: now,                  // EXACT same timestamp as createdAt
        nonMuslimMuslimHoise: Number(nonMuslimMuslimHoise) || 0,
        murtadIslamFireche: Number(murtadIslamFireche) || 0,
        editorContent: editorContent || "",
      },
    });

    return NextResponse.json(
      { message: "Submission successful", data: record },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/dinefera error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const mode = searchParams.get("mode"); // "today" or null
    const sort = (searchParams.get("sort") ?? "desc") as "asc" | "desc";
    const from = searchParams.get("from"); // YYYY-MM-DD (Dhaka)
    const to = searchParams.get("to");     // YYYY-MM-DD (Dhaka)

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (mode === "today") {
      const { start, end } = getDhakaDayRange();
      const existing = await prisma.dineFeraRecord.findFirst({
        where: { userId: user.id, date: { gte: start, lt: end } },
        select: { id: true },
      });
      return NextResponse.json({ isSubmittedToday: Boolean(existing) }, { status: 200 });
    }

    // Optional date range interpreted in Dhaka timezone
    let dateFilter: { gte?: Date; lt?: Date } | undefined;
    if (from || to) {
      const fromRange = from ? dhakaDayRangeFromISODate(from) : undefined;
      const toRange = to ? dhakaDayRangeFromISODate(to) : undefined;
      dateFilter = {
        ...(fromRange ? { gte: fromRange.start } : {}),
        ...(toRange ? { lt: toRange.end } : {}),
      };
    }

    const records = await prisma.dineFeraRecord.findMany({
      where: { userId: user.id, ...(dateFilter ? { date: dateFilter } : {}) },
      orderBy: { date: sort },
    });

    // Convenience: today's flag + record
    const { start, end } = getDhakaDayRange();
    const todayRecord = records.find((r) => r.date >= start && r.date < end);

    return NextResponse.json(
      { isSubmittedToday: !!todayRecord, today: todayRecord ?? null, records },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/dinefera error:", error);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}
