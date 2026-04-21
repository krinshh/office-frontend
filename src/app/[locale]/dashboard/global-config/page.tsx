import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { GlobalConfigClient } from '@/components/dashboard/global-config/GlobalConfigClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'globalConfig' });
  return {
    title: `${t('title')} | Office Management`,
    description: t('subtitle'),
  };
}

export default function GlobalConfigPage() {
  return <GlobalConfigClient />;
}