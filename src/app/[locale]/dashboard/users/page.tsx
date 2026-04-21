import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { UsersClient } from '@/components/dashboard/users/UsersClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'users' });
  return {
    title: `${t('title')} | Office Management`,
    description: t('subtitle'),
  };
}

export default function UsersPage() {
  return <UsersClient />;
}
