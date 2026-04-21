import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { UserAttendanceClient } from '@/components/user/attendance/UserAttendanceClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'userAttendance' });
  return {
    title: `${t('title')} | Office Management`,
    description: t('subtitle'),
  };
}

export default function UserAttendancePage() {
  return <UserAttendanceClient />;
}