// Estiak
"use client";

import { Button } from "@/components/ui/button";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { initialFormData, validationSchema } from "@/app/data/JamatBishoyData";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import JoditEditorComponent from "./richTextEditor";
import { toast } from "sonner";
import Loading from "@/app/[locale]/dashboard/loading";
import { useTranslations } from "next-intl";

interface FormValues {
  jamatBerHoise: string | number;
  jamatSathi: string | number;
  editorContent: string;
}

const JamatBishoyForm: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || "";

  const tJamat = useTranslations("dashboard.UserDashboard.jamat");
  const tToast = useTranslations("dashboard.UserDashboard.toast");
  const common = useTranslations("common");

  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if the user has already submitted today (server computes Dhaka day)
  useEffect(() => {
    if (!email) {
      setIsSubmittedToday(false);
      setLoading(false);
      return;
    }

    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch(
          `/api/jamat?email=${encodeURIComponent(email)}&mode=today`,
          { cache: "no-store", signal: ac.signal }
        );
        if (!res.ok) throw new Error("Failed to check today's status");
        const json = await res.json();
        setIsSubmittedToday(!!json.isSubmittedToday);
      } catch (err: any) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Submission status error:", err);
          toast.error(tToast("errorFetchingData"));
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [email, tToast]);

  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
    if (!email) {
      toast.error(common("userEmailIsNotSet"));
      return;
    }
    if (isSubmittedToday) {
      toast.error(common("youHaveAlreadySubmittedToday"));
      return;
    }

    const payload = {
      email,
      jamatBerHoise: Number(values.jamatBerHoise) || 0,
      jamatSathi: Number(values.jamatSathi) || 0,
      editorContent: values.editorContent || "",
    };

    try {
      const res = await fetch("/api/jamat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error || common("formSubmissionFailed"));
        return;
      }

      toast.success(common("submittedSuccessfully"));
      setIsSubmittedToday(true);
      router.push("/dashboard");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(common("formSubmissionFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="mx-auto mt-8 w-full rounded bg-white p-4 lg:p-10 shadow-lg">
      {isSubmittedToday && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-8">
          {common("youHaveAlreadySubmittedToday")}
        </div>
      )}

      <h2 className="mb-6 text-2xl">{tJamat("title")}</h2>

      <Formik<FormValues>
        initialValues={{ ...(initialFormData as any), editorContent: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting }) => (
          <Form>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <label className="mb-2 block text-gray-700">
                  {tJamat("jamatBerHoise")}
                </label>
                <Field
                  name="jamatBerHoise"
                  type="number"
                  placeholder="0"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  disabled={isSubmittedToday || isSubmitting}
                />
                <ErrorMessage name="jamatBerHoise" component="div" className="text-red-500" />
              </div>

              <div>
                <label className="mb-2 block text-gray-700">
                  {tJamat("jamatSathi")}
                </label>
                <Field
                  name="jamatSathi"
                  type="number"
                  placeholder="0"
                  className="w-full rounded border border-gray-300 px-4 py-2 mb-3"
                  disabled={isSubmittedToday || isSubmitting}
                />
                <ErrorMessage name="jamatSathi" component="div" className="text-red-500" />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-3 block text-gray-700">{common("editorContent")}</label>
                <JoditEditorComponent
                  placeholder={common("editorContentPlaceholder")}
                  initialValue=""
                  onContentChange={(content) => setFieldValue("editorContent", content)}
                  height="300px"
                  width="100%"
                  disabled={isSubmittedToday || isSubmitting}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="ghost"
                size="default"
                type="submit"
                disabled={isSubmittedToday || isSubmitting}
              >
                {common("submit")}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default JamatBishoyForm;
