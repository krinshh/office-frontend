import { getMessages } from 'next-intl/server';
import { Metadata } from 'next';
import { AuditClient } from '@/components/dashboard/audit/AuditClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const messages: any = await getMessages({ locale });
  const t = messages.audit;
  return {
    title: `${t.title} | Office Management`,
    description: t.subtitle,
  };
}

export default function AuditPage() {
  return <AuditClient />;
}
