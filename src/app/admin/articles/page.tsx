"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Image as ImageIcon,
  X,
  ExternalLink,
  Star,
  Video,
  Play,
} from "lucide-react";
import Link from "next/link";
import { ImageUploadCompact, MultiImageUpload } from '@/components/admin/ImageUpload';
import { RichTextEditorCompact } from '@/components/admin/RichTextEditor';

interface Category {
  id: string;
  nameFr: string;
  nameEn: string;
  slug: string;
}

interface Article {
  id: string;
  titleFr: string;
  titleEn: string;
  slug: string;
  excerptFr: string | null;
  excerptEn: string | null;
  imageUrl: string | null;
  published: boolean;
  featured: boolean;
  publishedAt: string | null;
  category: Category | null;
  author: {
    id: string;
    name: string | null;
  } | null;
  createdAt: string;
}

interface ArticlesResponse {
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const articleSchema = z.object({
  titleFr: z.string().min(1, "French title is required"),
  titleEn: z.string().min(1, "English title is required"),
  slug: z.string().min(1, "Slug is required"),
  contentFr: z.string().optional(),
  contentEn: z.string().optional(),
  excerptFr: z.string().optional(),
  excerptEn: z.string().optional(),
  imageUrl: z.string().optional(),
  imageAltFr: z.string().optional(),
  imageAltEn: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
  published: z.boolean(),
  featured: z.boolean(),
  publishedAt: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

async function fetchArticles(params: {
  page: number;
  limit: number;
  search: string;
  categoryId?: string;
  published?: string;
}): Promise<ArticlesResponse> {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    ...(params.search && { search: params.search }),
    ...(params.categoryId && { categoryId: params.categoryId }),
    ...(params.published && { published: params.published }),
  });

  const response = await fetch(`/api/admin/articles?${searchParams}`);
  if (!response.ok) throw new Error("Failed to fetch articles");
  return response.json();
}

async function fetchCategories(): Promise<Category[]> {
  const response = await fetch("/api/admin/article-categories");
  if (!response.ok) throw new Error("Failed to fetch categories");
  return response.json();
}

async function createArticle(data: ArticleFormData) {
  const response = await fetch("/api/admin/articles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create article");
  }
  return response.json();
}

async function updateArticle(id: string, data: Partial<ArticleFormData>) {
  const response = await fetch(`/api/admin/articles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update article");
  }
  return response.json();
}

async function deleteArticle(id: string) {
  const response = await fetch(`/api/admin/articles/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete article");
  }
  return response.json();
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}

