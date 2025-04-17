"use client";

import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { assistantDaeeData } from "@/app/data/assistantDaeeData";
import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js";

const AssistantDaeeList: React.FC = () => {
  const { data: session } = useSession();
  const email = session?.user?.email || "";
  const [filteredAssistants, setFilteredAssistants] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const userName = session?.user?.name || "User";
  const userDivision = session?.user?.division || "";
  const userDistrict = session?.user?.district || "";

  // Filter the assistants data based on the logged-in user's email
  useEffect(() => {
    if (email) {
      const assistants = Object.values(assistantDaeeData.records).filter(
        (assistant) => assistant.mainDaeeEmail === email
      );
      setFilteredAssistants(assistants);
    }
  }, [email]);

  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    filterAssistants(e.target.value);
  };

  // Filter assistants based on search query
  const filterAssistants = (query: string) => {
    if (!query) {
      setFilteredAssistants(
        Object.values(assistantDaeeData.records).filter(
          (assistant) => assistant.mainDaeeEmail === email
        )
      );
    } else {
      const filtered = filteredAssistants.filter((assistant) => {
        return (
          assistant.name.toLowerCase().includes(query.toLowerCase()) ||
          assistant.phone.includes(query) ||
          assistant.address.toLowerCase().includes(query.toLowerCase())
        );
      });
      setFilteredAssistants(filtered);
    }
  };

  // Generate and download the PDF using html2pdf.js with improved styling
  const downloadPDF = () => {
    // Create a new element for PDF that won't be shown on the page
    const pdfContent = document.createElement("div");
    pdfContent.style.padding = "20px";
    pdfContent.style.fontFamily = "Arial, sans-serif";

    // Current date and time
    const now = new Date();
    const dateTimeString = now.toLocaleString();

    // Header with logo placeholder and title
    const header = document.createElement("div");
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #4a5568; padding-bottom: 10px;">
        <div style="text-align: left;">
          <h1 style="color: #2c5282; margin: 0; font-size: 24px;">সহযোগি দাঈদের তালিকা</h1>
          <p style="margin: 5px 0 0 0; color: #4a5568; font-size: 14px;">Generated on: ${dateTimeString}</p>
        </div>
      </div>
    `;
    pdfContent.appendChild(header);

    // User info section
    const userInfo = document.createElement("div");
    userInfo.innerHTML = `
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <div style="display: flex; flex-wrap: wrap;">
          <div style="margin-right: 40px; margin-bottom: 10px;">
            <strong style="color: #4a5568;">নাম:</strong> ${userName}
          </div>
          <div style="margin-right: 40px; margin-bottom: 10px;">
            <strong style="color: #4a5568;">ইমেইল:</strong> ${email}
          </div>
          <div style="margin-right: 40px; margin-bottom: 10px;">
            <strong style="color: #4a5568;">বিভাগ:</strong> ${userDivision}
          </div>
          <div style="margin-bottom: 10px;">
            <strong style="color: #4a5568;">জেলা:</strong> ${userDistrict}
          </div>
        </div>
      </div>
    `;
    pdfContent.appendChild(userInfo);

    // Table section
    const tableSection = document.createElement("div");
    tableSection.innerHTML = `
      <h3 style="margin: 0 0 10px 0; color: #2d3748; font-size: 18px;">সহযোগি দাঈদের বিস্তারিত তথ্য: ${filteredAssistants.length} </h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #2c5282; color: white;">
            <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">ক্রমিক</th>
            <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">নাম</th>
            <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">ফোন নম্বর</th>
            <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">ঠিকানা</th>
            <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">বিস্তারিত</th>
            <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">তারিখ</th>
          </tr>
        </thead>
        <tbody>
          ${filteredAssistants
            .map(
              (assistant, index) => `
            <tr style="background-color: ${index % 2 === 0 ? "#f7fafc" : "white"};">
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${index + 1}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${assistant.name}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${assistant.phone}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${assistant.address}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${assistant.description || "-"}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${assistant.date}</td>
            </tr>
          `
            )
            .join("")}
          ${
            filteredAssistants.length === 0
              ? `
            <tr>
              <td colspan="6" style="padding: 20px; text-align: center; border: 1px solid #e2e8f0;">কোন সহযোগি দাঈ পাওয়া যায়নি</td>
            </tr>
          `
              : ""
          }
        </tbody>
      </table>
    `;
    pdfContent.appendChild(tableSection);

    // PDF Options
    const options = {
      margin: 10,
      filename: `সহযোগি_দাঈ_তালিকা_${now.toISOString().split("T")[0]}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // Generate PDF
    html2pdf().from(pdfContent).set(options).save();
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by Name, Phone or Address"
          className="w-1/2 p-2 border border-gray-300 rounded"
        />
        <Button
          onClick={downloadPDF}
          className="bg-[#155E75] text-white hover:bg-[#255d6ee1] flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download PDF
        </Button>
      </div>

      <div id="assistants-table" className="overflow-x-auto">
        <table className="min-w-full border-collapse table-auto">
          <thead>
            <tr className="bg-[#155E75] text-white">
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Phone</th>
              <th className="border px-4 py-2 text-left">Address</th>
              <th className="border px-4 py-2 text-left">Description</th>
              <th className="border px-4 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssistants.length > 0 ? (
              filteredAssistants.map((assistant, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="border px-4 py-2">{assistant.name}</td>
                  <td className="border px-4 py-2">{assistant.phone}</td>
                  <td className="border px-4 py-2">{assistant.address}</td>
                  <td className="border px-4 py-2">
                    {assistant.description || "-"}
                  </td>
                  <td className="border px-4 py-2">{assistant.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 border">
                  No assistants found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssistantDaeeList;
