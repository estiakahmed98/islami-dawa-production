// app/api/dayi/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    console.log("POST /api/dayi Received data:", body);

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
      return NextResponse.json({ error: "Invalid sohojogiDayeToiri" }, { status: 400 });
    }

    // Build UTC day window
    const now = new Date();
    const start = new Date(Date.UTC(
      now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0
    ));
    const end = new Date(Date.UTC(
      now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999
    ));

    // Check for existing submission
    const existing = await prisma.dayeeBishoyRecord.findFirst({
      where: { userId: user.id, date: { gte: start, lt: end } },
    });
    if (existing) {
      return NextResponse.json({ error: "Already submitted today" }, { status: 400 });
    }

    // Extra tracing: find potential jwt/jose usage in hooks/middleware
    console.log("About to enter transaction: userId", user.id);

    const result = await prisma.$transaction(async (tx) => {
      const newRecord = await tx.dayeeBishoyRecord.create({
        data: {
          userId: user.id,
          date: start,              // store normalized start-of-day if desired
          sohojogiDayeToiri: sohojogiDayeToiriNum,
          editorContent: String(editorContent ?? ""),
        },
      });

      if (Array.isArray(assistants) && assistants.length > 0) {
        const div = String(userInfo?.division ?? "");
        const dis = String(userInfo?.district ?? "");
        const upa = String(userInfo?.upazila ?? "");
        const uni = String(userInfo?.union ?? "");

        const rows = assistants.map((a: any) => ({
          name: String(a?.name ?? ""),
          phone: String(a?.phone ?? ""),
          address: String(a?.address ?? ""),
          email: a?.email ? String(a.email) : null,            // make sure schema allows null
          description: a?.description ? String(a.description) : null,
          division: div,
          district: dis,
          upazila: upa,
          union: uni,
          dayeeBishoyId: newRecord.id,
        }));

        console.log("assistant rows to insert:", rows);

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
      { error: "Internal server error", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const records = await prisma.dayeeBishoyRecord.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
      include: { assistants: true },
    });

    return NextResponse.json({ records }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/dayi error stack:", error?.stack || error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch records", details: error?.stack || String(error) },
      { status: 500 }
    );
  }
}
