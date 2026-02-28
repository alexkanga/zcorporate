'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { Metadata } from 'next';

interface RealisationDetail {
  id: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  client: string | null;
  date: Date | null;
  location: string | null;
  imageUrl: string | null;
  gallery: string[];
  featured: boolean;
  category: {
    id: string;
    nameFr: string;
    nameEn: string;
    slug: string;
  } | null;
}

async function fetchRealisation(id: string) {
  const response = await fetch(`/api/realisations/${id}`);
  const data = await response.json();
  return data;
}

export default function RealisationDetailPage() {
  const locale = useLocale() as 'fr' | 'en';
  const params = useParams();
  const id = params.id as string;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['realisation', id],
    queryFn: () => fetchRealisation(id),
    enabled: !!id,
  });

  const realisation: RealisationDetail | null = data?.data;

  const getTitle = () =>
    realisation ? (locale === 'fr' ? realisation.titleFr : realisation.titleEn) : '';

  const getDescription = () =>
    realisation ? (locale === 'fr' ? realisation.descriptionFr : realisation.descriptionEn) : null;

  const getCategoryName = () =>
    realisation?.category
      ? locale === 'fr'
        ? realisation.category.nameFr
        : realisation.category.nameEn
      : null;

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!realisation?.gallery) return;
    const total = realisation.gallery.length;
    if (direction === 'prev') {
      setLightboxIndex((prev) => (prev - 1 + total) % total);
    } else {
      setLightboxIndex((prev) => (prev + 1) % total);
    }
  };

  const allImages = realisation?.gallery || [];
  if (realisation?.imageUrl && !allImages.includes(realisation.imageUrl)) {
    allImages.unshift(realisation.imageUrl);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="aspect-video w-full mb-8 rounded-lg" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !realisation) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">
              {locale === 'fr' ? 'Réalisation non trouvée' : 'Project not found'}
            </h1>
            <Link href="/realisations">
              <Button variant="outline">
                <ArrowLeft className="mr-2 w-4 h-4" />
                {locale === 'fr' ? 'Retour aux réalisations' : 'Back to projects'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link
            href="/realisations"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            {locale === 'fr' ? 'Retour aux réalisations' : 'Back to projects'}
          </Link>

          {/* Main Image */}
          <div className="mb-8">
            {realisation.imageUrl ? (
              <div
                className="aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer"
                onClick={() => openLightbox(0)}
              >
                <img
                  src={realisation.imageUrl}
                  alt={getTitle()}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {realisation.category && (
                <Badge variant="outline">{getCategoryName()}</Badge>
              )}
              {realisation.featured && (
                <Badge className="bg-[var(--color-primary)] text-white">
                  {locale === 'fr' ? 'À la une' : 'Featured'}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{getTitle()}</h1>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {realisation.date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(realisation.date)}
                </div>
              )}
              {realisation.client && (
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {realisation.client}
                </div>
              )}
              {realisation.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {realisation.location}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {getDescription() && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{getDescription()}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gallery */}
          {allImages.length > 1 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                {locale === 'fr' ? 'Galerie' : 'Gallery'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {allImages.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={image}
                      alt={`${getTitle()} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <Card className="bg-muted/30">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                {locale === 'fr'
                  ? 'Vous avez un projet similaire ?'
                  : 'Have a similar project?'}
              </p>
              <Link href="/contact">
                <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white">
                  {locale === 'fr' ? 'Contactez-nous' : 'Contact us'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation Buttons */}
            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 text-white hover:bg-white/10 z-10"
                  onClick={() => navigateLightbox('prev')}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 text-white hover:bg-white/10 z-10"
                  onClick={() => navigateLightbox('next')}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            {/* Image */}
            {allImages[lightboxIndex] && (
              <img
                src={allImages[lightboxIndex]}
                alt={getTitle()}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Counter */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                {lightboxIndex + 1} / {allImages.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
