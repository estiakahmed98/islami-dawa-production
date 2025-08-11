"use client";

import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Formik, Form } from "formik";
import { initialFormData, validationSchema } from "@/app/data/MoktobBishoyData";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import JoditEditorComponent from "./richTextEditor";
import { toast } from "sonner";
import Loading from "@/app/[locale]/dashboard/loading";

type FormValues = typeof initialFormData & { editorContent: string };

const FIELDS: { name: keyof FormValues; label: string }[] = [
  { name: "notunMoktobChalu", label: "নতুন মক্তব চালু হয়েছে" },
  { name: "totalMoktob", label: "মোট মক্তব চালু আছে" },
  { name: "totalStudent", label: "মোট শিক্ষার্থী" },
  { name: "obhibhabokConference", label: "অভিভাবক সম্মেলন" },
  { name: "moktoThekeMadrasaAdmission", label: "মক্তব থেকে মাদরাসায় ভর্তি" },
  { name: "notunBoyoskoShikkha", label: "নতুন বয়স্ক কোরআন শিক্ষা" },
  { name: "totalBoyoskoShikkha", label: "মোট বয়স্ক কোরআন শিক্ষা" },
  { name: "boyoskoShikkhaOnshogrohon", label: "বয়স্ক শিক্ষায় অংশগ্রহণ" },
  { name: "newMuslimeDinerFikir", label: "নব মুসলিমের দীন ফিকির" },
];

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
        const res = await fetch(
          `/api/moktob?email=${encodeURIComponent(email)}`,
          { cache: "no-store", signal: ac.signal }
        );
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
          toast.error("আজকের সাবমিশন স্ট্যাটাস চেক করা যায়নি।");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [email]);

  const handleSubmit = async (values: FormValues) => {
    if (!email) {
      toast.error("You are not logged in.");
      return;
    }

    if (isSubmittedToday) {
      toast.error("You have already submitted today.");
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
        throw new Error(data.error || "Submission failed");
      }

      toast.success("Submitted successfully...");
      setIsSubmittedToday(true);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Submission failed");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full mx-auto mt-8 rounded bg-white p-4 lg:p-10 shadow-lg">
      {isSubmittedToday && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-8">
          You have already submitted today.
        </div>
      )}
      <h2 className="mb-6 text-2xl">মক্তব বিষয়</h2>
      <Formik<FormValues>
        initialValues={{ ...initialFormData, editorContent: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting }) => (
          <Form className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {FIELDS.map((f) => (
              <div key={f.name as string}>
                <label className="mb-2 block text-gray-700">{f.label}</label>
                <Field
                  name={f.name as string}
                  type="number"
                  placeholder="Enter value"
                  disabled={isSubmittedToday || isSubmitting}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-2"
                />
                <ErrorMessage
                  name={f.name as string}
                  component="div"
                  className="text-red-500"
                />
              </div>
            ))}

            <div className="col-span-full">
              <label className="block text-gray-700 mb-2">মতামত</label>
              <JoditEditorComponent
                placeholder="আপনার মতামত লিখুন..."
                initialValue=""
                onContentChange={(content) =>
                  setFieldValue("editorContent", content)
                }
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
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default MoktobBishoyForm;
