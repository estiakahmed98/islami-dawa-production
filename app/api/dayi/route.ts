// app/api/dayi/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    console.log("Received data:", body); // Add logging
    
    const {
      email,
      sohojogiDayeToiri = 0,
      editorContent = "",
      assistants = [],
      userInfo = {},
    } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Check for existing submission
    const existing = await prisma.dayeeBishoyRecord.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: new Date(today.setUTCHours(0, 0, 0, 0)),
          lt: new Date(today.setUTCHours(23, 59, 59, 999)),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already submitted today" },
        { status: 400 }
      );
    }

    // Create record with transaction
    const result = await prisma.$transaction(async (prisma) => {
      const newRecord = await prisma.dayeeBishoyRecord.create({
        data: {
          userId: user.id,
          date: today,
          sohojogiDayeToiri,
          editorContent,
        },
      });

      if (assistants.length > 0) {
        await prisma.assistantDaee.createMany({
          data: assistants.map((assistant: any) => ({
            name: assistant.name,
            phone: assistant.phone,
            address: assistant.address,
            email: assistant.email || null,
            description: assistant.description || null,
            division: userInfo.division || "",
            district: userInfo.district || "",
            upazila: userInfo.upazila || "",
            union: userInfo.union || "",
            dayeeBishoyId: newRecord.id,
          })),
        });
      }

      return await prisma.dayeeBishoyRecord.findUnique({
        where: { id: newRecord.id },
        include: { assistants: true },
      });
    });

    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// =============== GET ===============
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
  } catch (error) {
    console.error("GET /api/dayi error:", error);
    let errorMessage = "Failed to fetch records";
    let errorDetails: string | object = "Unknown error";

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || error.message;
    } else if (typeof error === 'object' && error !== null) {
      try {
        errorDetails = JSON.stringify(error);
      } catch (e) {
        errorDetails = String(error);
      }
    } else {
      errorDetails = String(error);
    }

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: 500 }
    );
  }
}
