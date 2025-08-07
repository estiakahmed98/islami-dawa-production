"use client";

import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Formik, Form } from "formik";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import JoditEditorComponent from "./richTextEditor";
import Loading from "@/app/dashboard/loading";
import { initialFormData, validationSchema } from "@/app/data/MoktobBishoyData";

const MoktobBishoyForm = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || "";
  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editorContent, setEditorContent] = useState("");

  const handleContentChange = (content: string) => setEditorContent(content);

  useEffect(() => {
    const checkSubmission = async () => {
      if (!email) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/moktob?email=${email}`);
        if (res.ok) {
          const data = await res.json();
          const today = new Date().toDateString();
          const hasTodaySubmission = data.records.some((record: any) => {
            const recordDate = new Date(record.date).toDateString();
            return recordDate === today;
          });
          setIsSubmittedToday(hasTodaySubmission);
        } else {
          toast.error("Failed to check today's submission.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error checking today's submission.");
      } finally {
        setLoading(false);
      }
    };

    checkSubmission();
  }, [email]);

  const handleSubmit = async (values: typeof initialFormData) => {
    if (isSubmittedToday) {
      toast.error("You have already submitted today.");
      return;
    }

    const formData = {
      ...values,
      email,
      editorContent,
    };

    try {
      const res = await fetch("/api/moktob", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        toast.success("Submitted successfully!");
        setIsSubmittedToday(true);
        router.push("/dashboard");
      } else {
        const err = await res.json();
        toast.error(err.error || "Submission failed.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Unexpected error during submission.");
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

      <Formik
        initialValues={{ ...initialFormData, editorContent: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[
              { name: "notunMoktobChalu", label: "নতুন মক্তব চালু হয়েছে" },
              { name: "totalMoktob", label: "মোট মক্তব চালু আছে" },
              { name: "totalStudent", label: "মোট শিক্ষার্থী" },
              { name: "obhibhabokConference", label: "অভিভাবক সম্মেলন" },
              { name: "moktoThekeMadrasaAdmission", label: "মাদরাসায় ভর্তি" },
              { name: "notunBoyoskoShikkha", label: "নতুন বয়স্ক শিক্ষা" },
              { name: "totalBoyoskoShikkha", label: "মোট বয়স্ক শিক্ষা" },
              { name: "boyoskoShikkhaOnshogrohon", label: "অংশগ্রহণ সংখ্যা" },
              { name: "newMuslimeDinerFikir", label: "নব মুসলিমের দীন ফিকির" },
            ].map((field) => (
              <div key={field.name}>
                <label className="mb-2 block text-gray-700">{field.label}</label>
                <Field
                  name={field.name}
                  type="number"
                  placeholder="Enter value"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-2"
                />
                <ErrorMessage
                  name={field.name}
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
                onContentChange={handleContentChange}
                height="300px"
                width="100%"
                disabled={isSubmittedToday}
              />
            </div>

            <div className="col-span-full flex justify-end mt-4">
              <Button
                type="submit"
                disabled={isSubmitting || isSubmittedToday}
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