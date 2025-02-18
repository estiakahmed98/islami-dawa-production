"use client";

//Juwel

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

import { userMoktobBisoyData } from "@/app/data/moktobBisoyUserData";
import { userDawatiBisoyData } from "@/app/data/dawatiBisoyUserData";
import { userDawatiMojlishData } from "@/app/data/dawatiMojlishUserData";
import { userJamatBisoyData } from "@/app/data/jamatBisoyUserData";
import { userDineFeraData } from "@/app/data/dineferaUserData";
import { userSoforBishoyData } from "@/app/data/soforBishoyUserData";
import { userDayeData } from "@/app/data/dayiUserData";
import { userTalimBisoyData } from "@/app/data/talimBisoyUserData";
import { userAmoliData } from "@/app/data/amoliMuhasabaUserData";
import ComparisonTallyCard from "@/components/ComparisonTallyCard";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
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

  console.log("Compare Email", emailList);

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
          getParentEmail(user, users) === parentEmail &&
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

  return (
    <div className="p-2 lg:p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">তুলনা দেখুন</h1>
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
          <option value="day">Day-to-Day</option>
          <option value="month">Month-to-Month</option>
          <option value="year">Year-to-Year</option>
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
              <span className="self-center font-bold">to</span>
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
              <span className="py-1 self-center font-bold">to</span>
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
          Compare
        </button>
      </div>

      <div className="bg-gray-100 p-2 lg:p-4 rounded-lg shadow overflow-x-auto">
        {comparisonData.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300 text-sm lg:text-base">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 lg:px-4 py-1 lg:py-2">Label</th>
                <th className="border px-2 lg:px-4 py-1 lg:py-2">{from}</th>
                <th className="border px-2 lg:px-4 py-1 lg:py-2">{to}</th>
                <th className="border px-2 lg:px-4 py-1 lg:py-2">Difference</th>
                <th className="border px-2 lg:px-4 py-1 lg:py-2">Change</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((item, index) => (
                <tr key={index} className="text-center">
                  <td className="border px-2 lg:px-4 py-1 lg:py-2">{item.label}</td>
                  <td className="border px-2 lg:px-4 py-1 lg:py-2">{item.from}</td>
                  <td className="border px-2 lg:px-4 py-1 lg:py-2">{item.to}</td>
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
            Select values and click "Compare" to see results.
          </p>
        )}

        {comparisonData.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={convertToPDF}
              className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700"
            >
              Download PDF
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

const getParentEmail = (user: User, users: User[]): string | null => {
  let parentUser: User | undefined;
  switch (user.role) {
    case "divisionadmin":
      parentUser = users.find((u) => u.role === "centraladmin");
      break;
    case "districtadmin":
      parentUser = users.find(
        (u) => u.role === "divisionadmin" && u.division === user.division
      );
      if (!parentUser) {
        parentUser = users.find((u) => u.role === "centraladmin");
      }
      break;
    case "upozilaadmin":
      parentUser = users.find(
        (u) => u.role === "districtadmin" && u.district === user.district
      );
      // Step 4: If no districtadmin is found, find a divisiontadmin in the same division
      if (!parentUser) {
        parentUser = users.find(
          (u) => u.role === "divisionadmin" && u.division === user.division
        );
      }
      if (!parentUser) {
        parentUser = users.find((u) => u.role === "centraladmin");
      }
      break;
    case "unionadmin":
      parentUser = users.find(
        (u) => u.role === "upozilaadmin" && u.upazila === user.upazila
      );
      // Step 3: If no unionadmin is found, find a districtadmin in the same district
      if (!parentUser) {
        parentUser = users.find(
          (u) => u.role === "districtadmin" && u.district === user.district
        );
      }
      // Step 4: If no districtadmin is found, find a divisiontadmin in the same division
      if (!parentUser) {
        parentUser = users.find(
          (u) => u.role === "divisionadmin" && u.division === user.division
        );
      }
      if (!parentUser) {
        parentUser = users.find((u) => u.role === "centraladmin");
      }
      break;
    case "daye":
      // Step 1: Try to find a unionadmin in the same union
      parentUser = users.find(
        (u) => u.role === "unionadmin" && u.union === user.union
      );

      // Step 2: If no unionadmin is found, find a upozila in the same upozila
      if (!parentUser) {
        parentUser = users.find(
          (u) => u.role === "upozilaadmin" && u.upazila === user.upazila
        );
      }

      // Step 3: If no unionadmin is found, find a districtadmin in the same district
      if (!parentUser) {
        parentUser = users.find(
          (u) => u.role === "districtadmin" && u.district === user.district
        );
      }
      // Step 4: If no districtadmin is found, find a divisiontadmin in the same division
      if (!parentUser) {
        parentUser = users.find(
          (u) => u.role === "divisionadmin" && u.division === user.division
        );
      }
      if (!parentUser) {
        parentUser = users.find((u) => u.role === "centraladmin");
      }
      break;

    default:
      return null;
  }
  return parentUser ? parentUser.email : null;
};

export default ComparisonDataComponent;
