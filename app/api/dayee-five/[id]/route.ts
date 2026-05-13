import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = await params;

    const record = await prisma.dayeeFiveRecord.update({
      where: {
        id: id,
      },
      data: {
        shobgojariDate: body.shobgojariDate
          ? new Date(body.shobgojariDate)
          : null,

        mashwaraDate: body.mashwaraDate ? new Date(body.mashwaraDate) : null,

        trainingDates: Array.isArray(body.trainingDates)
          ? body.trainingDates.map((date: string) => new Date(date))
          : [],

        jamatCount: Number(body.jamatCount) || 0,
        gashtCount: Number(body.gashtCount) || 0,
        editorContent: body.editorContent || null,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error("DAYEE_FIVE_UPDATE_ERROR", error);
    return NextResponse.json(
      { error: "Failed to update record" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.dayeeFiveRecord.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Record deleted successfully",
    });
  } catch (error) {
    console.error("DAYEE_FIVE_DELETE_ERROR", error);
    return NextResponse.json(
      { error: "Failed to delete record" },
      { status: 500 },
    );
  }
}
