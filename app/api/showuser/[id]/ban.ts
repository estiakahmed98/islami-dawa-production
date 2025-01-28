import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const { banned, banReason, banExpires } = await req.json();

    // Update the user's ban status
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        banned,
        banReason: banned ? banReason : null, // If unbanned, remove reason
        banExpires: banned ? banExpires : null, // If unbanned, remove expiry
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating ban status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user ban status." },
      { status: 500 }
    );
  }
}
