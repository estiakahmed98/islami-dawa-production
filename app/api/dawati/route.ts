// app/api/dawati/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Start/end of a Dhaka (Asia/Dhaka) calendar day for the provided instant */
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
      nonMuslimDawat = 0,
      murtadDawat = 0,
      nonMuslimSaptahikGasht = 0,
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
    const exists = await prisma.dawatiBisoyRecord.findFirst({
      where: { userId: user.id, date: { gte: start, lt: end } },
      select: { id: true },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Already submitted for today (Asia/Dhaka).", code: "ALREADY_SUBMITTED" },
        { status: 409 }
      );
    }

    // Save the real submission instant for BOTH createdAt and date
    const now = new Date();
    const created = await prisma.dawatiBisoyRecord.create({
      data: {
        userId: user.id,
        createdAt: now,    // mirror
        date: now,         // EXACT same timestamp as createdAt
        nonMuslimDawat,
        murtadDawat,
        nonMuslimSaptahikGasht,
        editorContent,
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/dawati error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const emailsParam = searchParams.get("emails");
    const email = searchParams.get("email");
    const mode = searchParams.get("mode"); // "today" or null
    const sort = (searchParams.get("sort") ?? "desc") as "asc" | "desc";
    const from = searchParams.get("from"); // YYYY-MM-DD (Dhaka)
    const to = searchParams.get("to");     // YYYY-MM-DD (Dhaka)

    let emailList: string[] = [];
    if (emailsParam) {
      emailList = emailsParam.split(",").map(e => e.trim());
    } else if (email) {
      emailList = [email];
    } else {
      return NextResponse.json({ error: "Emails or email is required" }, { status: 400 });
    }

    const records: Record<string, any> = {};

    for (const em of emailList) {
      const user = await prisma.users.findUnique({ where: { email: em } });
      if (!user) {
        if (mode === "today") {
          records[em] = { isSubmittedToday: false };
        } else {
          records[em] = [];
        }
        continue;
      }

      if (mode === "today") {
        const { start, end } = getDhakaDayRange();
        const existing = await prisma.dawatiBisoyRecord.findFirst({
          where: { userId: user.id, date: { gte: start, lt: end } },
          select: { id: true },
        });
        records[em] = { isSubmittedToday: Boolean(existing) };
        continue;
      }

      // Optional date range filter interpreted in Dhaka timezone
      let dateFilter: { gte?: Date; lt?: Date } | undefined;
      if (from || to) {
        const fromRange = from ? dhakaDayRangeFromISODate(from) : undefined;
        const toRange = to ? dhakaDayRangeFromISODate(to) : undefined;
        dateFilter = {
          ...(fromRange ? { gte: fromRange.start } : {}),
          ...(toRange ? { lt: toRange.end } : {}),
        };
      }

      const userRecords = await prisma.dawatiBisoyRecord.findMany({
        where: { userId: user.id, ...(dateFilter ? { date: dateFilter } : {}) },
        orderBy: { date: sort },
      });

      // Convenience: compute today's submission flag too
      const { start, end } = getDhakaDayRange();
      const todayRecord = userRecords.find((r) => r.date >= start && r.date < end);

      records[em] = userRecords;
    }

    if (emailsParam) {
      // Multiple emails: return { records: { email: data } }
      return NextResponse.json({ records }, { status: 200 });
    } else {
      // Single email: return the data directly for today mode, otherwise { records: array }
      if (mode === "today") {
        return NextResponse.json(records[email!], { status: 200 });
      } else {
        return NextResponse.json({ records: records[email!] }, { status: 200 });
      }
    }
  } catch (error) {
    console.error("GET /api/dawati error:", error);
    return NextResponse.json(
      { error: "Failed to fetch records", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, id, date, patch = {} } = body ?? {};

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let targetId: string | undefined = id;

    if (!targetId) {
      if (!date) {
        return NextResponse.json(
          { error: "Provide either 'id' or 'date' (YYYY-MM-DD in Dhaka)" },
          { status: 400 }
        );
      }
      // Find by Dhaka-day range since `date` now stores real timestamps
      const { start, end } = dhakaDayRangeFromISODate(date);
      const found = await prisma.dawatiBisoyRecord.findFirst({
        where: { userId: user.id, date: { gte: start, lt: end } },
        orderBy: { date: "desc" },
      });
      if (!found) {
        return NextResponse.json(
          { error: "Record not found for the given Dhaka date" },
          { status: 404 }
        );
      }
      targetId = found.id;
    }

    const updated = await prisma.dawatiBisoyRecord.update({
      where: { id: targetId },
      data: {
        ...(typeof patch.nonMuslimDawat === "number" ? { nonMuslimDawat: patch.nonMuslimDawat } : {}),
        ...(typeof patch.murtadDawat === "number" ? { murtadDawat: patch.murtadDawat } : {}),
        ...(typeof patch.nonMuslimSaptahikGasht === "number" ? { nonMuslimSaptahikGasht: patch.nonMuslimSaptahikGasht } : {}),
        ...(typeof patch.editorContent === "string" ? { editorContent: patch.editorContent } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/dawati error:", error);
    return NextResponse.json(
      { error: "Failed to update record", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
