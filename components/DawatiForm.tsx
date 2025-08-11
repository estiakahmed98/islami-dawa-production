// Faysal // Estiak
"use client";
import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { initialFormData, validationSchema } from "@/app/data/DawatiData";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import JoditEditorComponent from "./richTextEditor";
import { toast } from "sonner";
import Loading from "@/app/[locale]/dashboard/loading";

// Form values
interface DawatiFormData {
  nonMuslimDawat: string;
  murtadDawat: string;
  alemderSatheyMojlish: string;
  publicSatheyMojlish: string;
  nonMuslimSaptahikGasht: string;
  editorContent: string;
}

const DawatiForm: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || "";
  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if the user has already submitted today (Asia/Dhaka day)
  useEffect(() => {
    const checkToday = async () => {
      if (!email) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/dawati?email=${encodeURIComponent(email)}&mode=today`
        );
        if (!res.ok) throw new Error("Failed to check submission status");
        const data = await res.json();
        setIsSubmittedToday(Boolean(data?.isSubmittedToday));
      } catch (err) {
        console.error("Submission check error:", err);
        toast.error("Could not verify today's submission.");
      } finally {
        setLoading(false);
      }
    };
    checkToday();
  }, [email]);

  const handleSubmit = async (values: DawatiFormData) => {
    if (!email) {
      toast.error("You are not logged in.");
      return;
    }

    if (isSubmittedToday) {
      toast.error("You have already submitted today. Try again tomorrow.");
      return;
    }

    const body = {
      email,
      nonMuslimDawat: Number(values.nonMuslimDawat) || 0,
      murtadDawat: Number(values.murtadDawat) || 0,
      alemderSatheyMojlish: Number(values.alemderSatheyMojlish) || 0,
      publicSatheyMojlish: Number(values.publicSatheyMojlish) || 0,
      nonMuslimSaptahikGasht: Number(values.nonMuslimSaptahikGasht) || 0,
      editorContent: values.editorContent || "",
    };

    try {
      const res = await fetch("/api/dawati", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));

      if (res.status === 201) {
        toast.success("Submitted successfully!");
        setIsSubmittedToday(true);
        router.push("/dashboard");
        return;
      }

      if (res.status === 409) {
        // unique violation (already submitted today)
        setIsSubmittedToday(true);
        toast.error(json?.error || "Already submitted for today.");
        return;
      }

      toast.error(json?.error || "Submission failed. Try again.");
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Unexpected error during submission.");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full mx-auto mt-8 rounded bg-white p-4 lg:p-10 shadow-lg">
      {isSubmittedToday && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-8">
          You already have submitted today.
        </div>
      )}

      <h2 className="mb-6 text-2xl">দাওয়াতি বিষয়</h2>

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
                  অনুসলিমকে দাওয়াত দেওয়া হয়েছে
                </label>
                <Field
                  name="nonMuslimDawat"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="Enter value"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="nonMuslimDawat"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  মুরতাদ কে দাওয়াত দেওয়া হয়েছে
                </label>
                <Field
                  name="murtadDawat"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="Enter Value"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="murtadDawat"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  আলেম উলামার সাথে দাওয়াতি বিষয়ে কথাবার্তা হয়েছে
                </label>
                <Field
                  name="alemderSatheyMojlish"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="Enter Value"
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
                  সাধারণ মুসলমানদের সাথে দাওয়াতি বিষয়ে কথাবার্তা হয়েছে
                </label>
                <Field
                  name="publicSatheyMojlish"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="Enter Value"
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
                  অমুসলিমদের মাঝে সাপ্তাহিক গাস্ত হয়েছে
                </label>
                <Field
                  name="nonMuslimSaptahikGasht"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="Enter Value"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="nonMuslimSaptahikGasht"
                  component="div"
                  className="text-red-500"
                />
              </div>
            </div>

            <div>
              <h1 className="pb-3">মতামত লিখুন</h1>
              <JoditEditorComponent
                placeholder="আপনার মতামত লিখুন..."
                initialValue=""
                onContentChange={(content) =>
                  setFieldValue("editorContent", content)
                }
                height="300px"
                width="100%"
              />
            </div>

            <div className="flex justify-end mt-4">
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

export default DawatiForm;
