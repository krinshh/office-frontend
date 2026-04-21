import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { OfficesClient } from '@/components/dashboard/offices/OfficesClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'offices' });
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default function OfficesPage() {
  return <OfficesClient />;
}