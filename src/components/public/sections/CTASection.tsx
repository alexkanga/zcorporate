"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Mail, Phone } from "lucide-react";
import type { Locale } from "@/i18n";

interface HomeCTA {
  id: string;
  titleFr: string;
  titleEn: string;
  subtitleFr: string | null;
  subtitleEn: string | null;
  buttonTextFr: string | null;
  buttonTextEn: string | null;
  buttonUrl: string | null;
  badgeTextFr: string | null;
  badgeTextEn: string | null;
}

interface SiteSettings {
  id: string;
  email: string | null;
  phone: string | null;
}

interface CTASectionProps {
  homeCTA: HomeCTA | null;
  siteSettings: SiteSettings | null;
  locale: Locale;
}

// Helper to get localized content with FR fallback
function getLocalizedText(
  fr: string | null,
  en: string | null,
  locale: Locale
): string | null {
  if (locale === "en" && en) return en;
  return fr;
}

function CTASectionSkeleton() {
  return (
    <section className="py-16 md:py-24 bg-[var(--color-primary)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          <Skeleton className="h-10 w-96 mx-auto bg-white/20" />
          <Skeleton className="h-6 w-[500px] mx-auto bg-white/20" />
          <Skeleton className="h-12 w-40 mx-auto bg-white/20" />
        </div>
      </div>
    </section>
  );
}

export function CTASection({ homeCTA, siteSettings, locale }: CTASectionProps) {
  if (!homeCTA) {
    return <CTASectionSkeleton />;
  }

  const title = getLocalizedText(homeCTA.titleFr, homeCTA.titleEn, locale);
  const subtitle = getLocalizedText(
    homeCTA.subtitleFr,
    homeCTA.subtitleEn,
    locale
  );
  const buttonText = getLocalizedText(
    homeCTA.buttonTextFr,
    homeCTA.buttonTextEn,
    locale
  );
  const badgeText = getLocalizedText(
    homeCTA.badgeTextFr,
    homeCTA.badgeTextEn,
    locale
  ) || (locale === "en" ? "Get Started Today" : "Commencez Aujourd'hui");
  
  // Use button URL from database or fallback to contact page
  const buttonUrl = homeCTA.buttonUrl || `/${locale === "en" ? "en/" : ""}contact`;
  
  // Use site settings for contact info or fallback to defaults
  const contactEmail = siteSettings?.email || "contact@aaea.org";
  const contactPhone = siteSettings?.phone || "+225 07 00 00 00 00";

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary)]/95 to-[var(--color-secondary)] animate-gradient-x" />
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2 animate-pulse" />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-[var(--color-accent)]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8">
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent-light)] animate-pulse" />
            <span className="text-sm font-medium text-white/90">
              {badgeText}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            {title}
          </h2>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}

          {/* CTA Button */}
          <div className="flex items-center justify-center mb-12">
            <Button
              asChild
              size="lg"
              className="bg-white text-[var(--color-primary)] hover:bg-[var(--color-accent-light)] px-12 py-7 text-lg font-semibold shadow-2xl hover:shadow-white/25 transition-all duration-300 group rounded-full"
            >
              <a href={buttonUrl}>
                {buttonText || (locale === "en" ? "Contact Us" : "Contactez-nous")}
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </a>
            </Button>
          </div>

          {/* Contact info - from site settings */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-white/80">
            {contactEmail && (
              <a 
                href={`mailto:${contactEmail}`} 
                className="flex items-center gap-2 hover:text-white transition-colors group"
              >
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <span>{contactEmail}</span>
              </a>
            )}
            {contactPhone && (
              <a 
                href={`tel:${contactPhone.replace(/\s/g, '')}`} 
                className="flex items-center gap-2 hover:text-white transition-colors group"
              >
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
                <span>{contactPhone}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export { CTASectionSkeleton };
