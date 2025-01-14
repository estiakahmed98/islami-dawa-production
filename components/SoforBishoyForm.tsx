"use client";

import React, { useState } from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import { Button } from "@/components/ui/button";
import { validationSchema } from "@/app/data/SoforBishoyData";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import JoditEditorComponent from "./richTextEditor";

interface FormValues {
  madrasaVisits: string[];
  schoolCollegeVisits: string[];
}

const SoforBishoyForm = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || "";

  // Move useState inside the component
  const [editorContent, setEditorContent] = useState("<p>মতামত লিখুন...</p>");

  const handleContentChange = (content: string) => {
    setEditorContent(content);
  };

  return (
    <div className="mx-auto mt-8 w-full rounded bg-white p-10 shadow-lg">
      <h2 className="mb-6 text-2xl">সফর বিষয়</h2>
      <Formik<FormValues>
        initialValues={{
          madrasaVisits: [""],
          schoolCollegeVisits: [""],
        }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          if (!email) {
            alert("User email is not set. Please log in.");
            return;
          }

          const formData = { ...values, email };

          const response = await fetch("/api/soforbisoy", {
            method: "POST",
            body: JSON.stringify(formData),
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            router.push("/dashboard");
            alert("Form submission successful!");
          } else {
            alert("Form submission failed! Try again.");
          }
        }}
      >
        {({ values }) => (
          <Form>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 justify-center">
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-gray-700">
                    চলমান মক্তব পরিদর্শন হয়েছে
                  </label>
                  <Field
                    name="moktobVisit"
                    placeholder="Enter Value"
                    className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  />
                </div>
                {/* Dynamic Madrasa Visits */}
                <div>
                  <label className="mb-2 block text-gray-700">
                    মাদ্রাসা সফর হয়েছে
                  </label>
                  <FieldArray
                    name="madrasaVisits"
                    render={(arrayHelpers) => (
                      <div>
                        {values.madrasaVisits &&
                        values.madrasaVisits.length > 0 ? (
                          values.madrasaVisits.map((_, index) => (
                            <div key={index} className="mb-3 flex items-center">
                              <Field
                                name={`madrasaVisits.${index}`}
                                placeholder={`Name of Madrasa ${index + 1}`}
                                className="w-full rounded border border-gray-300 px-4 py-2"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => arrayHelpers.remove(index)}
                                className="ml-2"
                              >
                                -
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() =>
                                  arrayHelpers.insert(index + 1, "")
                                }
                                className="ml-2"
                              >
                                +
                              </Button>
                            </div>
                          ))
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => arrayHelpers.push("")}
                          >
                            Add a Madrasa
                          </Button>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* Dynamic School/College Visits */}

              <div className="space-y-8">
                <div>
                  <label className="mb-2 block text-gray-700">
                    স্কুল/কলেজ/ভার্সিটি দাওয়াতী সফর হয়েছে
                  </label>
                  <FieldArray
                    name="schoolCollegeVisits"
                    render={(arrayHelpers) => (
                      <div>
                        {values.schoolCollegeVisits &&
                        values.schoolCollegeVisits.length > 0 ? (
                          values.schoolCollegeVisits.map((_, index) => (
                            <div key={index} className="mb-3 flex items-center">
                              <Field
                                name={`schoolCollegeVisits.${index}`}
                                placeholder={`Name of School/College/University ${
                                  index + 1
                                }`}
                                className="w-full rounded border border-gray-300 px-4 py-2"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => arrayHelpers.remove(index)}
                                className="ml-2"
                              >
                                -
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() =>
                                  arrayHelpers.insert(index + 1, "")
                                }
                                className="ml-2"
                              >
                                +
                              </Button>
                            </div>
                          ))
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => arrayHelpers.push("")}
                          >
                            Add a School/College
                          </Button>
                        )}
                      </div>
                    )}
                  />
                </div>
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

            <div className="flex justify-end mt-6">
              <Button variant="ghost" size="default" type="submit">
                Submit
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SoforBishoyForm;
