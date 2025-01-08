import * as Yup from "yup";

// Types for form data
interface FormData {
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
}

// Initial form data
export const initialFormData: FormData = {
  tahajjud: "",
  ayat: "",
  zikir: "",
  ishraq: "",
  jamat: "",
  sirat: "",
  Dua: "",
  ilm: "",
  tasbih: "",
  dayeeAmol: "",
  amoliSura: "",
  ayamroja: "",
  hijbulBahar: "",
};

// Validation schema using Yup
export const validationSchema = Yup.object().shape({
  tahajjud: Yup.string().required("tahajjud is required"),
  ayat: Yup.string().required("sura is required"),
  zikir: Yup.string().required("zikir is required"),
  ishraq: Yup.string().required("Option is required"),
  jamat: Yup.string().required("jamate salat is required"),
  sirat: Yup.string().required("sirat is required"),
  Dua: Yup.string().required("Dua is required"),
  ilm: Yup.string().required("This Field is required"),
  tasbih: Yup.string().required("Option Selection is Required"),
  dayeeAmol: Yup.string().required("Dayee Amol Selection is Required"),
  amoliSura: Yup.string().required("Amoli Sura Selection is Required"),
  ayamroja: Yup.string().required("Ayam Selection is Required"),
  hijbulBahar: Yup.string().required("Hijbul Bahar Selection is Required"),
});

// Options for select fields

export const ayatOptions = [
  { value: "sura Fatiha", label: "সুরা ফাতিহা" },
  { value: "sura Baqara", label: "সুরা বাকারা" },
  { value: "sura Al-Imran", label: "সুরা আল ইমরান" },
  { value: "sura Nisa", label: "সুরা নিসা" },
  { value: "sura Maidah", label: "সুরা মাইদাহ" },
  { value: "sura Anam", label: "সুরা আনআম" },
  { value: "sura Araf", label: "সুরা আরাফ" },
  { value: "sura Anfal", label: "সুরা আনফাল" },
  { value: "sura Tawba", label: "সুরা তাওবা" },
  { value: "sura Yunus", label: "সুরা ইউনুস" },
  { value: "sura Hud", label: "সুরা হুদ" },
  { value: "sura Yusuf", label: "সুরা ইউসুফ" },
  { value: "sura Rad", label: "সুরা রাদ" },
  { value: "sura Ibrahim", label: "সুরা ইব্রাহিম" },
  { value: "sura Hijr", label: "সুরা হিজর" },
  { value: "sura Nahl", label: "সুরা নাহল" },
  { value: "sura Isra", label: "সুরা ইসরা" },
  { value: "sura Kahf", label: "সুরা কাহফ" },
  { value: "sura Maryam", label: "সুরা মরিয়ম" },
  { value: "sura Taha", label: "সুরা ত্বাহা" },
  { value: "sura Anbiya", label: "সুরা আম্বিয়া" },
  { value: "sura Hajj", label: "সুরা হাজ্জ" },
  { value: "sura Muminoon", label: "সুরা মুমিনুন" },
  { value: "sura Nur", label: "সুরা নূর" },
  { value: "sura Furqan", label: "সুরা ফুরকান" },
  { value: "sura Shuara", label: "সুরা শুআরা" },
  { value: "sura Naml", label: "সুরা নামল" },
  { value: "sura Qasas", label: "সুরা কাসাস" },
  { value: "sura Ankabut", label: "সুরা আনকাবুত" },
  { value: "sura Rum", label: "সুরা রুম" },
  { value: "sura Luqman", label: "সুরা লুকমান" },
  { value: "sura Sajda", label: "সুরা সিজদা" },
  { value: "sura Ahzab", label: "সুরা আহজাব" },
  { value: "sura Saba", label: "সুরা সাবা" },
  { value: "sura Fatir", label: "সুরা ফাতির" },
  { value: "sura Yasin", label: "সুরা ইয়াসিন" },
  { value: "sura Saffat", label: "সুরা আস-সাফফাত" },
  { value: "sura Sad", label: "সুরা সাদ" },
  { value: "sura Zumar", label: "সুরা যুমার" },
  { value: "sura Ghafir", label: "সুরা গাফির" },
  { value: "sura Fussilat", label: "সুরা ফুসসিলাত" },
  { value: "sura Shura", label: "সুরা আশ-শুরা" },
  { value: "sura Zukhruf", label: "সুরা যুখরুফ" },
  { value: "sura Dukhan", label: "সুরা আদ-দুখান" },
  { value: "sura Jathiya", label: "সুরা আল-জাসিয়া" },
  { value: "sura Ahqaf", label: "সুরা আহক্বাফ" },
  { value: "sura Muhammad", label: "সুরা মুহাম্মাদ" },
  { value: "sura Fath", label: "সুরা আল-ফাতহ" },
  { value: "sura Hujurat", label: "সুরা আল-হুজুরাত" },
  { value: "sura Qaf", label: "সুরা কাফ" },
  { value: "sura Dhariyat", label: "সুরা আয-যারিয়াত" },
  { value: "sura Tur", label: "সুরা আত-তুর" },
  { value: "sura Najm", label: "সুরা আন-নাজম" },
  { value: "sura Qamar", label: "সুরা আল-কামার" },
  { value: "sura Rahman", label: "সুরা আর-রহমান" },
  { value: "sura Waqia", label: "সুরা আল-ওয়াকিয়া" },
  { value: "sura Hadid", label: "সুরা আল-হাদিদ" },
  { value: "sura Mujadila", label: "সুরা আল-মুজাদিলা" },
  { value: "sura Hashr", label: "সুরা আল-হাশর" },
  { value: "sura Mumtahina", label: "সুরা আল-মুমতাহিনা" },
  { value: "sura Saff", label: "সুরা আস-সাফ" },
  { value: "sura Jumuah", label: "সুরা আল-জুমুআ" },
  { value: "sura Munafiqun", label: "সুরা আল-মুনাফিকুন" },
  { value: "sura Taghabun", label: "সুরা আত-তাগাবুন" },
  { value: "sura Talaq", label: "সুরা আত-তালাক" },
  { value: "sura Tahrim", label: "সুরা আত-তাহরিম" },
  { value: "sura Mulk", label: "সুরা আল-মুলক" },
  { value: "sura Qalam", label: "সুরা আল-কলম" },
  { value: "sura Haqqah", label: "সুরা আল-হাক্কাহ" },
  { value: "sura Maarij", label: "সুরা আল-মাআরিজ" },
  { value: "sura Nuh", label: "সুরা নূহ" },
  { value: "sura Jinn", label: "সুরা আল-জিন" },
  { value: "sura Muzzammil", label: "সুরা আল-মুজ্জামিল" },
  { value: "sura Mudathir", label: "সুরা আল-মুদ্দাসসির" },
  { value: "sura Qiyamah", label: "সুরা আল-কিয়ামাহ" },
  { value: "sura Insan", label: "সুরা আদ-দাহর" },
  { value: "sura Mursalat", label: "সুরা আল-মুরসালাত" },
  { value: "sura Naba", label: "সুরা আন-নাবা" },
  { value: "sura Naziat", label: "সুরা আন-নাজিয়াত" },
  { value: "sura Abasa", label: "সুরা আবাসা" },
  { value: "sura Takwir", label: "সুরা আত-তাকভির" },
  { value: "sura Infitar", label: "সুরা আল-ইনফিতার" },
  { value: "sura Mutaffifin", label: "সুরা আল-মুতাফ্ফিফিন" },
  { value: "sura Inshiqaq", label: "সুরা আল-ইনশিকাক" },
  { value: "sura Burooj", label: "সুরা আল-বুরুজ" },
  { value: "sura Tariq", label: "সুরা আত-তারিক" },
  { value: "sura Ala", label: "সুরা আল-আলা" },
  { value: "sura Ghashiyah", label: "সুরা আল-গাশিয়াহ" },
  { value: "sura Fajr", label: "সুরা আল-ফজর" },
  { value: "sura Balad", label: "সুরা আল-বালাদ" },
  { value: "sura Shams", label: "সুরা আশ-শামস" },
  { value: "sura Layl", label: "সুরা আল-লাইল" },
  { value: "sura Duha", label: "সুরা আদ-দুহা" },
  { value: "sura Inshirah", label: "সুরা আল-ইনশিরাহ" },
  { value: "sura Tin", label: "সুরা আত-তিন" },
  { value: "sura Alaq", label: "সুরা আলাক" },
  { value: "sura Qadr", label: "সুরা আল-ক্বদর" },
  { value: "sura Bayyinah", label: "সুরা আল-বায়্যিনাহ" },
  { value: "sura Zalzalah", label: "সুরা আল-যিলযাল" },
  { value: "sura Adiyat", label: "সুরা আদ-দিয়াত" },
  { value: "sura Qariah", label: "সুরা আল-কারিয়াহ" },
  { value: "sura Takathur", label: "সুরা আত-তাকাসুর" },
  { value: "sura Asr", label: "সুরা আল-আসর" },
  { value: "sura Humazah", label: "সুরা আল-হুমাযা" },
  { value: "sura Fil", label: "সুরা আল-ফিল" },
  { value: "sura Quraysh", label: "সুরা কুরাইশ" },
  { value: "sura Maun", label: "সুরা আল-মাউন" },
  { value: "sura Kawthar", label: "সুরা আল-কাওসার" },
  { value: "sura Kafirun", label: "সুরা আল-কাফিরুন" },
  { value: "sura Nasr", label: "সুরা আন-নাসর" },
  { value: "sura Lahab", label: "সুরা আল-লাহাব" },
  { value: "sura Ikhlas", label: "সুরা আল-ইখলাস" },
  { value: "sura Falaq", label: "সুরা আল-ফালাক" },
  { value: "sura Nas", label: "সুরা আন-নাস" },
];

