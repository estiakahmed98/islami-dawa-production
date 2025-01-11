"use client";
import React from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import { Button } from "@/components/ui/button";
import { initialFormData, validationSchema } from "@/app/data/SoforBishoyData";
import { useRouter } from "next/navigation";

interface FormValues {
  madrasaVisits: string[];
  schoolCollegeVisits: string[];
}

const SoforBishoyForm = () => {
  const router = useRouter();

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
          const email = localStorage.getItem("userEmail");

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                              onClick={() => arrayHelpers.remove(index)} // Remove a madrasa
                              className="ml-2"
                            >
                              -
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => arrayHelpers.insert(index + 1, "")} // Add a new madrasa
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
                          onClick={() => arrayHelpers.push("")} // Add first madrasa
                        >
                          Add a Madrasa
                        </Button>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Dynamic School/College Visits */}
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
                              onClick={() => arrayHelpers.remove(index)} // Remove a school/college
                              className="ml-2"
                            >
                              -
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => arrayHelpers.insert(index + 1, "")} // Add a new school/college
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
                          onClick={() => arrayHelpers.push("")} // Add first school/college
                        >
                          Add a School/College
                        </Button>
                      )}
                    </div>
                  )}
                />
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
