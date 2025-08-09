"use client";
import DayeeBishoyForm from "@/components/DayeeBishoyForm";
import React, { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/TabButton";
import UniversalTableShow from "@/components/TableShow";
import { useSession } from "@/lib/auth-client";

// YYYY-MM-DD for Asia/Dhaka
function dhakaYMD(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

// to "1. Name\n2. Name" with <br/> breaks
function toNumberedHTML(arr: any[] = []) {
  if (!Array.isArray(arr) || arr.length === 0) return "";
  return arr.map((a, i) => `${i + 1}. ${a?.name ?? ""}`).join("<br/>");
}

type Assistant = {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  description?: string;
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
};

const DayiPage: React.FC = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  const [userData, setUserData] = useState<any>({ records: {}, labelMap: {} });
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPayload, setModalPayload] = useState<{
    dateKey?: string;
    assistants?: Assistant[];
  }>({});

  // fetch & transform
  useEffect(() => {
    const fetchDayeeData = async () => {
      if (!userEmail) return;
      try {
        const res = await fetch(`/api/dayi?email=${encodeURIComponent(userEmail)}`, {
          cache: "no-store",
        });
        const json = await res.json();
        // when your /api/dayi returns records array:
        const records = Array.isArray(json.records) ? json.records : Array.isArray(json) ? json : [];

        const transformedRecords: Record<string, Record<string, any>> = { [userEmail]: {} };
        const detailsMap: Record<string, Assistant[]> = {};

        records.forEach((record: any) => {
          const dateKey = dhakaYMD(new Date(record.date));
          transformedRecords[userEmail][dateKey] = {
            sohojogiDayeToiri: record.sohojogiDayeToiri ?? 0,
            assistantsList: toNumberedHTML(record.assistants ?? []), // HTML for table
            editorContent: record.editorContent ?? "",
          };
          detailsMap[dateKey] = (record.assistants ?? []) as Assistant[];
        });

        setUserData({
          records: transformedRecords,
          labelMap: {
            sohojogiDayeToiri: "সহযোগী দায়ী তৈরি (সংখ্যা)",
            assistantsList: "সহযোগী দায়ীর তালিকা",
          },
          // keep the raw assistant details on userData for click handlers
          _assistantsByDate: detailsMap,
        });
      } catch (error) {
        console.error("Failed to fetch Dayee data:", error);
      }
    };
    fetchDayeeData();
  }, [userEmail]);

  // Cell click: open modal only for assistantsList
  const handleCellClick = useMemo(
    () =>
      (info: { email: string; dateKey: string; rowKey: string }) => {
        if (info.rowKey !== "assistantsList") return;
        const map = userData?._assistantsByDate || {};
        const assistants: Assistant[] = map[info.dateKey] || [];
        if (!assistants.length) return;
        setModalPayload({ dateKey: info.dateKey, assistants });
        setModalOpen(true);
      },
    [userData],
  );

  return (
    <div>
      <Tabs defaultValue="dataForm" className="w-full p-2 lg:p-4">
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="dataForm">তথ্য দিন</TabsTrigger>
            <TabsTrigger value="report">প্রতিবেদন</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dataForm">
          <div className="bg-gray-50 lg:rounded lg:shadow">
            <DayeeBishoyForm />
          </div>
        </TabsContent>

        <TabsContent value="report">
          <div className="bg-gray-50 rounded shadow">
            <UniversalTableShow
              userData={userData}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
              htmlFields={["assistantsList"]}          
              clickableFields={["assistantsList"]}     
              onCellClick={handleCellClick}            
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Simple Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-semibold">
                সহযোগী দায়ীর তথ্য — {modalPayload.dateKey}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded p-1 hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto p-6 space-y-4">
              {(modalPayload.assistants || []).map((a, idx) => (
                <div
                  key={a.id || idx}
                  className="rounded-xl border p-4 shadow-sm hover:shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="text-base font-semibold">
                      {idx + 1}. {a.name}
                    </div>
                    {a.email ? (
                      <a
                        className="text-sm underline hover:text-blue-700"
                        href={`mailto:${a.email}`}
                      >
                        {a.email}
                      </a>
                    ) : null}
                  </div>
                  <div className="mt-2 grid gap-1 text-sm text-gray-700">
                    <div><span className="font-medium">ফোন:</span> {a.phone || "-"}</div>
                    <div><span className="font-medium">ঠিকানা:</span> {a.address || "-"}</div>
                    <div><span className="font-medium">বিভাগ:</span> {a.division || "-"}</div>
                    <div><span className="font-medium">জেলা:</span> {a.district || "-"}</div>
                    <div><span className="font-medium">উপজেলা:</span> {a.upazila || "-"}</div>
                    <div><span className="font-medium">ইউনিয়ন:</span> {a.union || "-"}</div>
                    {a.description ? (
                      <div className="mt-1">
                        <span className="font-medium">বিবরণ:</span> {a.description}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 border-t px-6 py-3">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg border px-4 py-2 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayiPage;