export default function ArticlesPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [publishedFilter, setPublishedFilter] = useState<string | undefined>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");

  const { data, isLoading, isError } = useQuery<ArticlesResponse>({
    queryKey: ["articles", page, search, categoryId, publishedFilter],
    queryFn: () => fetchArticles({ page, limit: 10, search, categoryId, published: publishedFilter }),
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["article-categories"],
    queryFn: fetchCategories,
  });

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      titleFr: "",
      titleEn: "",
      slug: "",
      contentFr: "",
      contentEn: "",
      excerptFr: "",
      excerptEn: "",
      imageUrl: "",
      imageAltFr: "",
      imageAltEn: "",
      gallery: [],
      videos: [],
      published: false,
      featured: false,
      publishedAt: null,
      categoryId: null,
    },
  });

  const editForm = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      titleFr: "",
      titleEn: "",
      slug: "",
      contentFr: "",
      contentEn: "",
      excerptFr: "",
      excerptEn: "",
      imageUrl: "",
      imageAltFr: "",
      imageAltEn: "",
      gallery: [],
      videos: [],
      published: false,
      featured: false,
      publishedAt: null,
      categoryId: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      setIsCreateOpen(false);
      form.reset();
      setGalleryUrls([]);
      setVideoUrls([]);
      toast.success("Article créé avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ArticleFormData> }) =>
      updateArticle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      setIsEditOpen(false);
      setSelectedArticle(null);
      editForm.reset();
      setGalleryUrls([]);
      setVideoUrls([]);
      toast.success("Article mis à jour avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      setIsDeleteOpen(false);
      setSelectedArticle(null);
      toast.success("Article deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = (article: Article) => {
    setSelectedArticle(article);
    const gallery = [];
    setGalleryUrls(gallery);
    editForm.reset({
      titleFr: article.titleFr,
      titleEn: article.titleEn,
      slug: article.slug,
      contentFr: "",
      contentEn: "",
      excerptFr: article.excerptFr || "",
      excerptEn: article.excerptEn || "",
      imageUrl: article.imageUrl || "",
      imageAltFr: "",
      imageAltEn: "",
      gallery: gallery,
      published: article.published,
      featured: article.featured,
      publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString().split("T")[0] : null,
      categoryId: article.category?.id || null,
    });
    setIsEditOpen(true);
  };

  const handleDelete = (article: Article) => {
    setSelectedArticle(article);
    setIsDeleteOpen(true);
  };

  const addGalleryUrl = () => {
    if (newGalleryUrl.trim()) {
      const updated = [...galleryUrls, newGalleryUrl.trim()];
      setGalleryUrls(updated);
      form.setValue("gallery", updated);
      setNewGalleryUrl("");
    }
  };

  const removeGalleryUrl = (index: number) => {
    const updated = galleryUrls.filter((_, i) => i !== index);
    setGalleryUrls(updated);
    form.setValue("gallery", updated);
  };

  const addEditGalleryUrl = () => {
    if (newGalleryUrl.trim()) {
      const updated = [...galleryUrls, newGalleryUrl.trim()];
      setGalleryUrls(updated);
      editForm.setValue("gallery", updated);
      setNewGalleryUrl("");
    }
  };

  const removeEditGalleryUrl = (index: number) => {
    const updated = galleryUrls.filter((_, i) => i !== index);
    setGalleryUrls(updated);
    editForm.setValue("gallery", updated);
  };

  // Video functions
  const addVideoUrl = () => {
    if (newVideoUrl.trim()) {
      const updated = [...videoUrls, newVideoUrl.trim()];
      setVideoUrls(updated);
      form.setValue("videos", updated);
      setNewVideoUrl("");
    }
  };

  const removeVideoUrl = (index: number) => {
    const updated = videoUrls.filter((_, i) => i !== index);
    setVideoUrls(updated);
    form.setValue("videos", updated);
  };

  const addEditVideoUrl = () => {
    if (newVideoUrl.trim()) {
      const updated = [...videoUrls, newVideoUrl.trim()];
      setVideoUrls(updated);
      editForm.setValue("videos", updated);
      setNewVideoUrl("");
    }
  };

  const removeEditVideoUrl = (index: number) => {
    const updated = videoUrls.filter((_, i) => i !== index);
    setVideoUrls(updated);
    editForm.setValue("videos", updated);
  };

  // Helper to get YouTube thumbnail
  const getYouTubeThumbnail = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Auto-generate slug from French title
  const handleTitleFrChange = (value: string, formType: 'create' | 'edit') => {
    const targetForm = formType === 'create' ? form : editForm;
    targetForm.setValue('titleFr', value);
    if (!targetForm.getValues('slug')) {
      targetForm.setValue('slug', generateSlug(value));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Actualités</h1>
          <p className="text-muted-foreground">
            Gérer les articles et actualités du site
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/articles/categories">
              Gérer les catégories
            </Link>
          </Button>
          <Button onClick={() => {
            setGalleryUrls([]);
            form.reset();
            setIsCreateOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un article
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des articles..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8"
              />
            </div>
            <Select
              value={categoryId || "all"}
              onValueChange={(value) => {
                setCategoryId(value === "all" ? undefined : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Toutes catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.nameFr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={publishedFilter || "all"}
              onValueChange={(value) => {
                setPublishedFilter(value === "all" ? undefined : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tous statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="true">Publié</SelectItem>
                <SelectItem value="false">Brouillon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <Skeleton className="h-6 w-[80px]" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-muted-foreground">
              Erreur lors du chargement des articles. Veuillez réessayer.
            </div>
          ) : data?.articles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun article trouvé.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {article.imageUrl ? (
                              <div className="h-12 w-12 rounded overflow-hidden bg-muted flex items-center justify-center">
                                <img
                                  src={article.imageUrl}
                                  alt={article.titleFr}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {article.titleFr}
                                {article.featured && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                /{article.slug}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {article.category ? (
                            <Badge variant="outline">
                              {article.category.nameFr}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={article.published ? "default" : "secondary"}>
                            {article.published ? "Publié" : "Brouillon"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(article.publishedAt || article.createdAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(article)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(article)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {data && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Affichage de {(page - 1) * 10 + 1} à{" "}
                    {Math.min(page * 10, data.pagination.total)} sur{" "}
                    {data.pagination.total} articles
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Article Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un article</DialogTitle>
            <DialogDescription>
              Ajouter un nouvel article.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
              <Tabs defaultValue="fr">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                <TabsContent value="fr" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="titleFr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre (Français) *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Titre de l'article" 
                            {...field}
                            onChange={(e) => handleTitleFrChange(e.target.value, 'create')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="excerptFr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extrait (Français)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Brief description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contentFr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenu (Français)</FormLabel>
                        <FormControl>
                          <RichTextEditorCompact
                            value={field.value || ''}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="en" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="titleEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre (English) *</FormLabel>
                        <FormControl>
                          <Input placeholder="Article title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="excerptEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extrait (English)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Brief description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contentEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenu (English)</FormLabel>
                        <FormControl>
                          <RichTextEditorCompact
                            value={field.value || ''}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (URL) *</FormLabel>
                    <FormControl>
                      <Input placeholder="article-slug" {...field} />
                    </FormControl>
                    <FormDescription>
                      Identifiant unique dans l'URL (ex: mon-article)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nameFr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Image principale</FormLabel>
                <ImageUploadCompact
                  value={form.watch('imageUrl') || ''}
                  onChange={(url) => form.setValue('imageUrl', url)}
                  folder="articles"
                />
              </div>

              {/* Gallery Section */}
              <div className="space-y-2">
                <FormLabel>Galerie d'images</FormLabel>
                <MultiImageUpload
                  value={galleryUrls}
                  onChange={(urls) => {
                    setGalleryUrls(urls);
                    form.setValue('gallery', urls);
                  }}
                  folder="articles/gallery"
                  maxImages={10}
                />
              </div>

              {/* Videos Section */}
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Vidéos
                </FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="URL YouTube, Vimeo ou vidéo..."
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addVideoUrl();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addVideoUrl}>
                    Ajouter
                  </Button>
                </div>
                {videoUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {videoUrls.map((url, index) => {
                      const thumbnail = getYouTubeThumbnail(url);
                      return (
                        <div key={index} className="relative group rounded-lg overflow-hidden border">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={`Video ${index + 1}`}
                              className="h-20 w-full object-cover"
                            />
                          ) : (
                            <div className="h-20 w-full bg-muted flex items-center justify-center">
                              <Video className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeVideoUrl(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="publishedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de publication</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-6">
                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Publié</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">En vedette</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Article Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'article</DialogTitle>
            <DialogDescription>
              Mettre à jour les informations de l'article.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => {
              if (selectedArticle) {
                updateMutation.mutate({ id: selectedArticle.id, data });
              }
            })} className="space-y-4">
              <Tabs defaultValue="fr">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                <TabsContent value="fr" className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="titleFr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre (Français) *</FormLabel>
                        <FormControl>
                          <Input placeholder="Titre de l'article" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="excerptFr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extrait (Français)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Brief description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="contentFr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenu (Français)</FormLabel>
                        <FormControl>
                          <RichTextEditorCompact
                            value={field.value || ''}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="en" className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="titleEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre (English) *</FormLabel>
                        <FormControl>
                          <Input placeholder="Article title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="excerptEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extrait (English)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Brief description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="contentEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenu (English)</FormLabel>
                        <FormControl>
                          <RichTextEditorCompact
                            value={field.value || ''}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <FormField
                control={editForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (URL) *</FormLabel>
                    <FormControl>
                      <Input placeholder="article-slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nameFr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Image principale</FormLabel>
                <ImageUploadCompact
                  value={editForm.watch('imageUrl') || ''}
                  onChange={(url) => editForm.setValue('imageUrl', url)}
                  folder="articles"
                />
              </div>

              {/* Gallery Section */}
              <div className="space-y-2">
                <FormLabel>Galerie d'images</FormLabel>
                <MultiImageUpload
                  value={galleryUrls}
                  onChange={(urls) => {
                    setGalleryUrls(urls);
                    editForm.setValue('gallery', urls);
                  }}
                  folder="articles/gallery"
                  maxImages={10}
                />
              </div>

              {/* Videos Section */}
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Vidéos
                </FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="URL YouTube, Vimeo ou vidéo..."
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addEditVideoUrl();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addEditVideoUrl}>
                    Ajouter
                  </Button>
                </div>
                {videoUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {videoUrls.map((url, index) => {
                      const thumbnail = getYouTubeThumbnail(url);
                      return (
                        <div key={index} className="relative group rounded-lg overflow-hidden border">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={`Video ${index + 1}`}
                              className="h-20 w-full object-cover"
                            />
                          ) : (
                            <div className="h-20 w-full bg-muted flex items-center justify-center">
                              <Video className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeEditVideoUrl(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="publishedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de publication</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-6">
                <FormField
                  control={editForm.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Publié</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">En vedette</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Mettre à jour
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'article</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer &quot;{selectedArticle?.titleFr}&quot;?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedArticle && deleteMutation.mutate(selectedArticle.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
