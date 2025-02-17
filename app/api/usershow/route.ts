//Faysal Updated by //Estiak

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

/**
 * GET: Fetch users with optional filters
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const filters = {
      role: url.searchParams.get("role") || "",
      name: url.searchParams.get("name") || "",
      division: url.searchParams.get("division") || "",
      district: url.searchParams.get("district") || "",
      upazila: url.searchParams.get("upazila") || "",
      union: url.searchParams.get("union") || "",
      area: url.searchParams.get("area") || "",
      email: url.searchParams.get("email") || "",
      phone: url.searchParams.get("phone") || "",
      banned: url.searchParams.get("banned") === "true" ? true : undefined,
    };

    const query: Record<string, any> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value && typeof value === "string" && value.trim() !== "") {
        query[key] = {
          contains: value.trim(),
          mode: "insensitive",
        };
      } else if (key === "banned" && typeof value === "boolean") {
        query[key] = value;
      }
    }

    const users = await db.users.findMany({
      where: query,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        division: true,
        district: true,
        upazila: true,
        union: true,
        area: true,
        phone: true,
        markaz: true,
        banned: true,
        note: true,
      },
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch users.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update user details (Central Admin only)
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await db.users.findUnique({
      where: { id: session.user.id },
    });
    if (currentUser?.role !== "centraladmin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { userId, updates, note } = await req.json();
    if (!userId || typeof updates !== "object" || updates === null) {
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 }
      );
    }

    const updatedUser = await db.users.update({
      where: { id: userId },
      data: { ...updates, note },
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove a user (Central Admin only)
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await req.json();
    if (typeof userId !== "string") {
      return NextResponse.json(
        { message: "Invalid request body: userId is required" },
        { status: 400 }
      );
    }

    const user = await db.users.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await db.users.delete({ where: { id: userId } });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      {
        message: "Error deleting user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Ban/Unban a user (Central Admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await db.users.findUnique({
      where: { id: session.user.id },
    });
    if (currentUser?.role !== "centraladmin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { userId, banned } = await req.json();
    if (!userId || typeof banned !== "boolean") {
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 }
      );
    }

    const updatedUser = await db.users.update({
      where: { id: userId },
      data: { banned },
    });

    return NextResponse.json(
      {
        message: `User ${banned ? "banned" : "unbanned"} successfully!`,
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ban/unban error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
