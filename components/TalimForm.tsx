'use client'; // Faysal Updated by // Estiak

import { Button } from '@/components/ui/button';
import { ErrorMessage, Field, Formik, Form } from 'formik';
import { initialFormData, validationSchema } from '@/app/data/TalimData';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useState, useEffect } from 'react';
import JoditEditorComponent from './richTextEditor';
import { toast } from 'sonner';
import Loading from '@/app/[locale]/dashboard/loading';
import { useTranslations } from 'next-intl';

interface TalimFormValues {
  mohilaTalim: string;
  mohilaOnshogrohon: string; // ✅ matches JSON key
  editorContent: string;
}

const TalimForm: React.FC<{
  isSubmittedToday?: boolean;
  setIsSubmittedToday?: (v: boolean) => void;
}> = ({ isSubmittedToday: submittedProp, setIsSubmittedToday: setSubmittedProp }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || '';

  const tTalim = useTranslations('dashboard.UserDashboard.talim');
  const tToast = useTranslations('dashboard.UserDashboard.toast');
  const common = useTranslations('common');

  const [isSubmittedToday, setIsSubmittedToday] = useState<boolean>(!!submittedProp);
  const [loading, setLoading] = useState(true);
  const [editorContent, setEditorContent] = useState('');

  useEffect(() => setIsSubmittedToday(!!submittedProp), [submittedProp]);

  // Check if already submitted today (server-calculated)
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      if (!email) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/talim?email=${encodeURIComponent(email)}`, {
          cache: 'no-store',
          signal: ac.signal,
        });
        if (!res.ok) throw new Error('check failed');
        const data = await res.json();
        setIsSubmittedToday(!!data.isSubmittedToday);
        setSubmittedProp?.(!!data.isSubmittedToday);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === 'AbortError')) {
          console.error('Error checking submission status:', e);
          toast.error(tToast('errorFetchingData'));
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [email, setSubmittedProp, tToast]);

  const handleSubmit = async (values: TalimFormValues) => {
    if (!email) {
      toast.error(common('userEmailIsNotSet'));
      return;
    }
    if (isSubmittedToday) {
      toast.error(common('youHaveAlreadySubmittedToday'));
      return;
    }

    const formData = {
      email,
      mohilaTalim: Number(values.mohilaTalim) || 0,
      mohilaOnshogrohon: Number(values.mohilaOnshogrohon) || 0,
      editorContent,
    };

    try {
      const response = await fetch('/api/talim', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || common('formSubmissionFailed'));
      }

      setIsSubmittedToday(true);
      setSubmittedProp?.(true);
      toast.success(common('submittedSuccessfully'));
      window.location.reload();
    } catch (error: any) {
      console.error('Error during submission:', error);
      toast.error(error.message || common('formSubmissionFailed'));
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="mx-auto mt-8 w-full rounded bg-white p-4 lg:p-10 shadow-lg">
      {isSubmittedToday && (
        <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-500">
          {common('youHaveAlreadySubmittedToday')}
        </div>
      )}

      <h2 className="mb-6 text-2xl">{tTalim('title')}</h2>

      <Formik<TalimFormValues>
        initialValues={{ ...(initialFormData as any), editorContent: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              <div>
                <label htmlFor="mohilaTalim" className="mb-2 block text-gray-700">
                  {tTalim('mohilaTalim')}
                </label>
                <Field
                  id="mohilaTalim"
                  type="number"
                  name="mohilaTalim"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="0"
                  className="mb-3 w-full rounded border border-gray-300 px-4 py-2"
                />
                <ErrorMessage name="mohilaTalim" component="div" className="text-red-500" />
              </div>

              <div>
                <label htmlFor="mohilaOnshogrohon" className="mb-2 block text-gray-700">
                  {tTalim('mohilaOnshogrohon')}
                </label>
                <Field
                  id="mohilaOnshogrohon"
                  type="number"
                  name="mohilaOnshogrohon"
                  disabled={isSubmittedToday || isSubmitting}
                  placeholder="0"
                  className="mb-3 w-full rounded border border-gray-300 px-4 py-2"
                />
                <ErrorMessage name="mohilaOnshogrohon" component="div" className="text-red-500" />
              </div>
            </div>

            <div className="pb-4">
              <label className="mb-2 block text-gray-700">{common('editorContent')}</label>
              <JoditEditorComponent
                placeholder={common('editorContentPlaceholder')}
                initialValue=""
                onContentChange={(html) => {
                  const plain = html.replace(/<[^>]*>/g, '').trim();
                  setEditorContent(plain);
                }}
                height="300px"
                width="100%"
                disabled={isSubmittedToday || isSubmitting}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || isSubmittedToday}>
                {common('submit')}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default TalimForm;
