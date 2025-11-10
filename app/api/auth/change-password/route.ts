import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { compare, hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    const s: any = session as any;
    if (!s || !s.user?.id || !s.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const userId = (s.user as any).id as string;

    const account = await (db as any).accounts.findFirst({
      where: { userId, providerId: "credentials" },
    });

    if (!account || !account.password) {
      return NextResponse.json({ error: "No credentials account found" }, { status: 400 });
    }

    const ok = await compare(currentPassword, account.password as string);
    if (!ok) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const newHash = await hash(newPassword, 10);

    await (db as any).accounts.update({
      where: { id: account.id },
      data: { password: newHash, updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
