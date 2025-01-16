// import fs from "fs";
// import path from "path";
// import bcrypt from "bcrypt";
// import { NextRequest, NextResponse } from "next/server";

// // Path to the TypeScript data file
// const userDataPath = path.join(process.cwd(), "app/data/userData.ts");

// // Helper function to parse the TypeScript data file
// const parseTsFile = (filePath: string): Record<string, any> => {
//   if (!fs.existsSync(filePath)) {
//     return {};
//   }
//   const fileContent = fs.readFileSync(filePath, "utf-8");

//   // Extract the content inside the export statement
//   const match = fileContent.match(/export const userData = ([\s\S]+);/);
//   if (match && match[1]) {
//     try {
//       return JSON.parse(match[1]);
//     } catch (error) {
//       console.error("Error parsing user data:", error);
//       return {};
//     }
//   }

//   return {};
// };

// // Helper function to write data back to the TypeScript file
// const writeTsFile = (filePath: string, data: Record<string, any>) => {
//   const tsContent = `export const userData = ${JSON.stringify(data, null, 2)};`;
//   fs.writeFileSync(filePath, tsContent, "utf-8");
// };

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const {
//       name,
//       email,
//       password,
//       role,
//       division,
//       district,
//       upazila,
//       union,
//       markaz,
//       phoneNumber,
//     } = body;

//     console.log(
//       "Received Data in Register:",
//       name,
//       email,
//       password,
//       role,
//       division,
//       district,
//       upazila,
//       union,
//       markaz,
//       phoneNumber
//     );

//     // Basic validation
//     if (!name || !email || !password || !role || !phoneNumber) {
//       return NextResponse.json(
//         { error: "All fields are required." },
//         { status: 400 }
//       );
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Parse existing user data
//     const userData = parseTsFile(userDataPath);

//     // Check if the email already exists
//     if (userData[email]) {
//       return NextResponse.json(
//         { error: "Email already exists." },
//         { status: 400 }
//       );
//     }

//     // Create a new user object
//     const newUser = {
//       id: `${Date.now()}`,
//       name,
//       role,
//       division,
//       district,
//       upazila,
//       union,
//       area: markaz || "",
//       phone: phoneNumber,
//       email,
//       password: hashedPassword,
//     };

//     // Add the new user to the user data
//     userData[email] = newUser;

//     // Write the updated data back to the file
//     writeTsFile(userDataPath, userData);

//     return NextResponse.json(newUser, { status: 201 });
//   } catch (error) {
//     console.error("Error creating user:", error);
//     return NextResponse.json(
//       { error: "Failed to create user." },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(req: NextRequest): Promise<NextResponse> {
//   try {
//     const { searchParams } = new URL(req.url);
//     const email = searchParams.get("email");

//     if (!email) {
//       return NextResponse.json(
//         { error: "Email is required." },
//         { status: 400 }
//       );
//     }

//     // Parse the existing data from the TypeScript file
//     const userData = parseTsFile(userDataPath);

//     // Retrieve the user by email
//     const user = userData[email];

//     if (!user) {
//       return NextResponse.json({ error: "User not found." }, { status: 404 });
//     }

//     return NextResponse.json(user, { status: 200 });
//   } catch (error) {
//     console.error("Error retrieving user:", error);
//     return NextResponse.json(
//       { error: "Failed to retrieve user data." },
//       { status: 500 }
//     );
//   }
// }

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
