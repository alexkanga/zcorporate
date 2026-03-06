'use client';

import { useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Play, X, Youtube, Video, ExternalLink, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type VideoType = 'youtube' | 'vimeo' | 'dailymotion' | null;

interface VideoUrlInputProps {
  value?: string | null;
  type?: VideoType;
  onChange: (url: string, type: VideoType) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
}

// Extract video ID and type from URL (memoized)
function parseVideoUrl(url: string): { type: VideoType; id: string } | null {
  if (!url) return null;

  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      return { type: 'youtube', id: match[1] };
    }
  }

  // Vimeo patterns
  const vimeoPatterns = [
    /vimeo\.com\/(\d+)/,
    /vimeo\.com\/channels\/[\w-]+\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];
  
  for (const pattern of vimeoPatterns) {
    const match = url.match(pattern);
    if (match) {
      return { type: 'vimeo', id: match[1] };
    }
  }

  // Dailymotion patterns
  const dailymotionPatterns = [
    /dailymotion\.com\/video\/([a-zA-Z0-9]+)/,
    /dai\.ly\/([a-zA-Z0-9]+)/,
    /dailymotion\.com\/embed\/video\/([a-zA-Z0-9]+)/,
  ];
  
  for (const pattern of dailymotionPatterns) {
    const match = url.match(pattern);
    if (match) {
      return { type: 'dailymotion', id: match[1] };
    }
  }

  return null;
}

// Get embed URL from video type and ID
function getEmbedUrl(type: VideoType, id: string): string | null {
  if (!type || !id) return null;

  switch (type) {
    case 'youtube':
      return `https://www.youtube.com/embed/${id}`;
    case 'vimeo':
      return `https://player.vimeo.com/video/${id}`;
    case 'dailymotion':
      return `https://www.dailymotion.com/embed/video/${id}`;
    default:
      return null;
  }
}

// Get thumbnail URL
function getThumbnailUrl(type: VideoType, id: string): string | null {
  if (!type || !id) return null;

  switch (type) {
    case 'youtube':
      return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    case 'vimeo':
      return null;
    case 'dailymotion':
      return `https://www.dailymotion.com/thumbnail/video/${id}`;
    default:
      return null;
  }
}

export function VideoUrlInput({
  value,
  onChange,
  label = 'Video',
  className = '',
  disabled = false,
  showPreview = true,
}: VideoUrlInputProps) {
  const [inputValue, setInputValue] = useState(value || '');
  
  // Parse the current input value using useMemo
  const parsed = useMemo(() => parseVideoUrl(inputValue), [inputValue]);
  const videoType = parsed?.type || null;
  const videoId = parsed?.id || null;
  
  // Derive error state from the parsed result
  const error = useMemo(() => {
    if (!inputValue) return null;
    if (!parsed) {
      return 'URL vidéo non reconnue. Formats supportés: YouTube, Vimeo, Dailymotion';
    }
    return null;
  }, [inputValue, parsed]);

  // Handle input change
  const handleInputChange = useCallback((newUrl: string) => {
    setInputValue(newUrl);
    
    // Parse and call parent onChange
    const parsedResult = parseVideoUrl(newUrl);
    onChange(newUrl, parsedResult?.type || null);
  }, [onChange]);

  const handleClear = useCallback(() => {
    setInputValue('');
    onChange('', null);
  }, [onChange]);

  const embedUrl = videoId ? getEmbedUrl(videoType, videoId) : null;
  const thumbnailUrl = videoId ? getThumbnailUrl(videoType, videoId) : null;

  return (
    <div className={cn('space-y-3', className)}>
      {label && <Label>{label}</Label>}

      {/* URL Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="url"
            placeholder="Collez l'URL YouTube, Vimeo ou Dailymotion"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={disabled}
            className={cn(error && 'border-red-300 focus-visible:ring-red-300')}
          />
          {videoType && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {videoType === 'youtube' && <Youtube className="h-4 w-4 text-red-500" />}
              {videoType === 'vimeo' && <Video className="h-4 w-4 text-blue-500" />}
              {videoType === 'dailymotion' && <Play className="h-4 w-4 text-blue-400" />}
            </div>
          )}
        </div>
        {inputValue && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => window.open(inputValue, '_blank')}
              title="Ouvrir la vidéo"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              title="Supprimer"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Supported platforms info */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>Formats supportés:</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Youtube className="h-3 w-3 text-red-500" />
            YouTube
          </span>
          <span className="flex items-center gap-1">
            <Video className="h-3 w-3 text-blue-500" />
            Vimeo
          </span>
          <span className="flex items-center gap-1">
            <Play className="h-3 w-3 text-blue-400" />
            Dailymotion
          </span>
        </div>
      </div>

      {/* Preview */}
      {showPreview && videoType && videoId && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Tabs defaultValue="thumbnail" className="w-full">
              <TabsList className="w-full grid grid-cols-2 rounded-none h-9">
                <TabsTrigger value="thumbnail" className="rounded-none">
                  Miniature
                </TabsTrigger>
                <TabsTrigger value="embed" className="rounded-none">
                  Lecteur
                </TabsTrigger>
              </TabsList>
              <TabsContent value="thumbnail" className="mt-0">
                <div className="relative aspect-video bg-muted">
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Play className="h-8 w-8 text-gray-800 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {videoType === 'youtube' && <Youtube className="h-3 w-3" />}
                    {videoType === 'vimeo' && <Video className="h-3 w-3" />}
                    {videoType === 'dailymotion' && <Play className="h-3 w-3" />}
                    <span className="capitalize">{videoType}</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="embed" className="mt-0">
                <div className="aspect-video">
                  {embedUrl && (
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper function to get video embed URL (for frontend use)
export function getVideoEmbedUrl(url: string): string | null {
  const parsed = parseVideoUrl(url);
  if (!parsed) return null;
  return getEmbedUrl(parsed.type, parsed.id);
}

// Helper to check if URL is a valid video URL
export function isValidVideoUrl(url: string): boolean {
  return parseVideoUrl(url) !== null;
}

// Helper to get video type from URL
export function getVideoType(url: string): VideoType {
  const parsed = parseVideoUrl(url);
  return parsed?.type || null;
}
