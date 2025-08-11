// app/api/session-lock/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  if (req.headers.get("x-internal") !== "1") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId missing" }, { status: 400 });
  }
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { activeDeviceId: true, activeSessionId: true },
  });
  return NextResponse.json(
    {
      activeDeviceId: user?.activeDeviceId ?? null,
      activeSessionId: user?.activeSessionId ?? null,
    },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  if (req.headers.get("x-internal") !== "1") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const { userId, activeDeviceId, activeSessionId } = body || {};
  if (!userId || !activeDeviceId || !activeSessionId) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  await prisma.users.update({
    where: { id: userId },
    data: {
      activeDeviceId,
      activeSessionId,
    },
  });

  return NextResponse.json({ ok: true });
}
