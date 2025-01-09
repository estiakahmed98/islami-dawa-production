// import fs from "fs";
// import path from "path";
// import { NextRequest, NextResponse } from "next/server";

// const userDataPath = path.join(
//   process.cwd(),
//   "app/data/amoliMuhasabaUserData.ts"
// );

// // import { userAmoliData } from "@/app/data/amoliMuhasabaUserData";

// interface UserData {
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
//   email: string;
// }

// export async function POST(req: NextRequest): Promise<NextResponse> {
//   try {
//     const body: UserData = await req.json();

//     const {
//       tahajjud,
//       ayat,
//       zikir,
//       ishraq,
//       jamat,
//       sirat,
//       Dua,
//       ilm,
//       tasbih,
//       dayeeAmol,
//       amoliSura,
//       ayamroja,
//       hijbulBahar,
//       email,
//     } = body;

//     console.log("Received data:", body);

//     if (
//       !email ||
//       !tahajjud ||
//       !ayat ||
//       !zikir ||
//       !ishraq ||
//       !jamat ||
//       !sirat ||
//       !Dua ||
//       !ilm ||
//       !tasbih ||
//       !dayeeAmol ||
//       !amoliSura ||
//       !ayamroja ||
//       !hijbulBahar
//     ) {
//       return NextResponse.json(
//         { message: "All fields are required" },
//         { status: 400 }
//       );
//     }

//     const currentDate: string = new Date().toISOString().split("T")[0];

//     const dataDir = path.dirname(userDataPath);
//     if (!fs.existsSync(dataDir)) {
//       fs.mkdirSync(dataDir, { recursive: true });
//     }

//     if (!fs.existsSync(userDataPath)) {
//       fs.writeFileSync(userDataPath, "{}"); // Create the file if it doesn't exist
//     }
//     const fileContent: string = fs.readFileSync(userDataPath, "utf-8");

//     let userAmoliData: Record<string, Record<string, UserData>> = {};
//     if (fileContent.trim()) {
//       userAmoliData = JSON.parse(fileContent);
//     }

//     if (!userAmoliData[email]) {
//       userAmoliData[email] = {};
//     }

//     userAmoliData[email][currentDate] = {
//       tahajjud,
//       ayat,
//       zikir,
//       ishraq,
//       jamat,
//       sirat,
//       Dua,
//       ilm,
//       tasbih,
//       dayeeAmol,
//       amoliSura,
//       ayamroja,
//       hijbulBahar,
//       email,
//     };

//     const updatedFileContent = JSON.stringify(userAmoliData, null, 2);
//     fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

//     console.log("Data saved under date:", currentDate);

//     return NextResponse.json(userAmoliData[email][currentDate], {
//       status: 201,
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { message: "Failed to save user data" },
//       { status: 500 }
//     );
//   }
// }

import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const userDataPath = path.join(
  process.cwd(),
  "app/data/amoliMuhasabaUserData.ts"
);

type AmoliBisoyData = {
  tahajjud: string;
  ayat: string;
  zikir: string;
  ishraq: string;
  jamat: string;
  sirat: string;
  Dua: string;
  ilm: string;
  tasbih: string;
  dayeeAmol: string;
  amoliSura: string;
  ayamroja: string;
  hijbulBahar: string;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const {
      tahajjud,
      ayat,
      zikir,
      ishraq,
      jamat,
      sirat,
      Dua,
      ilm,
      tasbih,
      dayeeAmol,
      amoliSura,
      ayamroja,
      hijbulBahar,
      email,
    } = body as AmoliBisoyData & { email: string };

    console.log("Received data:", body);

    // Basic validation
    if (
      !email ||
      !tahajjud ||
      !ayat ||
      !zikir ||
      !ishraq ||
      !jamat ||
      !sirat ||
      !Dua ||
      !ilm ||
      !tasbih ||
      !dayeeAmol ||
      !amoliSura ||
      !ayamroja ||
      !hijbulBahar
    ) {
      return new NextResponse("All fields are required", { status: 400 });
    }

    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split("T")[0];

    // Check if the file exists; if not, initialize it
    if (!fs.existsSync(userDataPath)) {
      fs.writeFileSync(
        userDataPath,
        `export const userAmoliBisoyData = {};`,
        "utf-8"
      );
    }

    // Read the existing user data file
    const fileContent = fs.readFileSync(userDataPath, "utf-8");

    // Parse existing data
    let userAmoliBisoyData: Record<string, Record<string, AmoliBisoyData>> = {};
    const startIndex = fileContent.indexOf("{");
    const endIndex = fileContent.lastIndexOf("}");
    if (startIndex !== -1 && endIndex !== -1) {
      const jsonString = fileContent.slice(startIndex, endIndex + 1);
      userAmoliBisoyData = eval(`(${jsonString})`);
    }

    // Ensure the user's data is organized by email
    if (!userAmoliBisoyData[email]) {
      userAmoliBisoyData[email] = {};
    }

    // Add form data under the current date
    userAmoliBisoyData[email][currentDate] = {
      tahajjud,
      ayat,
      zikir,
      ishraq,
      jamat,
      sirat,
      Dua,
      ilm,
      tasbih,
      dayeeAmol,
      amoliSura,
      ayamroja,
      hijbulBahar,
    };

    // Write the updated userData back to the file
    const updatedFileContent = `export const userAmoliBisoyData = ${JSON.stringify(
      userAmoliBisoyData,
      null,
      2
    )};`;
    fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

    console.log("Data saved under date:", currentDate);
    return new NextResponse(
      JSON.stringify(userAmoliBisoyData[email][currentDate]),
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse("Failed to save user data", { status: 500 });
  }
}
