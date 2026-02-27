"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { NextIntlClientProvider } from "next-intl";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Toaster } from "@/components/ui/toaster";
import type { MenuItem, SiteSettings } from "@prisma/client";

interface LocaleProvidersProps {
  locale: string;
  messages: Record<string, unknown>;
  settings: Pick<
    SiteSettings,
    | "logoUrl"
    | "color1"
    | "color2"
    | "color3"
    | "color4"
    | "siteNameFr"
    | "siteNameEn"
    | "address"
    | "email"
    | "phone"
    | "phone2"
    | "workingHoursFr"
    | "workingHoursEn"
    | "socialLinks"
  >;
  menuItems: MenuItem[];
  footerMenuItems: MenuItem[];
  children: React.ReactNode;
}

export function LocaleProviders({
  locale,
  messages,
  settings,
  menuItems,
  footerMenuItems,
  children,
}: LocaleProvidersProps) {
  const siteName = locale === "fr" ? settings.siteNameFr : settings.siteNameEn;

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <Header
              logoUrl={settings.logoUrl}
              siteName={siteName}
              menuItems={menuItems}
            />
            <main className="flex-1">{children}</main>
            <Footer
              logoUrl={settings.logoUrl}
              siteName={siteName}
              settings={settings}
              menuItems={footerMenuItems}
            />
            <Toaster />
          </NextIntlClientProvider>
        </QueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
