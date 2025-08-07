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

  const handleContentChange = (content: string) => setEditorContent(content);

  // ✅ Submission check just like Moktob
  useEffect(() => {
    const checkSubmission = async () => {
      if (!email) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/dayi?email=${email}`);
        if (res.ok) {
          const data = await res.json();
          const records = data.records || [];
          const today = new Date().toDateString();

          const hasTodaySubmission = records.some((record: any) => {
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

  const handleAssistantCountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const count = parseInt(e.target.value) || 0;
    setAssistantCount(count);

    const newAssistants = [...assistants];
    while (newAssistants.length < count) {
      newAssistants.push({ name: "", phone: "", address: "", description: "" });
    }
    setAssistants(newAssistants.slice(0, count));
  };

  const handleAssistantChange = (
    index: number,
    field: keyof AssistantDaee,
    value: string
  ) => {
    const updated = [...assistants];
    updated[index][field] = value;
    setAssistants(updated);
  };

  const handleSubmit = async (values: typeof initialFormData) => {
    if (isSubmittedToday) {
      toast.error("You have already submitted today.");
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
      const res = await fetch("/api/dayi", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
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
    <div className="mx-auto mt-8 w-full rounded bg-white p-4 lg:p-10 shadow-lg">
      {isSubmittedToday && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-8">
          You have already submitted today.
        </div>
      )}
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">
        সহযোগী দায়ী বিষয়
      </h2>

      <Formik
        initialValues={initialFormData}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting }) => (
          <Form className="space-y-6">
            <div>
              <label htmlFor="sohojogiDayeToiri" className="block mb-1">
                সহযোগী দাঈ তৈরি হয়েছে
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
                className="w-full rounded border border-gray-300 px-4 py-2"
              />
              <ErrorMessage
                name="sohojogiDayeToiri"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {assistantCount > 0 && (
              <div className="border-t pt-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  সহযোগী দাঈদের তথ্য
                </h3>
                {assistants.map((assistant, index) => (
                  <div key={index} className="border p-4 rounded-lg space-y-4">
                    <h4 className="font-bold text-[#155E75]">
                      সহযোগী দাঈ #{index + 1}
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
                        className="w-full rounded border border-gray-300 px-4 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">ফোন</label>
                      <input
                        type="text"
                        value={assistant.phone}
                        onChange={(e) =>
                          handleAssistantChange(index, "phone", e.target.value)
                        }
                        disabled={isSubmittedToday}
                        className="w-full rounded border border-gray-300 px-4 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">ঠিকানা</label>
                      <textarea
                        value={assistant.address}
                        onChange={(e) =>
                          handleAssistantChange(index, "address", e.target.value)
                        }
                        disabled={isSubmittedToday}
                        className="w-full rounded border border-gray-300 px-4 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">বিস্তারিত</label>
                      <textarea
                        value={assistant.description}
                        onChange={(e) =>
                          handleAssistantChange(index, "description", e.target.value)
                        }
                        disabled={isSubmittedToday}
                        className="w-full rounded border border-gray-300 px-4 py-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="mb-3 font-medium">মতামত লিখুন</h3>
              <JoditEditorComponent
                placeholder="আপনার মতামত লিখুন..."
                initialValue=""
                onContentChange={handleContentChange}
                height="300px"
                width="100%"
                disabled={isSubmittedToday}
              />
            </div>

            <div className="flex justify-end mt-6">
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

export default DayeeBishoyForm;
