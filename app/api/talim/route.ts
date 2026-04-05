// /app/api/talim/route.ts
// Estiak Ahmed

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseDhakaDate(dateValue?: string | null) {
  if (!dateValue || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return null;
  return dateValue;
}

/** Start/end of the current Dhaka day (Asia/Dhaka) */
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
  const end = new Date(`${y}-${m}-${d}T24:00:00+06:00`); // next day 00:00
  return { start, end };
}

function dhakaDayRangeFromISODate(yyyyMmDd: string) {
  const [y, m, d] = yyyyMmDd.split("-");
  const start = new Date(`${y}-${m}-${d}T00:00:00+06:00`);
  const end = new Date(`${y}-${m}-${d}T24:00:00+06:00`);
  return { start, end };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, date, ...data } = body as {
      email: string;
      date?: string;
      mohilaTalim?: number;
      mohilaOnshogrohon?: number;
      editorContent?: string;
    };

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Dhaka-day duplicate check
    const selectedDate = parseDhakaDate(date);
    const { start, end } = selectedDate
      ? dhakaDayRangeFromISODate(selectedDate)
      : getDhakaDayRange();
    const already = await prisma.talimBisoyRecord.findFirst({
      where: {
        userId: user.id,
        date: { gte: start, lt: end },
      },
      select: { id: true },
    });

    if (already) {
      return NextResponse.json(
        { error: "You have already submitted data today." },
        { status: 400 }
      );
    }

    // Save real creation time for createdAt, but keep date as selected date at midnight UTC
    const actualCreatedAt = new Date();
    const selectedDateTime = selectedDate
      ? new Date(`${selectedDate}T00:00:00.000Z`)  // midnight UTC
      : actualCreatedAt;

    const newRecord = await prisma.talimBisoyRecord.create({
      data: {
        userId: user.id,
        createdAt: actualCreatedAt,       // real creation time
        date: selectedDateTime,            // selected date at midnight UTC
        mohilaTalim: data.mohilaTalim ?? 0,
        mohilaOnshogrohon: data.mohilaOnshogrohon ?? 0,
        editorContent: data.editorContent ?? "",
      },
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error("Error saving TalimBisoyRecord:", error);
    return NextResponse.json(
      { error: "Failed to save TalimBisoyRecord" },
      { status: 500 }
    );
  }
}

// /app/api/talim/route.ts (GET only)

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const emailsParam = searchParams.get("emails");
    const email = searchParams.get("email");
    const selectedDate = parseDhakaDate(searchParams.get("date"));

    let emailList: string[] = [];
    if (emailsParam) {
      emailList = emailsParam.split(",").map(e => e.trim());
    } else if (email) {
      emailList = [email];
    } else {
      return NextResponse.json({ error: "Emails or email is required" }, { status: 400 });
    }

    const records: Record<string, any[]> = {};

    for (const em of emailList) {
      const user = await prisma.users.findUnique({ where: { email: em } });
      if (!user) {
        records[em] = [];
        continue;
      }

      // Fetch ALL records for this user
      const userRecords = await prisma.talimBisoyRecord.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" }, // newest first; change to "asc" if you prefer
      });

      records[em] = userRecords;
    }

    if (emailsParam) {
      // Multiple emails: return { records: { email: array } }
      return NextResponse.json({ records }, { status: 200 });
    } else {
      // Single email: check if submitted today and return { records: array, isSubmittedToday: boolean }
      const { start, end } = selectedDate
        ? dhakaDayRangeFromISODate(selectedDate)
        : getDhakaDayRange();
      const user = await prisma.users.findUnique({ where: { email: email! } });
      let isSubmittedToday = false;
      let isSubmittedForDate = false;
      if (user) {
        const todayRecord = await prisma.talimBisoyRecord.findFirst({
          where: {
            userId: user.id,
            date: { gte: start, lt: end },
          },
          select: { id: true },
        });
        isSubmittedToday = !!todayRecord;
        isSubmittedForDate = !!todayRecord;
      }
      return NextResponse.json(
        { records: records[email!], isSubmittedToday, isSubmittedForDate },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in GET /api/talim:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

