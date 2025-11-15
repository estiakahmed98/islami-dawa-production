// components/AdminTable.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import DOMPurify from "dompurify";
import fileDownload from "js-file-download";
import "@fontsource/noto-sans-bengali";
import { useSelectedUser } from "@/providers/treeProvider";
import { useTranslations } from "next-intl";
import { MonthlyUserReportButton } from "@/components/MonthlyReportPDF";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  division?: string | null;
  district?: string | null;
  upazila?: string | null;
  union?: string | null;
  markaz?: { id: string; name: string } | string | null;
  markazId?: string | null;
}

interface AdminTableProps {
  userData: any;
  emailList: string[];
  // NEW: controlled month/year from parent
  selectedMonth?: number;
  selectedYear?: number;
  // NEW: which fields are clickable (e.g., ["assistantsList"])
  clickableFields?: string[];
  // NEW: bubble up clicks with dateKey + rowKey
  onCellClick?: (info: { dateKey: string; rowKey: string }) => void;
  // NEW: All tab data for PDF export
  allTabsData?: {
    moktobData?: any;
    talimData?: any;
    dayeData?: any;
    dawatiData?: any;
    dawatiMojlishData?: any;
    jamatData?: any;
    dineFeraData?: any;
    soforData?: any;
  };
  // NEW: users data to avoid fetching user details
  users?: User[];
}

