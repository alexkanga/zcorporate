import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './src/i18n';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = requestLocale ?? defaultLocale;
  
  if (!locales.includes(locale as 'fr' | 'en')) {
    locale = defaultLocale;
  }

  const messages = (await import(`./messages/${locale}.json`)).default;

  return {
    locale,
    messages,
    timeZone: 'Europe/Paris',
  };
});
