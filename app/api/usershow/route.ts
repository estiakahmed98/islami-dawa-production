// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET: Fetch users with optional filters.
 * Shapes relation markaz[] -> single string (first name) for UI compatibility.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);

    // tri-state parse for "banned": true | false | undefined
    const bannedParam = url.searchParams.get("banned");
    const bannedParsed =
      bannedParam === "true"
        ? true
        : bannedParam === "false"
          ? false
          : undefined;

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
      banned: bannedParsed as boolean | undefined,
    };

    // Build Prisma where
    const where: Record<string, any> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (key === "banned" && typeof value === "boolean") {
        where.banned = value;
      } else if (typeof value === "string" && value.trim() !== "") {
        // partial, case-insensitive match for strings
        where[key] = { contains: value.trim(), mode: "insensitive" };
      }
    }

    const rows = await db.users.findMany({
      where,
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
        banned: true,
        note: true,
        markaz: { select: { id: true, name: true } }, // Many-to-many relation
      },
      orderBy: { createdAt: "desc" }, // optional, remove if not present in schema
    });

    const users = rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      division: u.division,
      district: u.district,
      upazila: u.upazila,
      union: u.union,
      area: u.area,
      phone: u.phone,
      banned: u.banned,
      note: u.note,
      // keep UI contract: flatten to a single name (first markaz if any)
      markaz: Array.isArray(u.markaz) ? (u.markaz[0]?.name ?? "") : "",
    }));

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error fetching users:", msg);
    return NextResponse.json(
      { message: "Failed to fetch users.", error: msg },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update user (Central Admin only).
 * Body: { userId: string, updates: {..., markaz?: string}, note?: string }
 * - updates.markaz === ""         -> clear all markaz relations
 * - updates.markaz === "Name"     -> set to that one Markaz by name
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const me = await db.users.findUnique({ where: { id: session.user.id } });
    if (me?.role !== "centraladmin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => null as any);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    const { userId, updates, note } = body as {
      userId?: string;
      updates?: Record<string, any> | null;
      note?: string | null;
    };

    if (!userId || !updates || typeof updates !== "object") {
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 }
      );
    }

    const { markaz, ...scalar } = updates;
    const data: any = { ...scalar, note };

    if (typeof markaz !== "undefined") {
      if (typeof markaz === "string") {
        if (markaz.trim() === "") {
          data.markaz = { set: [] }; // clear all
        } else {
          const found = await db.markaz.findFirst({
            where: { name: markaz.trim() },
            select: { id: true },
          });
          if (!found) {
            return NextResponse.json(
              { message: `Markaz not found by name: ${markaz}` },
              { status: 400 }
            );
          }
          data.markaz = { set: [{ id: found.id }] }; // replace with exactly one
        }
      }
    }

    const updated = await db.users.update({
      where: { id: userId },
      data,
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
        banned: true,
        note: true,
        markaz: { select: { id: true, name: true } },
      },
    });

    const shaped = {
      ...updated,
      markaz: Array.isArray(updated.markaz)
        ? (updated.markaz[0]?.name ?? "")
        : "",
    };

    return NextResponse.json({ user: shaped }, { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Update error:", msg);
    return NextResponse.json(
      { message: "Internal server error", error: msg },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove a user (Central Admin only)
 * Body: { userId: string }
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const me = await db.users.findUnique({ where: { id: session.user.id } });
    if (me?.role !== "centraladmin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { userId } = await req.json();
    if (typeof userId !== "string" || !userId) {
      return NextResponse.json(
        { message: "Invalid request body: userId is required" },
        { status: 400 }
      );
    }

    const exists = await db.users.findUnique({ where: { id: userId } });
    if (!exists) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await db.users.delete({ where: { id: userId } });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error deleting user:", msg);
    return NextResponse.json(
      { message: "Error deleting user", error: msg },
      { status: 500 }
    );
  }
}

/**
 * POST: Ban/Unban a user (Central Admin only)
 * Body: { userId: string, banned: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const me = await db.users.findUnique({ where: { id: session.user.id } });
    if (me?.role !== "centraladmin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { userId, banned } = await req.json();
    if (!userId || typeof banned !== "boolean") {
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 }
      );
    }

    const updated = await db.users.update({
      where: { id: userId },
      data: { banned },
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
        banned: true,
        note: true,
        markaz: { select: { id: true, name: true } },
      },
    });

    const shaped = {
      ...updated,
      markaz: Array.isArray(updated.markaz)
        ? (updated.markaz[0]?.name ?? "")
        : "",
    };

    return NextResponse.json(
      {
        message: `User ${banned ? "banned" : "unbanned"} successfully!`,
        user: shaped,
      },
      { status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Ban/unban error:", msg);
    return NextResponse.json(
      { message: "Internal server error", error: msg },
      { status: 500 }
    );
  }
}
