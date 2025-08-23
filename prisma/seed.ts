import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Sample users data
const users = [
  {
    email: "estiakahmed898@gmail.com",
    name: "Estiak Ahmed",
    role: "centraladmin",
    division: "Dhaka",
    district: "Dhaka",
    upazila: "Dhaka",
    union: "Dhaka",
    area: "Dhaka",
    markaz: "Dhaka Central",
    phone: "01720151612",
    emailVerified: true,
    banned: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    email: "admin@example.com",
    name: "Division Admin",
    role: "divisionadmin",
    division: "Chittagong",
    district: "Chittagong",
    upazila: "Chittagong",
    union: "Chittagong",
    area: "Chittagong",
    markaz: "Chittagong Central",
    phone: "01700000000",
    emailVerified: true,
    banned: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    email: "daye@example.com",
    name: "Sample Daye",
    role: "daye",
    division: "Dhaka",
    district: "Dhaka",
    upazila: "Dhaka",
    union: "Dhaka",
    area: "Dhaka",
    markaz: "Dhaka Central",
    phone: "01800000000",
    emailVerified: true,
    banned: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// Sample Amoli Muhasaba data
const amoliData = [
  {
    date: new Date("2025-02-11"),
    tahajjud: 20,
    surah: "সুরা রাদ",
    ayat: "200",
    zikir: "সকাল",
    ishraq: "ইশরাক-আওয়াবীন-চাশ্ত",
    jamat: 5,
    sirat: "bukhari",
    Dua: "হ্যাঁ",
    ilm: "muslim",
    tasbih: "হ্যাঁ",
    dayeeAmol: "হ্যাঁ",
    amoliSura: "হ্যাঁ",
    ayamroja: "",
    hijbulBahar: "হ্যাঁ",
    percentage: "100.00",
    editorContent: "",
  },
  {
    date: new Date("2025-02-10"),
    tahajjud: 10,
    surah: "সুরা রাদ",
    ayat: "100",
    zikir: "সকাল-সন্ধ্যা",
    ishraq: "ইশরাক-আওয়াবীন-চাশ্ত",
    jamat: 5,
    sirat: "bukhari",
    Dua: "হ্যাঁ",
    ilm: "muslim",
    tasbih: "হ্যাঁ",
    dayeeAmol: "হ্যাঁ",
    amoliSura: "হ্যাঁ",
    ayamroja: "",
    hijbulBahar: "হ্যাঁ",
    percentage: "95.00",
    editorContent: "",
  },
];

// Sample Dawati Bisoy data
const dawatiBisoyData = [
  {
    date: new Date("2025-02-10"),
    nonMuslimDawat: 5,
    murtadDawat: 2,
    alemderSatheyMojlish: 3,
    publicSatheyMojlish: 4,
    nonMuslimSaptahikGasht: 2,
    editorContent: "",
  },
  {
    date: new Date("2025-02-11"),
    nonMuslimDawat: 3,
    murtadDawat: 1,
    alemderSatheyMojlish: 2,
    publicSatheyMojlish: 3,
    nonMuslimSaptahikGasht: 1,
    editorContent: "",
  },
];

// Sample Moktob Bisoy data
const moktobBisoyData = [
  {
    date: new Date("2025-02-10"),
    notunMoktobChalu: 10,
    totalMoktob: 10,
    totalStudent: 10,
    obhibhabokConference: 10,
    moktoThekeMadrasaAdmission: 10,
    notunBoyoskoShikkha: 10,
    totalBoyoskoShikkha: 10,
    boyoskoShikkhaOnshogrohon: 39,
    newMuslimeDinerFikir: 10,
    editorContent: "",
  },
  {
    date: new Date("2025-02-11"),
    notunMoktobChalu: 8,
    totalMoktob: 12,
    totalStudent: 15,
    obhibhabokConference: 5,
    moktoThekeMadrasaAdmission: 8,
    notunBoyoskoShikkha: 6,
    totalBoyoskoShikkha: 12,
    boyoskoShikkhaOnshogrohon: 25,
    newMuslimeDinerFikir: 7,
    editorContent: "",
  },
];

// Sample Leave Requests
const leaveRequests = [
  {
    leaveType: "Casual",
    fromDate: new Date("2025-04-19"),
    toDate: new Date("2025-04-19"),
    days: 1,
    reason: "Sick",
    approvedBy: "Estiak",
    status: "approved",
    phone: "01720151612",
    name: "Estiak Ahmed",
  },
  {
    leaveType: "Maternity",
    fromDate: new Date("2025-04-30"),
    toDate: new Date("2025-05-01"),
    days: 2,
    reason: "Need Leave",
    approvedBy: "Admin",
    status: "rejected",
    phone: "01720151612",
    name: "Estiak Ahmed",
  },
];

// Sample Tasks
const tasks = [
  {
    title: "Daily Report Submission",
    description: "Submit daily amoli muhasaba report",
    date: new Date("2025-02-12"),
    time: "09:00",
    visibility: "private",
    division: "Dhaka",
    district: "Dhaka",
    upazila: "Dhaka",
    union: "Dhaka",
    creatorRole: "centraladmin",
    completed: false,
  },
  {
    title: "Weekly Meeting",
    description: "Attend weekly coordination meeting",
    date: new Date("2025-02-15"),
    time: "14:00",
    visibility: "public",
    division: "Dhaka",
    district: "Dhaka",
    upazila: "Dhaka",
    union: "Dhaka",
    creatorRole: "centraladmin",
    completed: false,
  },
];

// Sample Edit Requests
const editRequests = [
  {
    email: "estiakahmed898@gmail.com",
    name: "Estiak Ahmed",
    phone: "01720151612",
    date: new Date("2025-02-10"),
    reason: "Need to correct data entry mistake",
    division: "Dhaka",
    district: "Dhaka",
    upazila: "Dhaka",
    union: "Dhaka",
    role: "centraladmin",
    status: "approved",
    editedOnce: false,
  },
];

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data (optional - remove in production)
    console.log("🧹 Cleaning existing data...");
    await prisma.editRequest.deleteMany();
    await prisma.task.deleteMany();
    await prisma.leaveRequest.deleteMany();
    await prisma.assistantDaee.deleteMany();
    await prisma.dayeeBishoyRecord.deleteMany();
    await prisma.moktobBisoyRecord.deleteMany();
    await prisma.talimBisoyRecord.deleteMany();
    await prisma.soforBisoyRecord.deleteMany();
    await prisma.dineFeraRecord.deleteMany();
    await prisma.jamatBisoyRecord.deleteMany();
    await prisma.dawatiMojlishRecord.deleteMany();
    await prisma.dawatiBisoyRecord.deleteMany();
    await prisma.amoliMuhasaba.deleteMany();
    await prisma.calendarEvent.deleteMany();
    await prisma.sessions.deleteMany();
    await prisma.accounts.deleteMany();
    await prisma.users.deleteMany();

    // Create users
    console.log("👥 Creating users...");
    const createdUsers = [];
    for (const userData of users) {
      const user = await prisma.users.create({
        data: userData,
      });
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.email}`);
    }

    // Get the first user (Estiak Ahmed) for sample data
    const mainUser = createdUsers[0];

    // Create Amoli Muhasaba records
    console.log("📊 Creating Amoli Muhasaba records...");
    for (const data of amoliData) {
      await prisma.amoliMuhasaba.create({
        data: {
          ...data,
          userId: mainUser.id,
        },
      });
    }

    // Create Dawati Bisoy records
    console.log("📈 Creating Dawati Bisoy records...");
    for (const data of dawatiBisoyData) {
      await prisma.dawatiBisoyRecord.create({
        data: {
          ...data,
          userId: mainUser.id,
        },
      });
    }

    // Create Moktob Bisoy records
    console.log("🏫 Creating Moktob Bisoy records...");
    for (const data of moktobBisoyData) {
      await prisma.moktobBisoyRecord.create({
        data: {
          ...data,
          userId: mainUser.id,
        },
      });
    }

    // Create sample records for other categories
    console.log("📝 Creating other category records...");

    // Dawati Mojlish
    await prisma.dawatiMojlishRecord.create({
      data: {
        userId: mainUser.id,
        date: new Date("2025-02-10"),
        dawatterGuruttoMojlish: 5,
        mojlisheOnshogrohon: 10,
        prosikkhonKormoshalaAyojon: 2,
        prosikkhonOnshogrohon: 15,
        jummahAlochona: 3,
        dhormoSova: 2,
        mashwaraPoint: 4,
        editorContent: "",
      },
    });

    // Jamat Bisoy
    await prisma.jamatBisoyRecord.create({
      data: {
        userId: mainUser.id,
        date: new Date("2025-02-10"),
        jamatBerHoise: 8,
        jamatSathi: 12,
        editorContent: "",
      },
    });

    // Dine Fera
    await prisma.dineFeraRecord.create({
      data: {
        userId: mainUser.id,
        date: new Date("2025-02-10"),
        nonMuslimMuslimHoise: 3,
        murtadIslamFireche: 2,
        editorContent: "",
      },
    });

    // Sofor Bisoy
    await prisma.soforBisoyRecord.create({
      data: {
        userId: mainUser.id,
        date: new Date("2025-02-10"),
        madrasaVisit: 5,
        moktobVisit: 8,
        schoolCollegeVisit: 3,
        editorContent: "",
      },
    });

    // Talim Bisoy
    await prisma.talimBisoyRecord.create({
      data: {
        userId: mainUser.id,
        date: new Date("2025-02-10"),
        mohilaTalim: 6,
        mohilaOnshogrohon: 15,
        editorContent: "",
      },
    });

    // Dayee Bisoy with Assistant Daee
    const dayeeRecord = await prisma.dayeeBishoyRecord.create({
      data: {
        userId: mainUser.id,
        date: new Date("2025-02-10"),
        sohojogiDayeToiri: 3,
        editorContent: "",
      },
    });

    // Create Assistant Daee
    await prisma.assistantDaee.create({
      data: {
        name: "Abdur Rohim",
        phone: "01720151678",
        address: "চট্রগ্রাম সিটি কর্পোরেশন",
        email: "rohim@gmail.com",
        description: "Se Shabazpur jame Mosjid er imam",
        division: "Dhaka",
        district: "Dhaka",
        upazila: "Dhaka",
        union: "Dhaka",
        dayeeBishoyId: dayeeRecord.id,
      },
    });

    // Create Leave Requests
    console.log("🏖 Creating leave requests...");
    for (const leaveData of leaveRequests) {
      await prisma.leaveRequest.create({
        data: {
          ...leaveData,
          userId: mainUser.id,
        },
      });
    }

    // Create Tasks
    console.log("📋 Creating tasks...");
    for (const taskData of tasks) {
      await prisma.task.create({
        data: {
          ...taskData,
          userId: mainUser.id,
        },
      });
    }

    // Create Edit Requests
    console.log("✏ Creating edit requests...");
    for (const editData of editRequests) {
      await prisma.editRequest.create({
        data: {
          ...editData,
          userId: mainUser.id,
        },
      });
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log("📊 Summary:");
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Amoli Records: ${amoliData.length}`);
    console.log(`   - Dawati Bisoy Records: ${dawatiBisoyData.length}`);
    console.log(`   - Moktob Records: ${moktobBisoyData.length}`);
    console.log(`   - Leave Requests: ${leaveRequests.length}`);
    console.log(`   - Tasks: ${tasks.length}`);
    console.log(`   - Edit Requests: ${editRequests.length}`);
    console.log("   - Additional category records: 6 types");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("❌ Seed script failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
