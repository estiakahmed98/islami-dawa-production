//Faysal Updated by //Juwel

import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

// Path to the user data file
const userDataPath = path.join(
  process.cwd(),
  "app/data/soforBishoyUserData.ts"
);

// Type definitions
interface SoforBishoyData {
  madrasaVisits: string[];
  schoolCollegeVisits: string[];
  editorContent?: string;
  [key: string]: string | string[] | undefined;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, ...data } = body as SoforBishoyData & { email: string };

    console.log("Received data:", body);

    // Basic validation
    if (!email || Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Email and data are required." },
        { status: 400 }
      );
    }

    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split("T")[0];

    // Check if the data file exists; if not, create it
    if (!fs.existsSync(userDataPath)) {
      fs.writeFileSync(
        userDataPath,
        `export const userSoforBishoyData = { labelMap: {}, records: {} };`,
        "utf-8"
      );
    }

    // Read the existing data file
    const fileContent = fs.readFileSync(userDataPath, "utf-8");

    // Parse existing data
    let userSoforBishoyData: {
      labelMap: object;
      records: Record<string, Record<string, SoforBishoyData>>;
    } = {
      labelMap: {},
      records: {},
    };

    const startIndex = fileContent.indexOf("{");
    const endIndex = fileContent.lastIndexOf("}");
    if (startIndex !== -1 && endIndex !== -1) {
      const jsonString = fileContent.slice(startIndex, endIndex + 1);
      userSoforBishoyData = eval(`(${jsonString})`);
    }

    // Ensure `records` key exists
    if (!userSoforBishoyData.records) {
      userSoforBishoyData.records = {};
    }

    // Check if the user has already submitted today
    if (userSoforBishoyData.records[email]?.[currentDate]) {
      return NextResponse.json(
        { error: "You have already submitted data today." },
        { status: 400 }
      );
    }

    // Ensure data is organized by email
    if (!userSoforBishoyData.records[email]) {
      userSoforBishoyData.records[email] = {};
    }

    // Add form data under the current date
    userSoforBishoyData.records[email][currentDate] = {
      ...data,
    };

    // Write the updated data back to the file
    const updatedFileContent = `export const userSoforBishoyData = ${JSON.stringify(
      userSoforBishoyData,
      null,
      2
    )};`;
    fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

    console.log("Data saved under date:", currentDate);
    return NextResponse.json(
      {
        message: "Submission successful",
        data: userSoforBishoyData.records[email][currentDate],
      },
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json(
      { error: "Failed to save user data." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const today = new Date().toISOString().split("T")[0];

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    // Check if the data file exists
    if (!fs.existsSync(userDataPath)) {
      fs.writeFileSync(
        userDataPath,
        `export const userSoforBishoyData = { labelMap: {}, records: {} };`,
        "utf-8"
      );
    }

    const fileContent = fs.readFileSync(userDataPath, "utf-8");

    const startIndex = fileContent.indexOf("{");
    const endIndex = fileContent.lastIndexOf("}");
    const jsonString = fileContent.slice(startIndex, endIndex + 1);
    const userSoforBishoyData = eval(`(${jsonString})`);

    // Check if the user has submitted data today
    const isSubmittedToday = !!userSoforBishoyData.records[email]?.[today];

    return NextResponse.json({ isSubmittedToday }, { status: 200 });
  } catch (error) {
    console.error("Error checking submission status:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission status." },
      { status: 500 }
    );
  }
}

// import fs from "fs";
// import path from "path";
// import { NextRequest, NextResponse } from "next/server";

// const userDataPath = path.join(process.cwd(), "app/data/dineferaUserData.ts");

// // Type definitions
// interface UserDineFeraData {
//   [key: string]: string | number;
// }

// export async function POST(req: NextRequest): Promise<NextResponse> {
//   try {
//     const body = await req.json();
//     const { email, ...data } = body as UserDineFeraData & { email: string };

//     console.log("Received data:", body);

//     // Basic validation
//     if (!email || Object.keys(data).length === 0) {
//       return new NextResponse("Email and data are required", { status: 400 });
//     }

//     // Get the current date in YYYY-MM-DD format
//     const currentDate = new Date().toISOString().split("T")[0];

//     // Check if the data file exists; if not, create it
//     if (!fs.existsSync(userDataPath)) {
//       fs.writeFileSync(
//         userDataPath,
//         `export const userDineFeraData = { labelMap: {}, records: {} };`,
//         "utf-8"
//       );
//     }

//     // Read the existing data file
//     const fileContent = fs.readFileSync(userDataPath, "utf-8");

//     // Parse existing data
//     let userDineFeraData: {
//       labelMap: object;
//       records: Record<string, Record<string, UserDineFeraData>>;
//     } = {
//       labelMap: {},
//       records: {},
//     };

//     const startIndex = fileContent.indexOf("{");
//     const endIndex = fileContent.lastIndexOf("}");
//     if (startIndex !== -1 && endIndex !== -1) {
//       const jsonString = fileContent.slice(startIndex, endIndex + 1);
//       userDineFeraData = eval(`(${jsonString})`);
//     }

//     // Ensure `records` key exists
//     if (!userDineFeraData.records) {
//       userDineFeraData.records = {};
//     }

//     // Check if the user has already submitted today
//     if (userDineFeraData.records[email]?.[currentDate]) {
//       return NextResponse.json(
//         { error: "You have already submitted data today." },
//         { status: 400 }
//       );
//     }

//     // Ensure data is organized by email
//     if (!userDineFeraData.records[email]) {
//       userDineFeraData.records[email] = {};
//     }

//     // Add form data under the current date
//     userDineFeraData.records[email][currentDate] = {
//       ...data,
//     };

//     // Write the updated data back to the file
//     const updatedFileContent = `export const userDineFeraData = ${JSON.stringify(
//       userDineFeraData,
//       null,
//       2
//     )};`;
//     fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

//     console.log("Data saved under date:", currentDate);
//     return NextResponse.json(
//       {
//         message: "Submission successful",
//         data: userDineFeraData.records[email][currentDate],
//       },
//       {
//         status: 201,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   } catch (error) {
//     console.error("Error saving data:", error);
//     return new NextResponse("Failed to save user data", { status: 500 });
//   }
// }

// export async function GET(req: NextRequest): Promise<NextResponse> {
//   const { searchParams } = new URL(req.url);
//   const email = searchParams.get("email");
//   const today = new Date().toISOString().split("T")[0];

//   if (!email) {
//     return NextResponse.json({ error: "Email is required" }, { status: 400 });
//   }

//   try {
//     if (!fs.existsSync(userDataPath)) {
//       fs.writeFileSync(
//         userDataPath,
//         `export const userDineFeraData = {};`,
//         "utf-8"
//       );
//     }

//     const fileContent = fs.readFileSync(userDataPath, "utf-8");
//     const startIndex = fileContent.indexOf("{");
//     const endIndex = fileContent.lastIndexOf("}");
//     const jsonString = fileContent.slice(startIndex, endIndex + 1);
//     const userDineFeraData = eval(`(${jsonString})`);

//     const isSubmittedToday = !!userDineFeraData.records[email]?.[today];
//     return NextResponse.json({ isSubmittedToday }, { status: 200 });
//   } catch (error) {
//     console.error("Error reading submission status:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch submission status" },
//       { status: 500 }
//     );
//   }
// }
