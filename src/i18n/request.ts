import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { locales, defaultLocale, type Locale } from './index';

export default getRequestConfig(async ({ requestLocale }) => {
  // Get the requested locale
  let locale = await requestLocale;
  
  // Validate the locale
  if (!locale || !hasLocale(locales, locale)) {
    locale = defaultLocale;
  }

  // Load messages for the locale
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    // Fallback to default locale messages
    messages = (await import(`../../messages/fr.json`)).default;
  }

  return {
    locale,
    messages,
  };
});
