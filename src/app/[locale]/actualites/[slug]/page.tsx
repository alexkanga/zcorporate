'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Calendar,
  User,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Play,
  Video,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface ArticleDetail {
  id: string;
  titleFr: string;
  titleEn: string;
  slug: string;
  contentFr: string;
  contentEn: string;
  excerptFr: string | null;
  excerptEn: string | null;
  imageUrl: string | null;
  imageAltFr: string | null;
  imageAltEn: string | null;
  gallery: string[];
  videos: string[];
  publishedAt: Date | null;
  featured: boolean;
  author: {
    id: string;
    name: string | null;
  } | null;
  category: {
    id: string;
    nameFr: string;
    nameEn: string;
    slug: string;
  } | null;
}

interface VideoInfo {
  url: string;
  type: 'youtube' | 'vimeo' | 'dailymotion' | 'direct';
  id: string | null;
  thumbnail: string | null;
  embedUrl: string | null;
}

async function fetchArticle(slug: string): Promise<{ data: ArticleDetail | null }> {
  const response = await fetch(`/api/articles/${slug}`);
  if (!response.ok) throw new Error('Failed to fetch article');
  return response.json();
}

// Get YouTube video ID
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^"&?\/\s]{11})/,
    /youtube\.com\/shorts\/([^"&?\/\s]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Get Vimeo video ID
function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

// Get Dailymotion video ID
function getDailymotionId(url: string): string | null {
  const patterns = [
    /dailymotion\.com\/video\/([^&_]+)/,
    /dai\.ly\/([^&]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Get video info including thumbnail and embed URL
function getVideoInfo(url: string): VideoInfo {
  const youtubeId = getYouTubeId(url);
  if (youtubeId) {
    return {
      url,
      type: 'youtube',
      id: youtubeId,
      thumbnail: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}?autoplay=1`,
    };
  }

  const vimeoId = getVimeoId(url);
  if (vimeoId) {
    return {
      url,
      type: 'vimeo',
      id: vimeoId,
      // Vimeo thumbnail requires API call, use placeholder
      thumbnail: null,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
    };
  }

  const dailymotionId = getDailymotionId(url);
  if (dailymotionId) {
    return {
      url,
      type: 'dailymotion',
      id: dailymotionId,
      thumbnail: `https://www.dailymotion.com/thumbnail/video/${dailymotionId}`,
      embedUrl: `https://www.dailymotion.com/embed/video/${dailymotionId}?autoplay=1`,
    };
  }

  // Direct video file
  return {
    url,
    type: 'direct',
    id: null,
    thumbnail: null,
    embedUrl: null,
  };
}

export default function ArticleDetailPage() {
  const locale = useLocale() as 'fr' | 'en';
  const params = useParams();
  const slug = params.slug as string;

  const [imageLightboxOpen, setImageLightboxOpen] = useState(false);
  const [imageLightboxIndex, setImageLightboxIndex] = useState(0);
  const [videoLightboxOpen, setVideoLightboxOpen] = useState(false);
  const [videoLightboxIndex, setVideoLightboxIndex] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => fetchArticle(slug),
    enabled: !!slug,
  });

  const article: ArticleDetail | null = data?.data;

  const getTitle = () =>
    article ? (locale === 'fr' ? article.titleFr : article.titleEn) : '';

  const getContent = () =>
    article ? (locale === 'fr' ? article.contentFr : article.contentEn) : '';

  const getCategoryName = () =>
    article?.category
      ? locale === 'fr'
        ? article.category.nameFr
        : article.category.nameEn
      : null;

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Separate photos and videos
  const photos = useMemo(() => {
    const images: string[] = [];
    if (article?.imageUrl) {
      images.push(article.imageUrl);
    }
    if (article?.gallery && Array.isArray(article.gallery)) {
      article.gallery.forEach(url => {
        if (url && !images.includes(url)) {
          images.push(url);
        }
      });
    }
    return images;
  }, [article]);

  const videos = useMemo(() => {
    if (!article?.videos || !Array.isArray(article.videos)) return [];
    return article.videos.filter(url => url).map(url => getVideoInfo(url));
  }, [article]);

  const openImageLightbox = (index: number) => {
    setImageLightboxIndex(index);
    setImageLightboxOpen(true);
  };

  const openVideoLightbox = (index: number) => {
    setVideoLightboxIndex(index);
    setVideoLightboxOpen(true);
  };

  const navigateImageLightbox = (direction: 'prev' | 'next') => {
    const total = photos.length;
    if (direction === 'prev') {
      setImageLightboxIndex((prev) => (prev - 1 + total) % total);
    } else {
      setImageLightboxIndex((prev) => (prev + 1) % total);
    }
  };

  const navigateVideoLightbox = (direction: 'prev' | 'next') => {
    const total = videos.length;
    if (direction === 'prev') {
      setVideoLightboxIndex((prev) => (prev - 1 + total) % total);
    } else {
      setVideoLightboxIndex((prev) => (prev + 1) % total);
    }
  };

  // Calculate reading time
  const getReadingTime = () => {
    if (!getContent()) return null;
    const wordCount = getContent().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    return readingTime;
  };

  // Render video embed
  const renderVideoEmbed = (video: VideoInfo) => {
    if (video.embedUrl) {
      return (
        <iframe
          src={video.embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    
    // Direct video file
    return (
      <video
        src={video.url}
        controls
        autoPlay
        className="max-w-full max-h-full"
      />
    );
  };

  // Render video thumbnail with play overlay
  const renderVideoThumbnail = (video: VideoInfo, index: number) => {
    return (
      <div
        key={index}
        className="aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer group relative"
        onClick={() => openVideoLightbox(index)}
      >
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={`Video ${index + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Video className="w-12 h-12 text-muted-foreground/50" />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-[var(--color-primary)] ml-1" fill="currentColor" />
          </div>
        </div>
        {/* Video type badge */}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-black/60 text-white text-xs">
            {video.type.charAt(0).toUpperCase() + video.type.slice(1)}
          </Badge>
        </div>
      </div>
    );
  };

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

  if (error || !article) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">
              {locale === 'fr' ? 'Article non trouvé' : 'Article not found'}
            </h1>
            <Link href="/actualites">
              <Button variant="outline">
                <ArrowLeft className="mr-2 w-4 h-4" />
                {locale === 'fr' ? 'Retour aux actualités' : 'Back to news'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasGallery = photos.length > 1 || videos.length > 0;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link
            href="/actualites"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            {locale === 'fr' ? 'Retour aux actualités' : 'Back to news'}
          </Link>

          {/* Main Image */}
          <div className="mb-8">
            {article.imageUrl ? (
              <div
                className="aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer group"
                onClick={() => openImageLightbox(0)}
              >
                <img
                  src={article.imageUrl}
                  alt={getTitle()}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
              {article.category && (
                <Badge variant="outline">{getCategoryName()}</Badge>
              )}
              {article.featured && (
                <Badge className="bg-[var(--color-primary)] text-white">
                  {locale === 'fr' ? 'À la une' : 'Featured'}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{getTitle()}</h1>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {article.publishedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(article.publishedAt)}
                </div>
              )}
              {article.author?.name && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {article.author.name}
                </div>
              )}
              {getReadingTime() && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {locale === 'fr'
                    ? `${getReadingTime()} min de lecture`
                    : `${getReadingTime()} min read`}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div 
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: getContent() }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Gallery & Videos with Tabs */}
          {hasGallery && (
            <div className="mb-8">
              <Tabs defaultValue="photos" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="photos" className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {locale === 'fr' ? 'Photos' : 'Photos'}
                    {photos.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {photos.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="videos" className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    {locale === 'fr' ? 'Vidéos' : 'Videos'}
                    {videos.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {videos.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Photos Tab */}
                <TabsContent value="photos">
                  {photos.length > 1 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {photos.slice(1).map((url, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer group"
                          onClick={() => openImageLightbox(index + 1)}
                        >
                          <img
                            src={url}
                            alt={`${getTitle()} - ${index + 2}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      {locale === 'fr' ? 'Aucune photo supplémentaire' : 'No additional photos'}
                    </div>
                  )}
                </TabsContent>

                {/* Videos Tab */}
                <TabsContent value="videos">
                  {videos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {videos.map((video, index) => renderVideoThumbnail(video, index))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      {locale === 'fr' ? 'Aucune vidéo disponible' : 'No videos available'}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* CTA */}
          <Card className="bg-muted/30">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                {locale === 'fr'
                  ? 'Vous avez aimé cet article ?'
                  : 'Did you like this article?'}
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

      {/* Image Lightbox Dialog */}
      <Dialog open={imageLightboxOpen} onOpenChange={setImageLightboxOpen}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
              onClick={() => setImageLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation Buttons */}
            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 text-white hover:bg-white/10 z-10"
                  onClick={() => navigateImageLightbox('prev')}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 text-white hover:bg-white/10 z-10"
                  onClick={() => navigateImageLightbox('next')}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            {/* Image Content */}
            {photos[imageLightboxIndex] && (
              <img
                src={photos[imageLightboxIndex]}
                alt={getTitle()}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Counter */}
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                {imageLightboxIndex + 1} / {photos.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Lightbox Dialog */}
      <Dialog open={videoLightboxOpen} onOpenChange={setVideoLightboxOpen}>
        <DialogContent className="max-w-5xl w-full h-[85vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
              onClick={() => setVideoLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation Buttons */}
            {videos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 text-white hover:bg-white/10 z-10"
                  onClick={() => navigateVideoLightbox('prev')}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 text-white hover:bg-white/10 z-10"
                  onClick={() => navigateVideoLightbox('next')}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            {/* Video Content */}
            {videos[videoLightboxIndex] && (
              <div className="w-full h-full flex items-center justify-center p-4">
                {renderVideoEmbed(videos[videoLightboxIndex])}
              </div>
            )}

            {/* Counter */}
            {videos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full flex items-center gap-2">
                <Video className="w-4 h-4" />
                {videoLightboxIndex + 1} / {videos.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
