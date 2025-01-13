// "use client";
// import { Button } from "@/components/ui/button";
// import { ErrorMessage, Field, Formik, FormikHelpers } from "formik";
// import { useRouter } from "next/navigation";
// import {
//   ayatOptions,
//   initialFormData,
//   duaOptions,
//   validationSchema,
//   zikirOptions,
//   ishraqOptions,
//   tasbihOptions,
//   dayeeAmolOptions,
//   amoliSuraOptions,
//   AyamOptions,
//   hijbulBaharOptions,
// } from "@/app/data/AmoliMuhasabaFormData";
// import * as Yup from "yup";
// import { useEffect, useState } from "react";
// import moment from "moment";
// import "moment-hijri";

// // Define the types for the form fields
// interface AmoliMuhasabaFormValues {
//   tahajjud: string;
//   ayat: string;
//   zikir: string;
//   ishraq: string;
//   jamat: string;
//   sirat: string;
//   Dua: string;
//   ilm: string;
//   tasbih: string;
//   dayeeAmol: string;
//   amoliSura: string;
//   ayamroja: string;
//   hijbulBahar: string;
// }

// declare module "moment" {
//   interface Moment {
//     iDate(): number;
//     iMonth(): number;
//     iYear(): number;
//   }
// }

// const AmoliMuhasabaForm = () => {
//   const router = useRouter();
//   const [showAyamRoja, setShowAyamRoja] = useState(false);
//   const [hijriDate, setHijriDate] = useState<number>(0);

//   const validationSchema = Yup.object({
//     jamat: Yup.number()
//       .min(0, "Value should not be less than 0")
//       .max(5, "Value should not exceed 5")
//       .required("This field is required"),
//   });

//   useEffect(() => {
//     const hijriDate = moment().date();
//     setShowAyamRoja(hijriDate === 13 || hijriDate === 14 || hijriDate === 15);
//     setHijriDate(hijriDate);
//   }, []);

//   return (
//     <div className="mx-auto mt-8 rounded bg-white p-10 shadow-lg">
//       <h2 className="mb-6 text-2xl">আ’মলি মুহাসাবা</h2>
//       <Formik
//         initialValues={initialFormData}
//         validationSchema={validationSchema}
//         onSubmit={async (
//           values: AmoliMuhasabaFormValues,
//           { setSubmitting }: FormikHelpers<AmoliMuhasabaFormValues>
//         ) => {
//           // Retrieve email from localStorage
//           const email = localStorage.getItem("userEmail");

//           // Check if email is available
//           if (!email) {
//             alert("User email is not set. Please log in.");
//             setSubmitting(false);
//             return;
//           }

//           // Include email in the form data
//           const formData = { ...values, email };

//           // Send form data to the API
//           const response = await fetch("/api/amoli", {
//             method: "POST",
//             body: JSON.stringify(formData),
//             headers: {
//               "Content-Type": "application/json",
//             },
//           });

//           console.log("response", response);

//           // Handle API response
//           if (response.ok) {
//             router.push("/dashboard");
//             alert("Form submission successful!");
//           } else {
//             alert("Form submission failed! Try again.");
//           }

//           console.log(formData);
//           setSubmitting(false);
//         }}
//       >
//         {({ handleSubmit, isSubmitting }) => (
//           <form onSubmit={handleSubmit}>
//             <div className="grid sm:sm:grid-cols-2 gap-10">
//               <div>
//                 <label className="mb-2 block text-gray-700">তাহাজ্জুদ </label>
//                 <Field
//                   name="tahajjud"
//                   placeholder="কত রাকাত"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 />
//                 <ErrorMessage
//                   name="tahajjud"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>
//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   তিলাওয়াতুল কোরআন তাদাব্বুর
//                 </label>
//                 <Field
//                   as="select"
//                   name="ayat"
//                   placeholder="সুরার বাকারা [৫০-১৫০] "
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 >
//                   <option value="">Select Sura</option>
//                   {ayatOptions.map((option) => (
//                     <option key={option.value} value={option.value}>
//                       {option.label}
//                     </option>
//                   ))}
//                 </Field>
//                 <ErrorMessage
//                   name="ayat"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>
//             </div>

//             <div className="grid sm:sm:grid-cols-2 gap-10">
//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   সকাল-সন্ধ্যা দোয়া ও জিকির
//                 </label>
//                 <Field
//                   as="select"
//                   name="zikir"
//                   placeholder="domain.com"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 >
//                   <option value="">Select Time</option>
//                   {zikirOptions.map((option) => (
//                     <option key={option.value} value={option.value}>
//                       {option.label}
//                     </option>
//                   ))}
//                 </Field>
//                 <ErrorMessage
//                   name="zikir"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>
//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   ইশরাক-আওয়াবীন-চাশ্ত
//                 </label>
//                 <Field
//                   as="select"
//                   name="ishraq"
//                   placeholder="Select Option"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 >
//                   <option value="">Select Option</option>
//                   {ishraqOptions.map((option) => (
//                     <option key={option.value} value={option.value}>
//                       {option.label}
//                     </option>
//                   ))}
//                 </Field>
//                 <ErrorMessage
//                   name="ishraq"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>
//             </div>

