import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = (await getServerSession(nextAuthOptions as any)) as any;
    if (!session || !session.user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Only allow users with admin-like roles
    const role = (session.user as any).role;
    const allowed = [
      "centraladmin",
      "superadmin",
      "divisionadmin",
      "markazadmin",
    ];
    if (!allowed.includes(role))
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    // Parse JSON body (do not rely on Content-Length which may be absent with chunked encoding)
    const contentType = req.headers.get("content-type") || "";
    if (contentType && !contentType.includes("application/json")) {
      return NextResponse.json(
        { message: "Content-Type must be application/json" },
        { status: 415 }
      );
    }
    
    let body: any;
    try {
      body = await req.json();
    } catch (e: any) {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { message: "Request body must be a JSON object" },
        { status: 400 }
      );
    }
    // Destructure with sensible defaults and basic type guards
    const {
      name,
      email,
      password,
      role: newRole,
      data = {},
    }: {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      data?: unknown;
    } = body ?? {};
    const safeExtraData =
      data && typeof data === "object" && !Array.isArray(data) ? (data as object) : {};
    if (!email || !password || !newRole)
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });

    const existing = await db.users.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );

    const hashed = await hash(password, 10);

    const createData: any = {
      name,
      email,
      role: newRole,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Create credentials account for this user
      accounts: {
        create: [
          {
            accountId: email,
            providerId: "credentials",
            password: hashed,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
      // Only spread validated extra object fields
      ...(safeExtraData as Record<string, unknown>),
    };

    const user = await db.users.create({ data: createData });

    return NextResponse.json(
      { message: "User created", user },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Error" },
      { status: 500 }
    );
  }
}
