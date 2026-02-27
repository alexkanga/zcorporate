'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, ArrowRight, Folder } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { Metadata } from 'next';

interface Realisation {
  id: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  client: string | null;
  date: Date | null;
  location: string | null;
  imageUrl: string | null;
  featured: boolean;
  category: {
    id: string;
    nameFr: string;
    nameEn: string;
    slug: string;
  } | null;
}

interface Category {
  id: string;
  nameFr: string;
  nameEn: string;
  slug: string;
}

async function fetchRealisations(categoryId?: string) {
  const url = categoryId
    ? `/api/realisations?categoryId=${categoryId}`
    : '/api/realisations';
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

export default function RealisationsPage() {
  const locale = useLocale() as 'fr' | 'en';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['realisations', selectedCategory],
    queryFn: () => fetchRealisations(selectedCategory === 'all' ? undefined : selectedCategory),
  });

  const realisations: Realisation[] = data?.data || [];
  const categories: Category[] = data?.categories || [];

  const getTitle = (item: Realisation) =>
    locale === 'fr' ? item.titleFr : item.titleEn;

  const getDescription = (item: Realisation) =>
    locale === 'fr' ? item.descriptionFr : item.descriptionEn;

  const getCategoryName = (category: Category | null) =>
    category ? (locale === 'fr' ? category.nameFr : category.nameEn) : null;

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--color-primary)]/10 via-background to-[var(--color-secondary)]/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              {locale === 'fr' ? 'Portfolio' : 'Portfolio'}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
              {locale === 'fr' ? 'Nos réalisations' : 'Our Projects'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {locale === 'fr'
                ? 'Découvrez nos projets et réussites'
                : 'Discover our achievements and successes'}
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">
                {locale === 'fr' ? 'Filtrer par :' : 'Filter by:'}
              </span>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={locale === 'fr' ? 'Catégorie' : 'Category'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {locale === 'fr' ? 'Toutes les catégories' : 'All categories'}
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {getCategoryName(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategory !== 'all' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  {locale === 'fr' ? 'Effacer les filtres' : 'Clear filters'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-video w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {locale === 'fr'
                    ? 'Erreur lors du chargement des réalisations'
                    : 'Error loading projects'}
                </p>
              </div>
            ) : realisations.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {locale === 'fr'
                    ? 'Aucune réalisation trouvée'
                    : 'No projects found'}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {realisations.map((realisation) => (
                  <Link
                    key={realisation.id}
                    href={`/realisations/${realisation.id}`}
                  >
                    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        {realisation.imageUrl ? (
                          <img
                            src={realisation.imageUrl}
                            alt={getTitle(realisation)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Folder className="w-12 h-12 text-muted-foreground/30" />
                          </div>
                        )}
                        {realisation.featured && (
                          <Badge className="absolute top-2 right-2 bg-[var(--color-primary)] text-white">
                            {locale === 'fr' ? 'En vedette' : 'Featured'}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {realisation.category && (
                            <Badge variant="outline" className="text-xs">
                              {getCategoryName(realisation.category)}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                          {getTitle(realisation)}
                        </h3>
                        {getDescription(realisation) && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {getDescription(realisation)}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-3">
                            {realisation.date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(realisation.date)}
                              </div>
                            )}
                            {realisation.client && (
                              <span>{realisation.client}</span>
                            )}
                          </div>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              {locale === 'fr'
                ? 'Vous avez un projet en tête ?'
                : 'Have a project in mind?'}
            </h2>
            <p className="text-muted-foreground mb-8">
              {locale === 'fr'
                ? 'Discutons de votre projet et voyons comment nous pouvons vous aider'
                : "Let's discuss your project and see how we can help"}
            </p>
            <Link href="/contact">
              <Button size="lg" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white">
                {locale === 'fr' ? 'Nous contacter' : 'Contact us'}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
