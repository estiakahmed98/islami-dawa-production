// Estiak — StrictMode-safe: remove useFormikContext, resize lists via effects in render
"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import JoditEditorComponent from "./richTextEditor";
import { toast } from "sonner";
import Loading from "@/app/[locale]/dashboard/loading";
import { useTranslations } from "next-intl";

type FormValues = {
  moktobVisit: number | string;
  madrasaVisit: number | string;               // count
  madrasaVisitList: string[];                  // list
  schoolCollegeVisit: number | string;         // count
  schoolCollegeVisitList: string[];            // list
  editorContent: string;
};

const initialValues: FormValues = {
  moktobVisit: "",
  madrasaVisit: 0,
  madrasaVisitList: [],
  schoolCollegeVisit: 0,
  schoolCollegeVisitList: [],
  editorContent: "",
};

const validationSchema = Yup.object({
  moktobVisit: Yup.number().typeError("সংখ্যা লিখুন").min(0).required("required"),
  madrasaVisit: Yup.number().typeError("সংখ্যা লিখুন").min(0).required("required"),
  madrasaVisitList: Yup.array()
    .of(Yup.string().trim().required("required"))
    .test("match-length", "মোট সংখ্যার সমান নাম লিখুন", function (arr) {
      const count = Number(this.parent.madrasaVisit || 0);
      return Array.isArray(arr) && arr.length === count;
    }),
  schoolCollegeVisit: Yup.number().typeError("সংখ্যা লিখুন").min(0).required("required"),
  schoolCollegeVisitList: Yup.array()
    .of(Yup.string().trim().required("required"))
    .test("match-length", "মোট সংখ্যার সমান নাম লিখুন", function (arr) {
      const count = Number(this.parent.schoolCollegeVisit || 0);
      return Array.isArray(arr) && arr.length === count;
    }),
  editorContent: Yup.string().nullable(),
});

type Props = {
  isSubmittedToday?: boolean;
  setIsSubmittedToday?: (v: boolean) => void;
};

