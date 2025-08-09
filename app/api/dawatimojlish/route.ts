// app/api/dawatimojlish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Start/end of the current Dhaka (Asia/Dhaka) calendar day */
function getDhakaDayRange(now = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [y, m, d] = fmt.format(now).split("-"); // "YYYY-MM-DD"
  // Dhaka is UTC+06:00 year-round
  const start = new Date(`${y}-${m}-${d}T00:00:00+06:00`);
  const end = new Date(`${y}-${m}-${d}T24:00:00+06:00`); // exclusive
  return { start, end };
}

/** Convert "YYYY-MM-DD" (Dhaka) to [start,end) UTC range */
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
      dawatterGuruttoMojlish = 0,
      mojlisheOnshogrohon = 0,
      prosikkhonKormoshalaAyozon = 0, // typo guard (if client sends this)
      prosikkhonKormoshalaAyojon = prosikkhonKormoshalaAyozon ?? 0,
      prosikkhonOnshogrohon = 0,
      jummahAlochona = 0,
      dhormoSova = 0,
      mashwaraPoint = 0,
      editorContent = "",
    } = body ?? {};

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Enforce one submission per Dhaka day
    const { start, end } = getDhakaDayRange();
    const exists = await prisma.dawatiMojlishRecord.findFirst({
      where: { userId: user.id, date: { gte: start, lt: end } },
      select: { id: true },
    });
    if (exists) {
      return NextResponse.json(
        { error: "Already submitted for today (Asia/Dhaka).", code: "ALREADY_SUBMITTED" },
        { status: 409 }
      );
    }

    // Save real submission instant for BOTH createdAt and date
    const now = new Date();
    const created = await prisma.dawatiMojlishRecord.create({
      data: {
        userId: user.id,
        createdAt: now, // mirror
        date: now,      // EXACT same timestamp as createdAt
        dawatterGuruttoMojlish,
        mojlisheOnshogrohon,
        prosikkhonKormoshalaAyojon,
        prosikkhonOnshogrohon,
        jummahAlochona,
        dhormoSova,
        mashwaraPoint,
        editorContent,
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/dawati-mojlish error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
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
      const existing = await prisma.dawatiMojlishRecord.findFirst({
        where: { userId: user.id, date: { gte: start, lt: end } },
        select: { id: true },
      });
      return NextResponse.json({ isSubmittedToday: Boolean(existing) }, { status: 200 });
    }

    // Optional date range in Dhaka timezone
    let dateFilter: { gte?: Date; lt?: Date } | undefined;
    if (from || to) {
      const fromRange = from ? dhakaDayRangeFromISODate(from) : undefined;
      const toRange = to ? dhakaDayRangeFromISODate(to) : undefined;
      dateFilter = {
        ...(fromRange ? { gte: fromRange.start } : {}),
        ...(toRange ? { lt: toRange.end } : {}),
      };
    }

    const records = await prisma.dawatiMojlishRecord.findMany({
      where: { userId: user.id, ...(dateFilter ? { date: dateFilter } : {}) },
      orderBy: { date: sort },
    });

    // Convenience: compute today's submission flag too
    const { start, end } = getDhakaDayRange();
    const todayRecord = records.find((r) => r.date >= start && r.date < end);

    return NextResponse.json(
      { isSubmittedToday: !!todayRecord, today: todayRecord ?? null, records },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/dawati-mojlish error:", error);
    return NextResponse.json(
      { error: "Failed to fetch records", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
