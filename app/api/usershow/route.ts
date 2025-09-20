// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET: Fetch users with optional filters.
 * NOTE: Schema updated to one-to-many (users.markazId -> Markaz).
 * Shapes relation to a single string (markaz name) for UI compatibility.
 *
 * Query params (optional):
 * - role, name, division, district, upazila, union, area, email, phone
 * - banned=true|false
 * - markazId=<id>        (filter by markazId)
 * - markaz=<name>        (filter by markaz name, case-insensitive)
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
      bannedParam === "true" ? true : bannedParam === "false" ? false : undefined;

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
      markazId: url.searchParams.get("markazId") || "",
      markaz: url.searchParams.get("markaz") || "", // name
    };

    // Build Prisma where
    const where: Record<string, any> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (key === "banned" && typeof value === "boolean") {
        where.banned = value;
      } else if (key === "markazId" && typeof value === "string" && value.trim() !== "") {
        where.markazId = value.trim();
      } else if (key === "markaz" && typeof value === "string" && value.trim() !== "") {
        // filter by related markaz name (case-insensitive)
        where.markaz = { name: { contains: value.trim(), mode: "insensitive" } };
      } else if (
        typeof value === "string" &&
        value.trim() !== "" &&
        !["markazId", "markaz"].includes(key)
      ) {
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
        markazId: true,
        markaz: { select: { id: true, name: true } }, // one-to-many: single object or null
      },
      orderBy: { createdAt: "desc" },
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
      markazId: u.markazId ?? null,
      // keep UI contract: flatten to a single name (or empty string)
      markaz: u.markaz?.name ?? "",
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
 * Body: {
 *   userId: string,
 *   updates: {
 *     ...scalar fields...
 *     markaz?: string        // markaz name: "" to clear, "Name" to set by name
 *     markazId?: string|null // direct FK control: null to clear, id to set
 *   },
 *   note?: string
 * }
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
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const { userId, updates, note } = body as {
      userId?: string;
      updates?: Record<string, any> | null;
      note?: string | null;
    };

    if (!userId || !updates || typeof updates !== "object") {
      return NextResponse.json({ message: "Invalid request data" }, { status: 400 });
    }

    const { markaz, markazId, ...scalar } = updates;

    // Build update data
    const data: any = { ...scalar };
    if (typeof note !== "undefined") data.note = note;

    // Priority: explicit markazId if provided. Otherwise fall back to markaz name string.
    if (typeof markazId !== "undefined") {
      if (markazId === null || (typeof markazId === "string" && markazId.trim() === "")) {
        data.markazId = null; // detach
      } else if (typeof markazId === "string") {
        // (Optional) Validate existence
        const exists = await db.markaz.findUnique({ where: { id: markazId } });
        if (!exists) {
          return NextResponse.json(
            { message: `Markaz not found by id: ${markazId}` },
            { status: 400 }
          );
        }
        data.markazId = markazId;
      }
    } else if (typeof markaz !== "undefined") {
      if (typeof markaz === "string") {
        if (markaz.trim() === "") {
          data.markazId = null; // clear
        } else {
          const found = await db.markaz.findFirst({
            where: { name: { equals: markaz.trim(), mode: "insensitive" } },
            select: { id: true },
          });
          if (!found) {
            return NextResponse.json(
              { message: `Markaz not found by name: ${markaz}` },
              { status: 400 }
            );
          }
          data.markazId = found.id; // set by name
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
        markazId: true,
        markaz: { select: { id: true, name: true } } as any, // typing aid
      },
    });

    const shaped = {
      ...updated,
      markaz: updated.markaz?.name ?? "",
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

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
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
      return NextResponse.json({ message: "Invalid request data" }, { status: 400 });
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
        markazId: true,
        markaz: { select: { id: true, name: true } },
      },
    });

    const shaped = {
      ...updated,
      markaz: updated.markaz?.name ?? "",
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
