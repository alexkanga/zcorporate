"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { Locale } from "@/i18n";

interface Testimonial {
  id: string;
  name: string;
  company: string | null;
  textFr: string;
  textEn: string;
  avatar: string | null;
  rating: number;
}

interface SectionData {
  id: string;
  titleFr: string | null;
  titleEn: string | null;
  subtitleFr: string | null;
  subtitleEn: string | null;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
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

// Helper to render star rating
function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 transition-all duration-300 ${
            i < rating
              ? "text-amber-400 fill-amber-400 drop-shadow-sm"
              : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function TestimonialCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-5" />
          ))}
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-6" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TestimonialsSectionSkeleton() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <TestimonialCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection({
  testimonials,
  sectionData,
  locale,
}: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const visibleCount = 3;
  const totalSlides = Math.ceil(testimonials.length / visibleCount);

  useEffect(() => {
    if (!isAutoPlaying || totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalSlides]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [totalSlides]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [totalSlides]);

  if (!testimonials || testimonials.length === 0) {
    return <TestimonialsSectionSkeleton />;
  }

  // Use section data from database, fallback to defaults
  const title = getLocalizedText(sectionData?.titleFr, sectionData?.titleEn, locale) 
    || (locale === "en" ? "What Our Clients Say" : "Ce Que Disent Nos Clients");
  const subtitle = getLocalizedText(sectionData?.subtitleFr, sectionData?.subtitleEn, locale)
    || (locale === "en"
      ? "Discover testimonials from our satisfied partners"
      : "Découvrez les témoignages de nos partenaires satisfaits");

  const startIndex = currentIndex * visibleCount;
  const visibleTestimonials = testimonials.slice(
    startIndex,
    startIndex + visibleCount
  );

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-accent)]/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
      
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

        {/* Testimonials Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-8 z-10 p-3 rounded-full bg-white shadow-xl border-2 border-gray-100 hover:border-[var(--color-primary)] hover:shadow-2xl hover:scale-110 transition-all duration-300 group"
                aria-label="Previous testimonials"
              >
                <ChevronLeft className="h-6 w-6 text-gray-600 group-hover:text-[var(--color-primary)] transition-colors" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-8 z-10 p-3 rounded-full bg-white shadow-xl border-2 border-gray-100 hover:border-[var(--color-primary)] hover:shadow-2xl hover:scale-110 transition-all duration-300 group"
                aria-label="Next testimonials"
              >
                <ChevronRight className="h-6 w-6 text-gray-600 group-hover:text-[var(--color-primary)] transition-colors" />
              </button>
            </>
          )}

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleTestimonials.map((testimonial, index) => {
              const text = getLocalizedText(
                testimonial.textFr,
                testimonial.textEn,
                locale
              );

              const initials = testimonial.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <Card
                  key={testimonial.id}
                  className="h-full bg-white border-2 border-gray-100 hover:border-[var(--color-primary)]/30 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--color-primary)]/10 hover:-translate-y-2 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-8 relative">
                    {/* Quote Icon */}
                    <Quote className="h-12 w-12 text-[var(--color-accent)]/20 mb-4 group-hover:text-[var(--color-primary)]/30 group-hover:scale-110 transition-all duration-300" />

                    {/* Rating */}
                    <div className="mb-4">
                      {renderStars(testimonial.rating)}
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-gray-600 leading-relaxed mb-8 text-lg italic">
                      &ldquo;{text}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                      <Avatar className="h-14 w-14 border-3 border-[var(--color-accent)]/30 group-hover:border-[var(--color-primary)] transition-all duration-300 shadow-lg group-hover:scale-110">
                        <AvatarImage
                          src={testimonial.avatar || undefined}
                          alt={testimonial.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold text-lg">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-gray-800 text-lg group-hover:text-[var(--color-primary)] transition-colors">
                          {testimonial.name}
                        </p>
                        {testimonial.company && (
                          <p className="text-sm text-gray-500">
                            {testimonial.company}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination Dots */}
          {totalSlides > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAutoPlaying(false);
                    setTimeout(() => setIsAutoPlaying(true), 10000);
                  }}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-10 h-3 bg-[var(--color-primary)] shadow-lg"
                      : "w-3 h-3 bg-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/40 hover:scale-125"
                  }`}
                  aria-label={`Go to testimonials page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export { TestimonialsSectionSkeleton };
