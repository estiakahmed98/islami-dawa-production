//api/banuser/route
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = (await getServerSession(nextAuthOptions as any)) as any;

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const allowed = ["centraladmin", "superadmin", "divisionadmin", "markazadmin"];
    if (!allowed.includes(role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const userId = body?.userId as string;
    const banned = body?.banned as boolean;

    if (typeof userId !== "string" || typeof banned !== "boolean") {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const data: any = { banned };

    if (banned) {
      data.banReason = "Violation of rules";
      // epoch seconds (+7 days)
      data.banExpires = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    } else {
      data.banReason = null;
      data.banExpires = null;
    }

    const updated = await db.users.update({
      where: { id: userId },
      data,
      select: { id: true, banned: true, banReason: true, banExpires: true },
    });

    return NextResponse.json(
      { message: "User status updated successfully", user: updated },
      { status: 200 }
    );
  } catch (error: any) {
    // Prisma "record not found"
    if (error?.code === "P2025") {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    console.error("Error updating user status:", error);
    return NextResponse.json(
      { message: "Error updating user status", error: error?.message || "Unknown" },
      { status: 500 }
    );
  }
}
