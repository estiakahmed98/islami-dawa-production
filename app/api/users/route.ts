// //Juwel

// import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export async function GET(req: NextRequest) {
//   try {
//     const url = new URL(req.url);
//     const filters = {
//       role: url.searchParams.get("role") || undefined,
//       name: url.searchParams.get("name") || undefined,
//       division: url.searchParams.get("division") || undefined,
//       district: url.searchParams.get("district") || undefined,
//       upazila: url.searchParams.get("upazila") || undefined,
//       union: url.searchParams.get("union") || undefined,
//     };

//     const query: any = {};
//     Object.keys(filters).forEach((key) => {
//       if (filters[key as keyof typeof filters]) {
//         query[key] = {
//           contains: filters[key as keyof typeof filters],
//           mode: "insensitive",
//         };
//       }
//     });

//     const users = await prisma.users.findMany({
//       where: query,
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true,
//         division: true,
//         district: true,
//         upazila: true,
//         union: true,
//         phone: true,
//         markaz: true,
//       },
//     });

//     return NextResponse.json(users, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch users." },
//       { status: 500 }
//     );
//   }
// }

//Juwel
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    // Handle email-specific query (new functionality)
    if (email) {
      const user = await prisma.users.findFirst({
        where: {
          email: email.toLowerCase(),
        },
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
          markaz: true,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(user, { status: 200 });
    }

    // Existing filter logic
    const filters = {
      role: url.searchParams.get("role") || undefined,
      name: url.searchParams.get("name") || undefined,
      division: url.searchParams.get("division") || undefined,
      district: url.searchParams.get("district") || undefined,
      upazila: url.searchParams.get("upazila") || undefined,
      union: url.searchParams.get("union") || undefined,
      markaz: url.searchParams.get("markaz") || undefined,
    };

    const query: any = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof typeof filters]) {
        query[key] = {
          contains: filters[key as keyof typeof filters],
          mode: "insensitive",
        };
      }
    });

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
        phone: true,
        markaz: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
