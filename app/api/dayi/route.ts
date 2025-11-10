// app/api/dayi/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const {
      email,
      sohojogiDayeToiri = 0,
      editorContent = "",
      assistants = [],
      userInfo = {},
    } = body ?? {};

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate number type
    const sohojogiDayeToiriNum = Number(sohojogiDayeToiri ?? 0);
    if (!Number.isFinite(sohojogiDayeToiriNum)) {
      return NextResponse.json(
        { error: "Invalid sohojogiDayeToiri" },
        { status: 400 }
      );
    }

    // Build Dhaka day window
    const { start, end } = getDhakaDayRange();

    // Check for existing submission
    const existing = await prisma.dayeeBishoyRecord.findFirst({
      where: { userId: user.id, date: { gte: start, lt: end } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Already submitted today" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const newRecord = await tx.dayeeBishoyRecord.create({
        data: {
          userId: user.id,
          date: start, // store normalized start-of-day if desired
          sohojogiDayeToiri: sohojogiDayeToiriNum,
          editorContent: String(editorContent ?? ""),
        },
      });

      if (Array.isArray(assistants) && assistants.length > 0) {
        const rows = assistants.map((a: any) => ({
          name: String(a?.name ?? ""),
          phone: String(a?.phone ?? ""),
          address: String(a?.address ?? ""),
          email: a?.email ? String(a.email) : null,
          description: a?.description ? String(a.description) : null,
          division: String(a?.division ?? ""), // ← from assistant
          district: String(a?.district ?? ""), // ← from assistant
          upazila: String(a?.upazila ?? ""), // ← from assistant
          union: String(a?.union ?? ""), // ← from assistant
          dayeeBishoyId: newRecord.id,
        }));

        await tx.assistantDaee.createMany({ data: rows });
      }

      return tx.dayeeBishoyRecord.findUnique({
        where: { id: newRecord.id },
        include: { assistants: true },
      });
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    // Print full details, not only message
    console.error("POST /api/dayi error stack:", error?.stack || error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const emailsParam = searchParams.get("emails");
    const email = searchParams.get("email");

    let emailList: string[] = [];
    if (emailsParam) {
      emailList = emailsParam.split(",").map(e => e.trim());
    } else if (email) {
      emailList = [email];
    } else {
      return NextResponse.json({ error: "Emails or email is required." }, { status: 400 });
    }

    const records: Record<string, any[]> = {};

    for (const em of emailList) {
      const user = await prisma.users.findUnique({ where: { email: em } });
      if (!user) {
        records[em] = [];
        continue;
      }

      const userRecords = await prisma.dayeeBishoyRecord.findMany({
        where: { userId: user.id },
        orderBy: { date: "asc" },
        include: { assistants: true },
      });

      records[em] = userRecords;
    }

    if (emailsParam) {
      // Multiple emails: return { records: { email: array } }
      return NextResponse.json({ records }, { status: 200 });
    } else {
      // Single email: return { records: array }
      return NextResponse.json({ records: records[email!] }, { status: 200 });
    }
  } catch (error: any) {
    console.error("GET /api/dayi error stack:", error?.stack || error);
    return NextResponse.json(
      {
        error: error?.message || "Failed to fetch records",
        details: error?.stack || String(error),
      },
      { status: 500 }
    );
  }
}
