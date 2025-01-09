import { userData } from "@/app/data/userData";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { email: string } }) {
  try {
    const email = params.email;
    console.log("Get email:", email);

    const user = userData[email];

    console.log("Find user:", user);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Exclude sensitive data like passwordHash
    const { passwordHash, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
