import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

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
        note: true, // Ensure note is included
      },
    });

    // Ensure note is always null unless explicitly changed
    const usersWithNullNote = users.map((user) => ({
      ...user,
      note: user.note ?? null,
    }));

    return NextResponse.json({ users: usersWithNullNote }, { status: 200 });
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

    const updateData: Record<string, any> = { ...updates };

    // Only update note if explicitly provided
    if (note !== undefined) {
      updateData.note = note;
    }

    const updatedUser = await db.users.update({
      where: { id: userId },
      data: updateData,
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

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

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

    // Check if user exists before deletion
    const user = await db.users.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Delete user
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
