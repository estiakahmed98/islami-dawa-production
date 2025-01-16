import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      role,
      division,
      district,
      upazila,
      union,
      markaz,
      phone,
      email,
      password,
    } = body;

    console.log("Received Data:", {
      name,
      role,
      division,
      district,
      upazila,
      union,
      markaz,
      phone,
      email,
      password,
    });

    // **Basic Validation**
    if (!email || !password || !role || !phone) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // **Check if email already exists**
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already resitered in this email." },
        { status: 400 }
      );
    }

    // **Hash the password**
    const hashedPassword = await bcrypt.hash(password, 10);

    // **Create new user in database**
    const user: User = await prisma.user.create({
      data: {
        name,
        role,
        division,
        district,
        upazila,
        union,
        area: markaz || "",
        phone,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user." },
      { status: 500 }
    );
  }
}
