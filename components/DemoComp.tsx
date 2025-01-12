import { useState } from "react";
import { Formik, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";

// Define the initial form values type
interface AmoliMuhasabaFormValues {
  tahajjud: number;
  tilawat: number;
  zikir: number;
}

// Define the initial form data
const initialFormData: AmoliMuhasabaFormValues = {
  tahajjud: 0,
  tilawat: 0,
  zikir: 0,
};

// Validation schema using Yup
const validationSchema = Yup.object({
  tahajjud: Yup.number()
    .min(0, "Value should not be less than 0")
    .required("This field is required"),
  tilawat: Yup.number()
    .min(0, "Value should not be less than 0")
    .required("This field is required"),
  zikir: Yup.number()
    .min(0, "Value should not be less than 0")
    .required("This field is required"),
});

const DemoComp = () => {
  const [points, setPoints] = useState({
    tahajjud: 0,
    tilawat: 0,
    zikir: 0,
  });

  const calculatePoints = (value: number): number => {
    if (value >= 20) return 5;
    if (value >= 10) return 3;
    return 1;
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof AmoliMuhasabaFormValues,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const value = parseInt(event.target.value, 10) || 0;

    // Update Formik field value
    setFieldValue(fieldName, value);

    // Calculate and update points for the field
    const updatedPoints = { ...points, [fieldName]: calculatePoints(value) };
    setPoints(updatedPoints);
  };

  const handleSubmit = async (
    values: AmoliMuhasabaFormValues,
    { setSubmitting }: FormikHelpers<AmoliMuhasabaFormValues>
  ) => {
    console.log("Form Submitted", values);
    console.log(
      "Total Points:",
      Object.values(points).reduce((a, b) => a + b, 0)
    );
    setSubmitting(false);
  };

  const totalPoints = Object.values(points).reduce((a, b) => a + b, 0);
  const maxPoints = 15; // 3 fields * 5 max points each
  const percentage = ((totalPoints / maxPoints) * 100).toFixed(2); // Calculating percentage

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
            {/* Input for Tahajjud */}
            <div className="mb-6">
              <label className="mb-2 block text-gray-700">তাহাজ্জুদ</label>
              <Field
                name="tahajjud"
                type="number"
                placeholder="কত রাকাত"
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

            {/* Input for Tilawat */}
            <div className="mb-6">
              <label className="mb-2 block text-gray-700">তিলাওয়াত</label>
              <Field
                name="tilawat"
                type="number"
                placeholder="কত আয়াত"
                className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(e, "tilawat", setFieldValue)
                }
              />
              <ErrorMessage
                name="tilawat"
                component="div"
                className="text-red-500"
              />
              <div className="text-gray-600">Points: {points.tilawat}</div>
            </div>

            {/* Input for Zikir */}
            <div className="mb-6">
              <label className="mb-2 block text-gray-700">জিকির</label>
              <Field
                name="zikir"
                type="number"
                placeholder="কতবার"
                className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(e, "zikir", setFieldValue)
                }
              />
              <ErrorMessage
                name="zikir"
                component="div"
                className="text-red-500"
              />
              <div className="text-gray-600">Points: {points.zikir}</div>
            </div>

            {/* Total Points and Percentage */}
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

export default DemoComp;
