//Faysal Updated by //Estiak

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, adminClient } from "better-auth/client/plugins";
import { auth } from "@/lib/auth";

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  admin,
  updateUser,
  changeEmail,
  changePassword,
} = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), adminClient()],
});

export async function GET() {
  try {
    const request = new Request("/api/auth/session");
    const response = await auth.handler(request);
    const session = await response.json();
    if (!session || !session.user?.email) {
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
        markaz: true,
        phone: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