//             <div className="grid sm:sm:grid-cols-2 gap-10">
//               <div>
//                 <label className="mb-2 block text-gray-700">জামাতে সালাত</label>
//                 <Field
//                   name="jamat"
//                   type="number"
//                   placeholder="কত ওয়াক্ত"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-1"
//                 />
//                 <ErrorMessage
//                   name="jamat"
//                   component="div"
//                   className="text-red-500 mb-1"
//                 />
//               </div>

//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   সিরাত ও মাগফিরাত কিতাব পাঠ
//                 </label>
//                 <Field
//                   name="sirat"
//                   placeholder="কিতাবের নাম লিখেন"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 />

//                 <ErrorMessage
//                   name="sirat"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>
//             </div>

//             <div className="grid sm:sm:grid-cols-2 gap-10">
//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   দু’আ আনাস ইবনে মালেক
//                 </label>
//                 <Field
//                   as="select"
//                   name="Dua"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 >
//                   <option value="">Select Option</option>
//                   {duaOptions.map((option) => (
//                     <option key={option.value} value={option.value}>
//                       {option.label}
//                     </option>
//                   ))}
//                 </Field>
//                 <ErrorMessage
//                   name="Dua"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>

//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   ইলমী ও আমলী কিতাব পাঠ
//                 </label>
//                 <Field
//                   name="ilm"
//                   placeholder="কিতাবের নাম লিখেন"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 />

//                 <ErrorMessage
//                   name="ilm"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>
//             </div>

//             <div className="grid sm:sm:grid-cols-2 gap-10">
//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   তিন তাসবীহ (সকাল- সন্ধ্যা)
//                 </label>
//                 <Field
//                   as="select"
//                   name="tasbih"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 >
//                   <option value="">Select Option</option>
//                   {tasbihOptions.map((option) => (
//                     <option key={option.value} value={option.value}>
//                       {option.label}
//                     </option>
//                   ))}
//                 </Field>
//                 <ErrorMessage
//                   name="tasbih"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>

//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   দা’য়ীদের আমলী কিতাব পাঠ
//                 </label>
//                 <Field
//                   as="select"
//                   name="dayeeAmol"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 >
//                   <option value="">Select Option</option>
//                   {dayeeAmolOptions.map((option) => (
//                     <option key={option.value} value={option.value}>
//                       {option.label}
//                     </option>
//                   ))}
//                 </Field>
//                 <ErrorMessage
//                   name="dayeeAmol"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>
//             </div>

//             <div className="grid sm:sm:grid-cols-2 gap-10">
//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   দৈনিক আমলি সুরা পাঠ
//                 </label>
//                 <Field
//                   as="select"
//                   name="amoliSura"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 >
//                   <option value="">Select Option</option>
//                   {amoliSuraOptions.map((option) => (
//                     <option key={option.value} value={option.value}>
//                       {option.label}
//                     </option>
//                   ))}
//                 </Field>
//                 <ErrorMessage
//                   name="amoliSura"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>

//               <div>
//                 <label className="mb-2 block text-gray-700">
//                   দৈনিক হিজবুল বাহার পাঠ
//                 </label>
//                 <Field
//                   as="select"
//                   name="hijbulBahar"
//                   className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                 >
//                   <option value="">Select Option</option>
//                   {hijbulBaharOptions.map((option) => (
//                     <option key={option.value} value={option.value}>
//                       {option.label}
//                     </option>
//                   ))}
//                 </Field>
//                 <ErrorMessage
//                   name="hijbulBahar"
//                   component="div"
//                   className="text-red-500"
//                 />
//               </div>
//             </div>

//             <div className="grid sm:grid-cols-2 gap-10">
//               {/* Conditionally Render Ayam Roja Section */}
//               {showAyamRoja && (
//                 <div>
//                   <label className="mb-2 block text-gray-700">
//                     আজ {hijriDate} তারিখ আইয়্যামে বীজের রোজা রেখেছেন তো?
//                   </label>
//                   <Field
//                     as="select"
//                     name="ayamroja"
//                     className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
//                   >
//                     <option value="">Select Option</option>
//                     {AyamOptions.map((option) => (
//                       <option key={option.value} value={option.value}>
//                         {option.label}
//                       </option>
//                     ))}
//                   </Field>
//                   <ErrorMessage
//                     name="ayamroja"
//                     component="div"
//                     className="text-red-500"
//                   />
//                 </div>
//               )}
//             </div>

