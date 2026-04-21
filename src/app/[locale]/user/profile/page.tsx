import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ProfileClient } from '@/components/user/profile/ProfileClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'userProfile' });
  return {
    title: `${t('title')} | Office Management`,
    description: t('subtitle')
  };
}

export default function UserProfilePage() {
  return <ProfileClient />;
}
