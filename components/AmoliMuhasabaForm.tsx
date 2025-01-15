"use client";

import { useState, useEffect } from "react";
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
import "moment-hijri";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import moment from "moment-hijri";
import { toast } from "sonner";

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
  ayamroja: Yup.string().notRequired(),
  hijbulBahar: Yup.string().required("This field is required"),
});

const AmoliMuhasabaForm = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || "";
  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
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

  moment.locale("en");
  const hijriDate = moment().format("iD");

  const showAyamRojaSection =
    hijriDate === "13" || hijriDate === "14" || hijriDate === "15";

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
  const maxPoints = showAyamRojaSection ? 65 : 60; // Dynamically set max points
  const percentage = ((totalPoints / maxPoints) * 100).toFixed(2);

  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (!email) return;
      try {
        const response = await fetch(`/api/amoli?email=${email}`);
        if (response.ok) {
          const data = await response.json();
          setIsSubmittedToday(data.isSubmittedToday);
        } else {
          toast.error("Failed to check submission status.");
        }
      } catch (error) {
        console.error("Error checking submission status:", error);
        toast.error("Error checking submission status.");
      }
    };

    checkSubmissionStatus();
  }, [email]);

  const handleSubmit = async (
    values: AmoliMuhasabaFormValues,
    { setSubmitting }: FormikHelpers<AmoliMuhasabaFormValues>
  ) => {
    if (!email) {
      alert("User email is not set. Please log in.");
      setSubmitting(false);
      return;
    }

    if (isSubmittedToday) {
      toast.error("You have already submitted today. Try again tomorrow.");
      setSubmitting(false);
      return;
    }

    const formData = { ...values, email, percentage };

    try {
      const response = await fetch("/api/amoli", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Submitted successfully!");
        router.push("/dashboard");
      } else {
        toast.error("Form submission failed! Try again.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An error occurred while submitting the form.");
    }

    setSubmitting(false);
  };

  return (
    <div className="mx-auto mt-8 rounded bg-white p-10 shadow-lg">
      <h2 className="mb-2 text-2xl">আ’মলি মুহাসাবা</h2>
      {isSubmittedToday && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-8">
          You have already submitted today.
        </div>
      )}
      <Formik
        initialValues={initialFormData}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, setFieldValue, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="mb-4">
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
                  disabled={isSubmittedToday}
                />
                <ErrorMessage
                  name="tahajjud"
                  component="div"
                  className="text-red-500"
                />
                <div className="text-gray-600">Points: {points.tahajjud}</div>
              </div>
              <div className="mb-2">
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
                  disabled={isSubmittedToday}
                />
                <ErrorMessage
                  name="jamat"
                  component="div"
                  className="text-red-500"
                />
                <div className="text-gray-600">Points: {points.jamat}</div>
              </div>
              {Object.keys(initialFormData)
                .filter(
                  (field) =>
                    field !== "tahajjud" &&
                    field !== "jamat" &&
                    (field !== "ayamroja" || showAyamRojaSection)
                )
                .map((field) => (
                  <div className="mb-2" key={field}>
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
                        ? `আজ ${moment().format(
                            "iD iMMMM iYYYY"
                          )} তারিখ আইয়্যামে বীজের রোজা রেখেছেন তো?`
                        : "দৈনিক হিজবুল বাহার পাঠ"}
                    </label>
                    {field === "sirat" || field === "ilm" ? (
                      <Field
                        name={field}
                        type="text"
                        disabled={isSubmittedToday}
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
                        disabled={isSubmittedToday}
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
                disabled={isSubmittedToday}
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

