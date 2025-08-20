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
    if (typeof window === "undefined") return;
    if (!rows.length) return;
    const BOM = "\uFEFF";
    const csv =
      BOM +
      [
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
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const getHtml2Pdf = async () => {
    const html2pdfModule = await import("html2pdf.js");
    return html2pdfModule.default || html2pdfModule;
  };

  const buildPrintableHTML = () => {
    // Build table rows with proper rowSpan for parent column
    const bodyRowsHtml: string[] = [];
    Array.from(grouped.entries()).forEach(([, items]) => {
      if (!items.length) return;
      // first row with rowSpan for parent
      const first = items[0];
      bodyRowsHtml.push(`
        <tr>
          <td class="parent" rowspan="${items.length}">${first.parentName}</td>
          <td>${first.name}</td>
          <td>${first.phone || "-"}</td>
          <td>${first.email || "-"}</td>
          <td>${first.address || "-"}</td>
          <td>${first.division || "-"}</td>
          <td>${first.district || "-"}</td>
          <td>${first.upazila || "-"}</td>
          <td>${first.union || "-"}</td>
          <td>${fmtDate(first.recordDate)}</td>
        </tr>
      `);

      // subsequent rows: omit the parent cell entirely (rowSpan will cover them)
      for (let i = 1; i < items.length; i++) {
        const r = items[i];
        bodyRowsHtml.push(`
          <tr>
            <td>${r.name}</td>
            <td>${r.phone || "-"}</td>
            <td>${r.email || "-"}</td>
            <td>${r.address || "-"}</td>
            <td>${r.division || "-"}</td>
            <td>${r.district || "-"}</td>
            <td>${r.upazila || "-"}</td>
            <td>${r.union || "-"}</td>
            <td>${fmtDate(r.recordDate)}</td>
          </tr>
        `);
      }
    });

    // Header construction
    const headCells = headers.map((h) => `<th>${h}</th>`).join("");

    // Printable HTML
    return `
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600&display=swap" rel="stylesheet" />
          <style>
            * { box-sizing: border-box; }
            body { font-family: 'Noto Sans Bengali', system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'; margin: 0; padding: 20px; }
            .header { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; align-items: center; margin-bottom: 10px; }
            .h-left { text-align: left; font-size: 12px; }
            .h-center { text-align: center; font-size: 14px; font-weight: 600; }
            .h-right { text-align: right; font-size: 12px; }
            .meta { margin-top: 4px; font-size: 11px; }
            .kpis { margin-top: 6px; font-size: 11px; display: flex; gap: 16px; justify-content: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
            thead { display: table-header-group; }
            th, td { border: 1px solid #000; padding: 6px; font-size: 11px; text-align: center; word-wrap: break-word; }
            th { background: #f8fafc; font-weight: 600; }
            td.parent { font-weight: 600; text-align: left; }
            tr { page-break-inside: avoid; }
            .footer { position: fixed; right: 12mm; bottom: 8mm; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="h-left">
              <div>${t("pdf.totalParents")}: ${grouped.size}</div>
              <div>${t("pdf.totalAssistants")}: ${rows.length}</div>
            </div>
            <div class="h-center">
              <div>${t("pdf.title")}</div>
              <div class="meta">${t("pdf.printed")}: ${new Date().toLocaleString()}</div>
            </div>
            <div class="h-right">
              <!-- space for filters or extra meta if needed -->
            </div>
          </div>

          <table>
            <thead>
              <tr>${headCells}</tr>
            </thead>
            <tbody>
              ${bodyRowsHtml.join("")}
            </tbody>
          </table>

          <div class="footer" id="__pdf_page_footer"></div>
        </body>
      </html>
    `;
  };

  const convertToPDF = async () => {
    if (typeof window === "undefined") return;
    if (!rows.length) return;

    const html = buildPrintableHTML();
    const el = document.createElement("div");
    el.innerHTML = html;

    try {
      const html2pdf = await getHtml2Pdf();
      html2pdf()
        .set({
          margin: 10,
          filename: `assistant_daee_${new Date().toISOString().slice(0, 10)}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        })
        .from(el)
        .toPdf()
        .get("pdf")
        .then((pdf: any) => {
          const total = pdf.internal.getNumberOfPages();
          for (let i = 1; i <= total; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.text(
              `Page ${i} of ${total}`,
              pdf.internal.pageSize.getWidth() - 20,
              pdf.internal.pageSize.getHeight() - 10
            );
          }
        })
        .save();
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-slate-700">
          {t("summary", { total: rows.length, parents: grouped.size })}
        </div>
        <div className="flex gap-2">
          {/* PDF now uses the same html2pdf.js flow as AdminTable */}
          <Button className="bg-[#155E75] hover:bg-[#1d809e] text-white" onClick={convertToPDF}>
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
                    <TableCell className="border-r">{r.phone || "-"}</TableCell>
                    <TableCell className="border-r">{r.email || "-"}</TableCell>
                    <TableCell className="border-r">{r.address || "-"}</TableCell>
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