export const zikirOptions = [
  { value: "যিকির", label: "যিকির" },
  { value: "অযিকির", label: "অযিকির" },
];

export const ishraqOptions = [
  { value: "ফজরের পর", label: "ফজরের পর" },
  { value: "অফরদ", label: "অফরদ" },
];

export const jamatOptions = [
  { value: "হ্যাঁ", label: "হ্যাঁ" },
  { value: "না", label: "না" },
];

export const siratOptions = [
  { value: "হ্যাঁ", label: "হ্যাঁ" },
  { value: "না", label: "না" },
];

export const duaOptions = [
  { value: "হ্যাঁ", label: "হ্যাঁ" },
  { value: "না", label: "না" },
];

export const ilmOptions = [
  { value: "হ্যাঁ", label: "হ্যাঁ" },
  { value: "না", label: "না" },
];

export const tasbihOptions = [
  { value: "হ্যাঁ", label: "হ্যাঁ" },
  { value: "না", label: "না" },
];

export const dayeeAmolOptions = [
  { value: "হ্যাঁ", label: "হ্যাঁ" },
  { value: "না", label: "না" },
];

export const amoliSuraOptions = [
  { value: "হ্যাঁ", label: "হ্যাঁ" },
  { value: "না", label: "না" },
];

export const AyamOptions = [
    { value: "হ্যাঁ", label: "হ্যাঁ" },
    { value: " না ", label: " না " },
];
export const hijbulBaharOptions = [
  { value: "হ্যাঁ", label: "হ্যাঁ" },
  { value: "না", label: "না" },
];
