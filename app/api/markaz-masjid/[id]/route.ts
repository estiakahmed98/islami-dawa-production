// app/api/markaz-masjid/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateMarkazSchema } from "@/lib/validators/markaz";
import { badRequest, notFound, serverError, requireAuth } from "@/lib/api-utils";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteParams) {
  try {
    await requireAuth();

    const { id } = await context.params;

    const item = await prisma.markaz.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true } },
        // Uncomment if you sometimes want users too
        // users: { select: { id: true, name: true, email: true, markazId: true } },
      },
    });

    if (!item) return notFound("Markaz not found");
    return NextResponse.json(item);
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return badRequest("Unauthorized");
    return serverError(e);
  }
}

export async function PUT(req: NextRequest, context: RouteParams) {
  try {
    await requireAuth();

    const { id } = await context.params;

    const body = await req.json();
    const parsed = updateMarkazSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i) => i.message).join(", "));
    }

    const updated = await prisma.markaz.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return badRequest("Unauthorized");
    if (e?.code === "P2025") return notFound("Markaz not found");
    if (e?.code === "P2002") {
      const target = Array.isArray(e?.meta?.target) ? e.meta.target.join(", ") : e?.meta?.target;
      return badRequest(`Duplicate value for unique field${target ? `: ${target}` : ""}.`);
    }
    return serverError(e);
  }
}

export async function DELETE(_req: NextRequest, context: RouteParams) {
  try {
    await requireAuth();

    const { id } = await context.params;

    // Optional guard: prevent delete if users exist
    const { _count } = await prisma.markaz.findUniqueOrThrow({
      where: { id },
      select: { _count: { select: { users: true } } },
    });

    if (_count.users > 0) {
      return badRequest("Cannot delete: users are linked to this markaz.");
    }

    await prisma.markaz.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return badRequest("Unauthorized");
    if (e?.code === "P2025") return notFound("Markaz not found");
    // Foreign key violation fallback if the guard above is removed
    if (e?.code === "P2003") {
      return badRequest("Cannot delete: foreign key constraint (users linked).");
    }
    return serverError(e);
  }
}
