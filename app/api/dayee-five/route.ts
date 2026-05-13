import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function getMonthYear(dateValue: string) {
  const date = new Date(dateValue);
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const email = searchParams.get("email");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const user = await prisma.users.findUnique({
      where: { email: email || session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const where: any = {
      userId: user.id,
    };

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
      isSubmittedForMonth:
        month && year
          ? records.some(
              (record) =>
                record.month === Number(month) && record.year === Number(year),
            )
          : false,
    });
  } catch (error) {
    console.error("DAYEE_FIVE_GET_ERROR", error);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const user = await prisma.users.findUnique({
      where: { email: body.email || session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { month, year } = getMonthYear(body.selectedMonthDate);

    const existingRecord = await prisma.dayeeFiveRecord.findUnique({
      where: {
        userId_month_year: {
          userId: user.id,
          month,
          year,
        },
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        { error: "এই মাসের জন্য আপনি ইতোমধ্যে সাবমিট করেছেন" },
        { status: 400 },
      );
    }

    const record = await prisma.dayeeFiveRecord.create({
      data: {
        userId: user.id,
        month,
        year,
        shobgojariDate: body.shobgojariDate
          ? new Date(body.shobgojariDate)
          : null,
        mashwaraDate: body.mashwaraDate ? new Date(body.mashwaraDate) : null,
        trainingDates: Array.isArray(body.trainingDates)
          ? body.trainingDates.map((date: string) => new Date(date))
          : [],
        jamatCount: Number(body.jamatCount) || 0,
        gashtCount: Number(body.gashtCount) || 0,
        editorContent: body.editorContent || "",
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({
      message: "Submitted successfully",
      record,
    });
  } catch (error) {
    console.error("DAYEE_FIVE_POST_ERROR", error);
    return NextResponse.json(
      { error: "Failed to submit record" },
      { status: 500 },
    );
  }
}
