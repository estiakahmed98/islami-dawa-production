import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ensure you have a central prisma client
import { createMarkazSchema } from "@/lib/validators/markaz";
import { badRequest, serverError, requireAuth } from "@/lib/api-utils";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || "10")));

    const where: Prisma.MarkazWhereInput = q
      ? {
          OR: [
            { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { division: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { district: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { upazila: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { union: { contains: q, mode: Prisma.QueryMode.insensitive } },
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
        include: { _count: { select: { users: true } } },
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

export async function POST(req: Request) {
  try {
    await requireAuth();
    const body = await req.json();
    const parsed = createMarkazSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map(i => i.message).join(", "));
    }
    const created = await prisma.markaz.create({ data: parsed.data });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return serverError(e);
  }
}
