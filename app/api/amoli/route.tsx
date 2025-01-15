import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

// Path to the user data file
const userDataPath = path.join(
  process.cwd(),
  "app/data/amoliMuhasabaUserData.ts"
);

// Type definitions
interface UserAmoliData {
  tahajjud?: string;
  ayat?: string;
  zikir?: string;
  ishraq?: string;
  jamat?: string;
  sirat?: string;
  Dua?: string;
  ilm?: string;
  tasbih?: string;
  dayeeAmol?: string;
  amoliSura?: string;
  ayamroja?: string;
  hijbulBahar?: string;
  percentage?: string;
  [key: string]: string | undefined;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, ...data } = body as UserAmoliData & { email: string };

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
        `export const userAmoliData = { labelMap: {}, records: {} };`,
        "utf-8"
      );
    }

    // Read the existing data file
    const fileContent = fs.readFileSync(userDataPath, "utf-8");

    // Parse existing data
    let userAmoliData: {
      labelMap: object;
      records: Record<string, Record<string, UserAmoliData>>;
    } = {
      labelMap: {},
      records: {},
    };

    const startIndex = fileContent.indexOf("{");
    const endIndex = fileContent.lastIndexOf("}");
    if (startIndex !== -1 && endIndex !== -1) {
      const jsonString = fileContent.slice(startIndex, endIndex + 1);
      userAmoliData = eval(`(${jsonString})`);
    }

    // Ensure `records` key exists
    if (!userAmoliData.records) {
      userAmoliData.records = {};
    }

    // Check if the user has already submitted today
    if (userAmoliData.records[email]?.[currentDate]) {
      return NextResponse.json(
        { error: "You have already submitted data today." },
        { status: 400 }
      );
    }

    // Ensure data is organized by email
    if (!userAmoliData.records[email]) {
      userAmoliData.records[email] = {};
    }

    // Add form data under the current date
    userAmoliData.records[email][currentDate] = {
      ...data,
    };

    // Write the updated data back to the file
    const updatedFileContent = `export const userAmoliData = ${JSON.stringify(
      userAmoliData,
      null,
      2
    )};`;
    fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

    console.log("Data saved under date:", currentDate);
    return NextResponse.json(
      {
        message: "Submission successful",
        data: userAmoliData.records[email][currentDate],
      },
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const today = new Date().toISOString().split("T")[0];

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    if (!fs.existsSync(userDataPath)) {
      fs.writeFileSync(
        userDataPath,
        `export const userAmoliData = {};`,
        "utf-8"
      );
    }

    const fileContent = fs.readFileSync(userDataPath, "utf-8");
    const startIndex = fileContent.indexOf("{");
    const endIndex = fileContent.lastIndexOf("}");
    const jsonString = fileContent.slice(startIndex, endIndex + 1);
    const userAmoliData = eval(`(${jsonString})`);

    const isSubmittedToday = !!userAmoliData.records[email]?.[today];
    return NextResponse.json({ isSubmittedToday }, { status: 200 });
  } catch (error) {
    console.error("Error reading submission status:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission status" },
      { status: 500 }
    );
  }
}

// import fs from "fs";
// import path from "path";
// import { NextRequest, NextResponse } from "next/server";

// const userDataPath = path.join(
//   process.cwd(),
//   "app/data/amoliMuhasabaUserData.ts"
// );

// type AmoliBisoyData = {
//   tahajjud: string;
//   ayat: string;
//   zikir: string;
//   ishraq: string;
//   jamat: string;
//   sirat: string;
//   Dua: string;
//   ilm: string;
//   tasbih: string;
//   dayeeAmol: string;
//   amoliSura: string;
//   ayamroja: string;
//   hijbulBahar: string;
//   percentage: string;
// };

// export async function POST(req: NextRequest): Promise<NextResponse> {
//   try {
//     const body = await req.json();
//     const { email, ...data } = body as AmoliBisoyData & { email: string };

//     console.log("Received data:", body);

//     // Basic validation
//     if (!email || Object.keys(data).length === 0) {
//       return new NextResponse("Email and data are required", { status: 400 });
//     }

//     // Get the current date in YYYY-MM-DD format
//     const currentDate = new Date().toISOString().split("T")[0];

//     // Check if the data file exists; if not, initialize it
//     if (!fs.existsSync(userDataPath)) {
//       fs.writeFileSync(
//         userDataPath,
//         `export const userAmoliBisoyData = { records: {} };`,
//         "utf-8"
//       );
//     }

//     // Read the existing data file
//     const fileContent = fs.readFileSync(userDataPath, "utf-8");

//     // Parse existing data
//     let userAmoliBisoyData: {
//       records: Record<string, Record<string, AmoliBisoyData>>;
//     } = { records: {} };

//     const startIndex = fileContent.indexOf("{");
//     const endIndex = fileContent.lastIndexOf("}");
//     if (startIndex !== -1 && endIndex !== -1) {
//       const jsonString = fileContent.slice(startIndex, endIndex + 1);
//       userAmoliBisoyData = eval(`(${jsonString})`);
//     }

//     // Ensure `records` key exists
//     if (!userAmoliBisoyData.records) {
//       userAmoliBisoyData.records = {};
//     }

//     // Ensure data is organized by email
//     if (!userAmoliBisoyData.records[email]) {
//       userAmoliBisoyData.records[email] = {};
//     }

//     // Add form data under the current date
//     userAmoliBisoyData.records[email][currentDate] = {
//       ...userAmoliBisoyData.records[email][currentDate], // Preserve existing data for the date
//       ...data, // Merge new data
//     };

//     // Write the updated data back to the file
//     const updatedFileContent = `export const userAmoliBisoyData = ${JSON.stringify(
//       userAmoliBisoyData,
//       null,
//       2
//     )};`;
//     fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

//     console.log("Data saved under date:", currentDate);
//     return new NextResponse(
//       JSON.stringify(userAmoliBisoyData.records[email][currentDate]),
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
