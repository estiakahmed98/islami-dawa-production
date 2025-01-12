// import fs from "fs";
// import path from "path";
// import { NextRequest, NextResponse } from "next/server";

// const userDataPath = path.join(process.cwd(), "app/data/dawatiMojlishUserData.ts");

// interface DawatiMojlishData {
//   [email: string]: {
//     [date: string]: {
//       dawatterGuruttoMojlish: string;
//       mojlisheOnshogrohon: string;
//       prosikkhonKormoshalaAyojon: string;
//       prosikkhonOnshogrohon: string;
//       jummahAlochona: string;
//       dhormoSova: string;
//       mashwaraPoint: string;
//     };
//   };
// }

// export async function POST(req: NextRequest) {
//   try {
//     const {
//       dawatterGuruttoMojlish,
//       mojlisheOnshogrohon,
//       prosikkhonKormoshalaAyojon,
//       prosikkhonOnshogrohon,
//       jummahAlochona,
//       dhormoSova,
//       mashwaraPoint,
//       email,
//     }: {
//       dawatterGuruttoMojlish: string;
//       mojlisheOnshogrohon: string;
//       prosikkhonKormoshalaAyojon: string;
//       prosikkhonOnshogrohon: string;
//       jummahAlochona: string;
//       dhormoSova: string;
//       mashwaraPoint: string;
//       email: string;
//     } = await req.json();

//     console.log("Received data:", {
//       dawatterGuruttoMojlish,
//       mojlisheOnshogrohon,
//       prosikkhonKormoshalaAyojon,
//       prosikkhonOnshogrohon,
//       jummahAlochona,
//       dhormoSova,
//       mashwaraPoint,
//       email,
//     });

//     // Basic validation
//     if (
//       !email ||
//       !dawatterGuruttoMojlish ||
//       !mojlisheOnshogrohon ||
//       !prosikkhonKormoshalaAyojon ||
//       !prosikkhonOnshogrohon ||
//       !jummahAlochona ||
//       !dhormoSova ||
//       !mashwaraPoint
//     ) {
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
//     let userDawatiMojlishData: DawatiMojlishData = {};
//     try {
//       const startIndex = fileContent.indexOf("{");
//       const endIndex = fileContent.lastIndexOf("}");
//       if (startIndex !== -1 && endIndex !== -1) {
//         const jsonString = fileContent.slice(startIndex, endIndex + 1);
//         userDawatiMojlishData = JSON.parse(jsonString);
//       }
//     } catch (e) {
//       console.error("Error parsing JSON:", e);
//     }

//     // Ensure the user's data is organized by email
//     if (!userDawatiMojlishData[email]) {
//       userDawatiMojlishData[email] = {};
//     }

//     // Add form data under the current date
//     userDawatiMojlishData[email][currentDate] = {
//       dawatterGuruttoMojlish,
//       mojlisheOnshogrohon,
//       prosikkhonKormoshalaAyojon,
//       prosikkhonOnshogrohon,
//       jummahAlochona,
//       dhormoSova,
//       mashwaraPoint,
//     };

//     // Write the updated userData back to the file
//     const updatedFileContent = `export const userDawatiMojlishData = ${JSON.stringify(
//       userDawatiMojlishData,
//       null,
//       2
//     )};`;
//     fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

//     console.log("Data saved under date:", currentDate);
//     return NextResponse.json({ [email]: userDawatiMojlishData[email][currentDate] }, { status: 201 });
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
  "app/data/dawatiMojlishUserData.ts"
);

// Type definitions
interface DawatiMojlishData {
  [key: string]: string | number;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, ...data } = body as DawatiMojlishData & { email: string };

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
        `export const userDawatiMojlishData = { labelMap: {}, records: {} };`,
        "utf-8"
      );
    }

    // Read the existing data file
    const fileContent = fs.readFileSync(userDataPath, "utf-8");

    // Parse existing data
    let userDawatiMojlishData: {
      labelMap: object;
      records: Record<string, Record<string, DawatiMojlishData>>;
    } = {
      labelMap: {},
      records: {},
    };

    const startIndex = fileContent.indexOf("{");
    const endIndex = fileContent.lastIndexOf("}");
    if (startIndex !== -1 && endIndex !== -1) {
      const jsonString = fileContent.slice(startIndex, endIndex + 1);
      userDawatiMojlishData = eval(`(${jsonString})`);
    }

    // Ensure `records` key exists
    if (!userDawatiMojlishData.records) {
      userDawatiMojlishData.records = {};
    }

    // Ensure data is organized by email
    if (!userDawatiMojlishData.records[email]) {
      userDawatiMojlishData.records[email] = {};
    }

    // Add form data under the current date
    userDawatiMojlishData.records[email][currentDate] = {
      ...userDawatiMojlishData.records[email][currentDate], // Preserve existing data for the date
      ...data, // Merge new data
    };

    // Write the updated data back to the file
    const updatedFileContent = `export const userDawatiMojlishData = ${JSON.stringify(
      userDawatiMojlishData,
      null,
      2
    )};`;
    fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

    console.log("Data saved under date:", currentDate);
    return new NextResponse(
      JSON.stringify(userDawatiMojlishData.records[email][currentDate]),
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
