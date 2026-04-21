import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { Providers } from '@/components/Providers';
import { Suspense } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Office Management System",
    description: "Manage staff tasks, attendance, and salary calculations",
  };
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'hi' }, { locale: 'gu' }];
}

async function loadMessages(locale: string) {
  switch (locale) {
    case 'en':
      return (await import('../../../messages/en.json')).default;
    case 'hi':
      return (await import('../../../messages/hi.json')).default;
    case 'gu':
      return (await import('../../../messages/gu.json')).default;
    default:
      return (await import('../../../messages/en.json')).default;
  }
}

export default function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  return (
    <LayoutContent params={params}>
      {children}
    </LayoutContent>
  );
}

async function LayoutContent({ 
  children, 
  params 
}: { 
  children: React.ReactNode, 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  const messages = await loadMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>
        {children}
      </Providers>
    </NextIntlClientProvider>
  );
}
