import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

// Path to the TypeScript data file
const userDataPath = path.join(process.cwd(), "app/data/userData.tsx");

// Helper function to parse the TypeScript data file
const parseTsFile = (filePath: string): Record<string, any> => {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const startIndex = fileContent.indexOf("{");
  const endIndex = fileContent.lastIndexOf("}");
  if (startIndex !== -1 && endIndex !== -1) {
    const jsonString = fileContent.slice(startIndex, endIndex + 1);
    return eval(`(${jsonString})`); // Evaluate to extract the object
  }
  return {};
};

// Helper function to write data back to the TypeScript file
const writeTsFile = (filePath: string, data: Record<string, any>) => {
  const tsContent = `export const userData = ${JSON.stringify(data, null, 2)};`;
  fs.writeFileSync(filePath, tsContent, "utf-8");
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      role,
      division,
      district,
      upazila,
      tunion,
      markaz,
      phoneNumber,
    } = body;

    // Basic validation
    if (!name || !email || !password || !role || !phoneNumber) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Parse existing user data
    const userData = parseTsFile(userDataPath);

    // Check if the email already exists
    if (userData[email]) {
      return NextResponse.json(
        { error: "Email already exists." },
        { status: 400 }
      );
    }

    // Create a new user object
    const newUser = {
      id: `${Date.now()}`,
      name,
      role,
      division,
      district,
      upazila,
      union: tunion,
      area: markaz,
      phone: phoneNumber,
      email,
      password: hashedPassword,
    };

    // Add the new user to the user data
    userData[email] = newUser;

    // Write the updated data back to the file
    writeTsFile(userDataPath, userData);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    // Parse the existing data from the TypeScript file
    const userData = parseTsFile(userDataPath);

    // Retrieve the user by email
    const user = userData[email];

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error retrieving user:", error);
    return NextResponse.json(
      { error: "Failed to retrieve user data." },
      { status: 500 }
    );
  }
}
