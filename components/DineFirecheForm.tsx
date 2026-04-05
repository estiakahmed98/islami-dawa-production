// Faysal Updated by Estiak — aligned with Prisma/API fields & Dhaka-day check
"use client";

import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { initialFormData, validationSchema } from "@/app/data/DineFirecheData";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import JoditEditorComponent from "./richTextEditor";
import { toast } from "sonner";
import Loading from "@/app/[locale]/dashboard/loading";
import { useTranslations } from "next-intl";

interface FormValues {
  omuslimKalemaPoreche: string | number; // -> nonMuslimMuslimHoise
  murtadDineFireasa: string | number;     // -> murtadIslamFireche
  editorContent: string;
}

const DineFirecheForm: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || "";

  const tDF = useTranslations("dashboard.UserDashboard.dineFera");
  const tToast = useTranslations("dashboard.UserDashboard.toast");
  const common = useTranslations("common");

  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  useEffect(() => {
    if (!email) {
      setIsSubmittedToday(false);
      setLoading(false);
      return;
    }
    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch(
          `/api/dinefera?email=${encodeURIComponent(email)}&date=${selectedDate}`,
          { cache: "no-store", signal: ac.signal }
        );
        if (!res.ok) throw new Error("Failed to check today's status");
        const json = await res.json();
        setIsSubmittedToday(!!json.isSubmittedForDate);
      } catch (err: any) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Submission status error:", err);
          toast.error(tToast("errorFetchingData"));
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [email, selectedDate, tToast]);

  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
    if (!email) {
      toast.error(common("userEmailIsNotSet"));
      return;
    }
    if (isSubmittedToday) {
      toast.error(common("youHaveAlreadySubmittedToday"));
      return;
    }

    // Map form fields to API/schema fields
    const payload = {
      email,
      nonMuslimMuslimHoise: Number(values.omuslimKalemaPoreche) || 0,
      murtadIslamFireche: Number(values.murtadDineFireasa) || 0,
      editorContent: values.editorContent || "",
      date: selectedDate,
    };

    try {
      const res = await fetch("/api/dinefera", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error || common("formSubmissionFailed"));
        return;
      }

      toast.success(common("submittedSuccessfully"));
      setIsSubmittedToday(true);
      router.refresh();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(common("formSubmissionFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto mt-8 w-full rounded bg-white p-4 lg:p-10 shadow-lg">
        {/* Alert Message Skeleton */}
        <div className="h-12 bg-gray-100 rounded-lg mb-8 animate-pulse"></div>

        {/* Title Skeleton */}
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>

        {/* Form Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Form Field Skeletons */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              {/* Label Skeleton */}
              <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
              
              {/* Input Field Skeleton */}
              <div className="h-10 bg-gray-200 rounded w-full mb-3 animate-pulse"></div>
              
              {/* Error Message Skeleton */}
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Editor Skeleton */}
        <div className="mt-4">
          {/* Editor Label Skeleton */}
          <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
          
          {/* Editor Content Skeleton */}
          <div className="h-72 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>

        {/* Submit Button Skeleton */}
        <div className="flex justify-end mt-4">
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 w-full rounded bg-white p-4 lg:p-10 shadow-lg">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl">{tDF("title")}</h2>
        <div className="flex items-center space-x-2">
          <label className="text-gray-700">জমা তারিখ</label>
          <input
            type="date"
            max={today}
            min={yesterday}
            className="rounded border border-gray-300 px-3 py-1"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>
      {isSubmittedToday && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-8">
          {common("youHaveAlreadySubmittedToday")}
        </div>
      )}

      <Formik<FormValues>
        initialValues={{ ...(initialFormData as any), editorContent: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting }) => (
          <Form>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <label className="mb-2 block text-gray-700">
                  {tDF("nonMuslimMuslimHoise")}
                </label>
                <Field
                  name="omuslimKalemaPoreche"
                  type="number"
                  placeholder="0"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  disabled={isSubmittedToday || isSubmitting}
                />
                <ErrorMessage name="omuslimKalemaPoreche" component="div" className="text-red-500" />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  {tDF("murtadIslamFireche")}
                </label>
                <Field
                  name="murtadDineFireasa"
                  type="number"
                  placeholder="0"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  disabled={isSubmittedToday || isSubmitting}
                />
                <ErrorMessage name="murtadDineFireasa" component="div" className="text-red-500" />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-3 block text-gray-700">{common("editorContent")}</label>
                <JoditEditorComponent
                  placeholder={common("editorContentPlaceholder")}
                  initialValue=""
                  onContentChange={(content) => setFieldValue("editorContent", content)}
                  height="300px"
                  width="100%"
                  disabled={isSubmittedToday || isSubmitting}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmittedToday || isSubmitting}>
                {common("submit")}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DineFirecheForm;
