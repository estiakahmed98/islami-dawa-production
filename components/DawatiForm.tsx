"use client";
import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { initialFormData, validationSchema } from "@/app/data/DawatiData";
import { useRouter } from "next/navigation";

// Define the type for form values
interface DawatiFormData {
  nonMuslimDawat: string;
  murtadDawat: string;
  alemderSatheyMojlish: string;
  publicSatheyMojlish: string;
  nonMuslimSaptahikGasht: string;
}

const DawatiForm = () => {
  const router = useRouter();

  return (
    <div className="w-full mx-auto mt-8 rounded bg-white p-10 shadow-lg">
      <h2 className="mb-6 text-2xl">দাওয়াতি বিষয়</h2>
      <Formik
        initialValues={initialFormData}
        validationSchema={validationSchema}
        onSubmit={async (values: DawatiFormData) => {
          // Retrieve email from localStorage
          const email = localStorage.getItem("userEmail");

          // Check if email is available
          if (!email) {
            alert("User email is not set. Please log in.");
            return;
          }

          // Include email in the form data
          const formData = { ...values, email };

          // Send form data to the API
          const response = await fetch("/api/dawati", {
            method: "POST",
            body: JSON.stringify(formData),
            headers: {
              "Content-Type": "application/json",
            },
          });

          // Handle API response
          if (response.ok) {
            alert("Form submission successful!");
            router.push("/dashboard");
          } else {
            alert("Form submission failed! Try again.");
          }

          console.log(formData);
        }}
      >
        <Form>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="mb-2 block text-gray-700">
                অনুসলিমকে দাওয়াত দেওয়া হয়েছে
              </label>
              <Field
                name="nonMuslimDawat"
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
                placeholder="Enter Value"
                className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
              />
              <ErrorMessage
                name="nonMuslimSaptahikGasht"
                component="div"
                className="text-red-500"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="ghost" size="default" type="submit">
              Submit
            </Button>
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default DawatiForm;
