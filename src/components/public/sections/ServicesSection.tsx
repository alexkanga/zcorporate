"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Locale } from "@/i18n";

interface Service {
  id: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  icon: string | null;
  imageUrl: string | null;
  imageAltFr: string | null;
  imageAltEn: string | null;
}

interface SectionData {
  id: string;
  titleFr: string | null;
  titleEn: string | null;
  subtitleFr: string | null;
  subtitleEn: string | null;
  buttonTextFr: string | null;
  buttonTextEn: string | null;
  buttonUrl: string | null;
}

interface ServicesSectionProps {
  services: Service[];
  sectionData: SectionData | null;
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

// Helper to get Lucide icon component by name
function getIconComponent(iconName: string | null): LucideIcon | null {
  if (!iconName) return null;

  const pascalCase = iconName
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");

  const IconComponent = (Icons as Record<string, LucideIcon>)[pascalCase];
  return IconComponent || null;
}

function ServiceCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <Skeleton className="h-12 w-12 rounded-lg mb-4" />
        <Skeleton className="h-6 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

function ServicesSectionSkeleton() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServicesSection({ services, sectionData, locale }: ServicesSectionProps) {
  if (!services || services.length === 0) {
    return <ServicesSectionSkeleton />;
  }

  // Use section data from database, fallback to defaults
  const title = getLocalizedText(sectionData?.titleFr, sectionData?.titleEn, locale) 
    || (locale === "en" ? "Our Services" : "Nos Services");
  const subtitle = getLocalizedText(sectionData?.subtitleFr, sectionData?.subtitleEn, locale)
    || (locale === "en"
      ? "Discover our comprehensive range of services designed to meet your needs"
      : "Découvrez notre gamme complète de services conçus pour répondre à vos besoins");
  const learnMore = locale === "en" ? "Learn more" : "En savoir plus";

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-20" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="h-1 w-12 bg-[var(--color-secondary)] mx-auto rounded-full" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-primary)] mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const serviceTitle = getLocalizedText(
              service.titleFr,
              service.titleEn,
              locale
            );
            const description = getLocalizedText(
              service.descriptionFr,
              service.descriptionEn,
              locale
            );
            const IconComponent = getIconComponent(service.icon);

            return (
              <Card
                key={service.id}
                className="group relative h-full bg-white border-2 border-gray-100 hover:border-[var(--color-primary)]/30 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--color-primary)]/10 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/0 to-[var(--color-accent)]/0 group-hover:from-[var(--color-primary)]/5 group-hover:to-[var(--color-accent)]/5 transition-all duration-500" />
                
                <CardContent className="relative p-8">
                  {/* Icon */}
                  <div className="mb-6">
                    {IconComponent ? (
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 text-[var(--color-primary)] group-hover:from-[var(--color-primary)] group-hover:to-[var(--color-secondary)] group-hover:text-white transition-all duration-500 shadow-lg group-hover:shadow-xl group-hover:scale-110 transform">
                        <IconComponent className="h-8 w-8" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 text-[var(--color-primary)] group-hover:from-[var(--color-primary)] group-hover:to-[var(--color-secondary)] group-hover:text-white transition-all duration-500 shadow-lg group-hover:shadow-xl group-hover:scale-110 transform">
                        <Icons.Star className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-[var(--color-primary)] transition-colors duration-300">
                    {serviceTitle}
                  </h3>

                  {/* Description */}
                  {description && (
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {description}
                    </p>
                  )}

                  {/* Read more indicator */}
                  <div className="flex items-center text-[var(--color-accent)] text-sm font-medium group-hover:text-[var(--color-primary)] transition-colors duration-300">
                    <span>{learnMore}</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>

                  {/* Image (optional) */}
                  {service.imageUrl && (
                    <div className="mt-6 rounded-xl overflow-hidden">
                      <img
                        src={service.imageUrl}
                        alt={
                          getLocalizedText(
                            service.imageAltFr,
                            service.imageAltEn,
                            locale
                          ) || serviceTitle || ""
                        }
                        className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { ServicesSectionSkeleton };
