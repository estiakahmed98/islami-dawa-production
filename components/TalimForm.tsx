"use client";

import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Formik, FormikHelpers } from "formik";
import { initialFormData, validationSchema } from "@/app/data/TalimData";
import { useRouter } from "next/navigation";

// Define the types for the form values
interface TalimFormValues {
  mohilaTalim: string;
  TalimOngshoGrohon: string;
}

const TalimForm: React.FC = () => {
  const router = useRouter();

  // Function to handle form submission
  const handleSubmit = async (
    values: TalimFormValues,
    { setSubmitting }: FormikHelpers<TalimFormValues>
  ) => {
    alert("Submitting form...");
    
    // Retrieve email from localStorage
    const email = localStorage.getItem("userEmail");

    // Check if email is available
    if (!email) {
      alert("User email is not set. Please log in.");
      setSubmitting(false);
      return;
    }

    // Include email in the form data
    const formData = { ...values, email };

    try {
      // Send form data to the API
      const response = await fetch("/api/talim", {
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
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-8 w-full rounded bg-white p-10 shadow-lg">
      <h2 className="mb-6 text-2xl">মহিলাদের তালিম বিষয়</h2>

      <Formik
        initialValues={initialFormData as TalimFormValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <form>
            <div className="grid grid-cols-2 gap-10">
              {/* Field: মহিলাদের মাঝে দ্বীনের তালিম */}
              <div>
                <label
                  htmlFor="mohilaTalim"
                  className="mb-2 block text-gray-700"
                >
                  মহিলাদের মাঝে দ্বীনের তালিম
                </label>
                <Field
                  id="mohilaTalim"
                  name="mohilaTalim"
                  placeholder="Enter value"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="mohilaTalim"
                  component="div"
                  className="text-red-500"
                />
              </div>

              {/* Field: মহিলাদের তালিমে মোট অংশগ্রহণ করেছে */}
              <div>
                <label
                  htmlFor="TalimOngshoGrohon"
                  className="mb-2 block text-gray-700"
                >
                  মহিলাদের তালিমে মোট অংশগ্রহণ করেছে
                </label>
                <Field
                  id="TalimOngshoGrohon"
                  name="TalimOngshoGrohon"
                  placeholder="Enter value"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="TalimOngshoGrohon"
                  component="div"
                  className="text-red-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
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

export default TalimForm;
