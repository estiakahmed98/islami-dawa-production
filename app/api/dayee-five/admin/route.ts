import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where: any = {};

    if (month && year) {
      where.month = Number(month);
      where.year = Number(year);
    }

    const records = await prisma.dayeeFiveRecord.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return NextResponse.json({
      records,
    });
  } catch (error) {
    console.error("DAYEE_FIVE_ADMIN_GET_ERROR", error);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 },
    );
  }
}
