import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { locales, type Locale, defaultLocale } from "@/i18n";
import { LocaleProviders } from "@/components/providers/LocaleProviders";
import { getSiteSettings, getSiteName, getMenuItems } from "@/lib/site-settings";
import type { Metadata } from "next";

// Import messages directly
import messagesFr from "@/../messages/fr.json";
import messagesEn from "@/../messages/en.json";

const messages: Record<string, Record<string, unknown>> = {
  fr: messagesFr,
  en: messagesEn,
};

// Force dynamic rendering to ensure colors are always fresh
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getSiteSettings();
  const siteName = getSiteName(settings, locale as Locale);
  const description =
    locale === "fr" ? settings.siteDescriptionFr : settings.siteDescriptionEn;

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: description || undefined,
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering for next-intl
  setRequestLocale(locale);

  // Get messages directly from imported JSON files
  const localeMessages = messages[locale] || messages[defaultLocale];

  // Fetch site settings and menu items (fresh on every request due to force-dynamic)
  const settings = await getSiteSettings();
  const menuItems = await getMenuItems("HEADER");
  const footerMenuItems = await getMenuItems("FOOTER");

  return (
    <LocaleProviders
      locale={locale}
      messages={localeMessages}
      settings={settings}
      menuItems={menuItems}
      footerMenuItems={footerMenuItems}
    >
      {children}
    </LocaleProviders>
  );
}
