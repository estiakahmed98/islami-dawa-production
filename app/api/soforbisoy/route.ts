// // app/api/soforbisoy/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import fs from "fs";
// import path from "path";

// // Path to the user data file
// const userDataPath = path.join(
//   process.cwd(),
//   "app/data/soforBishoyUserData.ts"
// );

// interface SoforBishoyData {
//   moktobVisit: string;
//   madrasaVisits: string[];
//   schoolCollegeVisits: string[];
//   editorContent?: string;
//   [key: string]: string | string[] | undefined;
// }

// export async function POST(req: NextRequest): Promise<NextResponse> {
//   try {
//     const body = await req.json();
//     const { email, ...restData } = body as SoforBishoyData & { email: string };

//     // Basic validation
//     if (!email || Object.keys(restData).length === 0) {
//       return NextResponse.json(
//         { error: "Email and data are required." },
//         { status: 400 }
//       );
//     }

//     // Get the current date in YYYY-MM-DD format
//     const currentDate = new Date().toISOString().split("T")[0];

//     // Check if the data file exists; if not, create it
//     if (!fs.existsSync(userDataPath)) {
//       fs.writeFileSync(
//         userDataPath,
//         `export const userSoforBishoyData = { labelMap: {}, records: {} };`,
//         "utf-8"
//       );
//     }

//     // Read the existing data file
//     const fileContent = fs.readFileSync(userDataPath, "utf-8");

//     // Parse existing data
//     let userSoforBishoyData: {
//       labelMap: object;
//       records: Record<string, Record<string, any>>;
//     } = {
//       labelMap: {},
//       records: {},
//     };

//     const startIndex = fileContent.indexOf("{");
//     const endIndex = fileContent.lastIndexOf("}");
//     if (startIndex !== -1 && endIndex !== -1) {
//       const jsonString = fileContent.slice(startIndex, endIndex + 1);
//       userSoforBishoyData = eval(`(${jsonString})`);
//     }

//     // Ensure `records` key exists
//     if (!userSoforBishoyData.records) {
//       userSoforBishoyData.records = {};
//     }

//     // Check if the user has already submitted today
//     if (userSoforBishoyData.records[email]?.[currentDate]) {
//       return NextResponse.json(
//         { error: "You have already submitted data today." },
//         { status: 400 }
//       );
//     }

//     // Ensure data is organized by email
//     if (!userSoforBishoyData.records[email]) {
//       userSoforBishoyData.records[email] = {};
//     }

//     // Convert arrays to newline-separated strings
//     const processedData = {
//       ...restData,
//       madrasaVisits: Array.isArray(restData.madrasaVisits)
//         ? restData.madrasaVisits.join("\n")
//         : restData.madrasaVisits,
//       schoolCollegeVisits: Array.isArray(restData.schoolCollegeVisits)
//         ? restData.schoolCollegeVisits.join("\n")
//         : restData.schoolCollegeVisits,
//     };

//     // Add form data under the current date
//     userSoforBishoyData.records[email][currentDate] = processedData;

//     // Write the updated data back to the file
//     const updatedFileContent = `export const userSoforBishoyData = ${JSON.stringify(
//       userSoforBishoyData,
//       null,
//       2
//     )};`;
//     fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

//     return NextResponse.json(
//       {
//         message: "Submission successful",
//         data: userSoforBishoyData.records[email][currentDate],
//       },
//       {
//         status: 201,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   } catch (error) {
//     console.error("Error saving data:", error);
//     return NextResponse.json(
//       { error: "Failed to save user data." },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(req: NextRequest): Promise<NextResponse> {
//   try {
//     const { searchParams } = new URL(req.url);
//     const email = searchParams.get("email");
//     const today = new Date().toISOString().split("T")[0];

//     if (!email) {
//       return NextResponse.json(
//         { error: "Email is required." },
//         { status: 400 }
//       );
//     }

//     // Check if the data file exists
//     if (!fs.existsSync(userDataPath)) {
//       fs.writeFileSync(
//         userDataPath,
//         `export const userSoforBishoyData = { labelMap: {}, records: {} };`,
//         "utf-8"
//       );
//     }

//     const fileContent = fs.readFileSync(userDataPath, "utf-8");

//     const startIndex = fileContent.indexOf("{");
//     const endIndex = fileContent.lastIndexOf("}");
//     const jsonString = fileContent.slice(startIndex, endIndex + 1);
//     const userSoforBishoyData = eval(`(${jsonString})`);

//     // Check if the user has submitted data today
//     const isSubmittedToday = !!userSoforBishoyData.records[email]?.[today];

//     return NextResponse.json({ isSubmittedToday }, { status: 200 });
//   } catch (error) {
//     console.error("Error checking submission status:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch submission status." },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Ensure you have this path right

// POST: Create SoforBisoyRecord
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, editorContent, madrasaVisits, moktobVisit, schoolCollegeVisits } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // Get user by email
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const currentDate = new Date().toISOString().split("T")[0];
    const date = new Date(currentDate);

    // Check if already submitted
    const existing = await prisma.soforBisoyRecord.findFirst({
      where: {
        userId: user.id,
        date,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already submitted data today." },
        { status: 400 }
      );
    }

    // Save new SoforBisoyRecord
    const newRecord = await prisma.soforBisoyRecord.create({
      data: {
        userId: user.id,
        date,
        madrasaVisit: madrasaVisits?.length || 0,
        moktobVisit: parseInt(moktobVisit || "0"),
        schoolCollegeVisit: schoolCollegeVisits?.length || 0,
        editorContent: editorContent || "",
      },
    });

    return NextResponse.json({ message: "Submission successful", data: newRecord }, { status: 201 });
  } catch (error) {
    console.error("Error saving SoforBisoyRecord:", error);
    return NextResponse.json({ error: "Failed to save record." }, { status: 500 });
  }
}

// GET: Check if SoforBisoyRecord exists for today
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const currentDate = new Date().toISOString().split("T")[0];
    const date = new Date(currentDate);

    const record = await prisma.soforBisoyRecord.findFirst({
      where: {
        userId: user.id,
        date,
      },
    });

    const isSubmittedToday = !!record;

    return NextResponse.json({ isSubmittedToday , data: record ?? null}, { status: 200 });
  } catch (error) {
    console.error("Error checking SoforBisoyRecord:", error);
    return NextResponse.json({ error: "Failed to check submission status." }, { status: 500 });
  }
}
