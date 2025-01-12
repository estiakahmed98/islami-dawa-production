// import fs from "fs";
// import path from "path";
// import { NextRequest, NextResponse } from "next/server";

// const userDataPath = path.join(process.cwd(), "app/data/talimBisoyUserData.ts");

// interface TalimBisoyData {
//   [email: string]: {
//     [date: string]: {
//       mohilaTalim: string;
//       TalimOngshoGrohon: string;
//     };
//   };
// }

// export async function POST(req: NextRequest): Promise<NextResponse> {
//   try {
//     const { mohilaTalim, TalimOngshoGrohon, email } = await req.json();

//     console.log("Received data:", {
//       mohilaTalim,
//       TalimOngshoGrohon,
//       email,
//     });

//     // Basic validation
//     if (!email || !mohilaTalim || !TalimOngshoGrohon) {
//       return new NextResponse("All fields are required", { status: 400 });
//     }

//     // Get the current date in YYYY-MM-DD format
//     const currentDate = new Date().toISOString().split("T")[0];

//     // Read the existing user data file
//     let fileContent = "{}";
//     if (fs.existsSync(userDataPath)) {
//       fileContent = fs.readFileSync(userDataPath, "utf-8");
//     }

//     // Parse existing data
//     let userTalimBisoyData: TalimBisoyData = {};
//     try {
//       const startIndex = fileContent.indexOf("{");
//       const endIndex = fileContent.lastIndexOf("}");
//       if (startIndex !== -1 && endIndex !== -1) {
//         const jsonString = fileContent.slice(startIndex, endIndex + 1);
//         userTalimBisoyData = JSON.parse(jsonString);
//       }
//     } catch (e) {
//       console.error("Error parsing JSON:", e);
//     }

//     // Ensure the user's data is organized by email
//     if (!userTalimBisoyData[email]) {
//       userTalimBisoyData[email] = {};
//     }

//     // Add form data under the current date
//     userTalimBisoyData[email][currentDate] = {
//       mohilaTalim,
//       TalimOngshoGrohon,
//     };

//     // Write the updated userData back to the file
//     const updatedFileContent = `export const userTalimBisoyData = ${JSON.stringify(
//       userTalimBisoyData,
//       null,
//       2
//     )};`;
//     fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

//     console.log("Data saved under date:", currentDate);
//     return new NextResponse(
//       JSON.stringify(userTalimBisoyData[email][currentDate]),
//       {
//         status: 201,
//       }
//     );
//   } catch (error) {
//     console.error("Error saving data:", error);
//     return new NextResponse("Failed to save user data", { status: 500 });
//   }
// }

import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

// Path to the user data file
const userDataPath = path.join(
  process.cwd(),
  "app/data/talimBisoyUserData.ts"
);

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
        `export const userTalimBisoyData = { labelMap: {}, records: {} };`,
        "utf-8"
      );
    }

    // Read the existing data file
    const fileContent = fs.readFileSync(userDataPath, "utf-8");

    // Parse existing data
    let userTalimBisoyData: {
      labelMap: object;
      records: Record<string, Record<string, TalimBisoyData>>;
    } = {
      labelMap: {},
      records: {},
    };

    const startIndex = fileContent.indexOf("{");
    const endIndex = fileContent.lastIndexOf("}");
    if (startIndex !== -1 && endIndex !== -1) {
      const jsonString = fileContent.slice(startIndex, endIndex + 1);
      userTalimBisoyData = eval(`(${jsonString})`);
    }

    // Ensure `records` key exists
    if (!userTalimBisoyData.records) {
      userTalimBisoyData.records = {};
    }

    // Ensure data is organized by email
    if (!userTalimBisoyData.records[email]) {
      userTalimBisoyData.records[email] = {};
    }

    // Add form data under the current date
    userTalimBisoyData.records[email][currentDate] = {
      ...userTalimBisoyData.records[email][currentDate], // Preserve existing data for the date
      ...data, // Merge new data
    };

    // Write the updated data back to the file
    const updatedFileContent = `export const userTalimBisoyData = ${JSON.stringify(
      userTalimBisoyData,
      null,
      2
    )};`;
    fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

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

