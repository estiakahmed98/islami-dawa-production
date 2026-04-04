import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Authenticate the user making the request
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only allow centraladmin to change passwords
    if (session.user.role !== "centraladmin") {
      return NextResponse.json({ message: "Insufficient permissions" }, { status: 403 });
    }

    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return NextResponse.json({ message: "User ID and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters long" }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await db.users.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    });

    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find the user's credentials account
    const account = await (db as any).accounts.findFirst({
      where: { userId, providerId: "credentials" },
    });

    if (!account) {
      return NextResponse.json({ message: "No credentials account found for this user" }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);

    // Update the user's password in accounts table
    await (db as any).accounts.update({
      where: { id: account.id },
      data: { password: hashedPassword, updatedAt: new Date() },
    });

    return NextResponse.json({ 
      message: "Password updated successfully",
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name
      }
    });

  } catch (error: any) {
    console.error("Password change error:", error);
    return NextResponse.json({ 
      message: "Internal server error",
      error: error?.message 
    }, { status: 500 });
  }
}
