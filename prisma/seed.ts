// /* prisma/seed.ts */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const now = new Date();

const markazList: { name: string; division?: string; district?: string; upazila?: string; union?: string }[] = [
  { name: "ইসলামী দাওয়াহ ইনস্টিটিউট, বাংলাদেশ। মান্ডা, মুগদা, ঢাকা" },
  { name: "ইসলামী দাওয়াহ ইনস্টটিউট মান্ডা শেষ মাথা, মুগদা, ঢাকা" },
  { name: "মাদরাসাতুল মাদীনাহ লিলবানাত মধুসিটি, কেরানীগঞ্জ, ঢাকা" },
  { name: "ইসলামী দাওয়াহ একাডেমী মাওসিইদ, উত্তরখান, ঢাকা" },
  { name: "মা'হাদুদ দাওয়াহ আল-ইসলামিয়া সেন্টারহাট, রংপুর" },
  { name: "মা'হাদুদ দাওয়াহ আলইসলামিয়া খুলনা নিরালা কমিউনিটি সেন্টার, হাবিলিবাগ, সোনাডাঙ্গা, খুলনা" },
  { name: "মাদরাসাতুদ দাওয়াহ আল ইসলামিয়া আকওয়া বাইপাস, ময়মনসিংহ" },
  { name: "দাওয়াতুল কুরআন একাডেমী সাভার, আশুলিয়া, ঢাকা" },
  { name: "দারুল কোরআন আদর্শ মাদরাসা মির কাদিম, পৌরসভা, মুন্সিগঞ্জ" },
  { name: "মাদরাসাতুস সুফফা আল ইসলামিয়া উত্তর এনায়েতনগর নাসিক ৮নং সিদ্ধিরগঞ্জ, নারায়ণগঞ্জ" },
  { name: "ফাতেমাতুজ্জহরা (রা:) মহিলা শাহডুবি, বীরগঞ্জ, দিনাজপুর" },
  { name: "মাদরাসাতুল হুদা নৈশ মাদরাসা সদর, দিনাজপুর" },
  { name: "ইসলামী দাওয়াহ ইনস্টটিউ তুষভান্ডার, কালিগঞ্জ, লালমনিরহাট" },
  { name: "মাদরাসাতুল ঈমান চরগোরক মন্ডল, কুড়িগ্রাম" },
  { name: "মা'হাদুদ দাওয়াহ আল ইসলামিয়া ধরনীগঞ্জ, ডোমার, নীলফামারী" },
  { name: "দারুল উলুম আল ইসলামিয়া ডোমার, নীলফামারী" },
  { name: "দারুল উলুম সাঈদিয়া মাদরাসা বরুনাগাও, বিহারীপাড়া, ঠাকুরগাঁও" },
  { name: "মাদরাসাতুল ফালাহ সদর, পঞ্চগড়" },
  { name: "দাওয়াতুর রহমান মাদরাসা অখড়াবাড়ী, বোদা, পঞ্চগড়" },
  { name: "মাদরাসাতুদ দাওয়াহ রাজুরবাজার, নেত্রকোনা" },
  { name: "দারুল উলুম মাহমুদিয়া ফুলবাড়িয়া, ময়মনসিংহ" },
  { name: "মাদরাসাতুর রহমাহ পাঁচরাস্তা মোড়, জামালপুর" },
  { name: "মাদরাসাতুল খাইফ বাড়াগাও, দাউদকান্দি, কুমিল্লা" },
  { name: "ইসলামী দাওয়াহ একাডেমী পশ্চিম নয়নপুর, পুনিয়াউট, বি-বাড়িয়া" },
  { name: "চট্টগ্রাম" },
  { name: "বরিশাল" },
  { name: "সিলেট" },
  { name: "রাজশাহী" },
];

// required non-null fields → fill with empty strings if not provided
const normalizeMarkaz = (m: typeof markazList[number]) => ({
  name: m.name,
  division: m.division ?? "",
  district: m.district ?? "",
  upazila: m.upazila ?? "",
  union: m.union ?? "",
  createdAt: now,
  updatedAt: now,
});

async function upsertCredentialsUser(opts: {
  email: string;
  name: string;
  role: string; // "centraladmin" | "daye" | ...
  password: string;
  markazName?: string; // optionally link to a markaz by name
}) {
  const passwordHash = await hash(opts.password, 10);

  // Ensure user row
  const user = await prisma.users.upsert({
    where: { email: opts.email },
    update: {
      name: opts.name,
      role: opts.role,
      emailVerified: true,
      updatedAt: now,
      banned: false,
    },
    create: {
      email: opts.email,
      name: opts.name,
      role: opts.role,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
      banned: false,
    },
  });

  // Link to markaz if requested
  if (opts.markazName) {
    const mk = await prisma.markaz.findFirst({ where: { name: opts.markazName } });
    if (mk) {
      await prisma.users.update({
        where: { id: user.id },
        data: { markazId: mk.id, updatedAt: now },
      });
    }
  }

  // Ensure credentials account
  const providerId = "credentials";
  const accountId = opts.email;

  const existingAcc = await prisma.accounts.findFirst({
    where: { userId: user.id, providerId },
  });

  if (existingAcc) {
    await prisma.accounts.update({
      where: { id: existingAcc.id },
      data: {
        accountId,
        password: passwordHash,
        updatedAt: now,
      },
    });
  } else {
    await prisma.accounts.create({
      data: {
        userId: user.id,
        providerId,
        accountId,
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      },
    });
  }
}

async function main() {
  // 1) Seed Markaz (idempotent by name)
  for (const m of markazList) {
    await prisma.markaz.upsert({
      where: { name: m.name },
      update: { ...normalizeMarkaz(m) },
      create: { ...normalizeMarkaz(m) },
    });
  }

  // 2) Users with credentials
  await upsertCredentialsUser({
    email: "islamidawainstitute@gmail.com",
    name: "Islami dawa",
    role: "centraladmin", // <- correct spelling
    password: "11111111",
    // no markaz link for centraladmin by default
  });

  await upsertCredentialsUser({
    email: "estiakahmed898@gmail.com",
    name: "estiak ahmed",
    role: "daye",
    password: "11111111",
    // link to the first markaz so hierarchy works out-of-the-box
    markazName: markazList[0]?.name,
  });

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
