"use client";

import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export function MonthlyUserReportButton({
  monthName,
  year,
  emailList,
  usersData,
  categoryData,
}: {
  monthName: string;
  year: number;
  emailList: string[];
  usersData: Record<string, string>;
  categoryData: {
    title: string;
    items: { label: string; values: Record<string, number> }[];
  }[];
}) {
  const [loading, setLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    setLoading(true);

    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Split categories into chunks of 4 per section
      const categoriesPerSection = 4;
      const categoryChunks = [];
      for (let i = 0; i < categoryData.length; i += categoriesPerSection) {
        categoryChunks.push(categoryData.slice(i, i + categoriesPerSection));
      }

      let globalPageNumber = 1;

      // Generate each category section
      for (let sectionIndex = 0; sectionIndex < categoryChunks.length; sectionIndex++) {
        const sectionCategories = categoryChunks[sectionIndex];

        // Split users into chunks of 16 per page for this section
        const usersPerPage = 16;
        const userChunks = [];
        for (let i = 0; i < emailList.length; i += usersPerPage) {
          userChunks.push(emailList.slice(i, i + usersPerPage));
        }

        // Generate pages for this section (one page per user chunk)
        for (let userChunkIndex = 0; userChunkIndex < userChunks.length; userChunkIndex++) {
          const pageUsers = userChunks[userChunkIndex];

          // Create hidden HTML content for this page
          const contentDiv = document.createElement('div');
          contentDiv.innerHTML = generateHTMLContentForPage(
            monthName,
            year,
            pageUsers,
            usersData,
            sectionCategories,
            globalPageNumber,
            userChunks.length * categoryChunks.length, // Total pages
            sectionIndex + 1,
            categoryChunks.length
          );
          contentDiv.style.position = 'absolute';
          contentDiv.style.left = '-9999px';
          contentDiv.style.top = '-9999px';
          contentDiv.style.width = '1200px';
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
            width: 1200,
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
      }

      pdf.save(`মাসিক_রিপোর্ট_${monthName}_${year}.pdf`);

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
      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
    >
      {loading ? (
        "PDF তৈরি হচ্ছে..."
      ) : (
        <>
          <FileText className="h-4 w-4 mr-1" /> মাসিক রিপোর্ট PDF
        </>
      )}
    </Button>
  );
}

function generateHTMLContentForPage(
  monthName: string,
  year: number,
  pageUsers: string[],
  usersData: Record<string, string>,
  pageCategories: {
    title: string;
    items: { label: string; values: Record<string, number> }[];
  }[],
  currentPage: number,
  totalPages: number,
  sectionNumber: number,
  totalSections: number
): string {
  // Flatten headers
  const subHeaders = pageCategories.flatMap((cat) =>
    cat.items.map((item) => ({
      category: cat.title,
      label: item.label,
    }))
  );

  return `
    <div style="
      font-family: 'Noto Sans Bengali', Arial, sans-serif;
      padding: 20px;
      background: white;
      font-size: 12px;
      line-height: 1.4;
      width: 1200px;
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
          font-size: 24px;
          font-weight: bold;
          color: #1e3a8a;
          margin: 0;
          font-family: 'Noto Sans Bengali', Arial, sans-serif;
        ">
          মাসিক রিপোর্ট - ${monthName} ${year}
        </h1>
        <div style="
          font-size: 14px;
          color: #666;
          margin-top: 5px;
          font-family: 'Noto Sans Bengali', Arial, sans-serif;
        ">
          ক্যাটাগরি সেট ${sectionNumber}/${totalSections} - পৃষ্ঠা ${currentPage}
        </div>
      </div>

      <!-- Table -->
      <table style="
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
        font-size: 10px;
        font-family: 'Noto Sans Bengali', Arial, sans-serif;
      ">
        <!-- Header Row: Categories -->
        <tr>
          <th style="
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
            background-color: #1e3a8a;
            color: white;
            font-weight: bold;
            width: 80px;
          ">নাম</th>
          ${pageCategories.map(cat => `
            <th style="
              border: 1px solid #000;
              padding: 8px;
              text-align: center;
              background-color: #2563eb;
              color: white;
              font-weight: bold;
            " colspan="${cat.items.length}">${cat.title}</th>
          `).join('')}
        </tr>

        <!-- Subcategory header row -->
        <tr>
          <th style="
            border: 1px solid #000;
            padding: 6px;
            background-color: #f8f9fa;
          "></th>
          ${pageCategories.map(cat =>
            cat.items.map(item => `
              <th style="
                border: 1px solid #000;
                padding: 6px;
                text-align: center;
                background-color: #e0f2fe;
                font-weight: bold;
              ">${item.label}</th>
            `).join('')
          ).join('')}
        </tr>

        <!-- User rows -->
        ${pageUsers.map((email: string) => `
          <tr>
            <td style="
              border: 1px solid #000;
              padding: 6px;
              text-align: left;
              font-weight: bold;
              background-color: #f8f9fa;
            ">${usersData[email] || email}</td>
            ${pageCategories.map(cat =>
              cat.items.map(item => `
                <td style="
                  border: 1px solid #000;
                  padding: 6px;
                  text-align: center;
                ">${item.values[email] ?? 0}</td>
              `).join('')
            ).join('')}
          </tr>
        `).join('')}
      </table>
    </div>
  `;
}

export default MonthlyUserReportButton;
