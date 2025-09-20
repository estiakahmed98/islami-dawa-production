"use client";

//Juwel

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import ComparisonTallyCard from "@/components/ComparisonTallyCard";
import { useTranslations } from "next-intl";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
  markaz?: string | null | { id: string; name: string }[];
  phone?: string;
}

const generateYearOptions = () => {
  const years = [];
  for (let year = 2020; year <= 2100; year++) {
    years.push(
      <option key={year} value={year}>
        {year}
      </option>
    );
  }
  return years;
};

const convertToPoints = (value: any, field: string): number => {
  if (typeof value === "number" && !isNaN(value)) return value;

  if (typeof value === "string") {
    value = value.trim();

    if (field === "zikir") {
      if (value === "সকাল-সন্ধ্যা") return 2;
      if (value === "সকাল" || value === "সন্ধ্যা") return 1;
      return 0;
    } else if (field === "ayat") {
      // Extract ayat number from range (e.g., "10-20")
      const [start, end] = value
        .split("-")
        .map((num: string) => parseInt(num, 10) || 0);
      return Math.abs((end || start) - start); // Return difference
    } else if (["surah", "ishraq", "ilm", "sirat"].includes(field)) {
      return value ? 1 : 0;
    } else if (field === "jamat") {
      const numValue = Number(value) || 0;
      return numValue >= 1 && numValue <= 5 ? numValue : 0;
    } else if (field === "tahajjud") {
      const numValue = Number(value) || 0;
      return numValue;
    } else if (
      [
        "Dua",
        "tasbih",
        "amoliSura",
        "hijbulBahar",
        "dayeeAmol",
        "ayamroja",
      ].includes(field)
    ) {
      return value === "হ্যাঁ" ? 1 : 0;
    }
  }

  return 0; // Default for empty/null values
};

