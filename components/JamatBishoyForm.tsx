//Faysal Updated by //Estiak

"use client";

import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { initialFormData, validationSchema } from "@/app/data/JamatBishoyData";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import JoditEditorComponent from "./richTextEditor";
import { toast } from "sonner";
import Loading from "@/app/dashboard/loading";

// Define form values type
interface FormValues {
  jamatBerHoise: string | number; // Allow both string and number
  jamatSathi: string;
  editorContent: string;
}

const JamatBishoyForm: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || "";
  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if the user has already submitted today
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      const response = await fetch(`/api/jamat?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        setIsSubmittedToday(data.isSubmittedToday);
      }
      setLoading(false);
    };
    if (email) checkSubmissionStatus();
  }, [email]);

  // Handle form submission
  const handleSubmit = async (values: FormValues) => {
    const formData = { ...values, email };
    if (isSubmittedToday) {
      toast.error("You Already Submitted Today...");
      return;
    }

    const response = await fetch("/api/jamat", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      setIsSubmittedToday(true);
      toast.success("Submitted Successfully...");
      router.push("/dashboard");
    } else {
      toast.error("Submission Failed. Please Try Again...");
    }
  };

  // Render loading state
  if (loading) return <Loading />;

  return (
    <div className="mx-auto mt-8 w-full rounded bg-white p-4 lg:p-10 shadow-lg">
      {isSubmittedToday && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-8 z-30">
          You already have submitted today
        </div>
      )}
      <h2 className="mb-6 text-2xl">জামাত বিষয়</h2>
      <Formik
        initialValues={{ ...initialFormData, editorContent: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => (
          <Form>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <label className="mb-2 block text-gray-700">
                  জামাত বের হয়েছে
                </label>
                <Field
                  name="jamatBerHoise"
                  type="number"
                  placeholder="Enter Value"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  disabled={isSubmittedToday}
                />
                <ErrorMessage
                  name="jamatBerHoise"
                  component="div"
                  className="text-red-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-gray-700">
                  জামাতের মোট সাথী ছিল
                </label>
                <Field
                  name="jamatSathi"
                  type="number"
                  placeholder="Enter Value"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  disabled={isSubmittedToday}
                />
                <ErrorMessage
                  name="jamatSathi"
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
                disabled={isSubmittedToday}
              >
                Submit
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default JamatBishoyForm;
