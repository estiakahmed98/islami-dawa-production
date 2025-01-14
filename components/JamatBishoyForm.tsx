"use client";
import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { initialFormData, validationSchema } from "@/app/data/JamatBishoyData";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import JoditEditorComponent from "./richTextEditor";

// Type for form data
interface FormData {
  jamatBerHoise: number | string;
  jamatSathi: string;
}

const JamatBishoyForm = () => {
  const router = useRouter();
  const [editorContent, setEditorContent] = useState("<p>মতামত লিখুন...</p>");

  const handleContentChange = (content: string) => {
    setEditorContent(content);
  };

  // User Logged in email collection
  const { data: session } = useSession();
  const email = session?.user?.email || "";

  return (
    <div className="mx-auto mt-8 w-full rounded bg-white p-10 shadow-lg">
      <h2 className="mb-6 text-2xl">জামাত বিষয়</h2>
      <Formik
        initialValues={initialFormData}
        validationSchema={validationSchema}
        onSubmit={async (values: FormData) => {
          // Check if email is available
          if (!email) {
            alert("User email is not set. Please log in.");
            return;
          }

          // Include email in the form data
          const formData = { ...values, email };

          // Send form data to the API
          const response = await fetch("/api/jamat", {
            method: "POST",
            body: JSON.stringify(formData),
            headers: {
              "Content-Type": "application/json",
            },
          });

          console.log("response", response);

          // Handle API response
          if (response.ok) {
            router.push("/dashboard");
            alert("Form submission successful!");
          } else {
            alert("Form submission failed! Try again.");
          }

          console.log(formData);
        }}
      >
        <Form>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <label className="mb-2 block text-gray-700">
                জামাত বের হয়েছে
              </label>
              <Field
                name="jamatBerHoise"
                placeholder="Enter value"
                className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
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
                placeholder="Enter Value"
                className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
              />
              <ErrorMessage
                name="jamatSathi"
                component="div"
                className="text-red-500"
              />
            </div>

            <div className="col-span-2">
              <h1 className=" pb-3">মতামত লিখুন</h1>
              <JoditEditorComponent
                placeholder="Start typing here..."
                initialValue={editorContent}
                onContentChange={handleContentChange}
                height="300px"
                width="100%"
              />
              {/* <h2>Output:</h2>
                  <div dangerouslySetInnerHTML={{ __html: editorContent }} /> */}
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="ghost" size="default" type="submit">
              Submit
            </Button>
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default JamatBishoyForm;
