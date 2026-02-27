"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Locale } from "@/i18n";

interface Slider {
  id: string;
  titleFr: string;
  titleEn: string;
  subtitleFr: string | null;
  subtitleEn: string | null;
  buttonTextFr: string | null;
  buttonTextEn: string | null;
  buttonUrl: string | null;
  imageUrl: string;
  imageAltFr: string | null;
  imageAltEn: string | null;
}

interface HeroSliderProps {
  sliders: Slider[];
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

function HeroSliderSkeleton() {
  return (
    <div className="relative w-full h-[60vh] min-h-[500px]">
      <Skeleton className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <Skeleton className="h-12 w-80 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
          <Skeleton className="h-12 w-32 mx-auto mt-4" />
        </div>
      </div>
    </div>
  );
}

export function HeroSlider({ sliders, locale }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying || sliders.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliders.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, sliders.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + sliders.length) % sliders.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [sliders.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % sliders.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [sliders.length]);

  if (!sliders || sliders.length === 0) {
    return <HeroSliderSkeleton />;
  }

  const currentSlider = sliders[currentIndex];
  const title = getLocalizedText(currentSlider.titleFr, currentSlider.titleEn, locale);
  const subtitle = getLocalizedText(currentSlider.subtitleFr, currentSlider.subtitleEn, locale);
  const buttonText = getLocalizedText(currentSlider.buttonTextFr, currentSlider.buttonTextEn, locale);
  const imageAlt = getLocalizedText(currentSlider.imageAltFr, currentSlider.imageAltEn, locale) || title || "Hero image";

  return (
    <section className="relative w-full h-[70vh] min-h-[550px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
        style={{ backgroundImage: `url(${currentSlider.imageUrl})` }}
      >
        {/* Gradient Overlay with brand colors */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/90 via-[var(--color-primary)]/70 to-[var(--color-primary)]/40" />
        {/* Decorative shape */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Content - offset from arrows */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-16 md:px-20 lg:px-24">
          <div className="max-w-2xl space-y-8">
            {/* Animated title */}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg"
              key={`title-${currentIndex}`}
            >
              <span className="inline-block animate-fade-in-up">{title}</span>
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p
                className="text-lg md:text-xl text-white/90 leading-relaxed drop-shadow-md max-w-xl"
                key={`subtitle-${currentIndex}`}
              >
                {subtitle}
              </p>
            )}

            {/* CTA Button */}
            {buttonText && currentSlider.buttonUrl && (
              <Button
                asChild
                size="lg"
                className="group bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/90 text-white px-8 py-6 text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-full"
              >
                <a href={currentSlider.buttonUrl}>
                  {buttonText}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all duration-300 backdrop-blur-sm hover:scale-110 shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all duration-300 backdrop-blur-sm hover:scale-110 shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Navigation Dots */}
      {sliders.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {sliders.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-10 h-3 bg-[var(--color-secondary)] shadow-lg"
                  : "w-3 h-3 bg-white/50 hover:bg-white/70 hover:scale-125"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? "true" : "false"}
            />
          ))}
        </div>
      )}

      {/* Slide counter */}
      <div className="absolute bottom-8 right-8 text-white/70 text-sm font-medium">
        {currentIndex + 1} / {sliders.length}
      </div>
    </section>
  );
}

export { HeroSliderSkeleton };
