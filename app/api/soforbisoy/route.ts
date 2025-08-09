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
  // Dhaka is UTC+06 year-round
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

// ========== POST: Create SoforBisoyRecord ==========
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();

    // Accept both old and new payload shapes
    const {
      email,
      editorContent = "",

      // counts (optional if lists are provided)
      madrasaVisit,                 // number (optional)
      schoolCollegeVisit,           // number (optional)
      moktobVisit,                  // number or string

      // new names (recommended)
      madrasaVisitList,             // string[]
      schoolCollegeVisitList,       // string[]

      // legacy names (from your current FE)
      madrasaVisits,                // string[]
      schoolCollegeVisits,          // string[]
    } = body ?? {};

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Normalize arrays (prefer explicit *List fields; fall back to legacy arrays)
    const madrasaList: string[] = Array.isArray(madrasaVisitList)
      ? madrasaVisitList
      : Array.isArray(madrasaVisits)
      ? madrasaVisits
      : [];

    const schoolList: string[] = Array.isArray(schoolCollegeVisitList)
      ? schoolCollegeVisitList
      : Array.isArray(schoolCollegeVisits)
      ? schoolCollegeVisits
      : [];

    // Normalize counts: explicit count wins; else derive from list length
    const madrasaCount =
      typeof madrasaVisit === "number"
        ? madrasaVisit
        : Number.isFinite(Number(madrasaVisit))
        ? Number(madrasaVisit)
        : madrasaList.length;

    const schoolCount =
      typeof schoolCollegeVisit === "number"
        ? schoolCollegeVisit
        : Number.isFinite(Number(schoolCollegeVisit))
        ? Number(schoolCollegeVisit)
        : schoolList.length;

    const moktobCount = Number(moktobVisit) || 0;

    // Enforce one submission per Dhaka calendar day
    const { start, end } = getDhakaDayRange();
    const exists = await prisma.soforBisoyRecord.findFirst({
      where: { userId: user.id, date: { gte: start, lt: end } },
      select: { id: true },
    });
    if (exists) {
      return NextResponse.json(
        { error: "You have already submitted data today (Asia/Dhaka)." },
        { status: 409 }
      );
    }

    // Save exact submission instant to BOTH date and createdAt
    const now = new Date();
    const created = await prisma.soforBisoyRecord.create({
      data: {
        userId: user.id,
        createdAt: now,
        date: now, // EXACT same timestamp as createdAt

        madrasaVisit: madrasaCount,
        madrasaVisitList: madrasaList.map((s) => String(s).trim()).filter(Boolean),

        moktobVisit: moktobCount,

        schoolCollegeVisit: schoolCount,
        schoolCollegeVisitList: schoolList.map((s) => String(s).trim()).filter(Boolean),

        editorContent: String(editorContent ?? ""),
      },
    });

    return NextResponse.json(
      { message: "Submission successful", data: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/soforbisoy error:", error);
    return NextResponse.json({ error: "Failed to save record." }, { status: 500 });
  }
}

// ========== GET: History + today flag ==========
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const mode = searchParams.get("mode"); // "today" or null
    const sort = (searchParams.get("sort") ?? "desc") as "asc" | "desc";
    const from = searchParams.get("from"); // YYYY-MM-DD (Dhaka)
    const to = searchParams.get("to");     // YYYY-MM-DD (Dhaka)

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (mode === "today") {
      const { start, end } = getDhakaDayRange();
      const existing = await prisma.soforBisoyRecord.findFirst({
        where: { userId: user.id, date: { gte: start, lt: end } },
        select: { id: true },
      });
      return NextResponse.json({ isSubmittedToday: Boolean(existing) }, { status: 200 });
    }

    // Optional date range filter (interpreted in Dhaka time)
    let dateFilter: { gte?: Date; lt?: Date } | undefined;
    if (from || to) {
      const fromRange = from ? dhakaDayRangeFromISODate(from) : undefined;
      const toRange = to ? dhakaDayRangeFromISODate(to) : undefined;
      dateFilter = {
        ...(fromRange ? { gte: fromRange.start } : {}),
        ...(toRange ? { lt: toRange.end } : {}),
      };
    }

    const records = await prisma.soforBisoyRecord.findMany({
      where: { userId: user.id, ...(dateFilter ? { date: dateFilter } : {}) },
      orderBy: { date: sort },
    });

    // Convenience: compute today's flag + record
    const { start, end } = getDhakaDayRange();
    const todayRecord = records.find((r) => r.date >= start && r.date < end);

    return NextResponse.json(
      { isSubmittedToday: !!todayRecord, today: todayRecord ?? null, records },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/soforbisoy error:", error);
    return NextResponse.json({ error: "Failed to fetch records." }, { status: 500 });
  }
}
