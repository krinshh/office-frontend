import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { AttendanceClient } from '@/components/dashboard/attendance/AttendanceClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'attendance' });
  return {
    title: `${t('title')} | Office Management`,
    description: t('subtitle'),
  };
}

export default function AttendancePage() {
  return <AttendanceClient />;
}