"use client"; //Faysal Updated by //Estiak

import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Formik, Form } from "formik";
import { initialFormData, validationSchema } from "@/app/data/TalimData";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import JoditEditorComponent from "./richTextEditor";
import { toast } from "sonner";
import Loading from "@/app/dashboard/loading";

// Define the types for the form values
interface TalimFormValues {
  mohilaTalim: string;
  TalimOngshoGrohon: string;
  editorContent: string;
}

const TalimForm: React.FC = () => {
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
        const response = await fetch(`/api/talim?email=${email}`);
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
  const handleSubmit = async (values: TalimFormValues) => {
    const formData = { ...values, email, editorContent };

    if (isSubmittedToday) {
      toast.error("You have already submitted today. Try again tomorrow.");
      return;
    }

    try {
      const response = await fetch("/api/talim", {
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
      <h2 className="mb-6 text-2xl">মহিলাদের তালিম বিষয়</h2>
      <Formik
        initialValues={{ ...initialFormData, editorContent: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting }) => (
          <Form>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Field: মহিলাদের মাঝে দ্বীনের তালিম */}
              <div>
                <label
                  htmlFor="mohilaTalim"
                  className="mb-2 block text-gray-700"
                >
                  মহিলাদের মাঝে দ্বীনের তালিম
                </label>
                <Field
                  id="mohilaTalim"
                  type="number"
                  name="mohilaTalim"
                  disabled={isSubmittedToday}
                  placeholder="Enter value"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="mohilaTalim"
                  component="div"
                  className="text-red-500"
                />
              </div>
              {/* Field: মহিলাদের তালিমে মোট অংশগ্রহণ করেছে */}
              <div>
                <label
                  htmlFor="TalimOngshoGrohon"
                  className="mb-2 block text-gray-700"
                >
                  মহিলাদের তালিমে মোট অংশগ্রহণ করেছে
                </label>
                <Field
                  id="TalimOngshoGrohon"
                  type="number"
                  name="TalimOngshoGrohon"
                  disabled={isSubmittedToday}
                  placeholder="Enter value"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="TalimOngshoGrohon"
                  component="div"
                  className="text-red-500"
                />
              </div>
            </div>
            <div className=" pb-4">
              <h1 className=" pb-3">মতামত লিখুন</h1>
              <JoditEditorComponent
                placeholder="আপনার মতামত লিখুন..."
                initialValue=""
                onContentChange={handleContentChange}
                height="300px"
                width="100%"
              />
            </div>

            <div className="flex justify-end">
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

export default TalimForm;
