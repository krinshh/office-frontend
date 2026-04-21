// src/navigation.ts
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { locales } from './i18n';

export const routing = defineRouting({
  locales,
  defaultLocale: 'en'
});

export const {
  Link,
  useRouter,
  usePathname,
  redirect
} = createNavigation(routing);

