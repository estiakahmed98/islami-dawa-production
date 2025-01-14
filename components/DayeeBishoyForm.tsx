// "use client";
// import { Button } from "@/components/ui/button";
// import { ErrorMessage, Field, Formik, FormikHelpers } from "formik";
// import { initialFormData, validationSchema } from "@/app/data/DayeeBishoyData";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";

// // Define the shape of the form values
// // interface DayeeBishoyFormValues {
// //   sohojogiDayeToiri: string;
// // }

// const DayeeBishoyForm = () => {
//   const router = useRouter();

//    const { data: session } = useSession();
//     const email = session?.user?.email || "";

//   return (
//     <div className="mx-auto mt-8 w-full rounded bg-white p-10 shadow-lg">
//       <h2 className="mb-6 text-2xl">দায়ী বিষয়</h2>
//       <Formik<DayeeBishoyFormValues>
//         initialValues={initialFormData}
//         validationSchema={validationSchema}
//         onSubmit={async (
//           values: DayeeBishoyFormValues,
//           { setSubmitting }: FormikHelpers<DayeeBishoyFormValues>
//         ) => {
//           try {

//             // Check if email is available
//             if (!email) {
//               alert("User email is not set. Please log in.");
//               setSubmitting(false);
//               return;
//             }

//             // Include email in the form data
//             const formData = { ...values, email };

//             // Send form data to the API
//             const response = await fetch("/api/dayi", {
//               method: "POST",
//               body: JSON.stringify(formData),
//               headers: {
//                 "Content-Type": "application/json",
//               },
//             });

//             // Handle API response
//             if (response.ok) {
//               alert("Form submission successful!");
//               router.push("/dashboard");
//             } else {
//               alert("Form submission failed! Try again.");
//             }
//           } catch (error) {
//             console.error("Submission error:", error);
//             alert("An error occurred. Please try again.");
//           } finally {
//             setSubmitting(false);
//           }
//         }}
//       >
//         {({ handleSubmit, isSubmitting }) => (
//           <form onSubmit={handleSubmit}>
//             <div className="grid grid-cols-2 gap-10">
//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   সহযোগি দাঈ তৈরি হয়েছে
//                 </label>
//                 <Field
//                   name="sohojogiDayeToiri"
//                   placeholder="Enter value"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 />
//                 <ErrorMessage
//                   name="sohojogiDayeToiri"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>

//               <div>
//                 <label className="mb-2 block text-gray-700">নোট লিখুন</label>
//                 <Field
//                   as="textarea"
//                   name="motamotdin"
//                   placeholder="লিখুন
//                   "
//                   rows={1}
//                   onInput={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
//                     const target = e.target;
//                     target.style.height = "auto";
//                     target.style.height = `${target.scrollHeight}px`;
//                   }}
//                   style={{ resize: "both" }}
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                 />
//                 <ErrorMessage
//                   name="motamotdin"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>
//             </div>
//             <div className="flex justify-end">
//               <Button
//                 variant="ghost"
//                 size="default"
//                 type="submit"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? "Submitting..." : "Submit"}
//               </Button>
//             </div>
//           </form>
//         )}
//       </Formik>
//     </div>
//   );
// };

// export default DayeeBishoyForm;

"use client";

import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Formik, FormikHelpers } from "formik";
import { initialFormData, validationSchema } from "@/app/data/DayeeBishoyData";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const DayeeBishoyForm = () => {
  const router = useRouter();

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div>
                <label
                  htmlFor="motamotdin"
                  className="mb-2 block text-gray-700 font-medium"
                >
                  নোট লিখুন
                </label>
                <Field
                  id="motamotdin"
                  as="textarea"
                  name="motamotdin"
                  placeholder="লিখুন"
                  rows={2}
                  onInput={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const target = e.target;
                    target.style.height = "auto";
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                  style={{ resize: "both" }}
                  className="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <ErrorMessage
                  name="motamotdin"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
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
