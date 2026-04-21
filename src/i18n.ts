import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'hi', 'gu'] as const;
export type Locale = typeof locales[number];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  const validLocale = locales.includes(locale as any) ? locale : 'en';

  let messages;
  switch (validLocale) {
    case 'en':
      messages = (await import('../messages/en.json')).default;
      break;
    case 'hi':
      messages = (await import('../messages/hi.json')).default;
      break;
    case 'gu':
      messages = (await import('../messages/gu.json')).default;
      break;
    default:
      messages = (await import('../messages/en.json')).default;
  }

  return {
    messages,
    locale: validLocale as string
  };
});