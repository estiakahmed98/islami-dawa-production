// app/[locale]/comparison/page.tsx
import ComparisonDataComponent from '@/components/ComparisonData';
import React from 'react';
import { useTranslations } from 'next-intl';

const ComparisonPage: React.FC = () => {
  const t = useTranslations('comparison.page');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">{t('title')}</h1>
      <p className="text-muted-foreground mb-4">{t('subtitle')}</p>
      <ComparisonDataComponent />
    </div>
  );
};

export default ComparisonPage;