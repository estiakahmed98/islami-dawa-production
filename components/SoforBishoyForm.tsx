"use client";
import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { initialFormData, validationSchema } from "@/app/data/SoforBishoyData";
import { useRouter } from "next/navigation";

// Define the type for form values
interface FormValues {
  madrasaVisit: string;
  moktobVisit: string;
  schoolCollegeVisit: string;
}

const SoforBishoyForm = () => {
  let router = useRouter();

  return (
    <div className="mx-auto mt-8 w-full rounded bg-white p-10 shadow-lg">
      <h2 className="mb-6 text-2xl">সফর বিষয়</h2>
      <Formik<FormValues>
        initialValues={initialFormData}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
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
          const response = await fetch("/api/soforbisoy", {
            method: "POST",
            body: JSON.stringify(formData),
            headers: {
              "Content-Type": "application/json",
            },
          });

          console.log("response", response);

          // Handle API response
          if (response.ok) {
            router.push("/dashboard");
            alert("Form submission successful!");
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
                মাদ্রাসা সফর হয়েছে
              </label>
              <Field
                name="madrasaVisit"
                placeholder="Enter value"
                className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
              />
              <ErrorMessage
                name="madrasaVisit"
                component="div"
                className="text-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-gray-700">
                চলমান মক্তব পরিদর্শন হয়েছে
              </label>
              <Field
                name="moktobVisit"
                placeholder="Enter Value"
                className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
              />
              <ErrorMessage
                name="moktobVisit"
                component="div"
                className="text-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-gray-700">
                স্কুল/কলেজ/ভার্সিটি দাওয়াতী সফর হয়েছে
              </label>
              <Field
                name="schoolCollegeVisit"
                placeholder="Enter Value"
                className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
              />
              <ErrorMessage
                name="schoolCollegeVisit"
                component="div"
                className="text-red-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="ghost" size="default" type="submit">
              Submit
            </Button>
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default SoforBishoyForm;
