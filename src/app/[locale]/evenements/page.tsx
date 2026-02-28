'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Calendar,
  MapPin,
  Play,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  CalendarDays,
} from 'lucide-react';

interface Event {
  id: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  date: string;
  endDate: string | null;
  location: string | null;
  imageUrl: string | null;
  gallery: string[];
  videos: string[];
  createdAt: string;
}

interface EventsResponse {
  data: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function fetchEvents(params: { page: number; filter?: string }): Promise<EventsResponse> {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    limit: '6',
    ...(params.filter && { filter: params.filter }),
  });

  const response = await fetch(`/api/events?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
}

const getYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Pagination component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = useMemo(() => {
    const items: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);
      if (currentPage > 3) items.push('ellipsis');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) items.push(i);
      
      if (currentPage < totalPages - 2) items.push('ellipsis');
      items.push(totalPages);
    }
    
    return items;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-9 w-9 border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((page, index) => {
        if (page === 'ellipsis') {
          return <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>;
        }
        const isActive = page === currentPage;
        return (
          <Button
            key={page}
            variant={isActive ? 'default' : 'outline'}
            size="icon"
            onClick={() => onPageChange(page)}
            className={isActive
              ? 'h-9 w-9 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90'
              : 'h-9 w-9 border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)]'
            }
          >
            {page}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 w-9 border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] disabled:opacity-50"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function EventsPage() {
  const locale = useLocale() as 'fr' | 'en';
  const [activeTab, setActiveTab] = useState<string>('all');
  const [page, setPage] = useState(1);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['events', page, activeTab],
    queryFn: () => fetchEvents({
      page,
      filter: activeTab === 'all' ? undefined : activeTab,
    }),
  });

  const events: Event[] = data?.data || [];
  const pagination = data?.pagination;

  const getTitle = (item: Event) =>
    locale === 'fr' ? item.titleFr : item.titleEn;

  const getDescription = (item: Event) =>
    locale === 'fr' ? item.descriptionFr : item.descriptionEn;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    const total = lightboxImages.length;
    if (direction === 'prev') {
      setLightboxIndex((prev) => (prev - 1 + total) % total);
    } else {
      setLightboxIndex((prev) => (prev + 1) % total);
    }
  };

  const openVideo = (url: string) => {
    const videoId = getYouTubeId(url);
    if (videoId) {
      setActiveVideoId(videoId);
      setVideoDialogOpen(true);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--color-primary)]/10 via-background to-[var(--color-secondary)]/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              {locale === 'fr' ? 'Agenda' : 'Agenda'}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
              {locale === 'fr' ? 'Événements' : 'Events'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {locale === 'fr'
                ? 'Restez informé de nos événements à venir'
                : 'Stay informed about our upcoming events'}
            </p>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  {locale === 'fr' ? 'Tous' : 'All'}
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="flex items-center gap-2">
                  {locale === 'fr' ? 'À venir' : 'Upcoming'}
                </TabsTrigger>
                <TabsTrigger value="past" className="flex items-center gap-2">
                  {locale === 'fr' ? 'Passés' : 'Past'}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="space-y-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <Skeleton className="w-full md:w-64 aspect-video rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-8 w-3/4 mb-4" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-2/3 mb-4" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {locale === 'fr'
                    ? 'Erreur lors du chargement des événements'
                    : 'Error loading events'}
                </p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {locale === 'fr'
                    ? 'Aucun événement trouvé'
                    : 'No events found'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-8">
                  {events.map((event) => {
                    const upcoming = isUpcoming(event.date);
                    const allImages = [...(event.gallery || [])];
                    if (event.imageUrl && !allImages.includes(event.imageUrl)) {
                      allImages.unshift(event.imageUrl);
                    }
                    const videos = event.videos || [];

                    return (
                      <Card key={event.id} className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Image */}
                            <div className="lg:w-80 flex-shrink-0">
                              {event.imageUrl ? (
                                <div
                                  className="aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer"
                                  onClick={() => openLightbox(allImages, 0)}
                                >
                                  <img
                                    src={event.imageUrl}
                                    alt={getTitle(event)}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                                  />
                                </div>
                              ) : (
                                <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                                  <Calendar className="w-12 h-12 text-muted-foreground/30" />
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={upcoming ? 'default' : 'secondary'}>
                                  {upcoming
                                    ? locale === 'fr' ? 'À venir' : 'Upcoming'
                                    : locale === 'fr' ? 'Passé' : 'Past'}
                                </Badge>
                              </div>
                              <h2 className="text-2xl font-bold mb-3">{getTitle(event)}</h2>

                              {/* Meta Info */}
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(event.date)}
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {event.location}
                                  </div>
                                )}
                              </div>

                              {/* Description */}
                              {getDescription(event) && (
                                <p className="text-muted-foreground mb-4 line-clamp-2">
                                  {getDescription(event)}
                                </p>
                              )}

                              {/* Media Actions */}
                              <div className="flex flex-wrap gap-2">
                                {allImages.length > 1 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openLightbox(allImages, 0)}
                                  >
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    {locale === 'fr' ? 'Photos' : 'Photos'} ({allImages.length})
                                  </Button>
                                )}
                                {videos.length > 0 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openVideo(videos[0])}
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    {locale === 'fr' ? 'Vidéos' : 'Videos'} ({videos.length})
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination && (
                  <Pagination
                    currentPage={page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Image Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {lightboxImages.length > 1 && (
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

            {lightboxImages[lightboxIndex] && (
              <img
                src={lightboxImages[lightboxIndex]}
                alt=""
                className="max-w-full max-h-full object-contain"
              />
            )}

            {lightboxImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                {lightboxIndex + 1} / {lightboxImages.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black border-none">
          <div className="relative aspect-video">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-white/10 z-10"
              onClick={() => setVideoDialogOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            {activeVideoId && (
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
