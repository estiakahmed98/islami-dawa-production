"use client";

import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Formik, Form } from "formik";
import { initialFormData, validationSchema } from "@/app/data/MoktobBishoyData";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import JoditEditorComponent from "./richTextEditor";
import { toast } from "sonner";

const MoktobBishoyForm = () => {
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
        const response = await fetch(`/api/moktob?email=${email}`);
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
      const response = await fetch("/api/moktob", {
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
  if (loading) return <p>Loading...</p>;

  return (
    <div className="w-full mx-auto mt-8 rounded bg-white p-10 shadow-lg">
      {isSubmittedToday && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-8">
          You already have submitted today.
        </div>
      )}
      <h2 className="mb-6 text-2xl">মক্তব বিষয়</h2>
      <Formik
        initialValues={{ ...initialFormData, editorContent: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting }) => (
          <Form>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <label className="mb-2 block text-gray-700">
                  এক মাসে নতুন মক্তব চালু হয়েছে
                </label>
                <Field
                  name="MoktobChalu"
                  placeholder="Enter value"
                  type="number"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="MoktobChalu"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  মক্তব থেকে ছাত্রছাত্রী মাদ্রাসায় ভর্তি হয়েছে
                </label>
                <Field
                  name="MoktobAdmit"
                  placeholder="Enter Value"
                  type="number"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="MoktobAdmit"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  নতুন পুরাতন মোট মক্তব চালু আছে
                </label>
                <Field
                  name="NewMoktob"
                  placeholder="Enter Value"
                  type="number"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="NewMoktob"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  এই মাসে বয়স্ক কোরআন শিক্ষা চালু হয়েছে
                </label>
                <Field
                  name="Sikkha"
                  placeholder="Enter Value"
                  type="number"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="Sikkha"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  মক্তবের মোট ছাত্র-ছাত্রীর সংখ্যা
                </label>
                <Field
                  name="TotalStudent"
                  placeholder="Enter Value"
                  type="number"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="TotalStudent"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  নতুন পুরাতন মোট বয়স্ক কোরআন চালু আছে
                </label>
                <Field
                  name="TotalSikkha"
                  placeholder="Enter Value"
                  type="number"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="TotalSikkha"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  মক্তবের অভিভাবক সম্মেলন হয়েছে
                </label>
                <Field
                  name="GurdianMeeting"
                  placeholder="Enter Value"
                  type="number"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="GurdianMeeting"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  বয়স্ক কোরআন শিক্ষা মোট অংশগ্রহণ করেছে
                </label>
                <Field
                  name="TotalAgeSikkha"
                  placeholder="Enter Value"
                  type="number"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="TotalAgeSikkha"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  মক্তব থেকে ছাত্রছাত্রী মাদ্রাসায় ভর্তি হয়েছে
                </label>
                <Field
                  name="MadrasahAdmit"
                  placeholder="Enter Value"
                  type="number"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="MadrasahAdmit"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  নব মুসলিমদের দ্বীন শিক্ষার ফিকির করা হয়েছে
                </label>
                <Field
                  name="NewMuslim"
                  placeholder="Enter Value"
                  type="number"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="NewMuslim"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div className="col-span-2">
                <h1 className=" pb-3">মতামত লিখুন</h1>
                <JoditEditorComponent
                  placeholder="আপনার মতামত লিখুন..."
                  initialValue=""
                  onContentChange={(content) =>
                    setFieldValue("editorContent", content)
                  }
                  height="300px"
                  width="100%"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
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

export default MoktobBishoyForm;

// "use client";

// import { Button } from "@/components/ui/button";
// import { ErrorMessage, Field, Form, Formik } from "formik";
// import { initialFormData, validationSchema } from "@/app/data/MoktobBishoyData";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { useState } from "react";
// import JoditEditorComponent from "./richTextEditor";

// const MoktobBishoyForm = () => {
//   const router = useRouter();
//   const [editorContent, setEditorContent] = useState("");

//   const handleContentChange = (content: string) => {
//     setEditorContent(content);
//   };

//   // User Logged in email collection
//   const { data: session } = useSession();
//   const email = session?.user?.email || "";

//   return (
//     <div className="w-full mx-auto mt-8 rounded bg-white p-10 shadow-lg">
//       <h2 className="mb-6 text-2xl">মক্তব বিষয়</h2>
//       <Formik
//         initialValues={initialFormData}
//         validationSchema={validationSchema}
//         onSubmit={async (values, { setSubmitting }) => {
//           try {
//             if (!email) {
//               alert("User email is not set. Please log in.");
//               setSubmitting(false);
//               return;
//             }

//             // Include email in the form data
//             const formData = { ...values, email };

//             // Send form data to the API
//             const response = await fetch("/api/moktob", {
//               method: "POST",
//               body: JSON.stringify(formData),
//               headers: {
//                 "Content-Type": "application/json",
//               },
//             });

//             if (response.ok) {
//               alert("Form submission successful!");
//               router.push("/dashboard");
//             } else {
//               alert("Form submission failed! Try again.");
//             }
//           } catch (error) {
//             console.error("Error during form submission:", error);
//             alert("An error occurred. Please try again.");
//           } finally {
//             setSubmitting(false);
//           }
//         }}
//       >
//         {({ handleSubmit, isSubmitting }) => (
//           <Form onSubmit={handleSubmit}>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   এক মাসে নতুন মক্তব চালু হয়েছে
//                 </label>
//                 <Field
//                   name="MoktobChalu"
//                   placeholder="Enter value"
//                   type="number"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 />
//                 <ErrorMessage
//                   name="MoktobChalu"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>

//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   মক্তব থেকে ছাত্রছাত্রী মাদ্রাসায় ভর্তি হয়েছে
//                 </label>
//                 <Field
//                   name="MoktobAdmit"
//                   placeholder="Enter Value"
//                   type="number"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 />
//                 <ErrorMessage
//                   name="MoktobAdmit"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>

//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   নতুন পুরাতন মোট মক্তব চালু আছে
//                 </label>
//                 <Field
//                   name="NewMoktob"
//                   placeholder="Enter Value"
//                   type="number"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 />
//                 <ErrorMessage
//                   name="NewMoktob"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>

//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   এই মাসে বয়স্ক কোরআন শিক্ষা চালু হয়েছে
//                 </label>
//                 <Field
//                   name="Sikkha"
//                   placeholder="Enter Value"
//                   type="number"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 />
//                 <ErrorMessage
//                   name="Sikkha"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>

//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   মক্তবের মোট ছাত্র-ছাত্রীর সংখ্যা
//                 </label>
//                 <Field
//                   name="TotalStudent"
//                   placeholder="Enter Value"
//                   type="number"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 />
//                 <ErrorMessage
//                   name="TotalStudent"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>

//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   নতুন পুরাতন মোট বয়স্ক কোরআন চালু আছে
//                 </label>
//                 <Field
//                   name="TotalSikkha"
//                   placeholder="Enter Value"
//                   type="number"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 />
//                 <ErrorMessage
//                   name="TotalSikkha"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>
//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   মক্তবের অভিভাবক সম্মেলন হয়েছে
//                 </label>
//                 <Field
//                   name="GurdianMeeting"
//                   placeholder="Enter Value"
//                   type="number"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 />
//                 <ErrorMessage
//                   name="GurdianMeeting"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>

//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   বয়স্ক কোরআন শিক্ষা মোট অংশগ্রহণ করেছে
//                 </label>
//                 <Field
//                   name="TotalAgeSikkha"
//                   placeholder="Enter Value"
//                   type="number"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 />
//                 <ErrorMessage
//                   name="TotalAgeSikkha"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>

//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   মক্তব থেকে ছাত্রছাত্রী মাদ্রাসায় ভর্তি হয়েছে
//                 </label>
//                 <Field
//                   name="MadrasahAdmit"
//                   placeholder="Enter Value"
//                   type="number"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 />
//                 <ErrorMessage
//                   name="MadrasahAdmit"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>

//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   নব মুসলিমদের দ্বীন শিক্ষার ফিকির করা হয়েছে
//                 </label>
//                 <Field
//                   name="NewMuslim"
//                   placeholder="Enter Value"
//                   type="number"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 />
//                 <ErrorMessage
//                   name="NewMuslim"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>

//               <div className="col-span-2">
//                 <h1 className=" pb-3">মতামত লিখুন</h1>
//                 <JoditEditorComponent
//                   placeholder="আপনার মতামত লিখুন..."
//                   initialValue={editorContent}
//                   onContentChange={handleContentChange}
//                   height="300px"
//                   width="100%"
//                 />
//                 {/* <h2>Output:</h2>
//                   <div dangerouslySetInnerHTML={{ __html: editorContent }} /> */}
//               </div>
//             </div>

//             <div className="flex justify-end mt-4">
//               <Button
//                 variant="ghost"
//                 size="default"
//                 type="submit"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? "Submitting..." : "Submit"}
//               </Button>
//             </div>
//           </Form>
//         )}
//       </Formik>
//     </div>
//   );
// };

// export default MoktobBishoyForm;
