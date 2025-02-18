"use client"; //Faysal Updated by //Estiak

import React, { useEffect, useState } from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import JoditEditorComponent from "./richTextEditor";
import { toast } from "sonner";
import Loading from "@/app/dashboard/loading";

interface FormValues {
  moktobVisit: string;
  madrasaVisits: string[];
  schoolCollegeVisits: string[];
}

const initialValues: FormValues = {
  moktobVisit: "",
  madrasaVisits: [""],
  schoolCollegeVisits: [""],
};

const validationSchema = Yup.object({
  moktobVisit: Yup.string().required("This field is required"),
  madrasaVisits: Yup.array()
    .of(Yup.string().required("This field is required"))
    .required("At least one madrasa visit is required"),
  schoolCollegeVisits: Yup.array()
    .of(Yup.string().required("This field is required"))
    .required("At least one school/college visit is required"),
});

const SoforBishoyForm: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || "";

  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editorContent, setEditorContent] = useState("");

  const handleContentChange = (content: string) => {
    setEditorContent(content);
  };

  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (!email) return;

      try {
        const response = await fetch(`/api/soforbisoy?email=${email}`);
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

  if (loading) return <Loading />;

  return (
    <div className="mx-auto mt-8 w-full rounded bg-white p-4 lg:p-10 shadow-lg">
      {isSubmittedToday && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-8">
          You have already submitted today.
        </div>
      )}

      <h2 className="mb-6 text-2xl">সফর বিষয়</h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          // console.log(values);
          // return;
          if (isSubmittedToday) {
            toast.error("You have already submitted today.");
            setSubmitting(false);
            return;
          }

          if (!email) {
            toast.error("User email is not set. Please log in.");
            setSubmitting(false);
            return;
          }

          const formData = { ...values, email, editorContent };

          try {
            const response = await fetch("/api/soforbisoy", {
              method: "POST",
              body: JSON.stringify(formData),
              headers: {
                "Content-Type": "application/json",
              },
            });
            console.log(response);

            if (response.ok) {
              toast.success("Form submission successful!");
              resetForm();
              router.push("/dashboard");
            } else {
              toast.error("Form submission failed! Try again.");
            }
          } catch (error) {
            console.error("Error during form submission:", error);
            toast.error("An unexpected error occurred. Please try again.");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values }) => (
          <Form>
            <div>
              <label htmlFor="moktobVisit" className="mb-2 block text-gray-700">
                চলমান মক্তব পরিদর্শন হয়েছে
              </label>
              <Field
                id="moktobVisit"
                type="number"
                name="moktobVisit"
                placeholder="Enter Value"
                className="w-full rounded border border-gray-300 px-4 py-2 mb-6"
              />
              <ErrorMessage
                name="moktobVisit"
                component="div"
                className="text-red-500"
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <label className="mb-2 block text-gray-700">
                  মাদ্রাসা সফর হয়েছে
                </label>
                <FieldArray
                  name="madrasaVisits"
                  render={(arrayHelpers) => (
                    <div>
                      {values.madrasaVisits.map((_, index) => (
                        <div key={index} className="flex items-center mb-3">
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
                            onClick={() => arrayHelpers.insert(index + 1, "")}
                            className="ml-2"
                          >
                            +
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  স্কুল/কলেজ/ভার্সিটি দাওয়াতী সফর হয়েছে
                </label>
                <FieldArray
                  name="schoolCollegeVisits"
                  render={(arrayHelpers) => (
                    <div>
                      {values.schoolCollegeVisits.map((_, index) => (
                        <div key={index} className="mb-3 flex items-center">
                          <Field
                            name={`schoolCollegeVisits.${index}`}
                            placeholder={`Name of School/College ${index + 1}`}
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
                            onClick={() => arrayHelpers.insert(index + 1, "")}
                            className="ml-2"
                          >
                            +
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>
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

            <div className="flex justify-end mt-6">
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

export default SoforBishoyForm;
