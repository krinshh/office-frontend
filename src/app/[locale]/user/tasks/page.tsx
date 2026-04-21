import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { UserTasksClient } from '@/components/user/tasks/UserTasksClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'tasks' });
  return {
    title: `${t('myTasksTitle')} | Office Management`,
    description: t('myTasksSubtitle'),
  };
}

export default function UserTasksPage() {
  return <UserTasksClient />;
}