const SoforBishoyForm: React.FC<Props> = ({
  isSubmittedToday: propSubmitted,
  setIsSubmittedToday: setPropSubmitted,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || "";

  const tCommon = useTranslations("common");
  const tSofor = useTranslations("dashboard.UserDashboard.soforbisoy");
  const tToast = useTranslations("dashboard.UserDashboard.toast");

  const [isSubmittedTodayLocal, setIsSubmittedTodayLocal] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const effectiveSubmitted = propSubmitted ?? isSubmittedTodayLocal;
  const setEffectiveSubmitted = setPropSubmitted ?? setIsSubmittedTodayLocal;

  // Only fetch if parent didn't pass isSubmittedToday
  React.useEffect(() => {
    if (propSubmitted !== undefined) {
      setLoading(false);
      return;
    }
    if (!email) {
      setIsSubmittedTodayLocal(false);
      setLoading(false);
      return;
    }
    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch(
          `/api/soforbisoy?email=${encodeURIComponent(email)}&mode=today`,
          { cache: "no-store", signal: ac.signal }
        );
        if (!res.ok) throw new Error("Failed to check submission status");
        const data = await res.json();
        setIsSubmittedTodayLocal(!!data.isSubmittedToday);
      } catch (err: any) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Submission status check failed:", err);
          toast.error(tToast("errorFetchingData"));
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [email, propSubmitted, tToast]);

  if (loading) return <Loading />;

  return (
    <div className="mx-auto mt-8 w-full rounded bg-white p-4 lg:p-10 shadow-lg">
      {effectiveSubmitted && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-8">
          {tCommon("youHaveAlreadySubmittedToday")}
        </div>
      )}

      <h2 className="mb-6 text-2xl">{tSofor("title")}</h2>

      <Formik<FormValues>
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          if (effectiveSubmitted) {
            toast.error(tCommon("youHaveAlreadySubmittedToday"));
            setSubmitting(false);
            return;
          }
          if (!email) {
            toast.error(tCommon("userEmailIsNotSet"));
            setSubmitting(false);
            return;
          }

          const payload = {
            email,
            moktobVisit: Number(values.moktobVisit) || 0,
            madrasaVisit: Number(values.madrasaVisit) || 0,
            madrasaVisitList: values.madrasaVisitList.map((s) => s.trim()).filter(Boolean),
            schoolCollegeVisit: Number(values.schoolCollegeVisit) || 0,
            schoolCollegeVisitList: values.schoolCollegeVisitList.map((s) => s.trim()).filter(Boolean),
            editorContent: values.editorContent || "",
          };

          try {
            const res = await fetch("/api/soforbisoy", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
              toast.error(json?.error || tCommon("formSubmissionFailed"));
              return;
            }

            toast.success(tCommon("submittedSuccessfully"));
            resetForm();
            setEffectiveSubmitted(true);
            router.push("/dashboard");
          } catch (err) {
            console.error("Submit error:", err);
            toast.error(tCommon("formSubmissionFailed"));
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, setFieldValue, isSubmitting }) => {
          // Keep list lengths in sync with counts
          React.useEffect(() => {
            const count = Math.max(0, Number(values.madrasaVisit || 0));
            let list = Array.isArray(values.madrasaVisitList) ? [...values.madrasaVisitList] : [];
            if (list.length !== count) {
              if (list.length < count) list.push(...Array(count - list.length).fill(""));
              else list = list.slice(0, count);
              setFieldValue("madrasaVisitList", list, false);
            }
          }, [values.madrasaVisit]); // eslint-disable-line react-hooks/exhaustive-deps

          React.useEffect(() => {
            const count = Math.max(0, Number(values.schoolCollegeVisit || 0));
            let list = Array.isArray(values.schoolCollegeVisitList)
              ? [...values.schoolCollegeVisitList]
              : [];
            if (list.length !== count) {
              if (list.length < count) list.push(...Array(count - list.length).fill(""));
              else list = list.slice(0, count);
              setFieldValue("schoolCollegeVisitList", list, false);
            }
          }, [values.schoolCollegeVisit]); // eslint-disable-line react-hooks/exhaustive-deps

          return (
            <Form>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Moktob visit count */}
                <div className="lg:col-span-2">
                  <label htmlFor="moktobVisit" className="mb-2 block text-gray-700">
                    {tSofor("moktobVisit")}
                  </label>
                  <Field
                    id="moktobVisit"
                    name="moktobVisit"
                    type="number"
                    min={0}
                    placeholder="0"
                    className="w-full rounded border border-gray-300 px-4 py-2 mb-2"
                    disabled={effectiveSubmitted || isSubmitting}
                  />
                  <ErrorMessage name="moktobVisit" component="div" className="text-red-500" />
                </div>

                {/* Madrasa: count -> N inputs */}
                <div>
                  <label className="mb-2 block text-gray-700">
                    {tSofor("madrasaVisit")}
                  </label>
                  <Field
                    name="madrasaVisit"
                    type="number"
                    min={0}
                    placeholder="0"
                    className="w-full rounded border border-gray-300 px-4 py-2 mb-2"
                    disabled={effectiveSubmitted || isSubmitting}
                  />
                  <ErrorMessage name="madrasaVisit" component="div" className="text-red-500" />

                  {Number(values.madrasaVisit || 0) > 0 && (
                    <div className="mt-3 space-y-3">
                      {values.madrasaVisitList.map((val, idx) => (
                        <div key={`madrasa-${idx}`}>
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => {
                              const next = [...values.madrasaVisitList];
                              next[idx] = e.target.value;
                              setFieldValue("madrasaVisitList", next, false);
                            }}
                            placeholder={`মাদ্রাসার নাম #${idx + 1}`}
                            className="w-full rounded border border-gray-300 px-4 py-2"
                            disabled={effectiveSubmitted || isSubmitting}
                          />
                        </div>
                      ))}
                      <ErrorMessage
                        name="madrasaVisitList"
                        component="div"
                        className="text-red-500"
                      />
                    </div>
                  )}
                </div>

                {/* School/College/University: count -> N inputs */}
                <div>
                  <label className="mb-2 block text-gray-700">
                    {tSofor("schoolCollegeVisit")}
                  </label>
                  <Field
                    name="schoolCollegeVisit"
                    type="number"
                    min={0}
                    placeholder="0"
                    className="w-full rounded border border-gray-300 px-4 py-2 mb-2"
                    disabled={effectiveSubmitted || isSubmitting}
                  />
                  <ErrorMessage
                    name="schoolCollegeVisit"
                    component="div"
                    className="text-red-500"
                  />

                  {Number(values.schoolCollegeVisit || 0) > 0 && (
                    <div className="mt-3 space-y-3">
                      {values.schoolCollegeVisitList.map((val, idx) => (
                        <div key={`scu-${idx}`}>
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => {
                              const next = [...values.schoolCollegeVisitList];
                              next[idx] = e.target.value;
                              setFieldValue("schoolCollegeVisitList", next, false);
                            }}
                            placeholder={`স্কুল/কলেজ/ভার্সিটি নাম #${idx + 1}`}
                            className="w-full rounded border border-gray-300 px-4 py-2"
                            disabled={effectiveSubmitted || isSubmitting}
                          />
                        </div>
                      ))}
                      <ErrorMessage
                        name="schoolCollegeVisitList"
                        component="div"
                        className="text-red-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Editor */}
              <div className="col-span-2 mt-6">
                <label className="pb-3 block">{tCommon("editorContent")}</label>
                <JoditEditorComponent
                  placeholder={tCommon("editorContentPlaceholder")}
                  initialValue={initialValues.editorContent}
                  onContentChange={(content) => setFieldValue("editorContent", content)}
                  height="300px"
                  width="100%"
                  disabled={effectiveSubmitted || isSubmitting}
                />
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  variant="ghost"
                  size="default"
                  type="submit"
                  disabled={effectiveSubmitted || isSubmitting}
                >
                  {tCommon("submit")}
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default SoforBishoyForm;