//             <div className="flex justify-end">
//               <Button
//                 variant="ghost"
//                 size="default"
//                 type="submit"
//                 disabled={isSubmitting}
//               >
//                 Submit
//               </Button>
//             </div>
//           </form>
//         )}
//       </Formik>
//     </div>
//   );
// };

// export default AmoliMuhasabaForm;



"use client";
import { useState } from "react";
import { Formik, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import {
  ayatOptions,
  duaOptions,
  zikirOptions,
  ishraqOptions,
  tasbihOptions,
  dayeeAmolOptions,
  amoliSuraOptions,
  AyamOptions,
  hijbulBaharOptions,
} from "@/app/data/AmoliMuhasabaFormData";
import moment from "moment";
import "moment-hijri";
import { useRouter } from "next/navigation";


interface AmoliMuhasabaFormValues {
  tahajjud: number;
  ayat: string;
  zikir: string;
  ishraq: string;
  jamat: number;
  sirat: string;
  Dua: string;
  ilm: string;
  tasbih: string;
  dayeeAmol: string;
  amoliSura: string;
  ayamroja: string;
  hijbulBahar: string;
}

const initialFormData: AmoliMuhasabaFormValues = {
  tahajjud: 0,
  ayat: "",
  zikir: "",
  ishraq: "",
  jamat: 0,
  sirat: "",
  Dua: "",
  ilm: "",
  tasbih: "",
  dayeeAmol: "",
  amoliSura: "",
  ayamroja: "",
  hijbulBahar: "",
};

const validationSchema = Yup.object({
  tahajjud: Yup.number()
    .min(0, "Value should not be less than 0")
    .required("This field is required"),
  jamat: Yup.number()
    .min(0, "Value should not be less than 0")
    .max(5, "Value should not exceed 5")
    .required("This field is required"),
  ayat: Yup.string().required("This field is required"),
  zikir: Yup.string().required("This field is required"),
  ishraq: Yup.string().required("This field is required"),
  sirat: Yup.string().required("This field is required"),
  Dua: Yup.string().required("This field is required"),
  ilm: Yup.string().required("This field is required"),
  tasbih: Yup.string().required("This field is required"),
  dayeeAmol: Yup.string().required("This field is required"),
  amoliSura: Yup.string().required("This field is required"),
  ayamroja: Yup.string().required("This field is required"),
  hijbulBahar: Yup.string().required("This field is required"),
});

const AmoliMuhasabaForm = () => {
  const router = useRouter();

  const [points, setPoints] = useState({
    tahajjud: 0,
    ayat: 0,
    zikir: 0,
    ishraq: 0,
    jamat: 0,
    sirat: 0,
    Dua: 0,
    ilm: 0,
    tasbih: 0,
    dayeeAmol: 0,
    amoliSura: 0,
    ayamroja: 0,
    hijbulBahar: 0,
  });

  const hijriDate = moment().format("iD iMMMM iYYYY");

  const calculatePoints = (value: any, field: string): number => {
    if (field === "zikir") {
      if (value === "সকাল-সন্ধ্যা") return 5;
      if (value === "সকাল" || value === "সন্ধ্যা") return 3;
      return 0;
    } else if (
      field === "ayat" ||
      field === "ishraq" ||
      field === "ilm" ||
      field === "sirat"
    ) {
      return value ? 5 : 0;
    } else if (field === "jamat") {
      if (value >= 1 && value <= 5) return value;
      return 0;
    } else if (field === "tahajjud") {
      if (value >= 20) return 5;
      if (value >= 10) return 3;
      if (value >= 1) return 2;
      return 0;
    } else if (
      [
        "Dua",
        "tasbih",
        "amoliSura",
        "hijbulBahar",
        "dayeeAmol",
        "ayamroja",
      ].includes(field)
    ) {
      return value === "হ্যাঁ" ? 5 : 0;
    }
    return value.trim() ? 5 : 0;
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    fieldName: keyof AmoliMuhasabaFormValues,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const value =
      event.target.type === "number"
        ? parseInt(event.target.value, 10) || 0
        : event.target.value;

    setFieldValue(fieldName, value);

    const updatedPoints = {
      ...points,
      [fieldName]: calculatePoints(value, fieldName),
    };
    setPoints(updatedPoints);
  };

  const totalPoints = Object.values(points).reduce((a, b) => a + b, 0);
  const maxPoints = 65; // 13 fields * 5 max points each
  const percentage = ((totalPoints / maxPoints) * 100).toFixed(2);
  
  const handleSubmit = async (
    values: AmoliMuhasabaFormValues,
    { setSubmitting }: FormikHelpers<AmoliMuhasabaFormValues>
  ) => {
    const email = localStorage.getItem("userEmail");

    if (!email) {
      alert("User email is not set. Please log in.");
      setSubmitting(false);
      return;
    }

    const formData = { ...values, email, percentage};

    try {
      const response = await fetch("/api/amoli", {
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
        alert("Form submission failed! Try again.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("An error occurred while submitting the form. Please try again.");
    }

    setSubmitting(false);
  };

 

  return (
    <div className="mx-auto mt-8 rounded bg-white p-10 shadow-lg">
      <h2 className="mb-6 text-2xl">আ’মলি মুহাসাবা</h2>
      <Formik
        initialValues={initialFormData}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, setFieldValue, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-6">
                <label className="mb-2 block text-gray-700">তাহাজ্জুদ</label>
                <Field
                  name="tahajjud"
                  type="number"
                  min="0"
                  placeholder="Enter value"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange(e, "tahajjud", setFieldValue)
                  }
                />
                <ErrorMessage
                  name="tahajjud"
                  component="div"
                  className="text-red-500"
                />
                <div className="text-gray-600">Points: {points.tahajjud}</div>
              </div>
              <div className="mb-6">
                <label className="mb-2 block text-gray-700">জামাতে সালাত</label>
                <Field
                  name="jamat"
                  type="number"
                  min="0"
                  max="5"
                  placeholder="Enter value (0-5)"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange(e, "jamat", setFieldValue)
                  }
                />
                <ErrorMessage
                  name="jamat"
                  component="div"
                  className="text-red-500"
                />
                <div className="text-gray-600">Points: {points.jamat}</div>
              </div>
              {Object.keys(initialFormData)
                .filter((field) => field !== "tahajjud" && field !== "jamat")
                .map((field) => (
                  <div className="mb-6" key={field}>
                    <label className="mb-2 block text-gray-700">
                      {field === "ayat"
                        ? "তিলাওয়াতুল কোরআন তাদাব্বুর"
                        : field === "zikir"
                        ? "সকাল-সন্ধ্যা দোয়া ও জিকির"
                        : field === "ishraq"
                        ? "ইশরাক-আওয়াবীন-চাশ্ত"
                        : field === "sirat"
                        ? "সিরাত ও মাগফিরাত কিতাব পাঠ"
                        : field === "Dua"
                        ? "দু’আ আনাস ইবনে মালেক"
                        : field === "ilm"
                        ? "ইলমী ও আমলী কিতাব পাঠ"
                        : field === "tasbih"
                        ? "তিন তাসবীহ (সকাল- সন্ধ্যা)"
                        : field === "dayeeAmol"
                        ? "দা’য়ীদের আমলী কিতাব পাঠ"
                        : field === "amoliSura"
                        ? "দৈনিক আমলি সুরা পাঠ"
                        : field === "ayamroja"
                        ? `আজ ${hijriDate} তারিখ আইয়্যামে বীজের রোজা রেখেছেন তো?`
                        : "দৈনিক হিজবুল বাহার পাঠ"}
                    </label>
                    {field === "sirat" || field === "ilm" ? (
                      <Field
                        name={field}
                        type="text"
                        placeholder="Enter text"
                        className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleInputChange(
                            e,
                            field as keyof AmoliMuhasabaFormValues,
                            setFieldValue
                          )
                        }
                      />
                    ) : (
                      <Field
                        as="select"
                        name={field}
                        className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          handleInputChange(
                            e,
                            field as keyof AmoliMuhasabaFormValues,
                            setFieldValue
                          )
                        }
                      >
                        <option value="">Select Option</option>
                        {(field === "ayat"
                          ? ayatOptions
                          : field === "zikir"
                          ? zikirOptions
                          : field === "ishraq"
                          ? ishraqOptions
                          : field === "Dua"
                          ? duaOptions
                          : field === "tasbih"
                          ? tasbihOptions
                          : field === "dayeeAmol"
                          ? dayeeAmolOptions
                          : field === "amoliSura"
                          ? amoliSuraOptions
                          : field === "ayamroja"
                          ? AyamOptions
                          : hijbulBaharOptions
                        ).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Field>
                    )}
                    <ErrorMessage
                      name={field}
                      component="div"
                      className="text-red-500"
                    />
                    <div className="text-gray-600">
                      Points: {points[field as keyof AmoliMuhasabaFormValues]}
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-4 text-lg font-bold text-gray-700">
              Total Points: {totalPoints}
            </div>
            <div className="mt-2 text-lg font-bold text-green-600">
              Percentage: {percentage}%
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="rounded bg-blue-500 px-4 py-2 text-white"
                disabled={isSubmitting}
              >
                Submit
              </button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default AmoliMuhasabaForm;


