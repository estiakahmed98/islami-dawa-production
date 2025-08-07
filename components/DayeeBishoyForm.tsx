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
  email?: string;
  description?: string;
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
}

interface UserInfo {
  division: string;
  district: string;
  upazila: string;
  union: string;
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

  // Check if user has already submitted today
  useEffect(() => {
    const checkSubmission = async () => {
      if (!email) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/dayi?email=${email}`);
        if (!res.ok) throw new Error("Failed to fetch records");
        
        const data = await res.json();
        const today = new Date().toDateString();
        const hasTodaySubmission = data.records?.some((record: any) => 
          new Date(record.date).toDateString() === today
        );
        
        setIsSubmittedToday(!!hasTodaySubmission);
      } catch (err) {
        console.error("Submission check error:", err);
        toast.error("Error checking today's submission.");
      } finally {
        setLoading(false);
      }
    };
    
    checkSubmission();
  }, [email]);

  const handleAssistantCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = Math.max(0, parseInt(e.target.value) || 0);
    setAssistantCount(count);
    
    // Initialize new assistants array with location fields
    const newAssistants = Array(count).fill(null).map((_, index) => 
      assistants[index] || { 
        name: "", 
        phone: "", 
        address: "", 
        description: "",
        division: "",
        district: "",
        upazila: "",
        union: ""
      }
    );
    
    setAssistants(newAssistants);
  };

  const handleAssistantChange = (
    index: number,
    field: keyof AssistantDaee,
    value: string
  ) => {
    setAssistants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (values: typeof initialFormData) => {
    if (isSubmittedToday) {
      toast.error("You have already submitted today.");
      return;
    }
  
    // Validate assistants
    if (assistantCount > 0) {
      const invalid = assistants.some(
        (a) =>
          !a.name?.trim() ||
          !a.phone?.trim() ||
          !a.address?.trim() ||
          !a.division?.trim() ||
          !a.district?.trim() ||
          !a.upazila?.trim() ||
          !a.union?.trim()
      );
  
      if (invalid) {
        toast.error("Please fill all required fields for assistants.");
        return;
      }
    }
  
    const formData = {
      email,
      sohojogiDayeToiri: Number(values.sohojogiDayeToiri) || 0,
      editorContent,
      assistants,
    };
  
    try {
      const res = await fetch("/api/dayi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      const data = await res.json().catch(() => ({}));
  
      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }
  
      toast.success("Submitted successfully!");
      setIsSubmittedToday(true);
      router.push("/dashboard");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error instanceof Error ? error.message : "Unexpected error occurred");
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
        {({ setFieldValue, isSubmitting, values }) => (
          <Form className="space-y-6">
            <div>
              <label htmlFor="sohojogiDayeToiri" className="block mb-1">
                সহযোগী দাঈ তৈরি হয়েছে
              </label>
              <Field
                id="sohojogiDayeToiri"
                name="sohojogiDayeToiri"
                type="number"
                min="0"
                placeholder="Enter number of assistants"
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
                      <label className="block text-gray-700 mb-1">নাম *</label>
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
                      <label className="block text-gray-700 mb-1">ফোন *</label>
                      <input
                        type="tel"
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
                      <label className="block text-gray-700 mb-1">ঠিকানা *</label>
                      <textarea
                        value={assistant.address}
                        onChange={(e) =>
                          handleAssistantChange(index, "address", e.target.value)
                        }
                        disabled={isSubmittedToday}
                        className="w-full rounded border border-gray-300 px-4 py-2"
                        required
                        rows={3}
                      />
                    </div>

                    {/* Added Location Fields */}
                    <div>
                      <label className="block text-gray-700 mb-1">বিভাগ *</label>
                      <input
                        type="text"
                        value={assistant.division}
                        onChange={(e) =>
                          handleAssistantChange(index, "division", e.target.value)
                        }
                        disabled={isSubmittedToday}
                        className="w-full rounded border border-gray-300 px-4 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-1">জেলা *</label>
                      <input
                        type="text"
                        value={assistant.district}
                        onChange={(e) =>
                          handleAssistantChange(index, "district", e.target.value)
                        }
                        disabled={isSubmittedToday}
                        className="w-full rounded border border-gray-300 px-4 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-1">উপজেলা *</label>
                      <input
                        type="text"
                        value={assistant.upazila}
                        onChange={(e) =>
                          handleAssistantChange(index, "upazila", e.target.value)
                        }
                        disabled={isSubmittedToday}
                        className="w-full rounded border border-gray-300 px-4 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-1">ইউনিয়ন *</label>
                      <input
                        type="text"
                        value={assistant.union}
                        onChange={(e) =>
                          handleAssistantChange(index, "union", e.target.value)
                        }
                        disabled={isSubmittedToday}
                        className="w-full rounded border border-gray-300 px-4 py-2"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-1">ইমেইল</label>
                      <input
                        type="email"
                        value={assistant.email || ""}
                        onChange={(e) =>
                          handleAssistantChange(index, "email", e.target.value)
                        }
                        disabled={isSubmittedToday}
                        className="w-full rounded border border-gray-300 px-4 py-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-1">বিস্তারিত</label>
                      <textarea
                        value={assistant.description || ""}
                        onChange={(e) =>
                          handleAssistantChange(index, "description", e.target.value)
                        }
                        disabled={isSubmittedToday}
                        className="w-full rounded border border-gray-300 px-4 py-2"
                        rows={3}
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
                initialValue={editorContent}
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
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : "Submit"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DayeeBishoyForm;