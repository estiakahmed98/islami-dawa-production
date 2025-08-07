import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the path as needed


export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, nonMuslimMuslimHoise, murtadIslamFireche, editorContent } = body;

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const currentDate = new Date();
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);

    const alreadyExists = await prisma.dineFeraRecord.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: startOfDay,
          lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (alreadyExists) {
      return NextResponse.json(
        { error: "You have already submitted data today." },
        { status: 400 }
      );
    }

    const record = await prisma.dineFeraRecord.create({
      data: {
        userId: user.id,
        date: currentDate,
        nonMuslimMuslimHoise: Number(nonMuslimMuslimHoise) || 0,
        murtadIslamFireche: Number(murtadIslamFireche) || 0,
        editorContent: editorContent || null,
      },
    });

    return NextResponse.json({ message: "Submission successful", data: record }, { status: 201 });
  } catch (error) {
    console.error("Error saving DineFera data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await prisma.dineFeraRecord.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    return NextResponse.json({ isSubmittedToday: !!record }, { status: 200 });
  } catch (error) {
    console.error("Error checking DineFera record:", error);
    return NextResponse.json({ error: "Failed to fetch submission status" }, { status: 500 });
  }
}
