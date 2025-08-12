'use client';

import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Formik, Form } from "formik";
import { initialFormData, validationSchema } from "@/app/data/MoktobBishoyData";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import JoditEditorComponent from "./richTextEditor";
import { toast } from "sonner";
import Loading from "@/app/[locale]/dashboard/loading";
import { useTranslations } from "next-intl";

type FormValues = typeof initialFormData & { editorContent: string };

/** Format a date to YYYY-MM-DD in Dhaka time */
function dhakaYMD(d: Date) {
  if (!(d instanceof Date) || isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Compare two dates based on Dhaka calendar date */
function isSameDhakaDay(recordDateISO: string | Date, now = new Date()) {
  const left = dhakaYMD(new Date(recordDateISO));
  const right = dhakaYMD(now);
  return left !== "" && right !== "" && left === right;
}

const MoktobBishoyForm = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || "";
  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  // i18n
  const tMoktob = useTranslations("dashboard.UserDashboard.moktob");
  const tToast = useTranslations("dashboard.UserDashboard.toast");
  const common = useTranslations("common");

  // Build field list *after* hooks so tMoktob is defined
  const FIELDS: { name: keyof FormValues; label: string }[] = [
    { name: "notunMoktobChalu", label: tMoktob("notunMoktobChalu") },
    { name: "totalMoktob", label: tMoktob("totalMoktob") },
    { name: "totalStudent", label: tMoktob("totalStudent") },
    { name: "obhibhabokConference", label: tMoktob("obhibhabokConference") },
    { name: "moktoThekeMadrasaAdmission", label: tMoktob("moktoThekeMadrasaAdmission") },
    { name: "notunBoyoskoShikkha", label: tMoktob("notunBoyoskoShikkha") },
    { name: "totalBoyoskoShikkha", label: tMoktob("totalBoyoskoShikkha") },
    { name: "boyoskoShikkhaOnshogrohon", label: tMoktob("boyoskoShikkhaOnshogrohon") },
    { name: "newMuslimeDinerFikir", label: tMoktob("newMuslimeDinerFikir") },
  ];

  // Check if user already submitted today
  useEffect(() => {
    if (!email) {
      setIsSubmittedToday(false);
      setLoading(false);
      return;
    }

    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/api/moktob?email=${encodeURIComponent(email)}`, {
          cache: "no-store",
          signal: ac.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch records");
        const json = await res.json();
        const records: Array<{ date: string | Date }> = Array.isArray(json)
          ? json
          : json.records ?? [];
        const todaySubmitted = records.some((r) => isSameDhakaDay(r.date));
        setIsSubmittedToday(todaySubmitted);
      } catch (err: any) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Today check error:", err);
          toast.error(tToast("errorFetchingData")); // from dashboard.UserDashboard.toast
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [email, tToast]);

  const handleSubmit = async (values: FormValues) => {
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
      editorContent: values.editorContent || "",
      notunMoktobChalu: Number(values.notunMoktobChalu) || 0,
      totalMoktob: Number(values.totalMoktob) || 0,
      totalStudent: Number(values.totalStudent) || 0,
      obhibhabokConference: Number(values.obhibhabokConference) || 0,
      moktoThekeMadrasaAdmission: Number(values.moktoThekeMadrasaAdmission) || 0,
      notunBoyoskoShikkha: Number(values.notunBoyoskoShikkha) || 0,
      totalBoyoskoShikkha: Number(values.totalBoyoskoShikkha) || 0,
      boyoskoShikkhaOnshogrohon: Number(values.boyoskoShikkhaOnshogrohon) || 0,
      newMuslimeDinerFikir: Number(values.newMuslimeDinerFikir) || 0,
    };

    try {
      const res = await fetch("/api/moktob", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || common("formSubmissionFailed"));
      }

      toast.success(common("submittedSuccessfully"));
      setIsSubmittedToday(true);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || common("formSubmissionFailed"));
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full mx-auto mt-8 rounded bg-white p-4 lg:p-10 shadow-lg">
      {isSubmittedToday && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-8">
          {common("youHaveAlreadySubmittedToday")}
        </div>
      )}
      <h2 className="mb-6 text-2xl">{tMoktob("title")}</h2>

      <Formik<FormValues>
        initialValues={{ ...initialFormData, editorContent: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting }) => (
          <Form className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {FIELDS.map((f) => (
              <div key={String(f.name)}>
                <label className="mb-2 block text-gray-700">{f.label}</label>
                <Field
                  name={String(f.name)}
                  type="number"
                  placeholder="0"
                  disabled={isSubmittedToday || isSubmitting}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-2"
                />
                <ErrorMessage
                  name={String(f.name)}
                  component="div"
                  className="text-red-500"
                />
              </div>
            ))}

            <div className="col-span-full">
              <label className="block text-gray-700 mb-2">
                {common("editorContent")}
              </label>
              <JoditEditorComponent
                placeholder={common("editorContentPlaceholder")}
                initialValue=""
                onContentChange={(content) => setFieldValue("editorContent", content)}
                height="300px"
                width="100%"
                disabled={isSubmittedToday || isSubmitting}
              />
            </div>

            <div className="col-span-full flex justify-end mt-4">
              <Button
                type="submit"
                disabled={isSubmittedToday || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {common("submit")}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default MoktobBishoyForm;
