"use client"; //Juwel //Faysal

import { useState, useEffect, ChangeEvent } from "react";
import { Formik, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import {
  surahOptions,
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
import { useSession } from "@/lib/auth-client";
import moment from "moment-hijri";
import { toast } from "sonner";

interface AmoliMuhasabaFormValues {
  tahajjud: number;
  surah: string;
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
  ayat: string;
}

const initialFormData: AmoliMuhasabaFormValues = {
  tahajjud: 0,
  surah: "",
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
  ayat: "", // New field
};

const validationSchema = Yup.object({
  tahajjud: Yup.number().min(0, "Value should not be less than 0").optional(),
  jamat: Yup.number()
    .min(0, "Value should not be less than 0")
    .max(5, "Value should not exceed 5")
    .optional(),
  surah: Yup.string().optional(),
  zikir: Yup.string().optional(),
  ishraq: Yup.string().optional(),
  sirat: Yup.string().optional(),
  Dua: Yup.string().optional(),
  ilm: Yup.string().optional(),
  tasbih: Yup.string().optional(),
  dayeeAmol: Yup.string().optional(),
  amoliSura: Yup.string().optional(),
  ayamroja: Yup.string().optional(),
  hijbulBahar: Yup.string().optional(),
  ayat: Yup.string().optional(),
});

const AmoliMuhasabaForm = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || "";
  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
  const [points, setPoints] = useState({
    tahajjud: 0,
    surah: 0,
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
    ayat: 0,
  });

  moment.locale("en");
  const hijriDate = moment().format("iD");

  const showAyamRojaSection =
    hijriDate === "14" || hijriDate === "15" || hijriDate === "16";

  const calculatePoints = (value: any, field: string): number => {
    if (field === "zikir") {
      if (value === "সকাল-সন্ধ্যা") return 5;
      if (value === "সকাল" || value === "সন্ধ্যা") return 3;
      return 0;
    } else if (
      field === "surah" ||
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
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | React.ChangeEvent<HTMLSelectElement>,
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
  const maxPoints = showAyamRojaSection ? 70 : 65; // Dynamically set max points
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
    <div className="mx-auto mt-8 rounded bg-white p-4 lg:p-10 shadow-lg">
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
                  onChange={(
                    e:
                      | ChangeEvent<HTMLInputElement | HTMLSelectElement>
                      | ChangeEvent<HTMLSelectElement>
                  ) => handleInputChange(e, "tahajjud", setFieldValue)}
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
                  onChange={(
                    e:
                      | ChangeEvent<HTMLInputElement | HTMLSelectElement>
                      | ChangeEvent<HTMLSelectElement>
                  ) => handleInputChange(e, "jamat", setFieldValue)}
                  disabled={isSubmittedToday}
                />
                <ErrorMessage
                  name="jamat"
                  component="div"
                  className="text-red-500"
                />
                <div className="text-gray-600">Points: {points.jamat}</div>
              </div>
              <div className="mb-2">
                <label className="mb-2 block text-gray-700">
                  তিলাওয়াতুল কোরআন তাদাব্বুর
                </label>
                <Field
                  name="surah"
                  as="select"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  onChange={(
                    e:
                      | ChangeEvent<HTMLInputElement | HTMLSelectElement>
                      | ChangeEvent<HTMLSelectElement>
                  ) => handleInputChange(e, "surah", setFieldValue)}
                >
                  <option value="">Select Option</option>
                  {surahOptions.map((option) => (
                    <option key={option.value} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="surah"
                  component="div"
                  className="text-red-500"
                />
                <div className="text-gray-600">Points: {points.surah}</div>
              </div>

              <div className="mb-2">
                <label className="mb-2 block text-gray-700">আয়াত প্রদান</label>
                <Field
                  name="ayat"
                  type="text"
                  placeholder="Enter Ayat"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  onChange={(
                    e:
                      | ChangeEvent<HTMLInputElement | HTMLSelectElement>
                      | ChangeEvent<HTMLSelectElement>
                  ) => handleInputChange(e, "ayat", setFieldValue)}
                  disabled={isSubmittedToday}
                />
                <ErrorMessage
                  name="ayat"
                  component="div"
                  className="text-red-500"
                />
                <div className="text-gray-600">Points: {points.ayat}</div>
              </div>

              <div className="mb-2">
                <label className="mb-2 block text-gray-700">
                  সকাল-সন্ধ্যা দোয়া ও জিকির
                </label>
                <Field
                  name="zikir"
                  as="select"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  onChange={(
                    e:
                      | ChangeEvent<HTMLInputElement | HTMLSelectElement>
                      | ChangeEvent<HTMLSelectElement>
                  ) => handleInputChange(e, "zikir", setFieldValue)}
                >
                  <option value="">Select Option</option>
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
                <div className="text-gray-600">Points: {points.zikir}</div>
              </div>
              <div className="mb-2">
                <label className="mb-2 block text-gray-700">
                  ইশরাক-আওয়াবীন-চাশ্ত
                </label>
                <Field
                  name="ishraq"
                  as="select"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  onChange={(
                    e:
                      | ChangeEvent<HTMLInputElement | HTMLSelectElement>
                      | ChangeEvent<HTMLSelectElement>
                  ) => handleInputChange(e, "ishraq", setFieldValue)}
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
                <div className="text-gray-600">Points: {points.ishraq}</div>
              </div>
              <div className="mb-2">
                <label className="mb-2 block text-gray-700">
                  সিরাত ও মাগফিরাত কিতাব পাঠ
                </label>
                <Field
                  name="sirat"
                  type="text"
                  placeholder="Enter text"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  onChange={(
                    e:
                      | ChangeEvent<HTMLInputElement | HTMLSelectElement>
                      | ChangeEvent<HTMLSelectElement>
                  ) => handleInputChange(e, "sirat", setFieldValue)}
                />
                <ErrorMessage
                  name="sirat"
                  component="div"
                  className="text-red-500"
                />
                <div className="text-gray-600">Points: {points.sirat}</div>
              </div>
              <div className="mb-2">
                <label className="mb-2 block text-gray-700">
                  দু’আ আনাস ইবনে মালেক
                </label>
                <Field
                  name="Dua"
                  as="select"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  onChange={(
                    e:
                      | ChangeEvent<HTMLInputElement | HTMLSelectElement>
                      | ChangeEvent<HTMLSelectElement>
                  ) => handleInputChange(e, "Dua", setFieldValue)}
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
                <div className="text-gray-600">Points: {points.Dua}</div>
              </div>
              <div className="mb-2">
                <label className="mb-2 block text-gray-700">
                  ইলমী ও আমলী কিতাব পাঠ
                </label>
                <Field
                  name="ilm"
                  type="text"
                  placeholder="Enter text"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  onChange={(
                    e:
                      | ChangeEvent<HTMLInputElement | HTMLSelectElement>
                      | ChangeEvent<HTMLSelectElement>
                  ) => handleInputChange(e, "ilm", setFieldValue)}
                />
                <ErrorMessage
                  name="ilm"
                  component="div"
                  className="text-red-500"
                />
                <div className="text-gray-600">Points: {points.ilm}</div>
              </div>
              <div className="mb-2">
                <label className="mb-2 block text-gray-700">
                  তিন তাসবীহ (সকাল- সন্ধ্যা)
                </label>
                <Field
                  name="tasbih"
                  as="select"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  onChange={(
                    e:
                      | ChangeEvent<HTMLInputElement | HTMLSelectElement>
                      | ChangeEvent<HTMLSelectElement>
                  ) => handleInputChange(e, "tasbih", setFieldValue)}
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
                <div className="text-gray-600">Points: {points.tasbih}</div>
              </div>
              <div className="mb-2">
                <label className="mb-2 block text-gray-700">দাঈ আমল</label>
                <Field
                  name="dayeeAmol"
                  as="select"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  onChange={(
                    e:
                      | ChangeEvent<HTMLInputElement | HTMLSelectElement>
                      | ChangeEvent<HTMLSelectElement>
                  ) => handleInputChange(e, "dayeeAmol", setFieldValue)}
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
                <div className="text-gray-600">Points: {points.dayeeAmol}</div>
              </div>
              <div className="mb-2">
                <label className="mb-2 block text-gray-700">আমলী সূরা</label>
                <Field
                  name="amoliSura"
                  as="select"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  onChange={(
                    e:
                      | ChangeEvent<HTMLInputElement | HTMLSelectElement>
                      | ChangeEvent<HTMLSelectElement>
                  ) => handleInputChange(e, "amoliSura", setFieldValue)}
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
                <div className="text-gray-600">Points: {points.amoliSura}</div>
              </div>
              {showAyamRojaSection && (
                <div className="mb-2">
                  <label className="mb-2 block text-gray-700">
                    আয়াম বীজ রোজা
                  </label>
                  <Field
                    name="ayamroja"
                    as="select"
                    disabled={isSubmittedToday}
                    className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                    onChange={(
                      e:
                        | ChangeEvent<HTMLSelectElement>
                        | ChangeEvent<HTMLSelectElement | HTMLInputElement>
                    ) => handleInputChange(e, "ayamroja", setFieldValue)}
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
                  <div className="text-gray-600">Points: {points.ayamroja}</div>
                </div>
              )}
              <div className="mb-2">
                <label className="mb-2 block text-gray-700">হিজবুল বাহার</label>
                <Field
                  name="hijbulBahar"
                  as="select"
                  disabled={isSubmittedToday}
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  onChange={(
                    e:
                      | ChangeEvent<HTMLInputElement | HTMLSelectElement>
                      | ChangeEvent<HTMLSelectElement>
                  ) => handleInputChange(e, "hijbulBahar", setFieldValue)}
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
                <div className="text-gray-600">
                  Points: {points.hijbulBahar}
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className="text-gray-600 text-lg">
                Total Points:{" "}
                <span className="text-emerald-600 font-semibold">
                  {totalPoints} / {maxPoints} ({percentage}%){" "}
                </span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || isSubmittedToday}
                className={`px-6 py-2 text-white ${
                  isSubmittedToday
                    ? "bg-gray-300"
                    : "bg-blue-500 hover:bg-blue-700"
                } rounded`}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default AmoliMuhasabaForm;
