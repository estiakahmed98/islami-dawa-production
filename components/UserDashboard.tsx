"use client";

import React, { useState, useEffect } from "react";
import AmoliChart from "@/components/AmoliCharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/TabButton";
import { useSession } from "@/lib/auth-client";
import AmoliTableShow from "@/components/TableShow";
import UniversalTableShow from "@/components/TableShow"; // Added UniversalTableShow
import TallyAdmin from "@/components/TallyAdmin";
import ComparisonTallyCard from "@/components/ComparisonTallyCard";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import UserTableShowPDFButton from "@/components/UserTableShowPDFButton"; // Add this line

interface TallyProps {
  userData: Record<string, any>;
  email: string;
  title: string;
}

const Dashboard: React.FC<TallyProps> = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";
  const t = useTranslations("dashboard.UserDashboard");

  // State for main dashboard
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // State for comparison feature
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonType, setComparisonType] = useState("day");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  // State for data from API
  const [userAmoliData, setUserAmoliData] = useState<any>({ records: {} });
  const [userMoktobBisoyData, setUserMoktobBisoyData] = useState<any>({ records: {} });
  const [userDawatiBisoyData, setUserDawatiBisoyData] = useState<any>({ records: {} });
  const [userDawatiMojlishData, setUserDawatiMojlishData] = useState<any>({ records: {} });
  const [userJamatBisoyData, setUserJamatBisoyData] = useState<any>({ records: {} });
  const [userDineFeraData, setUserDineFeraData] = useState<any>({ records: {} });
  const [userTalimBisoyData, setUserTalimBisoyData] = useState<any>({ records: {} });
  const [userSoforBishoyData, setUserSoforBishoyData] = useState<any>({ records: {} });
  const [userDayeData, setUserDayeData] = useState<any>({ records: {} });
  const [loading, setLoading] = useState(true);

  // Shared detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailModalTitle, setDetailModalTitle] = useState("");
  const [detailModalDate, setDetailModalDate] = useState("");
  const [detailModalItems, setDetailModalItems] = useState<any[]>([]);


  // Handler for month change
  const onMonthChange = (month: number) => {
    setSelectedMonth(month);
  };

  // Handler for year change
  const onYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const months = [
    t("months.january"),
    t("months.february"),
    t("months.march"),
    t("months.april"),
    t("months.may"),
    t("months.june"),
    t("months.july"),
    t("months.august"),
    t("months.september"),
    t("months.october"),
    t("months.november"),
    t("months.december"),
  ];

  const categories = [
    { title: t("dashboard.amoliMuhasaba"), userData: userAmoliData, selectedMonth, selectedYear },
    { title: t("dashboard.moktobSubject"), userData: userMoktobBisoyData, selectedMonth, selectedYear },
    { title: t("dashboard.talimSubject"), userData: userTalimBisoyData, selectedMonth, selectedYear },
    { title: t("dashboard.dayiSubject"), userData: userDayeData, selectedMonth, selectedYear },
    { title: t("dashboard.dawatiSubject"), userData: userDawatiBisoyData, selectedMonth, selectedYear },
    { title: t("dashboard.dawatiMojlish"), userData: userDawatiMojlishData, selectedMonth, selectedYear },
    { title: t("dashboard.jamatSubject"), userData: userJamatBisoyData, selectedMonth, selectedYear },
    { title: t("dashboard.dineFera"), userData: userDineFeraData, selectedMonth, selectedYear },
    { title: t("dashboard.soforSubject"), userData: userSoforBishoyData, selectedMonth, selectedYear },
  ];

  // Helper function to format date as YYYY-MM-DD (Dhaka timezone)
  function dhakaYMD(d: Date) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  }

  // Helper function to convert array to numbered HTML list
  function toNumberedHTML(arr: unknown): string {
    const list = Array.isArray(arr) ? arr.filter(Boolean).map(String) : [];
    if (list.length === 0) return "";
    return list.map((item, idx) => `${idx + 1}. ${item}`).join("<br/>");
  }

  // Click handler coming from UniversalTableShow (for Daye & Sofor tabs)
  const handleUserCellClick = (info: { email: string; dateKey: string; rowKey: string }) => {
    const { dateKey, rowKey } = info;

    // DAYE: assistants list
    if (rowKey === "assistantsList") {
      const items = userDayeData?._assistantsByDate?.[dateKey] || [];
      console.log("Assistants click:", { dateKey, rowKey, items, userDayeData });
      setDetailModalTitle(t("dashboard.dayiSubject"));
      setDetailModalDate(dateKey);
      setDetailModalItems(items);
      if (items.length) setDetailModalOpen(true);
      return;
    }

    // SOFOR: madrasa / school lists
    if (rowKey === "madrasaVisitList") {
      const items = userSoforBishoyData?._madrasaByDate?.[dateKey] || [];
      console.log("Madrasa click:", { dateKey, rowKey, items, userSoforBishoyData });
      setDetailModalTitle(t("dashboard.soforSubject"));
      setDetailModalDate(dateKey);
      setDetailModalItems(items);
      if (items.length) setDetailModalOpen(true);
      return;
    }
    if (rowKey === "schoolCollegeVisitList") {
      const items = userSoforBishoyData?._schoolByDate?.[dateKey] || [];
      console.log("School click:", { dateKey, rowKey, items, userSoforBishoyData });
      setDetailModalTitle(t("dashboard.soforSubject"));
      setDetailModalDate(dateKey);
      setDetailModalItems(items);
      if (items.length) setDetailModalOpen(true);
    }
  };

  // Fetch all data from API
  useEffect(() => {
    if (!userEmail) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const endpoints = [
          {
            url: `/api/amoli?email=${encodeURIComponent(userEmail)}`, setter: setUserAmoliData, labelMap: {
              tahajjud: t("amoli.tahajjud"),
              surah: t("amoli.surah"),
              ayat: t("amoli.ayat"),
              zikir: t("amoli.zikir"),
              ishraq: t("amoli.ishraq"),
              jamat: t("amoli.jamat"),
              sirat: t("amoli.sirat"),
              Dua: t("amoli.dua"),
              ilm: t("amoli.ilm"),
              tasbih: t("amoli.tasbih"),
              dayeeAmol: t("amoli.dayeeAmol"),
              amoliSura: t("amoli.amoliSura"),
              ayamroja: t("amoli.ayamroja"),
              hijbulBahar: t("amoli.hijbulBahar"),
            }
          },
          {
            url: `/api/moktob?email=${encodeURIComponent(userEmail)}`, setter: setUserMoktobBisoyData, labelMap: {
              notunMoktobChalu: t("moktob.notunMoktobChalu"),
              totalMoktob: t("moktob.totalMoktob"),
              totalStudent: t("moktob.totalStudent"),
              obhibhabokConference: t("moktob.obhibhabokConference"),
              moktoThekeMadrasaAdmission: t("moktob.moktoThekeMadrasaAdmission"),
              notunBoyoskoShikkha: t("moktob.notunBoyoskoShikkha"),
              totalBoyoskoShikkha: t("moktob.totalBoyoskoShikkha"),
              boyoskoShikkhaOnshogrohon: t("moktob.boyoskoShikkhaOnshogrohon"),
              newMuslimeDinerFikir: t("moktob.newMuslimeDinerFikir"),
            }
          },
          {
            url: `/api/talim?email=${encodeURIComponent(userEmail)}`, setter: setUserTalimBisoyData, labelMap: {
              mohilaTalim: t("talim.mohilaTalim"),
              mohilaOnshogrohon: t("talim.mohilaOnshogrohon"),
            }
          },
          {
            url: `/api/dayi?email=${encodeURIComponent(userEmail)}`,
            setter: setUserDayeData,
            labelMap: {
              sohojogiDayeToiri: t("dayi.sohojogiDayeToiri"),
              // ADD THIS so the table shows the clickable row:
              assistantsList: t("dayi.assistantsList"),
            }
          },
          {
            url: `/api/dawati?email=${encodeURIComponent(userEmail)}`, setter: setUserDawatiBisoyData, labelMap: {
              nonMuslimDawat: t("dawati.nonMuslimDawat"),
              murtadDawat: t("dawati.murtadDawat"),
              alemderSatheyMojlish: t("dawati.alemderSatheyMojlish"),
              publicSatheyMojlish: t("dawati.publicSatheyMojlish"),
              nonMuslimSaptahikGasht: t("dawati.nonMuslimSaptahikGasht"),
            }
          },
          {
            url: `/api/dawatimojlish?email=${encodeURIComponent(userEmail)}`, setter: setUserDawatiMojlishData, labelMap: {
              dawatterGuruttoMojlish: t("dawatiMojlish.dawatterGuruttoMojlish"),
              mojlisheOnshogrohon: t("dawatiMojlish.mojlisheOnshogrohon"),
              alemderSatheyMojlish: t("dawatiMojlish.alemderSatheyMojlish"),
              publicSatheyMojlish: t("dawatiMojlish.publicSatheyMojlish"),
              prosikkhonKormoshalaAyojon: t("dawatiMojlish.prosikkhonKormoshalaAyojon"),
              prosikkhonOnshogrohon: t("dawatiMojlish.prosikkhonOnshogrohon"),
              jummahAlochona: t("dawatiMojlish.jummahAlochona"),
              dhormoSova: t("dawatiMojlish.dhormoSova"),
              mashwaraPoint: t("dawatiMojlish.mashwaraPoint"),
            }
          },
          {
            url: `/api/jamat?email=${encodeURIComponent(userEmail)}`, setter: setUserJamatBisoyData, labelMap: {
              jamatBerHoise: t("jamat.jamatBerHoise"),
              jamatSathi: t("jamat.jamatSathi"),
            }
          },
          {
            url: `/api/dinefera?email=${encodeURIComponent(userEmail)}`, setter: setUserDineFeraData, labelMap: {
              nonMuslimMuslimHoise: t("dineFera.nonMuslimMuslimHoise"),
              murtadIslamFireche: t("dineFera.murtadIslamFireche"),
            }
          },
          {
            url: `/api/soforbisoy?email=${encodeURIComponent(userEmail)}`,
            setter: setUserSoforBishoyData,
            labelMap: {
              moktobVisit: t("soforbisoy.moktobVisit"),
              madrasaVisit: t("soforbisoy.madrasaVisit"),
              schoolCollegeVisit: t("soforbisoy.schoolCollegeVisit"),
              madrasaVisitList: t("soforbisoy.madrasaVisitList"),
              schoolCollegeVisitList: t("soforbisoy.schoolCollegeVisitList"),
            }
          },
        ];

        const fetchPromises = endpoints.map(async ({ url, setter, labelMap }) => {
          try {
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) throw new Error(`Failed to fetch ${url}`);
            const json = await res.json();
            const records = Array.isArray(json.records) ? json.records : [];
            const transformed: Record<string, Record<string, any>> = { [userEmail]: {} };

            // NEW: detail maps (attach to dataset object later)
            const assistantsByDate: Record<string, any[]> = {};
            const madrasaByDate: Record<string, string[]> = {};
            const schoolByDate: Record<string, string[]> = {};

            records.forEach((rec: any) => {
              const dateKey = dhakaYMD(new Date(rec.date));
              transformed[userEmail][dateKey] = { ...rec };

              // --- Keep raw arrays for modals ---
              if (Array.isArray(rec.assistants)) {
                assistantsByDate[dateKey] = rec.assistants; // raw array for Daye modal
                transformed[userEmail][dateKey].assistantsList = toNumberedHTML(
                  rec.assistants.map((a: any) => `${a.name} (${a.phone || ""})`)
                );
              }

              if (Array.isArray(rec.madrasaVisitList)) {
                madrasaByDate[dateKey] = rec.madrasaVisitList; // raw array for Sofor modal
                transformed[userEmail][dateKey].madrasaVisitList = toNumberedHTML(rec.madrasaVisitList);
              }
              if (Array.isArray(rec.schoolCollegeVisitList)) {
                schoolByDate[dateKey] = rec.schoolCollegeVisitList; // raw array for Sofor modal
                transformed[userEmail][dateKey].schoolCollegeVisitList = toNumberedHTML(rec.schoolCollegeVisitList);
              }
              // Existing handling for other array fields if they are not for modals
              if (rec.assistants && !Array.isArray(rec.assistants)) { // Ensure not to overwrite if already handled for modal
                transformed[userEmail][dateKey].assistants = toNumberedHTML(
                  rec.assistants.map((a: any) => `${a.name} (${a.phone})`)
                );
              }
            });

            // set into state WITH detail maps (they'll only exist where relevant)
            setter({
              records: transformed,
              labelMap,
              _assistantsByDate: assistantsByDate,
              _madrasaByDate: madrasaByDate,
              _schoolByDate: schoolByDate,
            });
          } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            toast.error(t("toast.errorFetchingData"));
          }
        });
        await Promise.all(fetchPromises);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error(t("toast.errorFetchingData"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userEmail]);

  // Filter data by selected month and year
  const filterChartAndTallyData = (userData: any) => {
    if (!userData || !userData.records) return userData;
    const filteredRecords = Object.keys(userData.records).reduce<Record<string, any>>(
      (filtered, email) => {
        const emailData = userData.records[email];
        const filteredDates = Object.keys(emailData).reduce<Record<string, any>>(
          (acc, date) => {
            const dateObj = new Date(date);
            if (dateObj.getFullYear() === selectedYear && dateObj.getMonth() === selectedMonth) {
              acc[date] = emailData[date];
            }
            return acc;
          },
          {}
        );
        if (Object.keys(filteredDates).length > 0) {
          filtered[email] = filteredDates;
        }
        return filtered;
      },
      {}
    );
    return { ...userData, records: filteredRecords };
  };

  // Convert values to points for comparison
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
    return 0;
  };

  // Fetch comparison data
  const fetchUserComparisonData = (
    userData: any,
    comparisonType: string,
    from: string,
    to: string
  ) => {
    if (!userData?.records) return [];
    const userRecords = userData.records[userEmail] || {};
    return Object.keys(userData.labelMap).map((metric) => {
      let totalFrom = 0;
      let totalTo = 0;
      if (comparisonType === "day") {
        totalFrom += convertToPoints(userRecords[from]?.[metric], metric);
        totalTo += convertToPoints(userRecords[to]?.[metric], metric);
      } else {
        Object.keys(userRecords).forEach((date) => {
          const dateObj = new Date(date);
          const dateStr = comparisonType === "month"
            ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`
            : String(dateObj.getFullYear());
          if (dateStr === from) {
            totalFrom += convertToPoints(userRecords[date]?.[metric], metric);
          }
          if (dateStr === to) {
            totalTo += convertToPoints(userRecords[date]?.[metric], metric);
          }
        });
      }
      let change = "0%";
      if (totalFrom === 0 && totalTo > 0) {
        change = "∞% ↑";
      } else if (totalFrom > 0 && totalTo === 0) {
        change = "-∞% ↓";
      } else if (totalFrom === totalTo) {
        change = "0%";
      } else {
        let percentageChange;
        totalFrom = isNaN(totalFrom) ? 0 : totalFrom;
        totalTo = isNaN(totalTo) ? 0 : totalTo;
        if (totalTo - totalFrom > 0) {
          percentageChange =
            ((Math.max(totalTo, totalFrom) - Math.min(totalTo, totalFrom)) /
              Math.min(totalTo, totalFrom)) *
            100;
        } else {
          percentageChange =
            -(
              (Math.max(totalTo, totalFrom) - Math.min(totalTo, totalFrom)) /
              Math.min(totalTo, totalFrom)
            ) * 100;
        }
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

  // Handle comparison button click
  const handleCompare = () => {
    if (!from || !to) {
      alert("Please select both 'From' and 'To' values.");
      return;
    }
    const allData = [
      userAmoliData,
      userMoktobBisoyData,
      userDawatiBisoyData,
      userDawatiMojlishData,
      userJamatBisoyData,
      userDineFeraData,
      userTalimBisoyData,
      userSoforBishoyData,
      userDayeData,
    ];
    const combinedData = allData.flatMap((data) =>
      fetchUserComparisonData(data, comparisonType, from, to)
    );
    setComparisonData(combinedData);
  };

  const getHtml2Pdf = async () => {
    const html2pdfModule = await import("html2pdf.js");
    return html2pdfModule.default || html2pdfModule;
  };

  const convertToPDF = async () => {
    if (!comparisonData.length) {
      console.error("No data available for PDF generation");
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
          <h2>তুলনা রিপোর্ট</h2>
          <table>
            <thead>
              <tr>
                <th>Label</th>
                <th>${from}</th>
                <th>${to}</th>
                <th>Difference</th>
                <th>Change</th>
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
              `Page ${i} of ${totalPages}`,
              pdf.internal.pageSize.getWidth() - 20,
              pdf.internal.pageSize.getHeight() - 5
            );
          }
        })
        .save();
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row justify-between items-center bg-white shadow-md p-6 rounded-xl">
        {/* Heading */}
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center lg:text-left">
          {t("welcome")},{" "}
          <span className="text-emerald-600">{session?.user?.name}</span>
        </h1>
        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto justify-center lg:justify-end">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="bg-emerald-600 text-white font-semibold px-4 md:px-6 py-2 rounded-lg shadow-md hover:bg-emerald-700 transition-all duration-300 w-full md:w-auto"
          >
            {showComparison ? t("dashboard.backToDashboard") : t("dashboard.comparison")}
          </button>
          {!showComparison && (
            <div className="flex gap-3 items-center w-full md:w-auto">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full sm:w-40 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500 cursor-pointer"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full sm:w-24 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500 cursor-pointer"
              >
                {Array.from({ length: 10 }, (_, i) => 2020 + i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      {showComparison ? (
        <div className="bg-white p-2 lg:p-6 rounded-lg shadow-md space-y-4">
          <div className="grid lg:flex lg:flex-wrap gap-4 items-center">
            <select
              value={comparisonType}
              onChange={(e) => setComparisonType(e.target.value)}
              className="border px-4 py-2 rounded-md shadow-sm"
            >
              <option value="day">{t("comparison.day")}</option>
              <option value="month">{t("comparison.month")}</option>
              <option value="year">{t("comparison.year")}</option>
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
              <div className="grid lg:flex gap-2">
                <input
                  type="month"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="border px-4 py-2 rounded-md shadow-sm"
                />
                <span className="font-bold">{t("comparison.from")}</span>
                <input
                  type="month"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="border px-4 py-2 rounded-md shadow-sm"
                />
              </div>
            )}
            {comparisonType === "year" && (
              <div className="grid max-w-sm:w-full lg:flex lg:gap-2">
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="border px-4 py-2 rounded-md shadow-sm"
                >
                  {Array.from({ length: 10 }, (_, i) => 2020 + i).map(
                    (year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  )}
                </select>
                <span className="font-bold">{t("comparison.from")}</span>
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="border px-4 py-2 rounded-md shadow-sm"
                >
                  {Array.from({ length: 10 }, (_, i) => 2020 + i).map(
                    (year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}
            <button
              onClick={handleCompare}
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700"
            >
              {t("comparison.compare")}
            </button>
          </div>
          <div className="bg-gray-100 p-2 lg:p-4 rounded-lg shadow overflow-x-auto">
            {comparisonData.length > 0 ? (
              <table className="w-full border-collapse border border-gray-300 text-sm lg:text-base">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-2 lg:px-4 py-1 lg:py-2">{t("comparison.label")}</th>
                    <th className="border px-2 lg:px-4 py-1 lg:py-2">{from}</th>
                    <th className="border px-2 lg:px-4 py-1 lg:py-2">{to}</th>
                    <th className="border px-2 lg:px-4 py-1 lg:py-2">
                      {t("comparison.difference")}
                    </th>
                    <th className="border px-2 lg:px-4 py-1 lg:py-2">
                      {t("comparison.change")}
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
            ) : (
              <p className="text-center text-gray-600">
                {t("comparison.noData")}
              </p>
            )}
            {comparisonData.length > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={convertToPDF}
                  className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700"
                >
                  {t("comparison.downloadPdf")}
                </button>
              </div>
            )}
          </div>
          {comparisonData.length > 0 && (
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
          )}
        </div>
      ) : (
        <>
          <div className="grid xl:grid-cols-3 p-2 lg:p-6 gap-6 overflow-y-auto border border-[#155E75] rounded-xl">
            <AmoliChart
              data={filterChartAndTallyData(userAmoliData).records}
              userEmail={userEmail}
            />
            <TallyAdmin
              userData={filterChartAndTallyData(userMoktobBisoyData)}
              emails={userEmail}
              title={t("dashboard.moktobSubject")}
            />
            <TallyAdmin
              userData={filterChartAndTallyData(userDawatiBisoyData)}
              emails={userEmail}
              title={t("dashboard.dawatiSubject")}
            />
            <TallyAdmin
              userData={filterChartAndTallyData(userDawatiMojlishData)}
              emails={userEmail}
              title={t("dashboard.dawatiMojlish")}
            />
            <TallyAdmin
              userData={filterChartAndTallyData(userJamatBisoyData)}
              emails={userEmail}
              title={t("dashboard.jamatSubject")}
            />
            <TallyAdmin
              userData={filterChartAndTallyData(userDineFeraData)}
              emails={userEmail}
              title={t("dashboard.dineFera")}
            />
            <TallyAdmin
              userData={filterChartAndTallyData(userTalimBisoyData)}
              emails={userEmail}
              title={t("dashboard.talimSubject")}
            />
            <TallyAdmin
              userData={filterChartAndTallyData(userSoforBishoyData)}
              emails={userEmail}
              title={t("dashboard.soforSubject")}
            />
            <TallyAdmin
              userData={filterChartAndTallyData(userDayeData)}
              emails={userEmail}
              title={t("dashboard.dayiSubject")}
            />
          </div>
          <div className="border border-[#155E75] p-2 lg:p-6 mt-10 rounded-xl overflow-y-auto">
            <Tabs defaultValue="Amolimusahaba" className="w-full lg:p-4">
              <TabsList className="mx-10 grid grid-cols-2 md:grid-cols-4 my-6">
                <TabsTrigger value="Amolimusahaba">{t("dashboard.amoliMuhasaba")}</TabsTrigger>
                <TabsTrigger value="moktob">{t("dashboard.moktobSubject")}</TabsTrigger>
                <TabsTrigger value="talim">{t("dashboard.talimSubject")}</TabsTrigger>
                <TabsTrigger value="daye">{t("dashboard.dayiSubject")}</TabsTrigger>
                <TabsTrigger value="dawati">{t("dashboard.dawatiSubject")}</TabsTrigger>
                <TabsTrigger value="dawatimojlish">{t("dashboard.dawatiMojlish")}</TabsTrigger>
                <TabsTrigger value="jamat">{t("dashboard.jamatSubject")}</TabsTrigger>
                <TabsTrigger value="dinefera">{t("dashboard.dineFera")}</TabsTrigger>
                <TabsTrigger value="sofor">{t("dashboard.soforSubject")}</TabsTrigger>
              </TabsList>
              {/* Tab Content */}
              <TabsContent value="Amolimusahaba">
                <div className="bg-gray-50 rounded shadow">
                  <AmoliTableShow userData={userAmoliData} selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={onMonthChange} onYearChange={onYearChange} categories={categories} userEmail={userEmail} userName={session?.user?.name || ""} />
                </div>
              </TabsContent>
              <TabsContent value="moktob">
                <div className="bg-gray-50 rounded shadow">
                  <AmoliTableShow userData={userMoktobBisoyData} selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={onMonthChange} onYearChange={onYearChange} categories={categories} userEmail={userEmail} userName={session?.user?.name || ""} />
                </div>
              </TabsContent>
              <TabsContent value="talim">
                <div className="bg-gray-50 rounded shadow">
                  <AmoliTableShow userData={userTalimBisoyData} selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={onMonthChange} onYearChange={onYearChange} categories={categories} userEmail={userEmail} userName={session?.user?.name || ""} />
                </div>
              </TabsContent>
              <TabsContent value="daye">
                <div className="bg-gray-50 rounded shadow">
                  <UniversalTableShow
                    userData={userDayeData}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onMonthChange={onMonthChange}
                    onYearChange={onYearChange}
                    htmlFields={["assistantsList"]}          // render <br/> lists nicely
                    clickableFields={["assistantsList"]}     // make cells clickable
                    onCellClick={handleUserCellClick}        // open modal
                    categories={categories}
                    userEmail={userEmail}
                    userName={session?.user?.name || ""}
                  />
                </div>
              </TabsContent>
              <TabsContent value="dawati">
                <div className="bg-gray-50 rounded shadow">
                  <AmoliTableShow userData={userDawatiBisoyData} selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={onMonthChange} onYearChange={onYearChange} categories={categories} userEmail={userEmail} userName={session?.user?.name || ""} />
                </div>
              </TabsContent>
              <TabsContent value="dawatimojlish">
                <div className="bg-gray-50 rounded shadow">
                  <AmoliTableShow userData={userDawatiMojlishData} selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={onMonthChange} onYearChange={onYearChange} categories={categories} userEmail={userEmail} userName={session?.user?.name || ""} />
                </div>
              </TabsContent>
              <TabsContent value="jamat">
                <div className="bg-gray-50 rounded shadow">
                  <AmoliTableShow userData={userJamatBisoyData} selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={onMonthChange} onYearChange={onYearChange} categories={categories} userEmail={userEmail} userName={session?.user?.name || ""} />
                </div>
              </TabsContent>
              <TabsContent value="dinefera">
                <div className="bg-gray-50 rounded shadow">
                  <AmoliTableShow userData={userDineFeraData} selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={onMonthChange} onYearChange={onYearChange} categories={categories} userEmail={userEmail} userName={session?.user?.name || ""} />
                </div>
              </TabsContent>
              <TabsContent value="sofor">
                <div className="bg-gray-50 rounded shadow">
                  <UniversalTableShow
                    userData={userSoforBishoyData}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onMonthChange={onMonthChange}
                    onYearChange={onYearChange}
                    htmlFields={["madrasaVisitList", "schoolCollegeVisitList"]}
                    clickableFields={["madrasaVisitList", "schoolCollegeVisitList"]}
                    onCellClick={handleUserCellClick}
                    categories={categories}
                    userEmail={userEmail}
                    userName={session?.user?.name || ""}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
      {detailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-semibold">
                {detailModalTitle} — {detailModalDate}
              </h3>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="rounded p-1 hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto p-6 space-y-3">
              {/* Assistants: full cards */}
              {detailModalTitle === t("dashboard.dayiSubject") ? (
                (() => {
                  console.log("Rendering assistants modal:", { detailModalTitle, detailModalItems });
                  const filteredItems = detailModalItems.filter((item) => item && typeof item === 'object');
                  console.log("Filtered assistants:", filteredItems);
                  return filteredItems.length ? (
                    filteredItems.map((a: any, idx: number) => (
                      <div key={a.id || idx} className="rounded-xl border p-4 shadow-sm hover:shadow">
                        <div className="flex items-start justify-between">
                          <div className="text-base font-semibold">{idx + 1}. {String(a?.name || "")}</div>
                          {a?.email ? (
                            <a className="text-sm underline hover:text-blue-700" href={`mailto:${String(a.email)}`}>
                              {String(a.email)}
                            </a>
                          ) : null}
                        </div>
                        <div className="mt-2 grid gap-1 text-sm text-gray-700">
                          <div><span className="font-medium">{t("dashboard.phone")}:</span> {String(a?.phone || "")}</div>
                          <div><span className="font-medium">{t("dashboard.address")}:</span> {String(a?.address || "")}</div>
                          {a?.description ? (
                            <div className="mt-1"><span className="font-medium">{t("dashboard.description")}:</span> {String(a.description)}</div>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-600">{t("dashboard.noData")}</div>
                  );
                })()
              ) : (
                (() => {
                  console.log("Rendering string modal:", { detailModalTitle, detailModalItems });
                  const filteredItems = detailModalItems.filter((item) => typeof item === 'string');
                  console.log("Filtered strings:", filteredItems);
                  return (
                    <div className="space-y-2">
                      {filteredItems.length ? (
                        filteredItems.map((t: string, idx: number) => (
                          <div key={idx} className="rounded border p-3">{idx + 1}. {t}</div>
                        ))
                      ) : (
                        <div className="text-gray-600">{t("dashboard.noData")}</div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>

            <div className="flex justify-end gap-2 border-t px-6 py-3">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="rounded-lg border px-4 py-2 hover:bg-gray-50"
              >
                {t("dashboard.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;