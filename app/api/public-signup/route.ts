import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    let body: any = null;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }
    const {
      name,
      email,
      password,
      role,
      division,
      district,
      area,
      upazila,
      union,
      phone,
      data,
    } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const existing = await db.users.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashed = await hash(password, 10);

    // Create user (without password) to match Prisma schema
    const user = await db.users.create({
      data: {
        name: name || null,
        email,
        role: role || "daye",
        division: division || null,
        district: district || null,
        area: area || null,
        upazila: upazila || null,
        union: union || null,
        phone: phone || null,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...(data || {}),
      },
    });

    // Create credentials account record for password auth
    await db.accounts.create({
      data: {
        userId: user.id,
        providerId: "credentials",
        accountId: email,
        password: hashed,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "User registered", user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("public-signup error:", error?.message || error);
    return NextResponse.json(
      { message: error?.message || "Error" },
      { status: 500 }
    );
  }
}
