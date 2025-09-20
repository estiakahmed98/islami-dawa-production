// app/api/userprofile/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerAuthSession();
    const email = session?.user?.email?.toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.users.findUnique({
      where: { email }, // email is unique in your schema
      select: {
        id: true,
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
        markazId: true,
        markaz: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
