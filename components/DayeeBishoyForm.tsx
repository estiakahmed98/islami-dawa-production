"use client";

import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Formik, FormikHelpers } from "formik";
import { initialFormData, validationSchema } from "@/app/data/DayeeBishoyData";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import JoditEditorComponent from "./richTextEditor";

const DayeeBishoyForm = () => {
  const router = useRouter();
  const [editorContent, setEditorContent] = useState("");

  const handleContentChange = (content: string) => {
    setEditorContent(content);
  };

  const { data: session } = useSession();
  const email = session?.user?.email || "";

  return (
    <div className="mx-auto mt-8 w-full rounded bg-white p-10 shadow-lg">
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">দায়ী বিষয়</h2>
      <Formik
        initialValues={initialFormData}
        validationSchema={validationSchema}
        onSubmit={async (
          values,
          { setSubmitting }: FormikHelpers<typeof initialFormData>
        ) => {
          try {
            if (!email) {
              alert("User email is not set. Please log in.");
              setSubmitting(false);
              return;
            }

            const formData = { ...values, email };

            const response = await fetch("/api/dayi", {
              method: "POST",
              body: JSON.stringify(formData),
              headers: {
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              alert("Form submission successful!");
              router.push("/dashboard");
            } else {
              const errorData = await response.json();
              alert(
                `Form submission failed: ${errorData.message || "Try again."}`
              );
            }
          } catch (error) {
            console.error("Submission error:", error);
            alert("An unexpected error occurred. Please try again.");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1  gap-6">
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
                  placeholder="Enter value"
                  className="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <ErrorMessage
                  name="sohojogiDayeToiri"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="col-span-2">
                <h1 className=" pb-3">মতামত লিখুন</h1>
                <JoditEditorComponent
                  placeholder="আপনার মতামত লিখুন..."
                  initialValue={editorContent}
                  onContentChange={handleContentChange}
                  height="300px"
                  width="100%"
                />
                {/* <h2>Output:</h2>
                  <div dangerouslySetInnerHTML={{ __html: editorContent }} /> */}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                variant="ghost"
                size="default"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default DayeeBishoyForm;
