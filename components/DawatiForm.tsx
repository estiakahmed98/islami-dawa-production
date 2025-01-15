"use client";
import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { initialFormData, validationSchema } from "@/app/data/DawatiData";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import JoditEditorComponent from "./richTextEditor";
import { toast } from "sonner";

// Define the type for form values
interface DawatiFormData {
  nonMuslimDawat: string;
  murtadDawat: string;
  alemderSatheyMojlish: string;
  publicSatheyMojlish: string;
  nonMuslimSaptahikGasht: string;
  editorContent: string;
}

const DawatiForm: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || "";
  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if the user has already submitted today
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (!email) return;

      try {
        const response = await fetch(`/api/dawati?email=${email}`);
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
  const handleSubmit = async (values: DawatiFormData) => {
    const formData = { ...values, email };

    if (isSubmittedToday) {
      toast.error("You have already submitted today. Try again tomorrow.");
      return;
    }

    try {
      const response = await fetch("/api/dawati", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setIsSubmittedToday(true);
        toast.success("Submitted successfully!");
        router.push("/dashboard");
      } else if (response.status === 400) {
        const data = await response.json();
        toast.error(data.error || "Submission failed. Try again.");
      } else {
        toast.error("Submission failed. Try again.");
      }
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error("Error during submission.");
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
      <h2 className="mb-6 text-2xl">দাওয়াতি বিষয়</h2>
      <Formik
        initialValues={{ ...initialFormData, editorContent: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => (
          <Form>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <label className="mb-2 block text-gray-700">
                  অনুসলিমকে দাওয়াত দেওয়া হয়েছে
                </label>
                <Field
                  name="nonMuslimDawat"
                  type="number"
                  disabled={isSubmittedToday}
                  placeholder="Enter value"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="nonMuslimDawat"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  মুরতাদ কে দাওয়াত দেওয়া হয়েছে
                </label>
                <Field
                  name="murtadDawat"
                  type="number"
                  disabled={isSubmittedToday}
                  placeholder="Enter Value"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="murtadDawat"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  আলেম উলামার সাথে দাওয়াতি বিষয়ে কথাবার্তা হয়েছে
                </label>
                <Field
                  name="alemderSatheyMojlish"
                  type="number"
                  disabled={isSubmittedToday}
                  placeholder="Enter Value"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="alemderSatheyMojlish"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  সাধারণ মুসলমানদের সাথে দাওয়াতি বিষয়ে কথাবার্তা হয়েছে
                </label>
                <Field
                  name="publicSatheyMojlish"
                  type="number"
                  disabled={isSubmittedToday}
                  placeholder="Enter Value"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="publicSatheyMojlish"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  অমুসলিমদের মাঝে সাপ্তাহিক গাস্ত হয়েছে
                </label>
                <Field
                  name="nonMuslimSaptahikGasht"
                  type="number"
                  disabled={isSubmittedToday}
                  placeholder="Enter Value"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="nonMuslimSaptahikGasht"
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

export default DawatiForm;

// "use client";
// import { Button } from "@/components/ui/button";
// import { ErrorMessage, Field, Form, Formik } from "formik";
// import { initialFormData, validationSchema } from "@/app/data/DawatiData";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { useState } from "react";
// import JoditEditorComponent from "./richTextEditor";

// // Define the type for form values
// interface DawatiFormData {
//   nonMuslimDawat: string;
//   murtadDawat: string;
//   alemderSatheyMojlish: string;
//   publicSatheyMojlish: string;
//   nonMuslimSaptahikGasht: string;
// }

// const DawatiForm = () => {
//   const router = useRouter();
//   const [editorContent, setEditorContent] = useState("");

//   const handleContentChange = (content: string) => {
//     setEditorContent(content);
//   };

//   const { data: session } = useSession();
//   const email = session?.user?.email || "";

//   return (
//     <div className="w-full mx-auto mt-8 rounded bg-white p-10 shadow-lg">
//       <h2 className="mb-6 text-2xl">দাওয়াতি বিষয়</h2>
//       <Formik
//         initialValues={initialFormData}
//         validationSchema={validationSchema}
//         onSubmit={async (values: DawatiFormData) => {
//           if (!email) {
//             alert("User email is not set. Please log in.");
//             return;
//           }

//           // Include email in the form data
//           const formData = { ...values, email };

//           // Send form data to the API
//           const response = await fetch("/api/dawati", {
//             method: "POST",
//             body: JSON.stringify(formData),
//             headers: {
//               "Content-Type": "application/json",
//             },
//           });

//           // Handle API response
//           if (response.ok) {
//             alert("Form submission successful!");
//             router.push("/dashboard");
//           } else {
//             alert("Form submission failed! Try again.");
//           }

//           console.log(formData);
//         }}
//       >
//         <Form>
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//             <div>
//               <label className="mb-2 block text-gray-700">
//                 অনুসলিমকে দাওয়াত দেওয়া হয়েছে
//               </label>
//               <Field
//                 name="nonMuslimDawat"
//                 placeholder="Enter value"
//                 className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//               />
//               <ErrorMessage
//                 name="nonMuslimDawat"
//                 component="div"
//                 className="text-red-500"
//               />
//             </div>

//             <div>
//               <label className="mb-2 block text-gray-700">
//                 মুরতাদ কে দাওয়াত দেওয়া হয়েছে
//               </label>
//               <Field
//                 name="murtadDawat"
//                 placeholder="Enter Value"
//                 className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//               />
//               <ErrorMessage
//                 name="murtadDawat"
//                 component="div"
//                 className="text-red-500"
//               />
//             </div>

//             <div>
//               <label className="mb-2 block text-gray-700">
//                 আলেম উলামার সাথে দাওয়াতি বিষয়ে কথাবার্তা হয়েছে
//               </label>
//               <Field
//                 name="alemderSatheyMojlish"
//                 placeholder="Enter Value"
//                 className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//               />
//               <ErrorMessage
//                 name="alemderSatheyMojlish"
//                 component="div"
//                 className="text-red-500"
//               />
//             </div>

//             <div>
//               <label className="mb-2 block text-gray-700">
//                 সাধারণ মুসলমানদের সাথে দাওয়াতি বিষয়ে কথাবার্তা হয়েছে
//               </label>
//               <Field
//                 name="publicSatheyMojlish"
//                 placeholder="Enter Value"
//                 className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//               />
//               <ErrorMessage
//                 name="publicSatheyMojlish"
//                 component="div"
//                 className="text-red-500"
//               />
//             </div>

//             <div>
//               <label className="mb-2 block text-gray-700">
//                 অমুসলিমদের মাঝে সাপ্তাহিক গাস্ত হয়েছে
//               </label>
//               <Field
//                 name="nonMuslimSaptahikGasht"
//                 placeholder="Enter Value"
//                 className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//               />
//               <ErrorMessage
//                 name="nonMuslimSaptahikGasht"
//                 component="div"
//                 className="text-red-500"
//               />
//             </div>

//             <div className="col-span-2">
//               <h1 className=" pb-3">মতামত লিখুন</h1>
//               <JoditEditorComponent
//                 placeholder="আপনার মতামত লিখুন..."
//                 initialValue={editorContent}
//                 onContentChange={handleContentChange}
//                 height="300px"
//                 width="100%"
//               />
//               {/* <h2>Output:</h2>
//                   <div dangerouslySetInnerHTML={{ __html: editorContent }} /> */}
//             </div>
//           </div>

//           <div className="flex justify-end mt-4">
//             <Button variant="ghost" size="default" type="submit">
//               Submit
//             </Button>
//           </div>
//         </Form>
//       </Formik>
//     </div>
//   );
// };

// export default DawatiForm;
