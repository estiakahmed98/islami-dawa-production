"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import {
  CalendarDays,
  Phone,
  User,
  Loader2,
  Info,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface LeaveRequestFormProps {
  userEmail: string;
  onSubmissionSuccess: () => void;
  onClose: () => void;
}

/** Convert English digits to Bangla digits for nicer UI */
const toBn = (val: string | number) =>
  String(val).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

/** Inclusive day count between two yyyy-mm-dd strings */
const getInclusiveDays = (from: string, to: string) => {
  if (!from || !to) return null;
  const start = new Date(from);
  const end = new Date(to);
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(0, 0, 0, 0);
  if (start > end) return null;
  const diff =
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return diff;
};

export function LeaveRequestForm({
  userEmail,
  onSubmissionSuccess,
  onClose,
}: LeaveRequestFormProps) {
  const t = useTranslations("leaveForm");
  const { data } = useSession();
  const user = data?.user;

  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Autofill name/phone from session once
  useEffect(() => {
    if (user) {
      setName((prev) => (prev?.trim() ? prev : user.name ?? ""));
      setPhone((prev) =>
        prev?.trim() ? prev : ((user as any)?.phone as string) ?? ""
      );
    }
  }, [user]);

  const calculatedDays = useMemo(
    () => getInclusiveDays(fromDate, toDate),
    [fromDate, toDate]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leaveType) {
      toast.error(t("errors.typeRequired"));
      return;
    }
    if (!fromDate || !toDate) {
      toast.error(t("errors.dateRequired"));
      return;
    }
    if (getInclusiveDays(fromDate, toDate) === null) {
      toast.error(t("errors.badRange"));
      return;
    }
    if (!reason.trim()) {
      toast.error(t("errors.reasonRequired"));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          name,
          phone,
          leaveType,
          from: fromDate,
          to: toDate,
          reason,
        }),
      });

      const resJson = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (resJson?.errors) {
          Object.values(resJson.errors).forEach((msg) => toast.error(String(msg)));
        } else {
          throw new Error(resJson?.error || t("errors.generic"));
        }
        return;
      }

      toast.success(t("toasts.submitted"));
      setLeaveType("");
      setFromDate("");
      setToDate("");
      setReason("");
      setPhone("");
      setName("");

      onSubmissionSuccess();
      onClose();
    } catch (err: any) {
      toast.error(`${t("errors.generic")} ${err?.message ?? ""}`.trim());
    } finally {
      setLoading(false);
    }
  };

  const isRangeInvalid =
    fromDate && toDate && getInclusiveDays(fromDate, toDate) === null;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "grid gap-6 rounded-2xl bg-muted/30 p-5 md:p-6",
        "shadow-sm ring-1 ring-border"
      )}
      aria-label={t("title")}
    >
      {/* header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">{t("title")}</h3>
          <p className="text-sm text-muted-foreground">{t("autofillNote")}</p>
        </div>

        {calculatedDays !== null && !isRangeInvalid && (
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border bg-background px-3 py-2",
              "text-sm"
            )}
            aria-live="polite"
            title={t("computedDays.title")}
          >
            <Calculator className="h-4 w-4" />
            {t("computedDays.label")}:{" "}
            <span className="font-semibold">{toBn(calculatedDays)}</span>
          </div>
        )}
      </div>

      {/* name/phone */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t("name")}
          </Label>
          <Input id="name" value={name} readOnly required />
          <p className="text-xs text-muted-foreground">{t("nameHelp")}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {t("phone")}
          </Label>
          <Input
            id="phone"
            value={phone}
            readOnly
            required
            inputMode="numeric"
            pattern="^01[3-9]\d{8}$"
            title={t("phonePatternTitle")}
          />
          <p className="text-xs text-muted-foreground">{t("phoneFormatHelp")}</p>
        </div>
      </div>

      {/* type */}
      <div className="space-y-2">
        <Label htmlFor="leaveType">{t("typeLabel")}</Label>
        <Select value={leaveType} onValueChange={setLeaveType}>
          <SelectTrigger id="leaveType" aria-label={t("typePlaceholder")}>
            <SelectValue placeholder={t("typePlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="casual">{t("types.casual")}</SelectItem>
            <SelectItem value="sick">{t("types.sick")}</SelectItem>
            <SelectItem value="paternity">{t("types.paternity")}</SelectItem>
            <SelectItem value="annual">{t("types.annual")}</SelectItem>
            <SelectItem value="other">{t("types.other")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* dates */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fromDate" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {t("dates.from")}
          </Label>
          <Input
            id="fromDate"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="toDate" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {t("dates.to")}
          </Label>
          <Input
            id="toDate"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            required
            min={fromDate || undefined}
          />
        </div>
      </div>

      {/* hint/warn */}
      <div
        className={cn(
          "rounded-xl border px-3 py-2 text-sm",
          isRangeInvalid ? "border-destructive/50 bg-destructive/5" : "bg-muted/40"
        )}
        role="note"
      >
        <div className="flex items-start gap-2">
          <Info className={cn("mt-[2px] h-4 w-4", isRangeInvalid ? "text-destructive" : "")} />
          <div>
            {isRangeInvalid ? (
              <span className="text-destructive">{t("dates.badRange")}</span>
            ) : (
              <span className="text-muted-foreground">{t("dates.hint")}</span>
            )}
          </div>
        </div>
      </div>

      {/* reason */}
      <div className="space-y-2">
        <Label htmlFor="reason">{t("reason.label")}</Label>
        <Textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t("reason.placeholder")}
          className="min-h-[110px]"
          required
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t("reason.hint")}</span>
          {calculatedDays !== null && !isRangeInvalid && (
            <span aria-live="polite">
              {t("reason.appliedDuration")}: {toBn(calculatedDays)} {t("reason.days")}
            </span>
          )}
        </div>
      </div>

      {/* actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          {t("actions.cancel")}
        </Button>
        <Button type="submit" disabled={loading} className="font-semibold transition-colors">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("actions.submitting")}
            </span>
          ) : (
            t("actions.submit")
          )}
        </Button>
      </div>
    </form>
  );
}
