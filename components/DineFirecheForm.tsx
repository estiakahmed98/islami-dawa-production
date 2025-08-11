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

interface FormValues {
  omuslimKalemaPoreche: string | number; // maps -> nonMuslimMuslimHoise
  murtadDineFireasa: string | number;     // maps -> murtadIslamFireche
  editorContent: string;
}

const DineFirecheForm: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || "";
  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if the user has already submitted today (server uses Dhaka day)
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
          `/api/dinefera?email=${encodeURIComponent(email)}&mode=today`,
          { cache: "no-store", signal: ac.signal }
        );
        if (!res.ok) throw new Error("Failed to check today's status");
        const json = await res.json();
        setIsSubmittedToday(!!json.isSubmittedToday);
      } catch (err: any) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Submission status error:", err);
          toast.error("আজকের সাবমিশন স্ট্যাটাস চেক করা যায়নি।");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [email]);

  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
    if (!email) {
      toast.error("You are not logged in.");
      return;
    }
    if (isSubmittedToday) {
      toast.error("You already submitted today.");
      return;
    }

    // Map form fields to API/schema fields
    const payload = {
      email,
      nonMuslimMuslimHoise: Number(values.omuslimKalemaPoreche) || 0,
      murtadIslamFireche: Number(values.murtadDineFireasa) || 0,
      editorContent: values.editorContent || "",
    };

    try {
      const res = await fetch("/api/dinefera", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // 409 from API means already submitted (Dhaka day)
        const msg = data?.error || "Submission failed. Please try again.";
        toast.error(msg);
        return;
      }

      toast.success("Submitted successfully!");
      setIsSubmittedToday(true);
      router.push("/dashboard");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Unexpected error during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="mx-auto mt-8 w-full rounded bg-white p-4 lg:p-10 shadow-lg">
      {isSubmittedToday && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-8">
          You already submitted today.
        </div>
      )}

      <h2 className="mb-6 text-2xl">দ্বীনে ফিরে এসেছে</h2>

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
                  অমুসলিম কালেমা পড়ে মুসলমান হয়েছে
                </label>
                <Field
                  name="omuslimKalemaPoreche"
                  type="number"
                  placeholder="Enter Value"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  disabled={isSubmittedToday || isSubmitting}
                />
                <ErrorMessage
                  name="omuslimKalemaPoreche"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  মুরতাদ কালেমা পড়ে ইসলামে ফিরে এসেছে
                </label>
                <Field
                  name="murtadDineFireasa"
                  type="number"
                  placeholder="Enter Value"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  disabled={isSubmittedToday || isSubmitting}
                />
                <ErrorMessage
                  name="murtadDineFireasa"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div className="lg:col-span-2">
                <h1 className="pb-3">মতামত লিখুন</h1>
                <JoditEditorComponent
                  placeholder="আপনার মতামত লিখুন"
                  initialValue=""
                  onContentChange={(content) => setFieldValue("editorContent", content)}
                  height="300px"
                  width="100%"
                  disabled={isSubmittedToday || isSubmitting}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="ghost"
                size="default"
                type="submit"
                disabled={isSubmittedToday || isSubmitting}
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

export default DineFirecheForm;
