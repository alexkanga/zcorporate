"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ExternalLink, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n";

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  website: string | null;
}

interface PartnersSectionProps {
  partners: Partner[];
  locale: Locale;
}

function PartnerLogoSkeleton() {
  return (
    <div className="flex items-center justify-center p-6 bg-white rounded-xl min-w-[200px]">
      <Skeleton className="h-12 w-24" />
    </div>
  );
}

function PartnersSectionSkeleton() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="flex gap-6 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <PartnerLogoSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function PartnersSection({ partners, locale }: PartnersSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate partners multiple times for seamless infinite scroll
  const duplicatedPartners = [...partners, ...partners, ...partners];

  const checkScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || isPaused) return;

    autoScrollIntervalRef.current = setInterval(() => {
      if (container) {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        
        // Reset to beginning when reaching end
        if (scrollLeft >= scrollWidth - clientWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: 1, behavior: 'auto' });
        }
        checkScrollButtons();
      }
    }, 30); // Smooth slow scroll

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [isPaused, checkScrollButtons]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      checkScrollButtons();
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, [partners, checkScrollButtons]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 250;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  if (!partners || partners.length === 0) {
    return <PartnersSectionSkeleton />;
  }

  const title = locale === "en" ? "Our Partners" : "Nos Partenaires";
  const subtitle =
    locale === "en"
      ? "Trusted by leading organizations worldwide"
      : "Ils nous font confiance à travers le monde";
  const becomePartner = locale === "en" ? "Become a Partner" : "Devenir Partenaire";

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-[var(--color-accent)]/5 rounded-full -translate-x-1/2 blur-3xl" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full translate-x-1/2 blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
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

        {/* Carousel Container with Arrows */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Left Arrow - Always visible */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={cn(
              "flex-shrink-0 h-12 w-12 md:h-14 md:w-14 rounded-full bg-white shadow-lg border flex items-center justify-center transition-all duration-300",
              canScrollLeft 
                ? "border-[var(--color-primary)]/20 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white hover:scale-110 cursor-pointer" 
                : "border-gray-200 text-gray-300 cursor-not-allowed opacity-50"
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex-1 flex gap-6 overflow-x-auto scrollbar-hide py-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {duplicatedPartners.map((partner, index) => {
              const content = (
                <div 
                  className="group relative flex flex-col items-center justify-center p-4 md:p-6 bg-white rounded-xl border border-gray-100 hover:border-[var(--color-primary)]/30 hover:shadow-xl transition-all duration-500 min-w-[140px] md:min-w-[180px] cursor-pointer flex-shrink-0"
                  key={`${partner.id}-${index}`}
                >
                  {/* Logo with opacity effect */}
                  <div className="relative h-16 w-24 md:h-20 md:w-32 flex items-center justify-center mb-2">
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      className="max-h-full max-w-full object-contain opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                    />
                  </div>

                  {/* Partner name */}
                  <p className="text-xs text-gray-400 text-center font-medium group-hover:text-[var(--color-primary)] transition-colors duration-300 line-clamp-2">
                    {partner.name}
                  </p>

                  {/* Hover overlay with link icon */}
                  {partner.website && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="h-6 w-6 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                        <ExternalLink className="h-3 w-3 text-[var(--color-primary)]" />
                      </div>
                    </div>
                  )}
                </div>
              );

              // Wrap with link if website exists
              if (partner.website) {
                return (
                  <a
                    key={`${partner.id}-${index}`}
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={partner.name}
                  >
                    {content}
                  </a>
                );
              }

              return content;
            })}
          </div>

          {/* Right Arrow - Always visible */}
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={cn(
              "flex-shrink-0 h-12 w-12 md:h-14 md:w-14 rounded-full bg-white shadow-lg border flex items-center justify-center transition-all duration-300",
              canScrollRight 
                ? "border-[var(--color-primary)]/20 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white hover:scale-110 cursor-pointer" 
                : "border-gray-200 text-gray-300 cursor-not-allowed opacity-50"
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
          </button>
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-12">
          <Button
            asChild
            className="bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white shadow-lg hover:shadow-xl transition-all duration-300 group rounded-full px-8 py-3"
          >
            <a href={`/${locale === "en" ? "en/" : ""}contact`}>
              {becomePartner}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
        </div>

        {/* Decorative bottom border */}
        <div className="mt-16 flex items-center justify-center">
          <div className="h-1 w-48 bg-gradient-to-r from-transparent via-[var(--color-primary)]/30 to-transparent rounded-full" />
        </div>
      </div>

      {/* Hide scrollbar style */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

export { PartnersSectionSkeleton };
