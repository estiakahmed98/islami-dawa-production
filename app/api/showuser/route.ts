import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define response types
interface UserResponse {
  users: Array<{
    id: string; // FIXED: Convert ID to string for consistency
    name: string | null;
    email: string;
    role: string | null;
    division: string;
    district: string;
    upazila: string;
    union: string;
    area: string;
    phone: string;
    markaz: string | null;
  }>;
}

interface ErrorResponse {
  message: string;
}

export async function GET(req: NextRequest) {
  try {
    // Extract query parameters from the request URL
    const url = new URL(req.url);
    const filters = {
      role: url.searchParams.get("role"),
      name: url.searchParams.get("name"),
      division: url.searchParams.get("division"),
      district: url.searchParams.get("district"),
      upazila: url.searchParams.get("upazila"),
      union: url.searchParams.get("union"),
      area: url.searchParams.get("area"),
      email: url.searchParams.get("email"),
      phone: url.searchParams.get("phone"),
    };

    // Build the Prisma `where` query dynamically based on provided filters
    const query: Record<string, any> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        query[key] = {
          contains: value,
          mode: "insensitive",
        };
      }
    }

    // Fetch filtered users from the database
    const users = await prisma.users.findMany({
      where: query,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        division: true,
        district: true,
        upazila: true,
        union: true,
        area: true,
        phone: true,
        markaz: true,
      },
    });

    // Convert ID from number to string
    const formattedUsers = users.map((user) => ({
      ...user,
      id: user.id.toString(), // FIX: Ensure ID is always a string
    }));

    return NextResponse.json({ users: formattedUsers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Failed to fetch users." },
      { status: 500 }
    );
  }
}
