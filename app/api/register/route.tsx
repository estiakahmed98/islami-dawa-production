import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

// Path to the user data file
const userDataPath = path.join(process.cwd(), "src/app/data/userData.ts");

export async function POST(req: NextRequest) {
  try {
    // Parse request data
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
    } = await req.json();

    // Basic validation
    if (
      !name ||
      !email ||
      !password ||
      !role ||
      !division ||
      !district ||
      !upazila ||
      !tunion ||
      !phoneNumber
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the user data file exists
    if (!fs.existsSync(userDataPath)) {
      return NextResponse.json(
        { error: "User data file not found" },
        { status: 500 }
      );
    }

    // Read the existing user data file
    const fileContent = fs.readFileSync(userDataPath, "utf-8");

    // Extract the userData object
    let userData: Record<string, any> = {};
    const startIndex = fileContent.indexOf("{");
    const endIndex = fileContent.lastIndexOf("}");
    if (startIndex !== -1 && endIndex !== -1) {
      const jsonString = fileContent.slice(startIndex, endIndex + 1);
      userData = eval(`(${jsonString})`); // Safely evaluate the object
    }

    // Check if the email already exists
    if (userData[email]) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Create a new user object
    const newUser = {
      id: `${Date.now()}`, // Use a string for ID to maintain consistency
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

    // Add the new user to the userData object
    userData[email] = newUser;

    // Write the updated userData back to the file
    const updatedFileContent = `export const userData = ${JSON.stringify(
      userData,
      null,
      2
    )};`;
    fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

    console.log("New user added:", newUser);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "User creation failed" },
      { status: 500 }
    );
  }
}
