"use client";

import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";
import JoditEditorComponent from "@/components/richTextEditor";

type FormValues = {
  shobgojariDate: string;
  mashwaraDate: string;
  trainingDates: string[];
  jamatCount: number;
  gashtCount: number;
  editorContent: string;
};

type Props = {
  record: {
    id: string;
    shobgojariDate?: string | null;
    mashwaraDate?: string | null;
    trainingDates?: string[];
    jamatCount: number;
    gashtCount: number;
    editorContent?: string | null;
    month: number;
    year: number;
  };
  onSuccess: () => void;
};

const validationSchema = Yup.object({
  shobgojariDate: Yup.string().required("শবগুজারির তারিখ দিন"),
  mashwaraDate: Yup.string().required("মাসওয়ারার তারিখ দিন"),
  trainingDates: Yup.array().of(Yup.string()),
  jamatCount: Yup.number().min(0).required("জামাত সংখ্যা দিন"),
  gashtCount: Yup.number().min(0).required("গাস্ত সংখ্যা দিন"),
});

function getMonthRange(month: number, year: number) {
  const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDate = new Date(year, month, 0).getDate();
  const lastDay = `${year}-${String(month).padStart(2, "0")}-${String(
    lastDate,
  ).padStart(2, "0")}`;

  return { firstDay, lastDay };
}

export default function DayeeFiveEditForm({ record, onSuccess }: Props) {
  const { firstDay, lastDay } = getMonthRange(record.month, record.year);

  const initialValues: FormValues = {
    shobgojariDate: record.shobgojariDate
      ? new Date(record.shobgojariDate).toISOString().split("T")[0]
      : "",
    mashwaraDate: record.mashwaraDate
      ? new Date(record.mashwaraDate).toISOString().split("T")[0]
      : "",
    trainingDates:
      record.trainingDates?.map((d) =>
        new Date(d).toISOString().split("T")[0]
      ) || [],
    jamatCount: record.jamatCount || 0,
    gashtCount: record.gashtCount || 0,
    editorContent: record.editorContent || "",
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      const payload = {
        shobgojariDate: values.shobgojariDate,
        mashwaraDate: values.mashwaraDate,
        trainingDates: values.trainingDates,
        jamatCount: Number(values.jamatCount) || 0,
        gashtCount: Number(values.gashtCount) || 0,
        editorContent: values.editorContent || "",
      };

      const res = await fetch(`/api/dayee-five/${record.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      toast.success("সফলভাবে আপডেট হয়েছে");
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "আপডেট করতে সমস্যা হয়েছে");
    }
  };

  return (
    <Formik<FormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, isSubmitting }) => (
        <Form className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-gray-700">শবগুজারি তারিখ</label>
            <Field
              name="shobgojariDate"
              type="date"
              min={firstDay}
              max={lastDay}
              disabled={isSubmitting}
              className="mb-2 w-full rounded border border-gray-300 px-4 py-2"
            />
            <ErrorMessage
              name="shobgojariDate"
              component="div"
              className="text-red-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-gray-700">মাসওয়ারা তারিখ</label>
            <Field
              name="mashwaraDate"
              type="date"
              min={firstDay}
              max={lastDay}
              disabled={isSubmitting}
              className="mb-2 w-full rounded border border-gray-300 px-4 py-2"
            />
            <ErrorMessage
              name="mashwaraDate"
              component="div"
              className="text-red-500"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="mb-2 block text-gray-700">
              প্রশিক্ষণ তারিখসমূহ
            </label>

            <div className="flex flex-col gap-3">
              {values.trainingDates.map((date, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="date"
                    min={firstDay}
                    max={lastDay}
                    value={date}
                    disabled={isSubmitting}
                    onChange={(e) => {
                      const updated = [...values.trainingDates];
                      updated[index] = e.target.value;
                      setFieldValue("trainingDates", updated);
                    }}
                    className="w-full rounded border border-gray-300 px-4 py-2"
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isSubmitting}
                    onClick={() => {
                      const updated = values.trainingDates.filter(
                        (_, i) => i !== index,
                      );
                      setFieldValue("trainingDates", updated);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                disabled={isSubmitting}
                className="w-fit bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() =>
                  setFieldValue("trainingDates", [
                    ...values.trainingDates,
                    firstDay,
                  ])
                }
              >
                + প্রশিক্ষণ তারিখ যোগ করুন
              </Button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-gray-700">
              মোট জামাতের সাথীদের সংখ্যা
            </label>
            <Field
              name="jamatCount"
              type="number"
              placeholder="0"
              disabled={isSubmitting}
              className="mb-2 w-full rounded border border-gray-300 px-4 py-2"
            />
            <ErrorMessage
              name="jamatCount"
              component="div"
              className="text-red-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-gray-700">গাস্ত হয়েছে </label>
            <Field
              name="gashtCount"
              type="number"
              placeholder="0"
              disabled={isSubmitting}
              className="mb-2 w-full rounded border border-gray-300 px-4 py-2"
            />
            <ErrorMessage
              name="gashtCount"
              component="div"
              className="text-red-500"
            />
          </div>

          <div className="col-span-full">
            <label className="mb-2 block text-gray-700">মন্তব্য</label>
            <JoditEditorComponent
              placeholder="মন্তব্য লিখুন"
              initialValue={values.editorContent}
              onContentChange={(content) =>
                setFieldValue("editorContent", content)
              }
              height="300px"
              width="100%"
              disabled={isSubmitting}
            />
          </div>

          <div className="col-span-full mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onSuccess}
              disabled={isSubmitting}
            >
              বাতিল
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
