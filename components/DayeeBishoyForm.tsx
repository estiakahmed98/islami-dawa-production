'use client';
import { Button } from '@/components/ui/button';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { initialFormData, validationSchema } from '@/app/data/DayeeBishoyData';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useState, useEffect } from 'react';
import JoditEditorComponent from './richTextEditor';
import { toast } from 'sonner';
import Loading from '@/app/[locale]/dashboard/loading';
import { useTranslations } from 'next-intl';

interface AssistantDaee {
  name: string;
  phone: string;
  address: string;
  email?: string;
  description?: string;
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
}

const DayeeBishoyForm: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || '';

  const tDayi = useTranslations('dashboard.UserDashboard.dayi');
  const common = useTranslations('common');

  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editorContent, setEditorContent] = useState('');
  const [assistantCount, setAssistantCount] = useState(0);
  const [assistants, setAssistants] = useState<AssistantDaee[]>([]);

  const handleContentChange = (content: string) => setEditorContent(content);

  useEffect(() => {
    const checkSubmission = async () => {
      if (!email) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/dayi?email=${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error('Failed to fetch records');

        const data = await res.json();
        const today = new Date().toDateString();
        const hasTodaySubmission = data.records?.some(
          (record: any) => new Date(record.date).toDateString() === today
        );

        setIsSubmittedToday(!!hasTodaySubmission);
      } catch (err) {
        console.error('Submission check error:', err);
        toast.error(common('errorValidatingExistingRecords'));
      } finally {
        setLoading(false);
      }
    };

    checkSubmission();
  }, [email, common]);

  const handleAssistantCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = Math.max(0, parseInt(e.target.value) || 0);
    setAssistantCount(count);

    const newAssistants = Array(count)
      .fill(null)
      .map((_, index) =>
        assistants[index] || {
          name: '',
          phone: '',
          address: '',
          description: '',
          division: '',
          district: '',
          upazila: '',
          union: '',
        }
      );

    setAssistants(newAssistants);
  };

  const handleAssistantChange = (index: number, field: keyof AssistantDaee, value: string) => {
    setAssistants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (values: typeof initialFormData) => {
    if (isSubmittedToday) {
      toast.error(common('youHaveAlreadySubmittedToday'));
      return;
    }

    // Validate assistants when count > 0
    if (assistantCount > 0) {
      const invalid = assistants.some(
        (a) =>
          !a.name?.trim() ||
          !a.phone?.trim() ||
          !a.address?.trim() ||
          !a.division?.trim() ||
          !a.district?.trim() ||
          !a.upazila?.trim() ||
          !a.union?.trim()
      );
      if (invalid) {
        toast.error(common('formSubmissionFailed')); // or a new key like common.fillAllRequiredFields
        return;
      }
    }

    const formData = {
      email,
      sohojogiDayeToiri: Number(values.sohojogiDayeToiri) || 0,
      editorContent,
      assistants,
    };

    try {
      const res = await fetch('/api/dayi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || common('formSubmissionFailed'));
      }

      toast.success(common('submittedSuccessfully'));
      setIsSubmittedToday(true);
      window.location.reload();
    } catch (error: any) {
      console.error('Submission error:', error);
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

      <h2 className="mb-6 text-2xl font-semibold text-gray-800">{tDayi('title')}</h2>

      <Formik initialValues={initialFormData} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ setFieldValue, isSubmitting }) => (
          <Form className="space-y-6">
            <div>
              <label htmlFor="sohojogiDayeToiri" className="mb-1 block">
                {tDayi('sohojogiDayeToiri')}
              </label>
              <Field
                id="sohojogiDayeToiri"
                name="sohojogiDayeToiri"
                type="number"
                min="0"
                placeholder={tDayi('sohojogiDayeToiri')}
                disabled={isSubmittedToday}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFieldValue('sohojogiDayeToiri', e.target.value);
                  handleAssistantCountChange(e);
                }}
                className="w-full rounded border border-gray-300 px-4 py-2"
              />
              <ErrorMessage name="sohojogiDayeToiri" component="div" className="mt-1 text-sm text-red-500" />
            </div>

            {assistantCount > 0 && (
              <div className="space-y-6 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800">{tDayi('assistantsList')}</h3>

                {assistants.map((assistant, index) => (
                  <div key={index} className="space-y-4 rounded-lg border p-4">
                    <h4 className="font-bold text-[#155E75]">
                      {tDayi('assistant')} #{index + 1}
                    </h4>

                    <div>
                      <label className="mb-1 block text-gray-700">{tDayi('name')} *</label>
                      <input
                        type="text"
                        value={assistant.name}
                        onChange={(e) => handleAssistantChange(index, 'name', e.target.value)}
                        disabled={isSubmittedToday}
                        className="w-full rounded border border-gray-300 px-4 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-gray-700">{tDayi('phone')} *</label>
                      <input
                        type="tel"
                        value={assistant.phone}
                        onChange={(e) => handleAssistantChange(index, 'phone', e.target.value)}
                        disabled={isSubmittedToday}
                        className="w-full rounded border border-gray-300 px-4 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-gray-700">{tDayi('address')} *</label>
                      <textarea
                        value={assistant.address}
                        onChange={(e) => handleAssistantChange(index, 'address', e.target.value)}
                        disabled={isSubmittedToday}
                        className="w-full rounded border border-gray-300 px-4 py-2"
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-gray-700">{tDayi('division')} *</label>
                      <input
                        type="text"
                        value={assistant.division}
                        onChange={(e) => handleAssistantChange(index, 'division', e.target.value)}
                        disabled={isSubmittedToday}
                        className="w-full rounded border border-gray-300 px-4 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-gray-700">{tDayi('district')} *</label>
                      <input
                        type="text"
                        value={assistant.district}
                        onChange={(e) => handleAssistantChange(index, 'district', e.target.value)}
                        disabled={isSubmittedToday}
                        className="w-full rounded border border-gray-300 px-4 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-gray-700">{tDayi('upazila')} *</label>
                      <input
                        type="text"
                        value={assistant.upazila}
                        onChange={(e) => handleAssistantChange(index, 'upazila', e.target.value)}
                        disabled={isSubmittedToday}
                        className="w-full rounded border border-gray-300 px-4 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-gray-700">{tDayi('union')} *</label>
                      <input
                        type="text"
                        value={assistant.union}
                        onChange={(e) => handleAssistantChange(index, 'union', e.target.value)}
                        disabled={isSubmittedToday}
                        className="w-full rounded border border-gray-300 px-4 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-gray-700">{tDayi('email')}</label>
                      <input
                        type="email"
                        value={assistant.email || ''}
                        onChange={(e) => handleAssistantChange(index, 'email', e.target.value)}
                        disabled={isSubmittedToday}
                        className="w-full rounded border border-gray-300 px-4 py-2"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-gray-700">{tDayi('description')}</label>
                      <textarea
                        value={assistant.description || ''}
                        onChange={(e) => handleAssistantChange(index, 'description', e.target.value)}
                        disabled={isSubmittedToday}
                        className="w-full rounded border border-gray-300 px-4 py-2"
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="mb-3 font-medium">{common('editorContent')}</h3>
              <JoditEditorComponent
                placeholder={common('editorContentPlaceholder')}
                initialValue={editorContent}
                onContentChange={handleContentChange}
                height="300px"
                width="100%"
                disabled={isSubmittedToday}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="submit" disabled={isSubmitting || isSubmittedToday} className="bg-blue-600 text-white hover:bg-blue-700">
                {common('submit')}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DayeeBishoyForm;
