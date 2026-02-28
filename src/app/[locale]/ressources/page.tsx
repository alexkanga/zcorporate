'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { useState, useMemo } from 'react';
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
import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  Download,
  File,
  Folder,
  HardDrive,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Resource {
  id: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  fileName: string;
  downloadCount: number;
  createdAt: string;
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

interface ResourcesResponse {
  data: Resource[];
  categories: Category[];
  fileTypes: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function fetchResources(params: { page: number; categoryId?: string; fileType?: string }): Promise<ResourcesResponse> {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    limit: '12',
    ...(params.categoryId && { categoryId: params.categoryId }),
    ...(params.fileType && { fileType: params.fileType }),
  });

  const response = await fetch(`/api/resources?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch resources');
  return response.json();
}

const getFileIcon = (fileType: string) => {
  const type = fileType.split('/')[0];
  switch (type) {
    case 'image':
      return FileImage;
    case 'video':
      return FileVideo;
    case 'audio':
      return FileAudio;
    case 'application':
      if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) {
        return FileArchive;
      }
      return FileText;
    default:
      return File;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getFileTypeLabel = (fileType: string, locale: 'fr' | 'en') => {
  const type = fileType.split('/')[0];
  const labels: Record<string, { fr: string; en: string }> = {
    image: { fr: 'Image', en: 'Image' },
    video: { fr: 'Vidéo', en: 'Video' },
    audio: { fr: 'Audio', en: 'Audio' },
    application: { fr: 'Document', en: 'Document' },
    text: { fr: 'Texte', en: 'Text' },
  };
  return labels[type]?.[locale] || type;
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

export default function ResourcesPage() {
  const locale = useLocale() as 'fr' | 'en';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFileType, setSelectedFileType] = useState<string>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['resources', page, selectedCategory, selectedFileType],
    queryFn: () => fetchResources({
      page,
      categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
      fileType: selectedFileType === 'all' ? undefined : selectedFileType,
    }),
  });

  const resources: Resource[] = data?.data || [];
  const categories: Category[] = data?.categories || [];
  const fileTypes: string[] = data?.fileTypes || [];
  const pagination = data?.pagination;

  const getTitle = (item: Resource) =>
    locale === 'fr' ? item.titleFr : item.titleEn;

  const getDescription = (item: Resource) =>
    locale === 'fr' ? item.descriptionFr : item.descriptionEn;

  const getCategoryName = (category: Category | null) =>
    category ? (locale === 'fr' ? category.nameFr : category.nameEn) : null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDownload = async (resource: Resource) => {
    try {
      await fetch(`/api/resources/${resource.id}/download`, { method: 'POST' });
      const link = document.createElement('a');
      link.href = resource.fileUrl;
      link.download = resource.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPage(1);
  };

  const handleFileTypeChange = (value: string) => {
    setSelectedFileType(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedFileType('all');
    setPage(1);
  };

  const hasFilters = selectedCategory !== 'all' || selectedFileType !== 'all';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--color-primary)]/10 via-background to-[var(--color-secondary)]/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              {locale === 'fr' ? 'Documentation' : 'Documentation'}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
              {locale === 'fr' ? 'Ressources' : 'Resources'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {locale === 'fr'
                ? 'Documentation, guides et outils pour vous accompagner'
                : 'Documentation, guides, and tools to support you'}
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {locale === 'fr' ? 'Filtrer par :' : 'Filter by:'}
              </span>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
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
              <Select value={selectedFileType} onValueChange={handleFileTypeChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={locale === 'fr' ? 'Type de fichier' : 'File type'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {locale === 'fr' ? 'Tous les types' : 'All types'}
                  </SelectItem>
                  {fileTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
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
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-12 w-12 mb-4" />
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
                    ? 'Erreur lors du chargement des ressources'
                    : 'Error loading resources'}
                </p>
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {locale === 'fr'
                    ? 'Aucune ressource trouvée'
                    : 'No resources found'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map((resource) => {
                    const FileIcon = getFileIcon(resource.fileType);
                    return (
                      <Card key={resource.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                              <FileIcon className="w-6 h-6 text-[var(--color-primary)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold mb-1 truncate" title={getTitle(resource)}>
                                {getTitle(resource)}
                              </h3>
                              {resource.category && (
                                <Badge variant="outline" className="text-xs mb-2">
                                  {getCategoryName(resource.category)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {getDescription(resource) && (
                            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                              {getDescription(resource)}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <HardDrive className="w-3 h-3" />
                                {formatFileSize(resource.fileSize)}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {getFileTypeLabel(resource.fileType, locale)}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                              onClick={() => handleDownload(resource)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              {locale === 'fr' ? 'Télécharger' : 'Download'}
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            {locale === 'fr' ? 'Publié le' : 'Published on'} {formatDate(resource.createdAt)}
                            {' • '}
                            {resource.downloadCount} {locale === 'fr' ? 'téléchargements' : 'downloads'}
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
    </div>
  );
}
