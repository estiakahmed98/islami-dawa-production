//Estiak

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth"; // Your session/auth helper
import { db } from "@/lib/db"; // Your Prisma client (or DB client)

export async function GET() {
  try {
    // 1) Get the session, passing in request headers
    const headersList = await headers(); // Await the headers
    const session = await auth.api.getSession({
      headers: headersList, // Pass the awaited headers
    });

    if (!session?.user?.email) {
      // Not logged in
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Fetch the user from DB by email
    const user = await db.users.findUnique({
      where: { email: session.user.email },
      // Choose exactly which fields you want to return
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        division: true,
        district: true,
        upazila: true,
        union: true,
        area: true,
        // get only markaz names to avoid sending objects to the client UI
        markaz: { select: { name: true } },
        parent: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        banned: true,
        banReason: true,
        banExpires: true,
        note: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3) Normalize shape for client (ProfileView expects scalar markaz)
    const markazNames = Array.isArray(user.markaz)
      ? user.markaz.map((m: any) => m?.name).filter(Boolean)
      : [];
    const responseBody = {
      ...user,
      markaz: markazNames.join(", "),
    };
    return NextResponse.json(responseBody, { status: 200 });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    // 1) Validate session
    const headersList = await headers(); // Await the headers
    const session = await auth.api.getSession({
      headers: headersList, // Pass the awaited headers
    });

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Parse the JSON body
    const data = await req.json();

    // 3) Update user record in DB
    const updatedUser = await db.users.update({
      where: { email: session.user.email },
      data: {
        // Only update the fields you need
        name: data.name,
        phone: data.phone,
        email: data.email,
        division: data.division,
        district: data.district,
        upazila: data.upazila,
        union: data.union,
        area: data.area,
        // markaz is a relation; updating it requires a connect/disconnect payload.
        // Intentionally omitted here to avoid runtime errors when the client sends a scalar string.
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("PUT /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 }
    );
  }
}
