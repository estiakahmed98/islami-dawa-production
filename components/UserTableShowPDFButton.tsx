"use client";

import React, { useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";

type UserData = {
  records: Record<string, Record<string, any>>;
  labelMap: Record<string, string>;
  [k: string]: any;
};

type CategoryData = {
  title: string;
  userData: UserData;
  selectedMonth: number;
  selectedYear: number;
};

export function UserTableShowPDFButton({
  categories,
  userEmail,
  userName,
}: {
  categories: CategoryData[];
  userEmail: string;
  userName: string;
}) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("dashboard.UserDashboard");

  const generatePDF = async () => {
    setLoading(true);

    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Define pages with their categories
      const pages = [
        [
          categories.find(c => c.title === t("dashboard.amoliMuhasaba")),
          categories.find(c => c.title === t("dashboard.talimSubject")),
          categories.find(c => c.title === t("dashboard.dayiSubject")),
        ].filter(Boolean) as CategoryData[],
        [
          categories.find(c => c.title === t("dashboard.moktobSubject")),
          categories.find(c => c.title === t("dashboard.dawatiSubject")),
        ].filter(Boolean) as CategoryData[],
        [
          categories.find(c => c.title === t("dashboard.dawatiMojlish")),
          categories.find(c => c.title === t("dashboard.jamatSubject")),
          categories.find(c => c.title === t("dashboard.dineFera")),
          categories.find(c => c.title === t("dashboard.soforSubject")),
        ].filter(Boolean) as CategoryData[],
      ];

      const pageTitles = [
        "A'mali Muhasaba, Women's Taleem & Assistant Daee Matters",
        "Maktab Matters & Dawah Matters",
        "Dawah Majlis, Jamaat Matters & Returned to Islam & Travel Matters"
      ];

      let globalPageNumber = 1;

      // Generate each page
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const pageCategories = pages[pageIndex];

        // Create hidden HTML content for this page
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = generateHTMLContentForPage(
          pageCategories,
          userEmail,
          userName,
          pageTitles[pageIndex],
          globalPageNumber,
          pages.length,
          pageIndex + 1
        );
        contentDiv.style.position = 'absolute';
        contentDiv.style.left = '-9999px';
        contentDiv.style.top = '-9999px';
        contentDiv.style.width = '1400px';
        contentDiv.style.fontFamily = "'Noto Sans Bengali', Arial, sans-serif";
        document.body.appendChild(contentDiv);

        // Wait for fonts to load
        await document.fonts.load("12px 'Noto Sans Bengali'");

        // Generate canvas
        const canvas = await html2canvas(contentDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 1400,
          height: contentDiv.scrollHeight,
        });

        // Add page to PDF (except first page)
        if (globalPageNumber > 1) {
          pdf.addPage();
        }

        // Add image to PDF
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 297; // A4 landscape width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        // Cleanup
        document.body.removeChild(contentDiv);

        globalPageNumber++;
      }

      pdf.save(`${userName}_সব_ক্যাটাগরি_রিপোর্ট.pdf`);

    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={loading}
      className="flex items-center gap-2 text-xs lg:text-lg px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition duration-300"
    >
      {loading ? (
        "PDF তৈরি হচ্ছে..."
      ) : (
        <>
          <FileText className="h-4 w-4 mr-1" /> Download PDF
        </>
      )}
    </Button>
  );
}

function generateHTMLContentForPage(
  pageCategories: CategoryData[],
  userEmail: string,
  userName: string,
  pageTitle: string,
  currentPage: number,
  totalPages: number,
  pageNumber: number
): string {
  // Generate tables for each category
  const tablesHTML = pageCategories.map(category => {
    const { title, userData, selectedMonth, selectedYear } = category;

    // Build table data similar to TableShow
    const labels = userData.labelMap || {};
    const userRecords = userData.records[userEmail] || {};

    const monthDays = Array.from(
      { length: new Date(selectedYear, selectedMonth + 1, 0).getDate() },
      (_, i) => i + 1
    );

    const transposed = Object.keys(labels).map((rowKey) => {
      const row: { label: string; [key: number]: any } = {
        label: labels[rowKey],
      };
      monthDays.forEach((day) => {
        const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const cellValue = userRecords[date]?.[rowKey] ?? "- -";
        row[day] = cellValue;
      });
      return row;
    });

    // Exclude rows if needed, similar to TableShow
    const printableRows = transposed;

    return `
      <div style="margin-bottom: 30px;">
        <h3 style="
          font-size: 16px;
          font-weight: bold;
          color: #1e3a8a;
          margin-bottom: 10px;
          font-family: 'Noto Sans Bengali', Arial, sans-serif;
        ">${title}</h3>
        <table style="
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 10px;
          font-family: 'Noto Sans Bengali', Arial, sans-serif;
        ">
          <!-- Header Row -->
          <tr>
            <th style="
              border: 1px solid #000;
              padding: 6px;
              text-align: left;
              background-color: #1e3a8a;
              color: white;
              font-weight: bold;
              width: 150px;
            ">লেবেল</th>
            ${monthDays.map(day => `
              <th style="
                border: 1px solid #000;
                padding: 6px;
                text-align: center;
                background-color: #2563eb;
                color: white;
                font-weight: bold;
              ">দিন ${day}</th>
            `).join('')}
          </tr>

          <!-- Data rows -->
          ${printableRows.map(row => `
            <tr>
              <td style="
                border: 1px solid #000;
                padding: 4px;
                text-align: left;
                font-weight: bold;
                background-color: #f8f9fa;
              ">${row.label}</td>
              ${monthDays.map(day => `
                <td style="
                  border: 1px solid #000;
                  padding: 4px;
                  text-align: center;
                ">${row[day] ?? '-'}</td>
              `).join('')}
            </tr>
          `).join('')}
        </table>
      </div>
    `;
  }).join('');

  return `
    <div style="
      font-family: 'Noto Sans Bengali', Arial, sans-serif;
      padding: 20px;
      background: white;
      font-size: 12px;
      line-height: 1.4;
      width: 1400px;
    ">
      <!-- Google Fonts Link -->
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;700&display=swap" rel="stylesheet">

      <!-- Header -->
      <div style="
        text-align: center;
        margin-bottom: 20px;
        border-bottom: 2px solid #1e3a8a;
        padding-bottom: 10px;
      ">
        <h1 style="
          font-size: 20px;
          font-weight: bold;
          color: #1e3a8a;
          margin: 0;
          font-family: 'Noto Sans Bengali', Arial, sans-serif;
        ">
          ${pageTitle}
        </h1>
        <div style="
          font-size: 12px;
          color: #666;
          margin-top: 5px;
          font-family: 'Noto Sans Bengali', Arial, sans-serif;
        ">
          ${userName} - পৃষ্ঠা ${currentPage}/${totalPages}
        </div>
      </div>

      ${tablesHTML}
    </div>
  `;
}

export default UserTableShowPDFButton;
