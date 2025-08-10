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
import { cn } from "@/lib/utils"; // if you don't have cn util, replace cn(...) with string join

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
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return diff;
};

export function LeaveRequestForm({
  userEmail,
  onSubmissionSuccess,
  onClose,
}: LeaveRequestFormProps) {
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const { data } = useSession();
  const user = data?.user;

  // সেশন আসলে নাম/ফোন অটো-ফিল
  useEffect(() => {
    if (user) {
      setName((prev) => (prev?.trim() ? prev : user.name ?? ""));
      setPhone((prev) => (prev?.trim() ? prev : (user?.phone as string) ?? ""));
    }
  }, [user]);

  // গণনা করা দিনের সংখ্যা (ইনক্লুসিভ)
  const calculatedDays = useMemo(() => getInclusiveDays(fromDate, toDate), [fromDate, toDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leaveType) {
      toast.error("ছুটির ধরন নির্বাচন করুন।");
      return;
    }
    if (!fromDate || !toDate) {
      toast.error("তারিখ দিন।");
      return;
    }
    if (getInclusiveDays(fromDate, toDate) === null) {
      toast.error("তারিখের সীমা সঠিক নয়।");
      return;
    }
    if (!reason.trim()) {
      toast.error("ছুটির কারণ লিখুন।");
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

      const resJson = await response.json();

      if (!response.ok) {
        if (resJson?.errors) {
          Object.values(resJson.errors).forEach((msg) => toast.error(String(msg)));
        } else {
          throw new Error(resJson?.error || "ছুটির আবেদন জমা দিতে ব্যর্থ।");
        }
        return;
      }

      toast.success("✅ ছুটির আবেদন সফলভাবে জমা হয়েছে!");
      // ফর্ম রিসেট
      setLeaveType("");
      setFromDate("");
      setToDate("");
      setReason("");
      setPhone("");
      setName("");

      onSubmissionSuccess();
      onClose();
    } catch (err: any) {
      toast.error(`ত্রুটি: ${err?.message || "অপ্রত্যাশিত সমস্যা ঘটেছে।"}`);
    } finally {
      setLoading(false);
    }
  };

  const isRangeInvalid = fromDate && toDate && getInclusiveDays(fromDate, toDate) === null;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "grid gap-6 rounded-2xl bg-muted/30 p-5 md:p-6",
        "shadow-sm ring-1 ring-border"
      )}
      aria-label="ছুটির আবেদন ফর্ম"
    >
      {/* শীর্ষ সারাংশ */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">ছুটির আবেদন</h3>
          <p className="text-sm text-muted-foreground">
            আপনার প্রোফাইলের নাম ও ফোন স্বয়ংক্রিয়ভাবে যুক্ত হয়েছে।
          </p>
        </div>

        {calculatedDays !== null && !isRangeInvalid && (
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border bg-background px-3 py-2",
              "text-sm"
            )}
            aria-live="polite"
            title="নির্বাচিত তারিখ অনুযায়ী গণনা"
          >
            <Calculator className="h-4 w-4" />
            মোট দিন: <span className="font-semibold">{toBn(calculatedDays)}</span>
          </div>
        )}
      </div>

      {/* নাম/ফোন */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            নাম
          </Label>
          <Input id="name" value={name} readOnly required />
          <p className="text-xs text-muted-foreground">
            এই ঘরটি আপনার প্রোফাইল থেকে নেওয়া হয়েছে।
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            ফোন নম্বর
          </Label>
          <Input
            id="phone"
            value={phone}
            readOnly
            required
            inputMode="numeric"
            pattern="^01[3-9]\d{8}$"
            title="বাংলাদেশি মোবাইল নম্বর: ০১৩–০১৯ সিরিজ, মোট ১১ ডিজিট"
          />
          <p className="text-xs text-muted-foreground">
            ফরম্যাট: 01XXXXXXXXX (বাংলাদেশ)
          </p>
        </div>
      </div>

      {/* ছুটির ধরন */}
      <div className="space-y-2">
        <Label htmlFor="leaveType">ছুটির ধরন</Label>
        <Select value={leaveType} onValueChange={setLeaveType} required>
          <SelectTrigger id="leaveType" aria-label="ছুটির ধরন নির্বাচন করুন">
            <SelectValue placeholder="ছুটির ধরন নির্বাচন করুন" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="casual">ক্যাজুয়াল ছুটি</SelectItem>
            <SelectItem value="sick">অসুস্থতার ছুটি</SelectItem>
            <SelectItem value="paternity">পিতৃত্বকালীন ছুটি</SelectItem>
            <SelectItem value="annual">বাৎসরিক ছুটি</SelectItem>
            <SelectItem value="other">অন্যান্য</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* তারিখ */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fromDate" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            শুরুর তারিখ
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
            শেষ তারিখ
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

      {/* সতর্কতা / হিন্ট */}
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
              <span className="text-destructive">তারিখের সীমা সঠিক নয়। শুরুর তারিখ শেষ তারিখের আগের হতে হবে।</span>
            ) : (
              <span className="text-muted-foreground">
                দিন গণনা ইনক্লুসিভ (শুরু ও শেষ—দুটিই ধরা হয়)।
              </span>
            )}
          </div>
        </div>
      </div>

      {/* কারণ */}
      <div className="space-y-2">
        <Label htmlFor="reason">ছুটির কারণ</Label>
        <Textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="সংক্ষেপে আপনার ছুটির কারণ লিখুন…"
          className="min-h-[110px]"
          required
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>স্পষ্ট ও সংক্ষিপ্ত কারণ দিন। প্রয়োজনে রেফারেন্স যুক্ত করুন।</span>
          {calculatedDays !== null && !isRangeInvalid && (
            <span aria-live="polite">আবেদিত মেয়াদ: {toBn(calculatedDays)} দিন</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          বাতিল
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="font-semibold transition-colors"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              জমা হচ্ছে…
            </span>
          ) : (
            "ছুটির আবেদন জমা দিন"
          )}
        </Button>
      </div>
    </form>
  );
}
