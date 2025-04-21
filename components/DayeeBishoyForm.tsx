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

interface AssistantDaee {
  name: string;
  phone: string;
  address: string;
  description?: string;
}

const DayeeBishoyForm: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || "";
  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editorContent, setEditorContent] = useState("");
  const [assistantCount, setAssistantCount] = useState(0);
  const [assistants, setAssistants] = useState<AssistantDaee[]>([]);

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

  // Handle assistant count change
  const handleAssistantCountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const count = parseInt(e.target.value) || 0;
    setAssistantCount(count);

    // Initialize assistants array with empty objects
    if (count > assistants.length) {
      const newAssistants = [...assistants];
      while (newAssistants.length < count) {
        newAssistants.push({ name: "", phone: "", address: "" });
      }
      setAssistants(newAssistants);
    } else if (count < assistants.length) {
      setAssistants(assistants.slice(0, count));
    }
  };

  // Handle assistant info change
  const handleAssistantChange = (
    index: number,
    field: keyof AssistantDaee,
    value: string
  ) => {
    const newAssistants = [...assistants];
    newAssistants[index][field] = value;
    setAssistants(newAssistants);
  };

  // Handle form submission
  const handleSubmit = async (values: typeof initialFormData) => {
    if (isSubmittedToday) {
      toast.error("You have already submitted today. Try again tomorrow.");
      return;
    }

    const formData = {
      ...values,
      email,
      editorContent,
      assistants: assistantCount > 0 ? assistants : [],
      userInfo: {
        dayeName: session?.user?.name || "",
        division: session?.user?.division || "",
        district: session?.user?.district || "",
        upazila: session?.user?.upazila || "",
        union: session?.user?.union || "",
      },
    };

    try {
      const response = await fetch("/api/dayi", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setIsSubmittedToday(true);
      toast.success("Form submitted successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "An unexpected error occurred");
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
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">
        সহযোগী দায়ী বিষয
      </h2>
      <Formik
        initialValues={initialFormData}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting }) => (
          <Form className="space-y-6">
            <div>
              <label
                htmlFor="sohojogiDayeToiri"
                className="mb-2 block text-gray-700 font-medium"
              >
                সহযোগি দাঈ তৈরি হয়েছে
              </label>
              <Field
                id="sohojogiDayeToiri"
                name="sohojogiDayeToiri"
                type="number"
                placeholder="Enter value"
                disabled={isSubmittedToday}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFieldValue("sohojogiDayeToiri", e.target.value);
                  handleAssistantCountChange(e);
                }}
                className="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <ErrorMessage
                name="sohojogiDayeToiri"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Assistant Daee Information Fields - Directly below the count field */}
            {assistantCount > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  সহযোগি দাঈদের তথ্য
                </h3>
                <div className="space-y-6">
                  {assistants.map((assistant, index) => (
                    <div
                      key={index}
                      className="border p-4 rounded-lg space-y-4"
                    >
                      <h4 className="font-extrabold text-[#155E75]">
                        সহযোগি দাঈ #{index + 1}
                      </h4>
                      <div>
                        <label className="block text-gray-700 mb-1">নাম</label>
                        <input
                          type="text"
                          value={assistant.name}
                          onChange={(e) =>
                            handleAssistantChange(index, "name", e.target.value)
                          }
                          disabled={isSubmittedToday}
                          className="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">
                          ফোন নম্বর
                        </label>
                        <input
                          type="text"
                          value={assistant.phone}
                          onChange={(e) =>
                            handleAssistantChange(
                              index,
                              "phone",
                              e.target.value
                            )
                          }
                          disabled={isSubmittedToday}
                          className="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">
                          ঠিকানা
                        </label>
                        <textarea
                          value={assistant.address}
                          onChange={(e) =>
                            handleAssistantChange(
                              index,
                              "address",
                              e.target.value
                            )
                          }
                          disabled={isSubmittedToday}
                          className="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">
                          বিস্তারিত
                        </label>
                        <textarea
                          value={assistant.description}
                          onChange={(e) =>
                            handleAssistantChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          disabled={isSubmittedToday}
                          className="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="mb-3 font-medium">মতামত লিখুন</h3>
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
