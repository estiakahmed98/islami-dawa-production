import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateMarkazSchema } from "@/lib/validators/markaz";
import { badRequest, notFound, serverError, requireAuth } from "@/lib/api-utils";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireAuth();
    const item = await prisma.markaz.findUnique({
      where: { id: params.id },
      include: { _count: { select: { users: true } } },
    });
    if (!item) return notFound("Markaz not found");
    return NextResponse.json(item);
  } catch (e) {
    return serverError(e);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    await requireAuth();
    const body = await req.json();
    const parsed = updateMarkazSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map(i => i.message).join(", "));
    }

    const updated = await prisma.markaz.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    if (e.code === "P2025") return notFound("Markaz not found");
    return serverError(e);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireAuth();
    await prisma.markaz.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.code === "P2025") return notFound("Markaz not found");
    return serverError(e);
  }
}
