//Estiak

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { admin } from "@/lib/auth-client";

export async function POST(req: NextRequest) {
  try {
    // Ensure user is authenticated
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userId, banned } = await req.json(); // Parse request body

    if (typeof userId !== "string" || typeof banned !== "boolean") {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    if (banned) {
      // Ban the user using BetterAuth
      await admin.banUser({
        userId,
        banReason: "Violation of rules",
        banExpiresIn: 60 * 60 * 24 * 7, // Ban for 7 days (optional)
      });
    } else {
      // Unban the user using BetterAuth
      await admin.unbanUser({ userId });
    }

    // Update the ban status in the database
    const updatedUser = await db.users.update({
      where: { id: userId },
      data: { banned },
    });

    return NextResponse.json(
      { message: "User status updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user status:", error);

    return NextResponse.json(
      {
        message: "Error updating user status",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
