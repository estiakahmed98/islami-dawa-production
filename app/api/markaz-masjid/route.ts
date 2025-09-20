// app/api/markaz-masjid/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createMarkazSchema } from "@/lib/validators/markaz";
import { badRequest, serverError, requireAuth } from "@/lib/api-utils";
import type { Prisma } from "@prisma/client";

/**
 * GET /api/markaz-masjid
 * Query:
 *  - q: string (search across name/division/district/upazila/union)
 *  - page: number (default 1)
 *  - pageSize: number (default 10, max 100)
 *  - includeUsers: "true" | "false" (default "false") -> include minimal users
 */
export async function GET(req: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "10")));
    const includeUsers = (searchParams.get("includeUsers") ?? "false").toLowerCase() === "true";

    const where: Prisma.MarkazWhereInput =
      q.length > 0
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { division: { contains: q, mode: "insensitive" } },
              { district: { contains: q, mode: "insensitive" } },
              { upazila: { contains: q, mode: "insensitive" } },
              { union: { contains: q, mode: "insensitive" } },
            ],
          }
        : {};

    const [total, data] = await Promise.all([
      prisma.markaz.count({ where }),
      prisma.markaz.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: { select: { users: true } },
          ...(includeUsers
            ? { users: { select: { id: true, name: true, email: true, markazId: true } } }
            : {}),
        },
      }),
    ]);

    return NextResponse.json({
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        query: q,
      },
    });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return badRequest("Unauthorized");
    return serverError(e);
  }
}

/**
 * POST /api/markaz-masjid
 * Body: { name, division, district, upazila, union }
 * - Handles unique constraint errors gracefully (e.g., name unique).
 */
export async function POST(req: Request) {
  try {
    await requireAuth();

    const body = await req.json();
    const parsed = createMarkazSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i) => i.message).join(", "));
    }

    const created = await prisma.markaz.create({
      data: parsed.data,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    // Handle unique constraint violation nicely if you have a unique index on name, etc.
    if (e?.code === "P2002") {
      const target = Array.isArray(e?.meta?.target) ? e.meta.target.join(", ") : e?.meta?.target;
      return badRequest(`Duplicate value for unique field${target ? `: ${target}` : ""}.`);
    }
    if (e?.message === "UNAUTHORIZED") return badRequest("Unauthorized");
    return serverError(e);
  }
}