const ComparisonDataComponent: React.FC = () => {
  const { data: session } = useSession();

  const userEmail = session?.user?.email || "";
  const [emailList, setEmailList] = useState<string[]>([userEmail]);
  const [users, setUsers] = useState<User[]>([]);

  const [comparisonType, setComparisonType] = useState("day");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const t = useTranslations('comparison');

  // --- Label maps (mirrors UsersTable) ---
  const AMOLI_LABELS: Record<string, string> = {
    tahajjud: "তাহাজ্জুদ (মিনিট/রাকাআত)",
    surah: "সূরা",
    ayat: "আয়াত",
    zikir: "যিকির",
    ishraq: "ইশরাক/আওয়াবীন/চাশ্ত",
    jamat: "জামাতে নামাজ",
    sirat: "সীরাত/হাদীস পাঠ",
    Dua: "দোয়া",
    ilm: "ইলম",
    tasbih: "তাসবিহ",
    dayeeAmol: "দায়ীর আমল",
    amoliSura: "আমলী সূরা",
    ayamroja: "আয়াম-এ-বিদ",
    hijbulBahar: "হিজবুল বাহর",
    percentage: "পারসেন্টেজ",
    editorContent: "মতামত",
  };
  const MOKTOB_LABELS: Record<string, string> = {
    notunMoktobChalu: "নতুন মক্তব চালু",
    totalMoktob: "মোট মক্তব",
    totalStudent: "মোট ছাত্র",
    obhibhabokConference: "অভিভাবক কনফারেন্স",
    moktoThekeMadrasaAdmission: "মক্তব থেকে মাদরাসায় ভর্তি",
    notunBoyoskoShikkha: "নতুন বয়স্ক শিক্ষা",
    totalBoyoskoShikkha: "মোট বয়স্ক শিক্ষা",
    boyoskoShikkhaOnshogrohon: "বয়স্ক শিক্ষায় অংশগ্রহণ",
    newMuslimeDinerFikir: "নতুন মুসলিমের দিনের ফিকির",
    editorContent: "মতামত",
  };
  const TALIM_LABELS: Record<string, string> = {
    mohilaTalim: "মহিলাদের তালিম",
    mohilaOnshogrohon: "মহিলাদের অংশগ্রহণ",
    editorContent: "মতামত",
  };
  const DAYE_LABELS: Record<string, string> = {
    sohojogiDayeToiri: "সহযোগী দায়ী তৈরি",
    editorContent: "মতামত",
  };
  const DAWATI_LABELS: Record<string, string> = {
    nonMuslimDawat: "অমুসলিমকে দাওয়াত",
    murtadDawat: "মুরতাদকে দাওয়াত",
    alemderSatheyMojlish: "আলেমদের সাথে মজলিশ",
    publicSatheyMojlish: "জনসাধারণের সাথে মজলিশ",
    nonMuslimSaptahikGasht: "অমুসলিম সাপ্তাহিক গাশত",
    editorContent: "মতামত",
  };
  const DAWATI_MOJLISH_LABELS: Record<string, string> = {
    dawatterGuruttoMojlish: "দাওয়াতের গুরুত্ব মজলিশ",
    mojlisheOnshogrohon: "মজলিশে অংশগ্রহণ",
    prosikkhonKormoshalaAyojon: "প্রশিক্ষণ কর্মশালা আয়োজন",
    prosikkhonOnshogrohon: "প্রশিক্ষণে অংশগ্রহণ",
    jummahAlochona: "জুম্মাহ আলােচনা",
    dhormoSova: "ধর্মসভা",
    mashwaraPoint: "মাশওয়ারা পয়েন্ট",
    editorContent: "মতামত",
  };
  const JAMAT_LABELS: Record<string, string> = {
    jamatBerHoise: "জামাত বের হয়েছে",
    jamatSathi: "জামাত সাথী",
    editorContent: "মতামত",
  };
  const DINEFERA_LABELS: Record<string, string> = {
    nonMuslimMuslimHoise: "অমুসলিম মুসলিম হয়েছে",
    murtadIslamFireche: "মুরতাদ ইসলাম ফিরেছে",
    editorContent: "মতামত",
  };
  const SOFOR_LABELS: Record<string, string> = {
    madrasaVisit: "মাদ্রাসা ভিজিট",
    madrasaVisitList: "মাদ্রাসা ভিজিট তালিকা",
    moktobVisit: "মক্তব ভিজিট",
    schoolCollegeVisit: "স্কুল/কলেজ ভিজিট",
    schoolCollegeVisitList: "স্কুল/কলেজ ভিজিট তালিকা",
    editorContent: "মতামত",
  };

  type RecordsByEmail = Record<string, Record<string, Record<string, any>>>;
  type UserDataForAdminTable = { records: RecordsByEmail; labelMap: Record<string, string> };

  const toDateKey = (iso: string) => {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const ensureEmailDateSlot = (records: RecordsByEmail, email: string, dateKey: string) => {
    if (!records[email]) records[email] = {};
    if (!records[email][dateKey]) records[email][dateKey] = {};
    return records[email][dateKey];
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch users");
        const usersData: User[] = await response.json();
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!users.length) return;

    const loggedInUser = users.find((u) => u.email === userEmail);
    if (!loggedInUser) return;

    let collectedEmails = new Set<string>(); // Use Set to prevent duplicates
    collectedEmails.add(loggedInUser.email);

    const findChildEmails = (parentEmail: string) => {
      users.forEach((user) => {
        if (
          getParentEmail(user, users, loggedInUser) === parentEmail &&
          !collectedEmails.has(user.email)
        ) {
          collectedEmails.add(user.email);
          findChildEmails(user.email);
        }
      });
    };

    findChildEmails(loggedInUser.email);

    setEmailList(Array.from(collectedEmails)); // Convert Set back to Array
  }, [users, userEmail]);

  // Handle comparison button click
  const handleCompare = async () => {
    if (!from || !to) {
      alert(t("messages.invalidRange"));
      return;
    }

    // Fetch from DB for all selected emails
    const fetchAmoli = async (emails: string[]): Promise<UserDataForAdminTable> => {
      const records: RecordsByEmail = {};
      await Promise.all(
        emails.map(async (email) => {
          const res = await fetch(`/api/amoli?email=${encodeURIComponent(email)}`);
          if (!res.ok) return;
          const json = await res.json();
          (json.records || []).forEach((r: any) => {
            const dateKey = toDateKey(r.date);
            const slot = ensureEmailDateSlot(records, email, dateKey);
            slot.tahajjud = r.tahajjud ?? "-";
            slot.surah = r.surah ?? "-";
            slot.ayat = r.ayat ?? "-";
            slot.zikir = r.zikir ?? "-";
            slot.ishraq = r.ishraq ?? "-";
            slot.jamat = r.jamat ?? "-";
            slot.sirat = r.sirat ?? "-";
            slot.Dua = r.Dua ?? "-";
            slot.ilm = r.ilm ?? "-";
            slot.tasbih = r.tasbih ?? "-";
            slot.dayeeAmol = r.dayeeAmol ?? "-";
            slot.amoliSura = r.amoliSura ?? "-";
            slot.ayamroja = r.ayamroja ?? "-";
            slot.hijbulBahar = r.hijbulBahar ?? "-";
            slot.percentage = r.percentage ?? "-";
            slot.editorContent = r.editorContent || "";
          });
        })
      );
      return { records, labelMap: AMOLI_LABELS };
    };

    const fetchMoktob = async (emails: string[]): Promise<UserDataForAdminTable> => {
      const records: RecordsByEmail = {};
      await Promise.all(
        emails.map(async (email) => {
          const res = await fetch(`/api/moktob?email=${encodeURIComponent(email)}`);
          if (!res.ok) return;
          const json = await res.json();
          (json.records || []).forEach((r: any) => {
            const dateKey = toDateKey(r.date);
            const slot = ensureEmailDateSlot(records, email, dateKey);
            slot.notunMoktobChalu = r.notunMoktobChalu ?? "-";
            slot.totalMoktob = r.totalMoktob ?? "-";
            slot.totalStudent = r.totalStudent ?? "-";
            slot.obhibhabokConference = r.obhibhabokConference ?? "-";
            slot.moktoThekeMadrasaAdmission = r.moktoThekeMadrasaAdmission ?? "-";
            slot.notunBoyoskoShikkha = r.notunBoyoskoShikkha ?? "-";
            slot.totalBoyoskoShikkha = r.totalBoyoskoShikkha ?? "-";
            slot.boyoskoShikkhaOnshogrohon = r.boyoskoShikkhaOnshogrohon ?? "-";
            slot.newMuslimeDinerFikir = r.newMuslimeDinerFikir ?? "-";
            slot.editorContent = r.editorContent || "";
          });
        })
      );
      return { records, labelMap: MOKTOB_LABELS };
    };

    const fetchTalim = async (emails: string[]): Promise<UserDataForAdminTable> => {
      const records: RecordsByEmail = {};
      await Promise.all(
        emails.map(async (email) => {
          const res = await fetch(`/api/talim?email=${encodeURIComponent(email)}`);
          if (!res.ok) return;
          const json = await res.json();
          (json.records || []).forEach((r: any) => {
            const dateKey = toDateKey(r.date);
            const slot = ensureEmailDateSlot(records, email, dateKey);
            slot.mohilaTalim = r.mohilaTalim ?? "-";
            slot.mohilaOnshogrohon = r.mohilaOnshogrohon ?? "-";
            slot.editorContent = r.editorContent || "";
          });
        })
      );
      return { records, labelMap: TALIM_LABELS };
    };

    const fetchDaye = async (emails: string[]): Promise<UserDataForAdminTable> => {
      const records: RecordsByEmail = {};
      await Promise.all(
        emails.map(async (email) => {
          const res = await fetch(`/api/dayi?email=${encodeURIComponent(email)}`);
          if (!res.ok) return;
          const json = await res.json();
          (json.records || []).forEach((r: any) => {
            const dateKey = toDateKey(r.date);
            const slot = ensureEmailDateSlot(records, email, dateKey);
            slot.sohojogiDayeToiri = r.sohojogiDayeToiri ?? "-";
            slot.editorContent = r.editorContent || "";
          });
        })
      );
      return { records, labelMap: DAYE_LABELS };
    };

    const fetchDawati = async (emails: string[]): Promise<UserDataForAdminTable> => {
      const records: RecordsByEmail = {};
      await Promise.all(
        emails.map(async (email) => {
          const res = await fetch(`/api/dawati?email=${encodeURIComponent(email)}`);
          if (!res.ok) return;
          const json = await res.json();
          (json.records || []).forEach((r: any) => {
            const dateKey = toDateKey(r.date);
            const slot = ensureEmailDateSlot(records, email, dateKey);
            slot.nonMuslimDawat = r.nonMuslimDawat ?? "-";
            slot.murtadDawat = r.murtadDawat ?? "-";
            slot.alemderSatheyMojlish = r.alemderSatheyMojlish ?? "-";
            slot.publicSatheyMojlish = r.publicSatheyMojlish ?? "-";
            slot.nonMuslimSaptahikGasht = r.nonMuslimSaptahikGasht ?? "-";
            slot.editorContent = r.editorContent || "";
          });
        })
      );
      return { records, labelMap: DAWATI_LABELS };
    };

    const fetchDawatiMojlish = async (emails: string[]): Promise<UserDataForAdminTable> => {
      const records: RecordsByEmail = {};
      await Promise.all(
        emails.map(async (email) => {
          const res = await fetch(`/api/dawatimojlish?email=${encodeURIComponent(email)}`);
          if (!res.ok) return;
          const json = await res.json();
          (json.records || []).forEach((r: any) => {
            const dateKey = toDateKey(r.date);
            const slot = ensureEmailDateSlot(records, email, dateKey);
            slot.dawatterGuruttoMojlish = r.dawatterGuruttoMojlish ?? "-";
            slot.mojlisheOnshogrohon = r.mojlisheOnshogrohon ?? "-";
            slot.prosikkhonKormoshalaAyojon = r.prosikkhonKormoshalaAyojon ?? "-";
            slot.prosikkhonOnshogrohon = r.prosikkhonOnshogrohon ?? "-";
            slot.jummahAlochona = r.jummahAlochona ?? "-";
            slot.dhormoSova = r.dhormoSova ?? "-";
            slot.mashwaraPoint = r.mashwaraPoint ?? "-";
            slot.editorContent = r.editorContent || "";
          });
        })
      );
      return { records, labelMap: DAWATI_MOJLISH_LABELS };
    };

    const fetchJamat = async (emails: string[]): Promise<UserDataForAdminTable> => {
      const records: RecordsByEmail = {};
      await Promise.all(
        emails.map(async (email) => {
          const res = await fetch(`/api/jamat?email=${encodeURIComponent(email)}`);
          if (!res.ok) return;
          const json = await res.json();
          (json.records || []).forEach((r: any) => {
            const dateKey = toDateKey(r.date);
            const slot = ensureEmailDateSlot(records, email, dateKey);
            slot.jamatBerHoise = r.jamatBerHoise ?? "-";
            slot.jamatSathi = r.jamatSathi ?? "-";
            slot.editorContent = r.editorContent || "";
          });
        })
      );
      return { records, labelMap: JAMAT_LABELS };
    };

    const fetchDineFera = async (emails: string[]): Promise<UserDataForAdminTable> => {
      const records: RecordsByEmail = {};
      await Promise.all(
        emails.map(async (email) => {
          const res = await fetch(`/api/dinefera?email=${encodeURIComponent(email)}`);
          if (!res.ok) return;
          const json = await res.json();
          (json.records || []).forEach((r: any) => {
            const dateKey = toDateKey(r.date);
            const slot = ensureEmailDateSlot(records, email, dateKey);
            slot.nonMuslimMuslimHoise = r.nonMuslimMuslimHoise ?? "-";
            slot.murtadIslamFireche = r.murtadIslamFireche ?? "-";
            slot.editorContent = r.editorContent || "";
          });
        })
      );
      return { records, labelMap: DINEFERA_LABELS };
    };

    const fetchSofor = async (emails: string[]): Promise<UserDataForAdminTable> => {
      const records: RecordsByEmail = {};
      await Promise.all(
        emails.map(async (email) => {
          const res = await fetch(`/api/soforbisoy?email=${encodeURIComponent(email)}`);
          if (!res.ok) return;
          const json = await res.json();
          (json.records || []).forEach((r: any) => {
            const dateKey = toDateKey(r.date);
            const slot = ensureEmailDateSlot(records, email, dateKey);
            slot.madrasaVisit = r.madrasaVisit ?? "-";
            slot.madrasaVisitList = Array.isArray(r.madrasaVisitList) ? r.madrasaVisitList.join(", ") : (r.madrasaVisitList || "");
            slot.moktobVisit = r.moktobVisit ?? "-";
            slot.schoolCollegeVisit = r.schoolCollegeVisit ?? "-";
            slot.schoolCollegeVisitList = Array.isArray(r.schoolCollegeVisitList) ? r.schoolCollegeVisitList.join(", ") : (r.schoolCollegeVisitList || "");
            slot.editorContent = r.editorContent || "";
          });
        })
      );
      return { records, labelMap: SOFOR_LABELS };
    };

    try {
      const [amoli, moktob, talim, daye, dawati, dawatiMojlish, jamat, dineFera, sofor] = await Promise.all([
        fetchAmoli(emailList),
        fetchMoktob(emailList),
        fetchTalim(emailList),
        fetchDaye(emailList),
        fetchDawati(emailList),
        fetchDawatiMojlish(emailList),
        fetchJamat(emailList),
        fetchDineFera(emailList),
        fetchSofor(emailList),
      ]);

      const allData = [amoli, moktob, dawati, dawatiMojlish, jamat, dineFera, talim, sofor, daye];
      const combinedData = allData.flatMap((data) => fetchUserComparisonData(data, comparisonType, from, to));
      setComparisonData(combinedData);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch comparison data for all users in emailList
  const fetchUserComparisonData = (
    userData: any,
    comparisonType: string,
    from: string,
    to: string
  ) => {
    if (!userData?.records) return [];

    return Object.keys(userData.labelMap).map((metric) => {
      let totalFrom = 0;
      let totalTo = 0;

      emailList.forEach((email) => {
        if (!userData.records[email]) return; // Skip if no data for user

        const userRecords = userData.records[email];

        if (comparisonType === "day") {
          totalFrom +=
            convertToPoints(userRecords[from]?.[metric], metric) || 0;
          totalTo += convertToPoints(userRecords[to]?.[metric], metric) || 0;
        } else {
          Object.keys(userRecords).forEach((date) => {
            if (comparisonType === "month" && date.startsWith(from)) {
              totalFrom +=
                convertToPoints(userRecords[date]?.[metric], metric) || 0;
            }
            if (comparisonType === "month" && date.startsWith(to)) {
              totalTo +=
                convertToPoints(userRecords[date]?.[metric], metric) || 0;
            }
            if (comparisonType === "year" && date.startsWith(from)) {
              totalFrom +=
                convertToPoints(userRecords[date]?.[metric], metric) || 0;
            }
            if (comparisonType === "year" && date.startsWith(to)) {
              totalTo +=
                convertToPoints(userRecords[date]?.[metric], metric) || 0;
            }
          });
        }
      });

      // Calculate percentage change
      let change = "0%";
      if (totalFrom === 0 && totalTo > 0) {
        change = "∞% ↑"; // Infinite increase
      } else if (totalFrom > 0 && totalTo === 0) {
        change = "-∞% ↓"; // Infinite decrease
      } else if (totalFrom !== totalTo) {
        let percentageChange = ((totalTo - totalFrom) / (totalFrom || 1)) * 100;
        change = `${percentageChange.toFixed(2)}% ${percentageChange > 0 ? "↑" : "↓"}`;
      }

      return {
        label: userData.labelMap[metric],
        from: totalFrom,
        to: totalTo,
        change,
        isIncrease: change.includes("↑"),
      };
    });
  };

  const getHtml2Pdf = async () => {
    const html2pdfModule = await import("html2pdf.js");
    return html2pdfModule.default || html2pdfModule; // Ensure correct function access
  };

  const convertToPDF = async () => {
    if (!comparisonData.length) {
      console.error(t("messages.noDataForPdf"));
      return;
    }

    const element = document.createElement("div");

    let tableHTML = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap');
            body {
              font-family: 'Noto Sans Bengali', sans-serif;
              text-align: center;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              text-align: center;
            }
            th, td {
              border: 1px solid #000;
              padding: 10px;
              text-align: center;
            }
            th {
              background-color: #16A085;
              color: white;
            }
            thead {
              display: table-header-group; 
            }
            tr {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <h2>${t("pdf.title")}</h2>
          <table>
            <thead>
              <tr>
                <th>${t("table.label")}</th>
                <th>${from}</th>
                <th>${to}</th>
                <th>${t("table.difference")}</th>
                <th>${t("table.change")}</th>
              </tr>
            </thead>
            <tbody>
              ${comparisonData
                .map(
                  (item) => `
                    <tr>
                      <td>${item.label}</td>
                      <td>${item.from}</td>
                      <td>${item.to}</td>
                      <td style="color: ${item.isIncrease ? "green" : "red"};">${item.to - item.from}</td>
                      <td style="color: ${item.isIncrease ? "green" : "red"};">${item.change}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>`;

    element.innerHTML = tableHTML;

    try {
      const html2pdf = await getHtml2Pdf();

      html2pdf()
        .set({
          margin: 10,
          filename: `comparison_report.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        })
        .from(element)
        .toPdf()
        .get("pdf")
        .then((pdf) => {
          const totalPages = pdf.internal.getNumberOfPages();
          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.text(
              t("pdf.page", { page: i, total: totalPages }),
              pdf.internal.pageSize.getWidth() - 20,
              pdf.internal.pageSize.getHeight() - 5
            );
          }
        })
        .save();
    } catch (error) {
      console.error(t("messages.errorGeneratingPDF"), error);
    }
  };

  return (
    <div className="p-2 lg:p-6 bg-white shadow-md rounded-lg">
      {/* <h1 className="text-2xl font-bold text-gray-800 mb-4">{t("title")}</h1> */}
      <div className="grid lg:flex lg:flex-wrap gap-4 mb-6">
        <select
          value={comparisonType}
          onChange={(e) => {
            setComparisonType(e.target.value);
            setFrom("");
            setTo("");
            setComparisonData([]); // Reset data on type change
          }}
          className="border px-4 py-2 rounded-md shadow-sm"
        >
          <option value="day">{t("controls.dayToDay")}</option>
          <option value="month">{t("controls.monthToMonth")}</option>
          <option value="year">{t("controls.yearToYear")}</option>
        </select>

        {comparisonType === "day" && (
          <>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border px-4 py-2 rounded-md shadow-sm"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border px-4 py-2 rounded-md shadow-sm"
            />
          </>
        )}

        {comparisonType === "month" && (
          <>
            <div className="grid lg:flex gap-2">
              <input
                type="month"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border px-4 py-2 rounded-md shadow-sm"
              />
              <span className="self-center font-bold">{t("controls.to")}</span>
              <input
                type="month"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border px-4 py-2 rounded-md shadow-sm"
              />
            </div>
          </>
        )}

        {comparisonType === "year" && (
          <>
            <div className="grid max-w-sm:w-full lg:flex lg:gap-2">
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border px-4 py-2 rounded-md shadow-sm"
              >
                {generateYearOptions()}
              </select>
              <span className="py-1 self-center font-bold">{t("controls.to")}</span>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border px-4 py-2 rounded-md shadow-sm"
              >
                {generateYearOptions()}
              </select>
            </div>
          </>
        )}

        <button
          onClick={handleCompare}
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700"
        >
          {t("controls.compare")}
        </button>
      </div>

      <div className="bg-gray-100 p-2 lg:p-4 rounded-lg shadow overflow-x-auto">
        {comparisonData.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300 text-sm lg:text-base">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 lg:px-4 py-1 lg:py-2">{t("table.label")}</th>
                <th className="border px-2 lg:px-4 py-1 lg:py-2">{from}</th>
                <th className="border px-2 lg:px-4 py-1 lg:py-2">{to}</th>
                <th className="border px-2 lg:px-4 py-1 lg:py-2">{t("table.difference")}</th>
                <th className="border px-2 lg:px-4 py-1 lg:py-2">{t("table.change")}</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((item, index) => (
                <tr key={index} className="text-center">
                  <td className="border px-2 lg:px-4 py-1 lg:py-2">
                    {item.label}
                  </td>
                  <td className="border px-2 lg:px-4 py-1 lg:py-2">
                    {item.from}
                  </td>
                  <td className="border px-2 lg:px-4 py-1 lg:py-2">
                    {item.to}
                  </td>
                  <td
                    className={`border px-2 lg:px-4 py-1 lg:py-2 font-bold ${item.isIncrease ? "text-green-600" : "text-red-600"}`}
                  >
                    {item.to - item.from}
                  </td>
                  <td
                    className={`border px-2 lg:px-4 py-1 lg:py-2 font-bold ${item.isIncrease ? "text-green-600" : "text-red-600"}`}
                  >
                    {item.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-600">
            {t('messages.selectValues')}
          </p>
        )}

        {comparisonData.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={convertToPDF}
              className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700"
            >
              {t("controls.downloadPdf")}
            </button>
          </div>
        )}
      </div>
      {comparisonData.length > 0 && (
        <div>
          <ComparisonTallyCard
            currentData={comparisonData.map((item) => ({
              label: item.label,
              value: item.to,
            }))}
            previousData={comparisonData.map((item) => ({
              label: item.label,
              value: item.from,
            }))}
          />
        </div>
      )}
    </div>
  );
};

// --- markaz normalization (single relation, legacy safe) ---
const getMarkazId = (u?: User): string | null => {
  if (!u) return null;
  if (u.markaz && typeof u.markaz === 'object' && !Array.isArray(u.markaz)) {
    return (u.markaz as any).id ?? (u as any).markazId ?? null;
  }
  return (u as any).markazId ?? null;
};

const getMarkazName = (u?: User): string | null => {
  if (!u?.markaz) return null;
  return typeof u.markaz === "string" ? u.markaz : (u.markaz as any).name ?? null;
};

const shareMarkaz = (a: User, b: User): boolean => {
  const aId = getMarkazId(a);
  const bId = getMarkazId(b);
  if (aId && bId) return aId === bId;
  const aName = getMarkazName(a);
  const bName = getMarkazName(b);
  if (aName && bName) return aName === bName;
  return false;
};

// Parent resolution updated for single markaz relation
const getParentEmail = (
  user: User,
  users: User[],
  loggedInUser: User | null
): string | null => {
  let parentUser: User | undefined;

  switch (user.role) {
    case "divisionadmin": {
      parentUser =
        (loggedInUser?.role === "centraladmin" ? loggedInUser : undefined) ||
        users.find((u) => u.role === "centraladmin");
      break;
    }
    case "markazadmin": {
      parentUser =
        users.find((u) => u.role === "divisionadmin" && u.division === user.division) ||
        (loggedInUser?.role === "centraladmin" ? loggedInUser : undefined) ||
        users.find((u) => u.role === "centraladmin");
      break;
    }
    case "daye": {
      parentUser =
        users.find((u) => u.role === "markazadmin" && shareMarkaz(u, user)) ||
        (loggedInUser?.role === "centraladmin" ? loggedInUser : undefined) ||
        users.find((u) => u.role === "centraladmin");
      break;
    }
    // legacy roles - keep for compatibility
    case "unionadmin": {
      parentUser =
        users.find((u) => u.role === "upozilaadmin" && u.upazila === user.upazila) ||
        users.find((u) => u.role === "districtadmin" && u.district === user.district) ||
        users.find((u) => u.role === "divisionadmin" && u.division === user.division) ||
        users.find((u) => u.role === "centraladmin");
      break;
    }
    case "upozilaadmin": {
      parentUser =
        users.find((u) => u.role === "districtadmin" && u.district === user.district) ||
        users.find((u) => u.role === "divisionadmin" && u.division === user.division) ||
        users.find((u) => u.role === "centraladmin");
      break;
    }
    case "districtadmin": {
      parentUser =
        users.find((u) => u.role === "divisionadmin" && u.division === user.division) ||
        users.find((u) => u.role === "centraladmin");
      break;
    }
    default:
      return null;
  }

  return parentUser ? parentUser.email : null;
};

export default ComparisonDataComponent;
