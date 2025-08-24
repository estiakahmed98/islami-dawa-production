// prisma/seed-markaz.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// === Your provided list ===
const markazList = [
  { name: "ইসলামী দাওয়াহ ইনস্টিটিউট, বাংলাদেশ। মান্ডা, মুগদা, ঢাকা" },
  { name: "ইসলামী দাওয়াহ ইনস্টটিউট মান্ডা শেষ মাথা, মুগদা, ঢাকা" },
  { name: "মাদরাসাতুল মাদীনাহ লিলবানাত মধুসিটি, কেরানীগঞ্জ, ঢাকা" },
  { name: "ইসলামী দাওয়াহ একাডেমী মাওসিইদ, উত্তরখান, ঢাকা" },
  { name: "মা'হাদুদ দাওয়াহ আল-ইসলামিয়া সেন্টারহাট, রংপুর" },
  {
    name: "মা'হাদুদ দাওয়াহ আলইসলামিয়া খুলনা নিরালা কমিউনিটি সেন্টার, হাবিলিবাগ, সোনাডাঙ্গা, খুলনা",
  },
  { name: "মাদরাসাতুদ দাওয়াহ আল ইসলামিয়া আকওয়া বাইপাস, ময়মনসিংহ" },
  { name: "দাওয়াতুল কুরআন একাডেমী সাভার, আশুলিয়া, ঢাকা" },
  { name: "দারুল কোরআন আদর্শ মাদরাসা মির কাদিম, পৌরসভা, মুন্সিগঞ্জ" },
  {
    name: "মাদরাসাতুস সুফফা আল ইসলামিয়া উত্তর এনায়েতনগর নাসিক ৮নং সিদ্ধিরগঞ্জ, নারায়ণগঞ্জ",
  },
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

// --------- Minimal helper: keep required fields non-null ----------
const asMarkazData = (name: string) => ({
  name,
  division: "",  // keep empty if you don't want to auto-parse now
  district: "",
  upazila: "",
  union: "",
});

async function main() {
  console.log("🌱 Seeding ONLY Markaz...");

  // (Optional) If you want to wipe existing Markaz first, uncomment:
  // await prisma.markaz.deleteMany();

  let created = 0, skipped = 0;

  for (const { name } of markazList) {
    // Avoid duplicate by name (since name isn't unique in schema)
    const exists = await prisma.markaz.findFirst({ where: { name } });
    if (exists) {
      skipped++;
      continue;
    }

    await prisma.markaz.create({
      data: asMarkazData(name),
    });
    created++;
  }

  console.log(`✅ Done. Created: ${created}, Skipped (already exists): ${skipped}`);
}

main()
  .catch((e) => {
    console.error("❌ Markaz seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
