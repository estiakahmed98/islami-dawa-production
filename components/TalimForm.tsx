'use client'; // Faysal Updated by // Estiak

import { Button } from '@/components/ui/button';
import { ErrorMessage, Field, Formik, Form } from 'formik';
import { initialFormData, validationSchema } from '@/app/data/TalimData';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useState, useEffect } from 'react';
import JoditEditorComponent from './richTextEditor';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface TalimFormValues {
  mohilaTalim: string;
  mohilaOnshogrohon: string;
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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  useEffect(() => setIsSubmittedToday(!!submittedProp), [submittedProp]);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      if (!email) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/talim?email=${encodeURIComponent(email)}&date=${selectedDate}`, {
          cache: 'no-store',
          signal: ac.signal,
        });
        if (!res.ok) throw new Error('check failed');
        const data = await res.json();
        setIsSubmittedToday(!!data.isSubmittedForDate);
        setSubmittedProp?.(!!data.isSubmittedForDate);
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
  }, [email, selectedDate, setSubmittedProp, tToast]);

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
      date: selectedDate,
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
      router.refresh();
    } catch (error: any) {
      console.error('Error during submission:', error);
      toast.error(error.message || common('formSubmissionFailed'));
    }
  };

  if (loading) {
    return (
      <div className="mx-auto mt-8 w-full rounded bg-white p-4 lg:p-10 shadow-lg">
        {/* Alert Message Skeleton */}
        <div className="h-12 bg-gray-100 rounded-lg mb-8 animate-pulse"></div>

        {/* Title Skeleton */}
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>

        {/* Form Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Form Field Skeletons */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              {/* Label Skeleton */}
              <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
              
              {/* Input Field Skeleton */}
              <div className="h-10 bg-gray-200 rounded w-full mb-3 animate-pulse"></div>
              
              {/* Error Message Skeleton */}
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Editor Skeleton */}
        <div className="mt-4">
          {/* Editor Label Skeleton */}
          <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
          
          {/* Editor Content Skeleton */}
          <div className="h-72 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>

        {/* Submit Button Skeleton */}
        <div className="flex justify-end mt-4">
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 w-full rounded bg-white p-4 lg:p-10 shadow-lg">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl">{tTalim('title')}</h2>
        <div className="flex items-center space-x-2">
          <label className="text-gray-700">জমা তারিখ</label>
          <input
            type="date"
            max={today}
            min={yesterday}
            className="rounded border border-gray-300 px-3 py-1"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>
      {isSubmittedToday && (
        <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-500">
          {common('youHaveAlreadySubmittedToday')}
        </div>
      )}

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
