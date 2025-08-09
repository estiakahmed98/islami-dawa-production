// Estiak // Faysal
"use client";
import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
  initialFormData,
  validationSchema,
} from "@/app/data/DawatiMojlishData";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import JoditEditorComponent from "./richTextEditor";
import { toast } from "sonner";
import Loading from "@/app/dashboard/loading";

interface FormValues {
  dawatterGuruttoMojlish: string;
  mojlisheOnshogrohon: string;
  prosikkhonKormoshalaAyojon: string;
  prosikkhonOnshogrohon: string;
  jummahAlochona: string;
  dhormoSova: string;
  mashwaraPoint: string;
  editorContent: string;
}

const DawatiMojlishForm: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || "";
  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if already submitted today (Asia/Dhaka day)
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (!email) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/dawatimojlish?email=${encodeURIComponent(email)}&mode=today`
        );
        if (!res.ok) throw new Error("Failed to check submission status");
        const data = await res.json();
        setIsSubmittedToday(Boolean(data?.isSubmittedToday));
      } catch (error) {
        console.error("Error checking submission status:", error);
        toast.error("Error checking today's submission.");
      } finally {
        setLoading(false);
      }
    };
    checkSubmissionStatus();
  }, [email]);

  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
    if (!email) {
      toast.error("You are not logged in.");
      return;
    }
    if (isSubmittedToday) {
      toast.error("You have already submitted today. Try again tomorrow.");
      return;
    }

    const payload = {
      email,
      dawatterGuruttoMojlish: Number(values.dawatterGuruttoMojlish) || 0,
      mojlisheOnshogrohon: Number(values.mojlisheOnshogrohon) || 0,
      prosikkhonKormoshalaAyojon: Number(values.prosikkhonKormoshalaAyojon) || 0,
      prosikkhonOnshogrohon: Number(values.prosikkhonOnshogrohon) || 0,
      jummahAlochona: Number(values.jummahAlochona) || 0,
      dhormoSova: Number(values.dhormoSova) || 0,
      mashwaraPoint: Number(values.mashwaraPoint) || 0,
      editorContent: values.editorContent || "",
    };

    try {
      const res = await fetch("/api/dawatimojlish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (res.status === 201) {
        toast.success("Submitted successfully!");
        setIsSubmittedToday(true);
        router.push("/dashboard");
        return;
      }
      if (res.status === 409) {
        setIsSubmittedToday(true);
        toast.error(json?.error || "Already submitted for today.");
        return;
      }
      toast.error(json?.error || "Submission failed. Try again.");
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error("Unexpected error during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="mx-auto mt-8 w-full rounded bg-white p-4 lg:p-10 shadow-lg">
      {isSubmittedToday && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-8 z-30">
          You already have submitted today.
        </div>
      )}

      <h2 className="mb-6 text-2xl">দাওয়াতি মজলিশ</h2>

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
                  দাওয়াতের গুরুত্ব ও প্রয়োজনীয়তা নিয়ে মজলিস হয়েছে
                </label>
                <Field
                  name="dawatterGuruttoMojlish"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="Enter Value"
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
                  দাওয়াতের গুরুত্ব ও প্রয়োজনীয়তা মজলিসে মোট অংশগ্রহণ
                </label>
                <Field
                  name="mojlisheOnshogrohon"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="Enter Value"
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
                  দাওয়াত প্রশিক্ষণ কর্মশালার আয়োজন হয়েছে
                </label>
                <Field
                  name="prosikkhonKormoshalaAyojon"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="Enter Value"
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
                  দাওয়াত প্রশিক্ষণ কর্মশালায় মোট অংশগ্রহণ
                </label>
                <Field
                  name="prosikkhonOnshogrohon"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="Enter Value"
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
                  জুমার মজলিসে আলোচনা হয়েছে
                </label>
                <Field
                  name="jummahAlochona"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="Enter Value"
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
                  ধর্মীয় সভা আয়োজন হয়েছে
                </label>
                <Field
                  name="dhormoSova"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="Enter Value"
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
                  দাওয়াতের মাশওয়ারা পয়েন্ট চালু হয়েছে
                </label>
                <Field
                  name="mashwaraPoint"
                  type="number"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="Enter Value"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="mashwaraPoint"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div className="lg:col-span-2">
                <h1 className="pb-3">মতামত লিখুন</h1>
                <JoditEditorComponent
                  placeholder="আপনার মতামত লিখুন"
                  initialValue=""
                  onContentChange={(content) =>
                    setFieldValue("editorContent", content)
                  }
                  height="300px"
                  width="100%"
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

export default DawatiMojlishForm;
