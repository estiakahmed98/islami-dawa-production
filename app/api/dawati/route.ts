// app/api/dawati-bisoy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000; // UTC+6, no DST

function dhakaDayBounds(base = new Date()) {
  const dhakaNow = new Date(base.getTime() + DHAKA_OFFSET_MS);
  const startDhakaUTC = Date.UTC(
    dhakaNow.getUTCFullYear(),
    dhakaNow.getUTCMonth(),
    dhakaNow.getUTCDate(), 0, 0, 0, 0
  );
  const startUTC = new Date(startDhakaUTC - DHAKA_OFFSET_MS);
  const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000); // exclusive
  return { startUTC, endUTC };
}

function dhakaDayKey(base = new Date()) {
  return dhakaDayBounds(base).startUTC; // we store this in `date`
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const {
      email,
      nonMuslimDawat = 0,
      murtadDawat = 0,
      alemderSatheyMojlish = 0,
      publicSatheyMojlish = 0,
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

    const dayKey = dhakaDayKey();

    try {
      const created = await prisma.dawatiBisoyRecord.create({
        data: {
          userId: user.id,
          date: dayKey,
          nonMuslimDawat,
          murtadDawat,
          alemderSatheyMojlish,
          publicSatheyMojlish,
          nonMuslimSaptahikGasht,
          editorContent,
        },
      });

      return NextResponse.json({ success: true, data: created }, { status: 201 });
    } catch (err: any) {
      // Unique constraint (one per user/day)
      if (err?.code === "P2002" || /unique/i.test(String(err?.message))) {
        return NextResponse.json(
          { error: "Already submitted for today (Asia/Dhaka).", code: "ALREADY_SUBMITTED" },
          { status: 409 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("POST /api/dawati-bisoy error:", error);
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
      const existing = await prisma.dawatiBisoyRecord.findFirst({
        where: {
          userId: user.id,
          date: { gte: startUTC, lt: endUTC },
        },
        select: { id: true },
      });
      return NextResponse.json({ isSubmittedToday: Boolean(existing) }, { status: 200 });
    }

    // Optional range filter (interpreted in Dhaka timezone)
    let dateFilter: { gte?: Date; lt?: Date } | undefined;
    if (from || to) {
      const fromKey = from ? dhakaDayKey(new Date(from)) : undefined;
      const toKeyExclusive = to
        ? dhakaDayBounds(new Date(to)).endUTC
        : undefined;
      dateFilter = {
        ...(fromKey ? { gte: fromKey } : {}),
        ...(toKeyExclusive ? { lt: toKeyExclusive } : {}),
      };
    }

    const records = await prisma.dawatiBisoyRecord.findMany({
      where: {
        userId: user.id,
        ...(dateFilter ? { date: dateFilter } : {}),
      },
      orderBy: { date: sort },
    });

    return NextResponse.json({ records }, { status: 200 });
  } catch (error) {
    console.error("GET /api/dawati-bisoy error:", error);
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

    let targetId = id as string | undefined;

    if (!targetId) {
      if (!date) {
        return NextResponse.json(
          { error: "Provide either 'id' or 'date' (YYYY-MM-DD)" },
          { status: 400 }
        );
      }
      const dayKey = dhakaDayKey(new Date(date));
      const found = await prisma.dawatiBisoyRecord.findUnique({
        where: { userId_date: { userId: user.id, date: dayKey } }, // requires named unique in schema
      }).catch(async () => {
        // fallback if the named constraint wasn't set: emulate with findFirst
        return prisma.dawatiBisoyRecord.findFirst({
          where: { userId: user.id, date: dayKey },
        });
      });

      if (!found) {
        return NextResponse.json(
          { error: "Record not found for given date" },
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
        ...(typeof patch.alemderSatheyMojlish === "number" ? { alemderSatheyMojlish: patch.alemderSatheyMojlish } : {}),
        ...(typeof patch.publicSatheyMojlish === "number" ? { publicSatheyMojlish: patch.publicSatheyMojlish } : {}),
        ...(typeof patch.nonMuslimSaptahikGasht === "number" ? { nonMuslimSaptahikGasht: patch.nonMuslimSaptahikGasht } : {}),
        ...(typeof patch.editorContent === "string" ? { editorContent: patch.editorContent } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/dawati-bisoy error:", error);
    return NextResponse.json(
      { error: "Failed to update record", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
