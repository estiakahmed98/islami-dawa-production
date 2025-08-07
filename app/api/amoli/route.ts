//api/amoli
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const {
      email,
      percentage = "0",
      editorContent = "",
      ...otherFields
    } = body;

    if (!email || Object.keys(otherFields).length === 0) {
      return NextResponse.json(
        { error: "Email and data are required." },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const today = new Date();

    const existing = await prisma.amoliMuhasaba.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already submitted today." },
        { status: 400 }
      );
    }

    const created = await prisma.amoliMuhasaba.create({
      data: {
        userId: user.id,
        date: today,
        percentage,
        editorContent,
        ...otherFields, // ✅ safe now
      },
    });

    return NextResponse.json(
      { message: "Submitted", data: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/amoli error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}



export async function GET(req: NextRequest) {
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

    const records = await prisma.amoliMuhasaba.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ records }, { status: 200 });
  } catch (error) {
    console.error("GET /api/amoli error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}





export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, ...data } = body;

    if (!email || Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Email and data are required." }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const today = new Date();
    const updated = await prisma.amoliMuhasaba.update({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      data,
    });

    return NextResponse.json({ message: "Updated successfully", data: updated }, { status: 200 });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "Update failed. Possibly not submitted yet." }, { status: 500 });
  }
}
