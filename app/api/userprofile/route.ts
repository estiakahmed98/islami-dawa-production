// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth"; // <- make sure this exists

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.users.findUnique({
      where: { email: session.user.email },
      select: {
        name: true,
        email: true,
        role: true,
        division: true,
        district: true,
        area: true,
        upazila: true,
        union: true,
        phone: true,
        image: true,
        // markaz: true, // ← uncomment only if this relation exists in your Prisma model
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