const AdminTable: React.FC<AdminTableProps> = ({
  userData,
  emailList,
  selectedMonth: selectedMonthProp,
  selectedYear: selectedYearProp,
  clickableFields = [],
  onCellClick,
  allTabsData,
  users = [],
}) => {
  // if parent controls month/year, use props; else fallback to internal state
  const [internalMonth, setInternalMonth] = useState<number>(
    new Date().getMonth()
  );
  const [internalYear, setInternalYear] = useState<number>(
    new Date().getFullYear()
  );

  const selectedMonth = selectedMonthProp ?? internalMonth;
  const selectedYear = selectedYearProp ?? internalYear;

  const [transposedData, setTransposedData] = useState<any[]>([]);
  const [motamotPopup, setMotamotPopup] = useState<string | null>(null);
  const [filterLabel, setFilterLabel] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");

  const { selectedUser } = useSelectedUser();
  const [selectedUserData, setSelectedUserData] = useState<any>(null);

  const month = useTranslations("dashboard.UserDashboard.months");
  const t = useTranslations("universalTableShow");

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!selectedUser) return;
      try {
        const response = await fetch(
          `/api/users?email=${encodeURIComponent(selectedUser)}`,
          { cache: "no-store" }
        );
        if (!response.ok) throw new Error("Failed to fetch user");
        const u = await response.json();
        setSelectedUserData(u);
      } catch {
        setSelectedUserData(null);
      }
    };
    fetchUserDetails();
  }, [selectedUser]);

  // Compute all user details for PDF - use useMemo directly without state
  const allUserDetails = useMemo(() => {
    if (!emailList.length) return {};

    const userDetails: Record<string, { name: string; email: string }> = {};
    emailList.forEach((email) => {
      const user = users.find(u => u.email === email);
      userDetails[email] = {
        name: user?.name || email,
        email: user?.email || email,
      };
    });

    return userDetails;
  }, [emailList, users]);

  const months = [
    month("january"),
    month("february"),
    month("march"),
    month("april"),
    month("may"),
    month("june"),
    month("july"),
    month("august"),
    month("september"),
    month("october"),
    month("november"),
    month("december"),
  ];

  const monthDays = useMemo(() => {
    return Array.from(
      { length: new Date(selectedYear, selectedMonth + 1, 0).getDate() },
      (_, i) => i + 1
    );
  }, [selectedMonth, selectedYear]);

  const convertToPoints = (value: any, field: string): number => {
    if (typeof value === "number" && !isNaN(value)) return value;
    if (typeof value === "string") {
      const v = value.trim();
      if (field === "zikir") {
        if (v === "সকাল-সন্ধ্যা") return 2;
        if (v === "সকাল" || v === "সন্ধ্যা") return 1;
        return 0;
      }
      if (field === "ayat") {
        const [sStr, eStr] = v.split("-");
        const s = parseInt(sStr, 10);
        const e = parseInt(eStr ?? sStr, 10);
        const S = isNaN(s) ? 0 : s;
        const E = isNaN(e) ? S : e;
        return Math.max(0, Math.abs(E - S));
      }
      if (["surah", "ishraq", "ilm", "sirat"].includes(field)) return v ? 1 : 0;
      if (field === "jamat") {
        const n = Number(v) || 0;
        return n >= 1 && n <= 5 ? n : 0;
      }
      if (
        [
          "Dua",
          "tasbih",
          "amoliSura",
          "hijbulBahar",
          "dayeeAmol",
          "ayamroja",
        ].includes(field)
      ) {
        return v === "হ্যাঁ" ? 1 : 0;
      }
      const n = parseFloat(v);
      if (!isNaN(n)) return n;
      return 0;
    }
    if (typeof value === "boolean") return value ? 1 : 0;
    return 0;
  };

  useEffect(() => {
    if (!userData || !userData.records || !emailList.length) return;

    const labelsMap: Record<string, string> = userData.labelMap || {};
    const labelKeys = Object.keys(labelsMap);

    const transposed = labelKeys.map((labelKey) => {
      const row: { labelKey: string; label: string; [key: number]: any } = {
        labelKey,
        label: labelsMap[labelKey],
      };

      monthDays.forEach((day) => {
        const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        if (emailList.length === 1) {
          // single user: show raw value (not aggregated)
          const email = emailList[0];
          const raw = userData.records[email]?.[date]?.[labelKey];
          row[day] = raw ?? "- -";
        } else {
          // aggregated: existing behavior (sum points)
          const sum = emailList.reduce((tot, email) => {
            const val = userData.records[email]?.[date]?.[labelKey];
            return tot + convertToPoints(val, labelKey);
          }, 0);
          row[day] = sum;
        }
      });

      return row;
    });

    // If single user, add a কারগুজারী (editorContent) row (eye button -> popup)
    // Avoid adding if the labelMap already contains an `editorContent` key
    if (emailList.length === 1 && !labelKeys.includes("editorContent")) {
      const motamotRow: { label: string; labelKey: string; [key: number]: any } = {
        label: t("motamot"),
        labelKey: "editorContent",
      };
      const email = emailList[0];
      monthDays.forEach((day) => {
        const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const motamotHtml: string = userData.records[email]?.[date]?.editorContent || "- -";
        const motamotText = DOMPurify.sanitize(motamotHtml, { ALLOWED_TAGS: [] });
        motamotRow[day] =
          motamotText !== "- -" ? (
            <button onClick={() => setMotamotPopup(motamotText)} title="See note">
              👁️
            </button>
          ) : (
            "- -"
          );
      });
      transposed.push(motamotRow);
    }

    setTransposedData(transposed);
  }, [selectedMonth, selectedYear, userData, emailList, monthDays]);

  const filteredData = useMemo(() => {
    return transposedData.filter((row) => {
      const matchesLabel = filterLabel
        ? String(row.label).includes(filterLabel)
        : true;
      const matchesValue = filterValue
        ? Object.values(row).some(
            (val) =>
              typeof val !== "object" && String(val).includes(filterValue)
          )
        : true;
      return matchesLabel && matchesValue;
    });
  }, [transposedData, filterLabel, filterValue]);

  const convertToCSV = () => {
    const BOM = "\uFEFF";
    const monthName = months[selectedMonth];
    const headers = [t("label"), ...monthDays.map((d) => `${t("day")} ${d}`)];
    const rows = filteredData.map((row) => [
      row.label,
      ...monthDays.map((d) => row[d] ?? "-"),
    ]);
    const csv =
      BOM + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const safeName = (selectedUserData?.name || "User").replace(
      /[\/\\:?*"<>|]/g,
      "_"
    );
    const safeRole = (selectedUserData?.role || "Role").replace(
      /[\/\\:?*"<>|]/g,
      "_"
    );
    fileDownload(
      csv,
      `report_${monthName}_${selectedYear}_${safeName}_${safeRole}.csv`
    );
  };

  // Prepare category data for PDF from all tabs
  const preparePDFData = () => {
    const processTabData = (tabData: any) => {
      if (!tabData || !tabData.records)
        return {
          labelMap: {},
          valuesByField: {} as Record<string, Record<string, number>>,
        };

      const labelMap = tabData.labelMap || {};
      const valuesByField: Record<string, Record<string, number>> = {};

      Object.keys(labelMap).forEach((fieldKey) => {
        const perEmail: Record<string, number> = {};
        emailList.forEach((email) => {
          let sum = 0;
          monthDays.forEach((day) => {
            const dateKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const raw = tabData.records[email]?.[dateKey]?.[fieldKey];
            if (typeof raw === "number" && !isNaN(raw)) sum += raw;
            else if (typeof raw === "string" && !isNaN(Number(raw)))
              sum += Number(raw);
          });
          perEmail[email] = sum;
        });
        valuesByField[fieldKey] = perEmail;
      });

      return { labelMap, valuesByField };
    };

    const moktob = processTabData(allTabsData?.moktobData);
    const talim = processTabData(allTabsData?.talimData);
    const dayee = processTabData(allTabsData?.dayeData);
    const dawati = processTabData(allTabsData?.dawatiData);
    const dawatiMojlish = processTabData(allTabsData?.dawatiMojlishData);
    const jamat = processTabData(allTabsData?.jamatData);
    const dineFera = processTabData(allTabsData?.dineFeraData);
    const sofor = processTabData(allTabsData?.soforData);

    const categoryData = [
      {
        title: "মক্তব বিষয়",
        items: [
          {
            label: moktob.labelMap?.["notunMoktobChalu"] || "নতুন মক্তব চালু",
            values: moktob.valuesByField?.["notunMoktobChalu"] || {},
          },
          {
            label: moktob.labelMap?.["totalMoktob"] || "মোট মক্তব",
            values: moktob.valuesByField?.["totalMoktob"] || {},
          },
          {
            label: moktob.labelMap?.["totalStudent"] || "মোট ছাত্র",
            values: moktob.valuesByField?.["totalStudent"] || {},
          },
          {
            label:
              moktob.labelMap?.["obhibhabokConference"] || "অভিভাবক কনফারেন্স",
            values: moktob.valuesByField?.["obhibhabokConference"] || {},
          },
          {
            label:
              moktob.labelMap?.["moktoThekeMadrasaAdmission"] ||
              "মক্তব থেকে মাদরাসায় ভর্তি",
            values: moktob.valuesByField?.["moktoThekeMadrasaAdmission"] || {},
          },
          {
            label:
              moktob.labelMap?.["notunBoyoskoShikkha"] || "নতুন বয়স্ক শিক্ষা",
            values: moktob.valuesByField?.["notunBoyoskoShikkha"] || {},
          },
          {
            label:
              moktob.labelMap?.["totalBoyoskoShikkha"] || "মোট বয়স্ক শিক্ষা",
            values: moktob.valuesByField?.["totalBoyoskoShikkha"] || {},
          },
          {
            label:
              moktob.labelMap?.["boyoskoShikkhaOnshogrohon"] ||
              "বয়স্ক শিক্ষায় অংশগ্রহণ",
            values: moktob.valuesByField?.["boyoskoShikkhaOnshogrohon"] || {},
          },
          {
            label:
              moktob.labelMap?.["newMuslimeDinerFikir"] ||
              "নতুন মুসলিমের দিনের ফিকির",
            values: moktob.valuesByField?.["newMuslimeDinerFikir"] || {},
          },
        ],
      },
      {
        title: "মহিলাদের তালিম",
        items: [
          {
            label: talim.labelMap?.["mohilaTalim"] || "মহিলাদের তালিম",
            values: talim.valuesByField?.["mohilaTalim"] || {},
          },
          {
            label: talim.labelMap?.["mohilaOnshogrohon"] || "মহিলাদের অংশগ্রহণ",
            values: talim.valuesByField?.["mohilaOnshogrohon"] || {},
          },
        ],
      },
      {
        title: "সহযোগী দা'ঈ",
        items: [
          {
            label: dayee.labelMap?.["sohojogiDayeToiri"] || "সহযোগী দা'ঈ তৈরি",
            values: dayee.valuesByField?.["sohojogiDayeToiri"] || {},
          },
        ],
      },
      {
        title: "দাওয়াতি বিষয়",
        items: [
          {
            label: dawati.labelMap?.["nonMuslimDawat"] || "অমুসলিমকে দাওয়াত",
            values: dawati.valuesByField?.["nonMuslimDawat"] || {},
          },
          {
            label: dawati.labelMap?.["murtadDawat"] || "মুরতাদকে দাওয়াত",
            values: dawati.valuesByField?.["murtadDawat"] || {},
          },
          {
            label:
              dawati.labelMap?.["nonMuslimSaptahikGasht"] ||
              "অমুসলিম সাপ্তাহিক গাশত",
            values: dawati.valuesByField?.["nonMuslimSaptahikGasht"] || {},
          },
        ],
      },
      {
        title: "দাওয়াতি মজলিশ",
        items: [
          {
            label:
              dawatiMojlish.labelMap?.["dawatterGuruttoMojlish"] ||
              "দাওয়াতি মজলিশ",
            values:
              dawatiMojlish.valuesByField?.["dawatterGuruttoMojlish"] || {},
          },
          {
            label:
              dawatiMojlish.labelMap?.["mojlisheOnshogrohon"] ||
              "মজলিশে অংশগ্রহণ",
            values: dawatiMojlish.valuesByField?.["mojlisheOnshogrohon"] || {},
          },
          {
            label:
              dawatiMojlish.labelMap?.["prosikkhonKormoshalaAyojon"] ||
              "প্রশিক্ষণ কর্মশালা আয়োজন",
            values:
              dawatiMojlish.valuesByField?.["prosikkhonKormoshalaAyojon"] || {},
          },
          {
            label:
              dawatiMojlish.labelMap?.["prosikkhonOnshogrohon"] ||
              "প্রশিক্ষণে অংশগ্রহণ",
            values:
              dawatiMojlish.valuesByField?.["prosikkhonOnshogrohon"] || {},
          },
          {
            label:
              dawatiMojlish.labelMap?.["jummahAlochona"] || "জুম্মাহ আলোচনা",
            values: dawatiMojlish.valuesByField?.["jummahAlochona"] || {},
          },
          {
            label: dawatiMojlish.labelMap?.["dhormoSova"] || "ধর্মসভা",
            values: dawatiMojlish.valuesByField?.["dhormoSova"] || {},
          },
          {
            label:
              dawatiMojlish.labelMap?.["mashwaraPoint"] || "মাশওয়ারা পয়েন্ট",
            values: dawatiMojlish.valuesByField?.["mashwaraPoint"] || {},
          },
        ],
      },
      {
        title: "জামাত বিষয়",
        items: [
          {
            label: jamat.labelMap?.["jamatBerHoise"] || "জামাত বের হয়েছে",
            values: jamat.valuesByField?.["jamatBerHoise"] || {},
          },
          {
            label: jamat.labelMap?.["jamatSathi"] || "জামাত সাথী",
            values: jamat.valuesByField?.["jamatSathi"] || {},
          },
        ],
      },
      {
        title: "দ্বীনে ফিরে এসেছে",
        items: [
          {
            label:
              dineFera.labelMap?.["nonMuslimMuslimHoise"] ||
              "অমুসলিম মুসলিম হয়েছে",
            values: dineFera.valuesByField?.["nonMuslimMuslimHoise"] || {},
          },
          {
            label:
              dineFera.labelMap?.["murtadIslamFireche"] ||
              "মুরতাদ ইসলাম ফিরেছে",
            values: dineFera.valuesByField?.["murtadIslamFireche"] || {},
          },
        ],
      },
      {
        title: "সফর বিষয়",
        items: [
          {
            label: sofor.labelMap?.["madrasaVisit"] || "মাদ্রাসা ভিজিট",
            values: sofor.valuesByField?.["madrasaVisit"] || {},
          },
          {
            label: sofor.labelMap?.["moktobVisit"] || "মক্তব ভিজিট",
            values: sofor.valuesByField?.["moktobVisit"] || {},
          },
          {
            label: sofor.labelMap?.["schoolCollegeVisit"] || "স্কুল/কলেজ ভিজিট",
            values: sofor.valuesByField?.["schoolCollegeVisit"] || {},
          },
        ],
      },
    ];

    return categoryData;
  };

  const handleCellClick = (rowKey: string, day: number) => {
    if (!clickableFields.includes(rowKey)) return;
    const dateKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onCellClick?.({ dateKey, rowKey });
  };

  return (
    <div>
      {/* if parent controls month/year, hide selectors; else show them */}
      {selectedMonthProp === undefined && selectedYearProp === undefined ? (
        <div className="flex flex-col lg:flex-row justify-between items-center bg-white shadow-md p-6 rounded-xl gap-4">
          <div className="flex items-center gap-4">
            <select
              value={internalMonth}
              onChange={(e) => setInternalMonth(parseInt(e.target.value))}
              className="w-40 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500 cursor-pointer"
            >
              {months.map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={internalYear}
              onChange={(e) => setInternalYear(parseInt(e.target.value))}
              className="w-24 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500 cursor-pointer"
            >
              {Array.from({ length: 10 }, (_, i) => 2020 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center rounded-xl"
              onClick={convertToCSV}
            >
              📥 Download CSV
            </button>
            {allTabsData && (
              <MonthlyUserReportButton
                monthName={months[selectedMonth]}
                year={selectedYear}
                emailList={emailList}
                usersData={Object.fromEntries(
                  Object.entries(allUserDetails).map(([email, details]) => [
                    email,
                    details.name,
                  ])
                )}
                categoryData={preparePDFData()}
              />
            )}
          </div>
        </div>
      ) : null}

      <div className="overflow-auto">
        <table className="border-collapse border border-gray-300 w-full table-auto text-sm md:text-base">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2 text-left">
                {t("label")}
              </th>
              {monthDays.map((day) => (
                <th
                  key={day}
                  className="border border-gray-300 px-6 py-2 text-center text-nowrap"
                >
                  {t("day")} {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-6 py-2 text-nowrap">
                  {row.label}
                </td>
                {monthDays.map((day) => {
                  const clickable = clickableFields.includes(row.labelKey);

                  // Special-case editorContent (কারগুজারী): show an eye button that opens a modal
                  if (row.labelKey === "editorContent") {
                    const dateKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    // collect motamot for each email for this date
                    const motamots = emailList
                      .map((email) => {
                        const raw = userData.records?.[email]?.[dateKey]?.editorContent;
                        if (!raw) return null;
                        const text = DOMPurify.sanitize(raw, { ALLOWED_TAGS: [] });
                        const name = (allUserDetails?.[email]?.name) || email;
                        return { name, email, text };
                      })
                      .filter(Boolean) as { name: string; email: string; text: string }[];

                    if (!motamots.length) {
                      return (
                        <td key={day} className="border border-gray-300 px-6 py-2 text-center">- -</td>
                    );
                    }

                    const combined = motamots.map((m) => `${m.name}: ${m.text}`).join("\n\n----\n\n");

                    return (
                      <td key={day} className="border border-gray-300 px-6 py-2 text-center">
                        <button onClick={() => setMotamotPopup(combined)} title="See note">
                          👁️
                        </button>
                      </td>
                    );
                  }

                  const rawValue = row[day];

                  // If the raw value is an object (e.g., amoli data { ayat, para, pageNo }),
                  // convert it into a readable string to avoid React error "Objects are not valid as a React child".
                  let displayValue: any = rawValue;
                  if (rawValue && typeof rawValue === "object") {
                    if (Array.isArray(rawValue)) {
                      displayValue = rawValue
                        .map((v) => (typeof v === "symbol" ? v.toString() : String(v)))
                        .join(", ");
                    } else if ("ayat" in rawValue || "para" in rawValue || "pageNo" in rawValue) {
                      const parts: string[] = [];
                      if (rawValue.ayat) parts.push(String(rawValue.ayat));
                      if (rawValue.para) parts.push(`পারা:${rawValue.para}`);
                      if (rawValue.pageNo) parts.push(`পৃষ্ঠা:${rawValue.pageNo}`);
                      displayValue = parts.join(" | ") || JSON.stringify(rawValue);
                    } else {
                      const vals = Object.values(rawValue).map((v) => (typeof v === "symbol" ? v.toString() : String(v)));
                      displayValue = vals.join(" | ") || JSON.stringify(rawValue);
                    }
                  }

                  const shouldRenderHTML =
                    typeof displayValue === "string" && (displayValue.includes("<br") || displayValue.includes("</"));

                  const commonProps: any = {
                    className: `border border-gray-300 px-6 py-2 text-center ${clickable ? "cursor-pointer underline decoration-dotted" : ""}`,
                    onClick: () => handleCellClick(row.labelKey, day),
                    title: clickable ? "Click to view details" : "",
                    style: { whiteSpace: shouldRenderHTML ? "normal" : undefined },
                  };

                  if (shouldRenderHTML) {
                    return <td key={day} {...commonProps} dangerouslySetInnerHTML={{ __html: displayValue as string }} />;
                  }

                  return (
                    <td key={day} {...commonProps}>
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* কারগুজারী popup for single-user motamot rows */}
      {motamotPopup && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-10 rounded-xl shadow-lg max-w-[85vw] lg:max-w-[60vw] max-h-[70vh] relative overflow-y-auto">
            <button
              className="absolute top-4 right-6 text-xl text-red-500 hover:text-red-700"
              onClick={() => setMotamotPopup(null)}
            >
              {t("close")}
            </button>
            <h3 className="text-lg font-bold mb-4">{t("motamot")}</h3>
            <p className="lg:text-xl">{motamotPopup}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTable;
