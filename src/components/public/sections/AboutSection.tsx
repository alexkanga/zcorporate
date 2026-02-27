"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Play } from "lucide-react";
import type { Locale } from "@/i18n";

interface HomeAbout {
  id: string;
  titleFr: string;
  titleEn: string;
  contentFr: string;
  contentEn: string;
  imageUrl: string | null;
  imageAltFr: string | null;
  imageAltEn: string | null;
  buttonTextFr: string | null;
  buttonTextEn: string | null;
  buttonUrl: string | null;
  // Badge text
  badgeTextFr: string | null;
  badgeTextEn: string | null;
  // Statistics
  stat1Value: string | null;
  stat1LabelFr: string | null;
  stat1LabelEn: string | null;
  stat2Value: string | null;
  stat2LabelFr: string | null;
  stat2LabelEn: string | null;
  stat3Value: string | null;
  stat3LabelFr: string | null;
  stat3LabelEn: string | null;
  // Floating badge
  floatingBadgeTitleFr: string | null;
  floatingBadgeTitleEn: string | null;
  floatingBadgeTextFr: string | null;
  floatingBadgeTextEn: string | null;
}

interface AboutSectionProps {
  homeAbout: HomeAbout | null;
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

function AboutSectionSkeleton() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-12 w-32 mt-4" />
          </div>
          <div className="order-1 lg:order-2">
            <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutSection({ homeAbout, locale }: AboutSectionProps) {
  if (!homeAbout) {
    return <AboutSectionSkeleton />;
  }

  const title = getLocalizedText(homeAbout.titleFr, homeAbout.titleEn, locale);
  const content = getLocalizedText(homeAbout.contentFr, homeAbout.contentEn, locale);
  const buttonText = getLocalizedText(homeAbout.buttonTextFr, homeAbout.buttonTextEn, locale);
  const imageAlt = getLocalizedText(homeAbout.imageAltFr, homeAbout.imageAltEn, locale) || title || "About image";
  const badgeText = getLocalizedText(homeAbout.badgeTextFr, homeAbout.badgeTextEn, locale) || (locale === "en" ? "About Us" : "À Propos");
  
  // Statistics from database
  const stat1Label = getLocalizedText(homeAbout.stat1LabelFr, homeAbout.stat1LabelEn, locale);
  const stat2Label = getLocalizedText(homeAbout.stat2LabelFr, homeAbout.stat2LabelEn, locale);
  const stat3Label = getLocalizedText(homeAbout.stat3LabelFr, homeAbout.stat3LabelEn, locale);
  
  // Floating badge from database
  const floatingBadgeTitle = getLocalizedText(homeAbout.floatingBadgeTitleFr, homeAbout.floatingBadgeTitleEn, locale);
  const floatingBadgeText = getLocalizedText(homeAbout.floatingBadgeTextFr, homeAbout.floatingBadgeTextEn, locale);

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--color-primary)]/5 to-transparent" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-accent)]/5 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1 space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)]/10 rounded-full">
              <span className="h-2 w-2 rounded-full bg-[var(--color-secondary)] animate-pulse" />
              <span className="text-sm font-medium text-[var(--color-primary)]">
                {badgeText}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-primary)] leading-tight">
              {title}
            </h2>

            {/* Content */}
            {content && (
              <div
                className="text-gray-600 text-lg leading-relaxed prose prose-lg max-w-none prose-p:text-gray-600 prose-headings:text-[var(--color-primary)] prose-a:text-[var(--color-accent)] prose-a:no-underline hover:prose-a:text-[var(--color-primary)]"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}

            {/* CTA Button */}
            {buttonText && homeAbout.buttonUrl && (
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 group rounded-full px-8"
                >
                  <a href={homeAbout.buttonUrl}>
                    {buttonText}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
              </div>
            )}

            {/* Stats - from database */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-[var(--color-primary)]">{homeAbout.stat1Value || "10+"}</div>
                <div className="text-sm text-gray-500">{stat1Label || (locale === "en" ? "Years Experience" : "Ans d'Expérience")}</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-[var(--color-primary)]">{homeAbout.stat2Value || "500+"}</div>
                <div className="text-sm text-gray-500">{stat2Label || (locale === "en" ? "Projects Completed" : "Projets Réalisés")}</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-[var(--color-primary)]">{homeAbout.stat3Value || "100%"}</div>
                <div className="text-sm text-gray-500">{stat3Label || (locale === "en" ? "Client Satisfaction" : "Clients Satisfaits")}</div>
              </div>
            </div>
          </div>

          {/* Image */}
          {homeAbout.imageUrl && (
            <div className="order-1 lg:order-2 relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={homeAbout.imageUrl}
                  alt={imageAlt || ""}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)]/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                
                {/* Floating badge - from database */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-lg">
                      ✓
                    </div>
                    <div>
                      <div className="font-bold text-[var(--color-primary)]">
                        {floatingBadgeTitle || (locale === "en" ? "Certified Excellence" : "Excellence Certifiée")}
                      </div>
                      <div className="text-sm text-gray-500">
                        {floatingBadgeText || (locale === "en" ? "Quality guaranteed" : "Qualité garantie")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[var(--color-accent)]/20 rounded-2xl -z-10 rotate-6" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[var(--color-primary)]/10 rounded-2xl -z-10 -rotate-6" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export { AboutSectionSkeleton };
