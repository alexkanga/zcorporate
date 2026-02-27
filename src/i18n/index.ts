// i18n configuration exports
export { routing, Link, redirect, usePathname, useRouter, getPathname } from './routing';

// Type exports for use throughout the app
export type Locale = 'fr' | 'en';

// Locale configuration constants
export const locales = ['fr', 'en'] as const;
export const defaultLocale = 'fr' as const;

// Locale display names for language switcher
export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
};

// Locale flag emojis for visual display
export const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
};
