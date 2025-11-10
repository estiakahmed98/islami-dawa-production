"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";

type ReportForm = {
  date: string;
  title: string;
  summary: string;
  details: string;
};

export default function KargojariPage() {
  const [form, setForm] = useState<ReportForm>({
    date: "",
    title: "",
    summary: "",
    details: "",
  });

  const isValid = useMemo(() => {
    return form.title.trim().length > 0 && form.summary.trim().length > 0;
  }, [form]);

  const onChange = <K extends keyof ReportForm>(key: K, value: ReportForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const outputText = useMemo(() => {
    const lines: string[] = [];
    lines.push(`কারগুজারী প্রতিবেদন`);
    if (form.date) lines.push(`তারিখ: ${form.date}`);
    if (form.title) lines.push(`শিরোনাম: ${form.title}`);
    if (form.summary) {
      lines.push("");
      lines.push(`সংক্ষিপ্ত বিবরণ:`);
      lines.push(form.summary);
    }
    if (form.details) {
      lines.push("");
      lines.push(`বিস্তারিত কারগুজারী:`);
      lines.push(form.details);
    }
    return lines.join("\n");
  }, [form]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      toast.success("প্রতিবেদন কপি হয়েছে");
    } catch (e) {
      toast.error("কপি করতে ব্যর্থ");
    }
  };

  return (
    <main className="p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold">কারগুজারী</h1>
        <p className="text-sm text-muted-foreground">
          "কারগুজারী" শব্দের অর্থ হলো কাজের বিবরণ বা প্রতিবেদন। সাধারণত কোনো কাজ বা মিশন সম্পর্কিত তথ্য—কী কী কাজ হয়েছে, কেমন হয়েছে এবং ফলাফল কী—তা সংক্ষিপ্ত ও বিস্তারিতভাবে উপস্থাপনের জন্য ব্যবহৃত হয়।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ইনপুট (কাজের বিবরণ)</CardTitle>
            <CardDescription>ফর্ম পূরণ করুন; ডান পাশে আউটপুট দেখুন</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date">তারিখ</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => onChange("date", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title">শিরোনাম <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  placeholder="যেমন: মাসিক দাওয়াতি কাজের প্রতিবেদন"
                  value={form.title}
                  onChange={(e) => onChange("title", e.target.value)}
                />
                {!form.title.trim() && (
                  <p className="text-xs text-red-500">শিরোনাম প্রয়োজন</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="summary">সংক্ষিপ্ত বিবরণ <span className="text-red-500">*</span></Label>
                <Textarea
                  id="summary"
                  placeholder="সংক্ষিপ্তভাবে কী কী কাজ হয়েছে, কোথায়, কার সাথে ইত্যাদি"
                  value={form.summary}
                  onChange={(e) => onChange("summary", e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{form.summary.length} অক্ষর</span>
                  {!form.summary.trim() && <span className="text-red-500">সংক্ষিপ্ত বিবরণ প্রয়োজন</span>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="details">বিস্তারিত কারগুজারী</Label>
                <Textarea
                  id="details"
                  placeholder="বিস্তারিত কার্যক্রম, ফলাফল, চ্যালেঞ্জ, শিক্ষা, পরবর্তী পরিকল্পনা ইত্যাদি"
                  value={form.details}
                  onChange={(e) => onChange("details", e.target.value)}
                  className="min-h-[160px]"
                />
                <div className="text-xs text-muted-foreground">{form.details.length} অক্ষর</div>
              </div>

              <div className="flex gap-2">
                <Button disabled={!isValid} onClick={handleCopy} type="button">
                  আউটপুট কপি করুন
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm({ date: "", title: "", summary: "", details: "" })}
                >
                  রিসেট
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-sky-200/70">
          <CardHeader>
            <CardTitle>আউটপুট (প্রিভিউ)</CardTitle>
            <CardDescription>আপনার দেওয়া তথ্যের ভিত্তিতে স্বয়ংক্রিয়ভাবে তৈরি</CardDescription>
          </CardHeader>
          <CardContent>
            {isValid ? (
              <pre className="whitespace-pre-wrap text-sm leading-6 bg-muted/40 p-3 rounded-md">
                {outputText}
              </pre>
            ) : (
              <div className="text-sm text-muted-foreground">
                শিরোনাম ও সংক্ষিপ্ত বিবরণ পূরণ করলে এখানে প্রতিবেদনটি দেখা যাবে।
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="text-xs text-muted-foreground">
        সমার্থক: এজেন্সি, দক্ষতা, ভালো সেবা ইত্যাদি প্রসঙ্গে "কারগুজারী" শব্দটি ব্যবহৃত হতে পারে। সাধারণ ব্যবহার: দাওয়াত ও তাবলীগের কাজ বা যে কোনো মিশনের কাজের রিপোর্ট/প্রতিবেদন উপস্থাপন।
      </div>
    </main>
  );
}

