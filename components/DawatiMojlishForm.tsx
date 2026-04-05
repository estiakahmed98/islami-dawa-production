// Estiak // Faysal
"use client";

import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
  initialFormData,
  validationSchema,
  DawatiFormData,
} from "@/app/data/DawatiMojlishData";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import JoditEditorComponent from "./richTextEditor";
import { toast } from "sonner";
import Loading from "@/app/[locale]/dashboard/loading";
import { useTranslations } from "next-intl";

const DawatiMojlishForm: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || "";

  const tDM = useTranslations("dashboard.UserDashboard.dawatiMojlish");
  const tToast = useTranslations("dashboard.UserDashboard.toast");
  const common = useTranslations("common");
  const tDawati = useTranslations("dashboard.UserDashboard.dawati");

  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (!email) {
        setIsSubmittedToday(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/dawatimojlish?email=${encodeURIComponent(email)}&date=${selectedDate}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("status check failed");
        const data = await res.json();
        setIsSubmittedToday(Boolean(data?.isSubmittedForDate));
      } catch (error) {
        console.error("Error checking submission status:", error);
        toast.error(tToast("errorFetchingData"));
      } finally {
        setLoading(false);
      }
    };
    checkSubmissionStatus();
  }, [email, selectedDate, tToast]);

  const handleSubmit = async (values: DawatiFormData, { setSubmitting }: any) => {
    if (!email) {
      toast.error(common("userEmailIsNotSet"));
      return;
    }
    if (isSubmittedToday) {
      toast.error(common("youHaveAlreadySubmittedToday"));
      return;
    }

    const payload = {
      email,
      dawatterGuruttoMojlish: Number(values.dawatterGuruttoMojlish) || 0,
      mojlisheOnshogrohon: Number(values.mojlisheOnshogrohon) || 0,
      alemderSatheyMojlish: Number(values.alemderSatheyMojlish) || 0,
      publicSatheyMojlish: Number(values.publicSatheyMojlish) || 0,
      prosikkhonKormoshalaAyojon:
        Number(values.prosikkhonKormoshalaAyojon) || 0,
      prosikkhonOnshogrohon: Number(values.prosikkhonOnshogrohon) || 0,
      jummahAlochona: Number(values.jummahAlochona) || 0,
      dhormoSova: Number(values.dhormoSova) || 0,
      mashwaraPoint: Number(values.mashwaraPoint) || 0,
      editorContent: values.editorContent || "",
      date: selectedDate,
    };

    try {
      const res = await fetch("/api/dawatimojlish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (res.status === 201) {
        toast.success(common("submittedSuccessfully"));
        setIsSubmittedToday(true);
        router.refresh();
        return;
      }
      if (res.status === 409) {
        setIsSubmittedToday(true);
        toast.error(json?.error || common("youHaveAlreadySubmittedToday"));
        return;
      }
      toast.error(json?.error || common("formSubmissionFailed"));
    } catch (error) {
      console.error("Error during submission:", error);
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
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
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
        <h2 className="text-2xl">{tDM("title")}</h2>
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
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-8 z-30">
          {common("youHaveAlreadySubmittedToday")}
        </div>
      )}

      <Formik
        initialValues={{ ...initialFormData, editorContent: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting }) => (
          <Form>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <label className="mb-2 block text-gray-700">
                  {tDM("dawatterGuruttoMojlish")}
                </label>
                <Field
                  name="dawatterGuruttoMojlish"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="0"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="dawatterGuruttoMojlish"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  {tDM("mojlisheOnshogrohon")}
                </label>
                <Field
                  name="mojlisheOnshogrohon"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="0"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="mojlisheOnshogrohon"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  {tDawati("alemderSatheyMojlish")}
                </label>
                <Field
                  name="alemderSatheyMojlish"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="0"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="alemderSatheyMojlish"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  {tDawati("publicSatheyMojlish")}
                </label>
                <Field
                  name="publicSatheyMojlish"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="0"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="publicSatheyMojlish"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  {tDM("prosikkhonKormoshalaAyojon")}
                </label>
                <Field
                  name="prosikkhonKormoshalaAyojon"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="0"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="prosikkhonKormoshalaAyojon"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  {tDM("prosikkhonOnshogrohon")}
                </label>
                <Field
                  name="prosikkhonOnshogrohon"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="0"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="prosikkhonOnshogrohon"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  {tDM("jummahAlochona")}
                </label>
                <Field
                  name="jummahAlochona"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="0"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="jummahAlochona"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  {tDM("dhormoSova")}
                </label>
                <Field
                  name="dhormoSova"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="0"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="dhormoSova"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  {tDM("mashwaraPoint")}
                </label>
                <Field
                  name="mashwaraPoint"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="0"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="mashwaraPoint"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-gray-700">
                  {common("editorContent")}
                </label>
                <JoditEditorComponent
                  placeholder={common("editorContentPlaceholder")}
                  initialValue=""
                  onContentChange={(content) =>
                    setFieldValue("editorContent", content)
                  }
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

export default DawatiMojlishForm;
