"use client";

import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loading from "@/app/[locale]/dashboard/loading";
import * as Yup from "yup";
import JoditEditorComponent from "@/components/richTextEditor";

type FormValues = {
  shobgojariDate: string;
  mashwaraDate: string;
  trainingDates: string[];
  jamatCount: number;
  gashtCount: number;
  editorContent: string;
};

const initialValues: FormValues = {
  shobgojariDate: "",
  mashwaraDate: "",
  trainingDates: [],
  jamatCount: 0,
  gashtCount: 0,
  editorContent: "",
};

const validationSchema = Yup.object({
  shobgojariDate: Yup.string().required("শবগুজারির তারিখ দিন"),
  mashwaraDate: Yup.string().required("মাসওয়ারার তারিখ দিন"),
  trainingDates: Yup.array().of(Yup.string()),
  jamatCount: Yup.number().min(0).required("জামাত সংখ্যা দিন"),
  gashtCount: Yup.number().min(0).required("গাস্ত সংখ্যা দিন"),
});

function getMonthValue(date: string) {
  return date.slice(0, 7); // YYYY-MM
}

function getMonthRange(monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);

  const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDate = new Date(year, month, 0).getDate();
  const lastDay = `${year}-${String(month).padStart(2, "0")}-${String(
    lastDate,
  ).padStart(2, "0")}`;

  return { firstDay, lastDay };
}

const DayeeFiveForm = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || "";

  const [loading, setLoading] = useState(true);
  const [isSubmittedForMonth, setIsSubmittedForMonth] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const currentMonth = getMonthValue(today);

  const [selectedMonthDate, setSelectedMonthDate] = useState(currentMonth);

  const [selectedYear, selectedMonth] = selectedMonthDate
    .split("-")
    .map(Number);
  const { firstDay, lastDay } = getMonthRange(selectedMonthDate);

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    const ac = new AbortController();

    async function checkSubmission() {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/dayee-five?email=${encodeURIComponent(
            email,
          )}&month=${selectedMonth}&year=${selectedYear}`,
          {
            cache: "no-store",
            signal: ac.signal,
          },
        );

        if (!res.ok) throw new Error("Failed to check submission");

        const json = await res.json();
        setIsSubmittedForMonth(!!json.isSubmittedForMonth);
      } catch (error: any) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error(error);
          toast.error("ডাটা চেক করতে সমস্যা হয়েছে");
        }
      } finally {
        setLoading(false);
      }
    }

    checkSubmission();

    return () => ac.abort();
  }, [email, selectedMonth, selectedYear]);

  const handleSubmit = async (values: FormValues) => {
    if (!email) {
      toast.error("User email not found");
      return;
    }

    if (isSubmittedForMonth) {
      toast.error("এই মাসের জন্য আপনি ইতোমধ্যে সাবমিট করেছেন");
      return;
    }

    try {
      const payload = {
        email,
        selectedMonthDate,
        shobgojariDate: values.shobgojariDate,
        mashwaraDate: values.mashwaraDate,
        trainingDates: values.trainingDates,
        jamatCount: Number(values.jamatCount) || 0,
        gashtCount: Number(values.gashtCount) || 0,
        editorContent: values.editorContent || "",
      };

      const res = await fetch("/api/dayee-five", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      toast.success("সফলভাবে সাবমিট হয়েছে");
      setIsSubmittedForMonth(true);
      window.dispatchEvent(new Event("dayee-five-data-refresh"));
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "সাবমিট করতে সমস্যা হয়েছে");
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="w-full mx-auto mt-8 rounded bg-white p-4 lg:p-10 shadow-lg">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-2xl font-semibold">
          দায়ীদের মাসিক ৫ কাজের প্রতিবেদন
        </h2>

        <div className="flex items-center gap-2">
          <label className="text-gray-700">মাস নির্বাচন</label>
          <input
            type="month"
            max={currentMonth}
            className="rounded border border-gray-300 px-3 py-1"
            value={selectedMonthDate}
            onChange={(e) => setSelectedMonthDate(e.target.value)}
          />
        </div>
      </div>

      {isSubmittedForMonth && (
        <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-500">
          এই মাসের জন্য আপনি ইতোমধ্যে সাবমিট করেছেন
        </div>
      )}

      <Formik<FormValues>
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-gray-700">শবগুজারি তারিখ</label>
              <Field
                name="shobgojariDate"
                type="date"
                min={firstDay}
                max={lastDay}
                disabled={isSubmittedForMonth || isSubmitting}
                className="mb-2 w-full rounded border border-gray-300 px-4 py-2"
              />
              <ErrorMessage
                name="shobgojariDate"
                component="div"
                className="text-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-gray-700">
                মাসওয়ারা তারিখ
              </label>
              <Field
                name="mashwaraDate"
                type="date"
                min={firstDay}
                max={lastDay}
                disabled={isSubmittedForMonth || isSubmitting}
                className="mb-2 w-full rounded border border-gray-300 px-4 py-2"
              />
              <ErrorMessage
                name="mashwaraDate"
                component="div"
                className="text-red-500"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-gray-700">
                প্রশিক্ষণ তারিখসমূহ
              </label>

              <div className="flex flex-col gap-3">
                {values.trainingDates.map((date, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="date"
                      min={firstDay}
                      max={lastDay}
                      value={date}
                      disabled={isSubmittedForMonth || isSubmitting}
                      onChange={(e) => {
                        const updated = [...values.trainingDates];
                        updated[index] = e.target.value;
                        setFieldValue("trainingDates", updated);
                      }}
                      className="w-full rounded border border-gray-300 px-4 py-2"
                    />

                    <Button
                      type="button"
                      variant="destructive"
                      disabled={isSubmittedForMonth || isSubmitting}
                      onClick={() => {
                        const updated = values.trainingDates.filter(
                          (_, i) => i !== index,
                        );
                        setFieldValue("trainingDates", updated);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  disabled={isSubmittedForMonth || isSubmitting}
                  className="w-fit bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() =>
                    setFieldValue("trainingDates", [
                      ...values.trainingDates,
                      firstDay,
                    ])
                  }
                >
                  + প্রশিক্ষণ তারিখ যোগ করুন
                </Button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-gray-700">
                মোট জামাতের সাথীদের সংখ্যা
              </label>
              <Field
                name="jamatCount"
                type="number"
                placeholder="0"
                disabled={isSubmittedForMonth || isSubmitting}
                className="mb-2 w-full rounded border border-gray-300 px-4 py-2"
              />
              <ErrorMessage
                name="jamatCount"
                component="div"
                className="text-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-gray-700">গাস্ত হয়েছে </label>
              <Field
                name="gashtCount"
                type="number"
                placeholder="0"
                disabled={isSubmittedForMonth || isSubmitting}
                className="mb-2 w-full rounded border border-gray-300 px-4 py-2"
              />
              <ErrorMessage
                name="gashtCount"
                component="div"
                className="text-red-500"
              />
            </div>

            <div className="col-span-full">
              <label className="mb-2 block text-gray-700">মন্তব্য</label>
              <JoditEditorComponent
                placeholder="মন্তব্য লিখুন"
                initialValue=""
                onContentChange={(content) =>
                  setFieldValue("editorContent", content)
                }
                height="300px"
                width="100%"
                disabled={isSubmittedForMonth || isSubmitting}
              />
            </div>

            <div className="col-span-full mt-4 flex justify-end">
              <Button
                type="submit"
                disabled={isSubmittedForMonth || isSubmitting}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DayeeFiveForm;
