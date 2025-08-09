// app/api/dawati-mojlish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;

function dhakaDayBounds(base = new Date()) {
  const dhakaNow = new Date(base.getTime() + DHAKA_OFFSET_MS);
  const startDhakaUTC = Date.UTC(
    dhakaNow.getUTCFullYear(),
    dhakaNow.getUTCMonth(),
    dhakaNow.getUTCDate(), 0, 0, 0, 0
  );
  const startUTC = new Date(startDhakaUTC - DHAKA_OFFSET_MS);
  const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000); 
  return { startUTC, endUTC };
}

function dhakaDayKey(base = new Date()) {
  return dhakaDayBounds(base).startUTC;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const {
      email,
      dawatterGuruttoMojlish = 0,
      mojlisheOnshogrohon = 0,
      prosikkhonKormoshalaAyojon = 0,
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

    const dayKey = dhakaDayKey();

    try {
      const created = await prisma.dawatiMojlishRecord.create({
        data: {
          userId: user.id,
          date: dayKey,
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
    } catch (err: any) {
      if (err?.code === "P2002" || /unique/i.test(String(err?.message))) {
        return NextResponse.json(
          { error: "Already submitted for today (Asia/Dhaka).", code: "ALREADY_SUBMITTED" },
          { status: 409 }
        );
      }
      throw err;
    }
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
    const mode = searchParams.get("mode");
    const sort = (searchParams.get("sort") ?? "desc") as "asc" | "desc";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (mode === "today") {
      const { startUTC, endUTC } = dhakaDayBounds();
      const existing = await prisma.dawatiMojlishRecord.findFirst({
        where: { userId: user.id, date: { gte: startUTC, lt: endUTC } },
        select: { id: true },
      });
      return NextResponse.json({ isSubmittedToday: Boolean(existing) }, { status: 200 });
    }

    let dateFilter: { gte?: Date; lt?: Date } | undefined;
    if (from || to) {
      const fromKey = from ? dhakaDayKey(new Date(from)) : undefined;
      const toKeyExclusive = to ? dhakaDayBounds(new Date(to)).endUTC : undefined;
      dateFilter = { ...(fromKey ? { gte: fromKey } : {}), ...(toKeyExclusive ? { lt: toKeyExclusive } : {}) };
    }

    const records = await prisma.dawatiMojlishRecord.findMany({
      where: { userId: user.id, ...(dateFilter ? { date: dateFilter } : {}) },
      orderBy: { date: sort },
    });

    return NextResponse.json({ records }, { status: 200 });
  } catch (error) {
    console.error("GET /api/dawati-mojlish error:", error);
    return NextResponse.json(
      { error: "Failed to fetch records", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
