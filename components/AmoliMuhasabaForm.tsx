"use client";
import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/navigation";
import {
  ayatOptions,
  initialFormData,
  duaOptions,
  validationSchema,
  zikirOptions,
  ishraqOptions,
  tasbihOptions,
  dayeeAmolOptions,
  amoliSuraOptions,
  AyamOptions,
  hijbulBaharOptions,
} from "@/app/data/AmoliMuhasabaFormData";

// Define the types for the form fields
interface AmoliMuhasabaFormValues {
  tahajjud: string;
  ayat: string;
  zikir: string;
  ishraq: string;
  jamat: string;
  sirat: string;
  Dua: string;
  ilm: string;
  tasbih: string;
  dayeeAmol: string;
  amoliSura: string;
  ayamroja: string;
  hijbulBahar: string;
}

const AmoliMuhasabaForm = () => {
  const router = useRouter();

  return (
    <div className="mx-auto mt-8 w-full rounded bg-white p-10 shadow-lg">
      <h2 className="mb-6 text-2xl">আ’মলি মুহাসাবা</h2>
      <Formik
        initialValues={initialFormData}
        validationSchema={validationSchema}
        onSubmit={async (values: AmoliMuhasabaFormValues, { setSubmitting }: FormikHelpers<AmoliMuhasabaFormValues>) => {
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

          // Send form data to the API
          const response = await fetch("/api/amoli", {
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
          setSubmitting(false);
        }}
      >
        {({ handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-10">
              <div>
                <label className="mb-2 block text-gray-700">তাহাজ্জুদ </label>
                <Field
                  name="tahajjud"
                  placeholder="কত রাকাত"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="tahajjud"
                  component="div"
                  className="text-red-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-gray-700">
                  তিলাওয়াতুল কোরআন তাদাব্বুর
                </label>
                <Field
                  as="select"
                  name="ayat"
                  placeholder="সুরার বাকারা [৫০-১৫০] "
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                >
                  <option value="">Select Sura</option>
                  {ayatOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="ayat"
                  component="div"
                  className="text-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-10">
              <div>
                <label className="mb-2 block text-gray-700">
                  সকাল-সন্ধ্যা দোয়া ও জিকির
                </label>
                <Field
                  as="select"
                  name="zikir"
                  placeholder="domain.com"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                >
                  <option value="">Select Time</option>
                  {zikirOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="zikir"
                  component="div"
                  className="text-red-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-gray-700">
                  ইশরাক-আওয়াবীন-চাশ্ত
                </label>
                <Field
                  as="select"
                  name="ishraq"
                  placeholder="Select Option"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                >
                  <option value="">Select Option</option>
                  {ishraqOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="ishraq"
                  component="div"
                  className="text-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-10">
              <div>
                <label className="mb-2 block text-gray-700">
                  জামাতে সালাত
                </label>
                <Field
                  name="jamat"
                  placeholder="কত ওয়াক্ত"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />
                <ErrorMessage
                  name="jamat"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  সিরাত ও মাগফিরাত কিতাব পাঠ
                </label>
                <Field
                  name="sirat"
                  placeholder="কিতাবের নাম লিখেন"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />

                <ErrorMessage
                  name="sirat"
                  component="div"
                  className="text-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-10">
              <div>
                <label className="mb-2 block text-gray-700">
                  দু’আ আনাস ইবনে মালেক
                </label>
                <Field
                  as="select"
                  name="Dua"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                >
                  <option value="">Select Option</option>
                  {duaOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="Dua"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  ইলমী ও আমলী কিতাব পাঠ
                </label>
                <Field
                  name="ilm"
                  placeholder="কিতাবের নাম লিখেন"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                />

                <ErrorMessage
                  name="ilm"
                  component="div"
                  className="text-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-10">
              <div>
                <label className="mb-2 block text-gray-700">
                  তিন তাসবীহ (সকাল- সন্ধ্যা)
                </label>
                <Field
                  as="select"
                  name="tasbih"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                >
                  <option value="">Select Option</option>
                  {tasbihOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="tasbih"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  দা’য়ীদের আমলী কিতাব পাঠ
                </label>
                <Field
                  as="select"
                  name="dayeeAmol"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                >
                  <option value="">Select Option</option>
                  {dayeeAmolOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="dayeeAmol"
                  component="div"
                  className="text-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-10">
              <div>
                <label className="mb-2 block text-gray-700">
                  দৈনিক আমলি সুরা পাঠ
                </label>
                <Field
                  as="select"
                  name="amoliSura"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                >
                  <option value="">Select Option</option>
                  {amoliSuraOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="amoliSura"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  আজ সোমবার আইয়্যামে বীজের রোজা রেখেছেন তো?
                </label>
                <Field
                  as="select"
                  name="ayamroja"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                >
                  <option value="">Select Option</option>
                  {AyamOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="ayamroja"
                  component="div"
                  className="text-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-10">
              <div>
                <label className="mb-2 block text-gray-700">
                  দৈনিক হিজবুল বাহার পাঠ
                </label>
                <Field
                  as="select"
                  name="hijbulBahar"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                >
                  <option value="">Select Option</option>
                  {hijbulBaharOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="hijbulBahar"
                  component="div"
                  className="text-red-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="ghost" size="default" type="submit" disabled={isSubmitting}>
                Submit
              </Button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default AmoliMuhasabaForm;
