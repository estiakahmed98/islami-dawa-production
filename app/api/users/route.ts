// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // use a singleton instead of new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    // 1) Direct lookup by email
    if (email) {
      const user = await prisma.users.findFirst({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          division: true,
          district: true,
          upazila: true,
          union: true,
          phone: true,
          markazId: true,
          markaz: { select: { id: true, name: true } },
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(user, { status: 200 });
    }

    // 2) Filters
    const filters = {
      role: url.searchParams.get("role") || undefined,
      name: url.searchParams.get("name") || undefined,
      division: url.searchParams.get("division") || undefined,
      district: url.searchParams.get("district") || undefined,
      upazila: url.searchParams.get("upazila") || undefined,
      union: url.searchParams.get("union") || undefined,
      markaz: url.searchParams.get("markaz") || undefined, // markaz name
      markazId: url.searchParams.get("markazId") || undefined, // markaz id
    };

    const where: any = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (!value) return;

      if (key === "markaz") {
        where.markaz = { name: { contains: value, mode: "insensitive" } };
      } else if (key === "markazId") {
        where.markazId = value;
      } else {
        where[key] = { contains: value, mode: "insensitive" };
      }
    });

    const users = await prisma.users.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        division: true,
        district: true,
        upazila: true,
        union: true,
        phone: true,
        markazId: true,
        markaz: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
  }
}
