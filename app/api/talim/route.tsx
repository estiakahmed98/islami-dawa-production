//Faysal Updated by //Juwel

import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

// Path to the user data file
const userDataPath = path.join(process.cwd(), "app/data/talimBisoyUserData.ts");

// Type definitions
interface TalimBisoyData {
  [key: string]: string | number;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, ...data } = body as TalimBisoyData & { email: string };

    console.log("Received data:", body);

    // Basic validation
    if (!email || Object.keys(data).length === 0) {
      return new NextResponse("Email and data are required", { status: 400 });
    }

    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split("T")[0];

    // Check if the data file exists; if not, create it
    if (!fs.existsSync(userDataPath)) {
      fs.writeFileSync(
        userDataPath,
        `export const userTalimBisoyData = { records: {} };`,
        "utf-8"
      );
    }

    // Read the existing data file
    const fileContent = fs.readFileSync(userDataPath, "utf-8");
    const userTalimBisoyData = eval(
      `(${fileContent.slice(
        fileContent.indexOf("{"),
        fileContent.lastIndexOf("}") + 1
      )})`
    );

    // Ensure data is organized by email
    if (!userTalimBisoyData.records[email]) {
      userTalimBisoyData.records[email] = {};
    }

    // Check if the user has already submitted today
    if (userTalimBisoyData.records[email][currentDate]) {
      return NextResponse.json(
        { error: "You have already submitted data today." },
        { status: 400 }
      );
    }

    // Add form data under the current date
    userTalimBisoyData.records[email][currentDate] = { ...data };

    // Write the updated data back to the file
    fs.writeFileSync(
      userDataPath,
      `export const userTalimBisoyData = ${JSON.stringify(
        userTalimBisoyData,
        null,
        2
      )};`,
      "utf-8"
    );

    console.log("Data saved under date:", currentDate);
    return new NextResponse(
      JSON.stringify(userTalimBisoyData.records[email][currentDate]),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error saving data:", error);
    return new NextResponse("Failed to save user data", { status: 500 });
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const today = new Date().toISOString().split("T")[0];

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    if (!fs.existsSync(userDataPath)) {
      return NextResponse.json({ isSubmittedToday: false }, { status: 200 });
    }

    const fileContent = fs.readFileSync(userDataPath, "utf-8");
    const userTalimBisoyData = eval(
      `(${fileContent.slice(
        fileContent.indexOf("{"),
        fileContent.lastIndexOf("}") + 1
      )})`
    );

    const isSubmittedToday = !!userTalimBisoyData.records[email]?.[today];
    return NextResponse.json({ isSubmittedToday }, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new NextResponse("Failed to fetch user data", { status: 500 });
  }
}

// import fs from "fs";
// import path from "path";
// import { NextRequest, NextResponse } from "next/server";

// // Path to the user data file
// const userDataPath = path.join(
//   process.cwd(),
//   "app/data/talimBisoyUserData.ts"
// );

// // Type definitions
// interface TalimBisoyData {
//   [key: string]: string | number;
// }

// export async function POST(req: NextRequest): Promise<NextResponse> {
//   try {
//     const body = await req.json();
//     const { email, ...data } = body as TalimBisoyData & { email: string };

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
//         `export const userTalimBisoyData = { labelMap: {}, records: {} };`,
//         "utf-8"
//       );
//     }

//     // Read the existing data file
//     const fileContent = fs.readFileSync(userDataPath, "utf-8");

//     // Parse existing data
//     let userTalimBisoyData: {
//       labelMap: object;
//       records: Record<string, Record<string, TalimBisoyData>>;
//     } = {
//       labelMap: {},
//       records: {},
//     };

//     const startIndex = fileContent.indexOf("{");
//     const endIndex = fileContent.lastIndexOf("}");
//     if (startIndex !== -1 && endIndex !== -1) {
//       const jsonString = fileContent.slice(startIndex, endIndex + 1);
//       userTalimBisoyData = eval(`(${jsonString})`);
//     }

//     // Ensure `records` key exists
//     if (!userTalimBisoyData.records) {
//       userTalimBisoyData.records = {};
//     }

//     // Ensure data is organized by email
//     if (!userTalimBisoyData.records[email]) {
//       userTalimBisoyData.records[email] = {};
//     }

//     // Add form data under the current date
//     userTalimBisoyData.records[email][currentDate] = {
//       ...userTalimBisoyData.records[email][currentDate], // Preserve existing data for the date
//       ...data, // Merge new data
//     };

//     // Write the updated data back to the file
//     const updatedFileContent = `export const userTalimBisoyData = ${JSON.stringify(
//       userTalimBisoyData,
//       null,
//       2
//     )};`;
//     fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

//     console.log("Data saved under date:", currentDate);
//     return new NextResponse(
//       JSON.stringify(userTalimBisoyData.records[email][currentDate]),
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
