// app/api/signup/route.tsx
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
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
    } = await req.json();

    // Basic validation
    if (
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
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Save data to the database
    const amolidata = await prisma.amoliMuhasabaData.create({
      data: {
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
      },
    });

    console.log(amolidata);
    return NextResponse.json(amolidata, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "User creation failed" }, { status: 500 });
  }
}
