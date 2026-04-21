import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { SalaryClient } from '@/components/dashboard/salary/SalaryClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'salary' });
  return {
    title: `${t('title')} | Office Management`,
    description: t('subtitle'),
  };
}

export default function SalaryPage() {
  return <SalaryClient />;
}