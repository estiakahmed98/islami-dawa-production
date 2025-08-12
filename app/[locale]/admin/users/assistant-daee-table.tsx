"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Assistant = {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  description: string;
  division: string;
  district: string;
  upazila: string;
  union: string;
  dayeeBishoyId: string;
  createdAt: string;
  updatedAt: string;
};

type DayeeRecord = {
  id: string;
  userId: string;
  date: string;
  sohojogiDayeToiri: number;
  editorContent?: string;
  createdAt: string;
  updatedAt: string;
  assistants: Assistant[];
};

type DayeeApiResponse = { records: DayeeRecord[] };

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  division: string;
  district: string;
  upazila: string;
  union: string;
  phone: string;
  area: string;
  markaz: string;
  banned: boolean;
};

type Props = { emails: string[]; users: User[] };

type FlatAssistant = Assistant & {
  parentUserId: string;
  parentName: string;
  parentEmail: string | null;
  recordDate: string;
};

const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : "-");

const AssistantDaeeList: React.FC<Props> = ({ emails, users }) => {
  const t = useTranslations("assistantDaeeList");

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<FlatAssistant[]>([]);
  const [error, setError] = useState<string | null>(null);

  const userNameById = (id: string): string => users.find((x) => x.id === id)?.name || t("unknownUser");

  useEffect(() => {
    const run = async () => {
      setError(null);
      setRows([]);
      if (!emails?.length) return;

      setLoading(true);
      try {
        const results = await Promise.allSettled(
          emails.map(async (email) => {
            const res = await fetch(`/api/dayi?email=${encodeURIComponent(email)}`);
            if (!res.ok) throw new Error(`Failed: ${email} -> ${res.status}`);
            const json: DayeeApiResponse = await res.json();
            return { email, json };
          })
        );

        const flat: FlatAssistant[] = [];
        for (const r of results) {
          if (r.status === "fulfilled") {
            const { email, json } = r.value;
            (json.records || []).forEach((rec) => {
              const parent = userNameById(rec.userId);
              (rec.assistants || []).forEach((a) => {
                flat.push({
                  ...a,
                  parentUserId: rec.userId,
                  parentName: parent,
                  parentEmail: email || null,
                  recordDate: rec.date,
                });
              });
            });
          } else {
            console.error(r.reason);
          }
        }

        flat.sort((a, b) => {
          if (a.parentName !== b.parentName) return a.parentName.localeCompare(b.parentName);
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setRows(flat);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || t("errors.loadFailed"));
      } finally {
        setLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(emails), users.length]);

  const grouped = useMemo(() => {
    const m = new Map<string, FlatAssistant[]>();
    rows.forEach((r) => {
      if (!m.has(r.parentUserId)) m.set(r.parentUserId, []);
      m.get(r.parentUserId)!.push(r);
    });
    return m;
  }, [rows]);

  const headers = [
    t("table.headers.parent"),
    t("table.headers.assistant"),
    t("table.headers.phone"),
    t("table.headers.email"),
    t("table.headers.address"),
    t("table.headers.division"),
    t("table.headers.district"),
    t("table.headers.upazila"),
    t("table.headers.union"),
    t("table.headers.date"),
  ];

  const exportCSV = () => {
    if (!rows.length) return;
    const BOM = "\uFEFF";
    const csv = BOM + [
      headers.join(","),
      ...rows.map((r) =>
        [
          r.parentName,
          r.name,
          r.phone || "-",
          r.email || "-",
          r.address || "-",
          r.division || "-",
          r.district || "-",
          r.upazila || "-",
          r.union || "-",
          fmtDate(r.recordDate),
        ]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "assistant_daee.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // jsPDF + autoTable (fits columns on landscape A4)
  const exportPDF = async () => {
    if (!rows.length) return;

    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default as any;

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 36;

    // Header
    doc.setFontSize(14);
    doc.text(t("pdf.title"), pageWidth / 2, 42, { align: "center" });
    doc.setFontSize(10);
    doc.text(`${t("pdf.totalParents")}: ${grouped.size}`, margin, 60);
    doc.text(`${t("pdf.totalAssistants")}: ${rows.length}`, margin + 150, 60);
    doc.text(`${t("pdf.printed")}: ${new Date().toLocaleString()}`, pageWidth - margin, 60, { align: "right" });

    const head = [headers];

    const body: any[] = [];
    Array.from(grouped.entries()).forEach(([, items]) => {
      if (!items.length) return;
      const first = items[0];
      body.push([
        { content: first.parentName, rowSpan: items.length, styles: { fontStyle: "bold", valign: "middle" } },
        first.name,
        first.phone || "-",
        first.email || "-",
        first.address || "-",
        first.division || "-",
        first.district || "-",
        first.upazila || "-",
        first.union || "-",
        fmtDate(first.recordDate),
      ]);
      for (let i = 1; i < items.length; i++) {
        const r = items[i];
        body.push([
          r.name,
          r.phone || "-",
          r.email || "-",
          r.address || "-",
          r.division || "-",
          r.district || "-",
          r.upazila || "-",
          r.union || "-",
          fmtDate(r.recordDate),
        ]);
      }
    });

    autoTable(doc, {
      startY: 76,
      head,
      body,
      styles: { fontSize: 8.5, cellPadding: 4, halign: "center", valign: "top", overflow: "linebreak" },
      headStyles: { fillColor: [21, 94, 117], textColor: 255, fontStyle: "bold", fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 95 },
        2: { cellWidth: 70 },
        3: { cellWidth: 110 },
        4: { cellWidth: 90 },
        5: { cellWidth: 60 },
        6: { cellWidth: 70 },
        7: { cellWidth: 60 },
        8: { cellWidth: 60 },
        9: { cellWidth: 60 },
      },
      margin: { left: margin, right: margin, top: margin, bottom: margin },
      tableWidth: pageWidth - margin * 2,
      didDrawPage: () => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        const pageCurrent = (doc as any).internal.getCurrentPageInfo().pageNumber;
        doc.setFontSize(9);
        doc.text(t("pdf.pageXofY", { current: pageCurrent, total: pageCount }), pageWidth - margin, pageHeight - 12, {
          align: "right",
        });
      },
    });

    doc.save(`assistant_daee_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-slate-700">
          {t("summary", { total: rows.length, parents: grouped.size })}
        </div>
        <div className="flex gap-2">
          <Button className="bg-[#155E75] hover:bg-[#1d809e] text-white" onClick={exportPDF}>
            {t("buttons.exportPdf")}
          </Button>
          <Button className="bg-[#155E75] hover:bg-[#1d809e] text-white" onClick={exportCSV}>
            {t("buttons.exportCsv")}
          </Button>
        </div>
      </div>

      <div className="w-full border border-gray-300 rounded-lg shadow-md overflow-auto max-h-[calc(100vh-260px)]">
        <Table className="w-full">
          <TableHeader className="sticky top-0 z-40 bg-[#155E75] text-white">
            <TableRow>
              {headers.map((h) => (
                <TableHead key={h} className="text-white border-r">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-6">
                  {t("status.loading")}
                </TableCell>
              </TableRow>
            )}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-6">
                  {t("empty.noRows")}
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              Array.from(grouped.entries()).map(([, items]) =>
                items.map((r, idx) => (
                  <TableRow key={r.id}>
                    {idx === 0 && (
                      <TableCell className="font-semibold border-r align-middle" rowSpan={items.length}>
                        {r.parentName}
                      </TableCell>
                    )}
                    <TableCell className="border-r">{r.name}</TableCell>
                    <TableCell className="border-r">{r.phone}</TableCell>
                    <TableCell className="border-r">{r.email}</TableCell>
                    <TableCell className="border-r">{r.address}</TableCell>
                    <TableCell className="border-r">{r.division || "-"}</TableCell>
                    <TableCell className="border-r">{r.district || "-"}</TableCell>
                    <TableCell className="border-r">{r.upazila || "-"}</TableCell>
                    <TableCell className="border-r">{r.union || "-"}</TableCell>
                    <TableCell>{fmtDate(r.recordDate)}</TableCell>
                  </TableRow>
                ))
              )}
          </TableBody>
        </Table>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error} — {t("errors.partial")}
        </p>
      )}
    </div>
  );
};

export default AssistantDaeeList;
