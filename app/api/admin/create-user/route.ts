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

    const body = await req.json();
    const { name, email, password, role: newRole, data } = body;
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
      password: hashed,
      role: newRole,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };

    const user = await db.users.create({ data: createData });

    return NextResponse.json(
      { message: "User created", user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: error?.message || "Error" },
      { status: 500 }
    );
  }
}
