import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const updatedUser = await prisma.users.update({
      where: { email },
      data: { role: role || "admin" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: `User ${email} role updated to ${updatedUser.role}`,
      user: updatedUser
    });

  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
