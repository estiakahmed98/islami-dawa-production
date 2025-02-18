//Faysal Updated by //Estiak

"use client";

import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { initialFormData, validationSchema } from "@/app/data/DayeeBishoyData";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import JoditEditorComponent from "./richTextEditor";
import { toast } from "sonner";
import Loading from "@/app/dashboard/loading";

const DayeeBishoyForm: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || "";
  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editorContent, setEditorContent] = useState("");

  const handleContentChange = (content: string) => {
    setEditorContent(content);
  };

  // Check if the user has already submitted today
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (!email) return;

      try {
        const response = await fetch(`/api/dayi?email=${email}`);
        if (response.ok) {
          const data = await response.json();
          setIsSubmittedToday(data.isSubmittedToday);
        } else {
          toast.error("Failed to check submission status.");
        }
      } catch (error) {
        console.error("Error checking submission status:", error);
        toast.error("Error checking submission status.");
      } finally {
        setLoading(false);
      }
    };

    checkSubmissionStatus();
  }, [email]);

  // Handle form submission
  const handleSubmit = async (values: typeof initialFormData) => {
    const formData = { ...values, email, editorContent };

    if (isSubmittedToday) {
      toast.error("You have already submitted today. Try again tomorrow.");
      return;
    }

    try {
      const response = await fetch("/api/dayi", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setIsSubmittedToday(true);
        toast.success("Form submitted successfully!");
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Submission failed. Try again.");
      }
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  // Render loading state
  if (loading) return <Loading />;

  return (
    <div className="mx-auto mt-8 w-full rounded bg-white p-4 lg:p-10 shadow-lg">
      {isSubmittedToday && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-8">
          You already have submitted today.
        </div>
      )}
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">দায়ী বিষয়</h2>
      <Formik
        initialValues={initialFormData}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting }) => (
          <Form>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label
                  htmlFor="sohojogiDayeToiri"
                  className="mb-2 block text-gray-700 font-medium"
                >
                  সহযোগি দাঈ তৈরি হয়েছে
                </label>
                <Field
                  id="sohojogiDayeToiri"
                  name="sohojogiDayeToiri"
                  type="number"
                  placeholder="Enter value"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <ErrorMessage
                  name="sohojogiDayeToiri"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="col-span-2">
                <h1 className="pb-3">মতামত লিখুন</h1>
                <JoditEditorComponent
                  placeholder="আপনার মতামত লিখুন..."
                  initialValue={editorContent}
                  onContentChange={handleContentChange}
                  height="300px"
                  width="100%"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                variant="ghost"
                size="default"
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

export default DayeeBishoyForm;
