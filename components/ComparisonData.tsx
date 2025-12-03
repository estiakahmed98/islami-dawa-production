"use client";

//Juwel

import React, { useEffect, useState, useMemo, useRef } from "react";
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
    } else if (field === "quarntilawat") {
      const ayatMatch = value.match(/(\d+\s*-\s*\d+)|(\d+)/);
      if (ayatMatch) {
        const nums = ayatMatch[0]
          .split("-")
          .map((s: string) => parseInt(s.replace(/\D/g, ""), 10) || 0);
        const start = nums[0] || 0;
        const end = nums[1] || start;
        return Math.abs(end - start) || (start > 0 ? start : 1);
      }
      // If it's non-empty textual quarntilawat, count as 1 point
      return value ? 1 : 0;
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
  const [isFetching, setIsFetching] = useState(false);
  const t = useTranslations("comparison");

  const isFetchingRef = useRef(false);
  const yearOptions = useMemo(() => generateYearOptions(), []);
  const bengaliFont = "'Noto Sans Bengali', 'Noto Sans', sans-serif";

  const MOKTOB_LABELS: Record<string, string> = {
    notunMoktobChalu: "নতুন মক্তব চালু",
    totalMoktob: "মোট মক্তব",
    totalStudent: "মোট ছাত্র",
    obhibhabokConference: "অভিভাবক কনফারেন্স",
    moktoThekeMadrasaAdmission: "মক্তব থেকে মাদরাসায় ভর্ত্তি",
    notunBoyoskoShikkha: "নতুন বয়স্ক শিক্ষা",
    totalBoyoskoShikkha: "মোট বয়স্ক শিক্ষা",
    boyoskoShikkhaOnshogrohon: "বয়স্ক শিক্ষায় অংশগ্রহণ",
    newMuslimeDinerFikir: "নতুন মুসলিমের দিনের ফিকির",
  };
  const TALIM_LABELS: Record<string, string> = {
    mohilaTalim: "মহিলাদের তালিম",
    mohilaOnshogrohon: "মহিলাদের অংশগ্রহণ",
  };
  const DAYE_LABELS: Record<string, string> = {
    sohojogiDayeToiri: "সহযোগী দা'ঈ তৈরি",
  };
  const DAWATI_LABELS: Record<string, string> = {
    nonMuslimDawat: "অমুসলিমকে দাওয়াত",
    murtadDawat: "মুরতাদকে দাওয়াত",
    alemderSatheyMojlish: "আলেমদের সাথে কথপোকথন",
    publicSatheyMojlish: "জনসাধারণের সাথে দাওয়াতি কথপোকথন",
    nonMuslimSaptahikGasht: "অমুসলিম সাপ্তাহিক গাশত",
  };
  const DAWATI_MOJLISH_LABELS: Record<string, string> = {
    dawatterGuruttoMojlish: "দাওয়াতি গুরুত্বের মজলিশ",
    mojlisheOnshogrohon: "মজলিশে অংশগ্রহণ",
    prosikkhonKormoshalaAyojon: "প্রশিক্ষণ কর্মশালা আয়োজন",
    prosikkhonOnshogrohon: "প্রশিক্ষণে অংশগ্রহণ",
    jummahAlochona: "জুম্মার আলোচনা",
    dhormoSova: "ধর্মসভা",
    mashwaraPoint: "মাসিক মাশওয়ারার",
  };
  const JAMAT_LABELS: Record<string, string> = {
    jamatBerHoise: "জামাত বের হয়েছে",
    jamatSathi: "জামাত সাথী",
  };
  const DINEFERA_LABELS: Record<string, string> = {
    nonMuslimMuslimHoise: "অমুসলিম মুসলিম হয়েছে",
    murtadIslamFireche: "মুরতাদ ইসলাম ফিরেছে",
  };
  const SOFOR_LABELS: Record<string, string> = {
    madrasaVisit: "মাদরাসা ভিজিট",
    moktobVisit: "মক্তব ভিজিট",
    schoolCollegeVisit: "স্কুল/কলেজ ভিজিট",
  };

  type RecordsByEmail = Record<string, Record<string, Record<string, any>>>;
  type UserDataForAdminTable = {
    records: RecordsByEmail;
    labelMap: Record<string, string>;
  };

  const toDateKey = (iso: string) => {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const ensureEmailDateSlot = (
    records: RecordsByEmail,
    email: string,
    dateKey: string
  ) => {
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

  // Ensure Bangla font is available for UI
  useEffect(() => {
    const fontLinkId = "noto-sans-bengali";
    if (!document.getElementById(fontLinkId)) {
      const link = document.createElement("link");
      link.id = fontLinkId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap";
      document.head.appendChild(link);
    }
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
    if (comparisonType === "singleMonth") {
      if (!from) {
        alert(t("messages.invalidRange"));
        return;
      }
      setTo("");
    } else {
      if (!from || !to) {
        alert(t("messages.invalidRange"));
        return;
      }
    }

    if (isFetchingRef.current) return; // prevent duplicate calls (StrictMode or repeated clicks)
    isFetchingRef.current = true;
    setIsFetching(true);
    setComparisonData([]);

    const encodeEmails = (emails: string[]) =>
      emails.map((e) => encodeURIComponent(e)).join(",");

    const fetchModule = async (
      endpoint: string,
      emails: string[],
      mapper: (r: any, slot: any) => void,
      labelMap: Record<string, string>
    ) => {
      const records: RecordsByEmail = {};
      if (!emails.length) return { records, labelMap };
      try {
        const qs = encodeEmails(emails);
        const res = await fetch(`/api/${endpoint}?emails=${qs}`);
        if (!res.ok) return { records, labelMap };
        const json = await res.json();
        const respRecords = json.records || {};
        for (const em of emails) {
          const arr = respRecords[em] || [];
          arr.forEach((r: any) => {
            const dateKey = toDateKey(r.date);
            const slot = ensureEmailDateSlot(records, em, dateKey);
            mapper(r, slot);
          });
        }
      } catch (err) {
        console.error(`Error fetching ${endpoint}:`, err);
      }
      return { records, labelMap };
    };

    try {
      const [
        moktob,
        talim,
        daye,
        dawati,
        dawatiMojlish,
        jamat,
        dineFera,
        sofor,
      ] = await Promise.all([

        fetchModule(
          "moktob",
          emailList,
          (r, slot) => {
            slot.notunMoktobChalu = r.notunMoktobChalu ?? "-";
            slot.totalMoktob = r.totalMoktob ?? "-";
            slot.totalStudent = r.totalStudent ?? "-";
            slot.obhibhabokConference = r.obhibhabokConference ?? "-";
            slot.moktoThekeMadrasaAdmission =
              r.moktoThekeMadrasaAdmission ?? "-";
            slot.notunBoyoskoShikkha = r.notunBoyoskoShikkha ?? "-";
            slot.totalBoyoskoShikkha = r.totalBoyoskoShikkha ?? "-";
            slot.boyoskoShikkhaOnshogrohon = r.boyoskoShikkhaOnshogrohon ?? "-";
            slot.newMuslimeDinerFikir = r.newMuslimeDinerFikir ?? "-";
            slot.editorContent = r.editorContent || "";
          },
          MOKTOB_LABELS
        ),

        fetchModule(
          "talim",
          emailList,
          (r, slot) => {
            slot.mohilaTalim = r.mohilaTalim ?? "-";
            slot.mohilaOnshogrohon = r.mohilaOnshogrohon ?? "-";
            slot.editorContent = r.editorContent || "";
          },
          TALIM_LABELS
        ),

        fetchModule(
          "dayi",
          emailList,
          (r, slot) => {
            slot.sohojogiDayeToiri = r.sohojogiDayeToiri ?? "-";
            slot.editorContent = r.editorContent || "";
          },
          DAYE_LABELS
        ),

        fetchModule(
          "dawati",
          emailList,
          (r, slot) => {
            slot.nonMuslimDawat = r.nonMuslimDawat ?? "-";
            slot.murtadDawat = r.murtadDawat ?? "-";
            slot.alemderSatheyMojlish = r.alemderSatheyMojlish ?? "-";
            slot.publicSatheyMojlish = r.publicSatheyMojlish ?? "-";
            slot.nonMuslimSaptahikGasht = r.nonMuslimSaptahikGasht ?? "-";
            slot.editorContent = r.editorContent || "";
          },
          DAWATI_LABELS
        ),

        fetchModule(
          "dawatimojlish",
          emailList,
          (r, slot) => {
            slot.dawatterGuruttoMojlish = r.dawatterGuruttoMojlish ?? "-";
            slot.mojlisheOnshogrohon = r.mojlisheOnshogrohon ?? "-";
            slot.prosikkhonKormoshalaAyojon =
              r.prosikkhonKormoshalaAyojon ?? "-";
            slot.prosikkhonOnshogrohon = r.prosikkhonOnshogrohon ?? "-";
            slot.jummahAlochona = r.jummahAlochona ?? "-";
            slot.dhormoSova = r.dhormoSova ?? "-";
            slot.mashwaraPoint = r.mashwaraPoint ?? "-";
            slot.editorContent = r.editorContent || "";
          },
          DAWATI_MOJLISH_LABELS
        ),

        fetchModule(
          "jamat",
          emailList,
          (r, slot) => {
            slot.jamatBerHoise = r.jamatBerHoise ?? "-";
            slot.jamatSathi = r.jamatSathi ?? "-";
            slot.editorContent = r.editorContent || "";
          },
          JAMAT_LABELS
        ),

        fetchModule(
          "dinefera",
          emailList,
          (r, slot) => {
            slot.nonMuslimMuslimHoise = r.nonMuslimMuslimHoise ?? "-";
            slot.murtadIslamFireche = r.murtadIslamFireche ?? "-";
            slot.editorContent = r.editorContent || "";
          },
          DINEFERA_LABELS
        ),

        fetchModule(
          "soforbisoy",
          emailList,
          (r, slot) => {
            slot.madrasaVisit = r.madrasaVisit ?? "-";
            slot.moktobVisit = r.moktobVisit ?? "-";
            slot.schoolCollegeVisit = r.schoolCollegeVisit ?? "-";
          },
          SOFOR_LABELS
        ),
      ]);

      const allData = [
        moktob,
        dawati,
        dawatiMojlish,
        jamat,
        dineFera,
        talim,
        sofor,
        daye,
      ];
      if (comparisonType === "singleMonth") {
        const monthTotals = allData.flatMap((data) =>
          fetchSingleMonthData(data, from)
        );
        setComparisonData(monthTotals);
      } else {
        const combinedData = allData.flatMap((data) =>
          fetchUserComparisonData(data, comparisonType, from, to)
        );
        setComparisonData(combinedData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      isFetchingRef.current = false;
      setIsFetching(false);
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
        const userRecords = userData.records[email];
        if (!userRecords) return;

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

      let change = "0%";
      if (totalFrom === 0 && totalTo > 0) {
        change = "∞% ↑";
      } else if (totalFrom > 0 && totalTo === 0) {
        change = "-∞% ↓";
      } else if (totalFrom !== totalTo) {
        const percentageChange =
          ((totalTo - totalFrom) / (totalFrom || 1)) * 100;
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

  // Aggregate for a single selected month (no comparison)
  const fetchSingleMonthData = (userData: any, month: string) => {
    if (!userData?.records || !month) return [];

    return Object.keys(userData.labelMap).map((metric) => {
      let total = 0;
      emailList.forEach((email) => {
        const userRecords = userData.records[email];
        if (!userRecords) return;
        Object.keys(userRecords).forEach((date) => {
          if (date.startsWith(month)) {
            total += convertToPoints(userRecords[date]?.[metric], metric) || 0;
          }
        });
      });
      return { label: userData.labelMap[metric], total };
    });
  };
  const getHtml2Pdf = async () => {
    const html2pdfModule = await import("html2pdf.js");
    return html2pdfModule.default || html2pdfModule; // Ensure correct function access
  };

  const formatPeriodValue = (value: string, type: string) => {
    if (!value) return "-";
    if (type === "day") {
      const date = new Date(value);
      return isNaN(date.getTime())
        ? value
        : date.toLocaleDateString("bn-BD", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
    }
    if (type === "month") {
      const date = new Date(`${value}-01`);
      return isNaN(date.getTime())
        ? value
        : date.toLocaleDateString("bn-BD", {
            year: "numeric",
            month: "long",
          });
    }
    return value; // year
  };

  const isSingleMonth = comparisonType === "singleMonth";
  const formattedFrom = isSingleMonth
    ? formatPeriodValue(from, "month")
    : formatPeriodValue(from, comparisonType);
  const formattedTo = formatPeriodValue(to, comparisonType);

  const convertToPDF = async () => {
    if (!comparisonData.length) {
      console.error(t("messages.noDataForPdf"));
      return;
    }

    // Ensure Bangla font is available for PDF render
    const fontLinkId = "noto-sans-bengali-pdf";
    if (!document.getElementById(fontLinkId)) {
      const link = document.createElement("link");
      link.id = fontLinkId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap";
      document.head.appendChild(link);
    }
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {
        // ignore font load wait errors
      }
    }

    const element = document.createElement("div");
    element.setAttribute("lang", "bn");
    element.style.fontFamily = "'Noto Sans Bengali', 'Noto Sans', sans-serif";

    // For the PDF title
    const pdfTitle = isSingleMonth
      ? ` ইসলামি দাওয়াহ ইনস্টিটিউট বাংলাদেশ<br>মাসিক রিপোর্ট - ${formattedFrom}`
      : `${t("pdf.title")} (${formattedFrom} ${t("controls.to")} ${formattedTo})`;

    // For the filename
    const fileName = isSingleMonth
      ? `ইসলামি দাওয়াহ ইনস্টিটিউট বাংলাদেশ<br>মাসিক_রিপোর্ট_${formattedFrom}.pdf`
      : `comparison_report_${formattedFrom}_to_${formattedTo}.pdf`;

    let tableHTML = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap');
            body {
              font-family: 'Noto Sans Bengali', sans-serif;
              text-align: center;
              font-size: ${isSingleMonth ? "10px" : "12px"};
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
              text-align: center;
              ${isSingleMonth ? "table-layout: fixed;" : ""}
            }
            th, td {
              border: 1px solid #000;
              padding: ${isSingleMonth ? "6px" : "10px"};
              text-align: center;
            }
            th {
              background-color: #16A085;
              color: white;
            }
            td { font-weight: 600; }
            thead {
              display: table-header-group; 
            }
            tr {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <h2>${pdfTitle}</h2>
          ${
            isSingleMonth
              ? `<table>
                  <thead>
                    <tr>
                      <th>${t("table.label")}</th>
                      <th>${formattedFrom}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${comparisonData
                      .map(
                        (item) => `
                          <tr>
                            <td>${item.label}</td>
                            <td>${item.total}</td>
                          </tr>
                        `
                      )
                      .join("")}
                  </tbody>
                </table>`
              : `<table>
                  <thead>
                    <tr>
                      <th>${t("table.label")}</th>
                      <th>${formattedFrom}</th>
                      <th>${formattedTo}</th>
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
                            <td style="color: ${item.isIncrease ? "green" : "red"};">${Number(item.to) - Number(item.from)}</td>
                            <td style="color: ${item.isIncrease ? "green" : "red"};">${item.change}</td>
                          </tr>
                        `
                      )
                      .join("")}
                  </tbody>
                </table>`
          }
        </body>
      </html>`;

    element.innerHTML = tableHTML;

    try {
      const html2pdf = await getHtml2Pdf();

      html2pdf()
        .set({
          margin: isSingleMonth ? 5 : 10,
          filename: fileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: isSingleMonth ? "portrait" : "landscape",
          },
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
              isSingleMonth ? `Page ${i} of ${totalPages}` : `Page ${i} of ${totalPages}`,
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
    <div
      className="p-2 lg:p-6 bg-white shadow-md rounded-lg"
      style={{ fontFamily: bengaliFont }}
    >
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
          <option value="singleMonth">{t("controls.singleMonth")}</option>
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

        {comparisonType === "singleMonth" && (
          <div className="grid lg:flex gap-2">
            <input
              type="month"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border px-4 py-2 rounded-md shadow-sm"
            />
          </div>
        )}

        {comparisonType === "year" && (
          <>
            <div className="grid max-w-sm:w-full lg:flex lg:gap-2">
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border px-4 py-2 rounded-md shadow-sm"
              >
                {yearOptions}
              </select>
              <span className="py-1 self-center font-bold">
                {t("controls.to")}
              </span>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border px-4 py-2 rounded-md shadow-sm"
              >
                {yearOptions}
              </select>
            </div>
          </>
        )}

        <button
          onClick={handleCompare}
          disabled={isFetching}
          className={`bg-blue-600 text-white px-4 py-2 rounded-md shadow-md ${isFetching ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"}`}
        >
          {isFetching
            ? t("controls.loading") || t("controls.compare")
            : t("controls.compare")}
        </button>
      </div>

      <div className="bg-gray-100 p-2 lg:p-4 rounded-lg shadow overflow-x-auto">
        {comparisonData.length > 0 ? (
          isSingleMonth ? (
            <table className="w-full border-collapse border border-gray-300 text-sm lg:text-base">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-2 lg:px-4 py-1 lg:py-2">
                    {t("table.label")}
                  </th>
                  <th className="border px-2 lg:px-4 py-1 lg:py-2">
                    {formattedFrom}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((item: any, index) => (
                  <tr key={index} className="text-center">
                    <td className="border px-2 lg:px-4 py-1 lg:py-2">
                      {item.label}
                    </td>
                    <td className="border px-2 lg:px-4 py-1 lg:py-2 font-bold text-emerald-700">
                      {item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full border-collapse border border-gray-300 text-sm lg:text-base">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-2 lg:px-4 py-1 lg:py-2">
                    {t("table.label")}
                  </th>
                  <th className="border px-2 lg:px-4 py-1 lg:py-2">
                    {formattedFrom}
                  </th>
                  <th className="border px-2 lg:px-4 py-1 lg:py-2">
                    {formattedTo}
                  </th>
                  <th className="border px-2 lg:px-4 py-1 lg:py-2">
                    {t("table.difference")}
                  </th>
                  <th className="border px-2 lg:px-4 py-1 lg:py-2">
                    {t("table.change")}
                  </th>
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
          )
        ) : (
          <p className="text-center text-gray-600">
            {t("messages.selectValues")}
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
      {comparisonData.length > 0 && !isSingleMonth && (
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
  if (u.markaz && typeof u.markaz === "object" && !Array.isArray(u.markaz)) {
    return (u.markaz as any).id ?? (u as any).markazId ?? null;
  }
  return (u as any).markazId ?? null;
};

const getMarkazName = (u?: User): string | null => {
  if (!u?.markaz) return null;
  return typeof u.markaz === "string"
    ? u.markaz
    : ((u.markaz as any).name ?? null);
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
        users.find(
          (u) => u.role === "divisionadmin" && u.division === user.division
        ) ||
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
        users.find(
          (u) => u.role === "upozilaadmin" && u.upazila === user.upazila
        ) ||
        users.find(
          (u) => u.role === "districtadmin" && u.district === user.district
        ) ||
        users.find(
          (u) => u.role === "divisionadmin" && u.division === user.division
        ) ||
        users.find((u) => u.role === "centraladmin");
      break;
    }
    case "upozilaadmin": {
      parentUser =
        users.find(
          (u) => u.role === "districtadmin" && u.district === user.district
        ) ||
        users.find(
          (u) => u.role === "divisionadmin" && u.division === user.division
        ) ||
        users.find((u) => u.role === "centraladmin");
      break;
    }
    case "districtadmin": {
      parentUser =
        users.find(
          (u) => u.role === "divisionadmin" && u.division === user.division
        ) || users.find((u) => u.role === "centraladmin");
      break;
    }
    default:
      return null;
  }

  return parentUser ? parentUser.email : null;
};

export default ComparisonDataComponent;
