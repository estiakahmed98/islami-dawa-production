import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true,
        division: true,
        district: true
      },
    });

    if (!user) {
      return NextResponse.json({ 
        error: "User not found in database",
        sessionEmail: session.user.email
      }, { status: 404 });
    }

    return NextResponse.json({
      session: {
        email: session.user.email,
        name: session.user.name,
      },
      databaseUser: user,
      isAdmin: user.role === "admin"
    });

  } catch (error) {
    console.error("Debug auth error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
