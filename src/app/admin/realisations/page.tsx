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
} from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  nameFr: string;
  nameEn: string;
  slug: string;
}

interface Realisation {
  id: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  client: string | null;
  date: string | null;
  location: string | null;
  imageUrl: string | null;
  gallery: string[];
  published: boolean;
  featured: boolean;
  category: Category | null;
  createdAt: string;
}

interface RealisationsResponse {
  realisations: Realisation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const realisationSchema = z.object({
  titleFr: z.string().min(1, "French title is required"),
  titleEn: z.string().min(1, "English title is required"),
  descriptionFr: z.string().optional(),
  descriptionEn: z.string().optional(),
  client: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  imageUrl: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  published: z.boolean(),
  featured: z.boolean(),
  categoryId: z.string().optional().nullable(),
});

type RealisationFormData = z.infer<typeof realisationSchema>;

async function fetchRealisations(params: {
  page: number;
  limit: number;
  search: string;
  categoryId?: string;
  published?: string;
}): Promise<RealisationsResponse> {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    ...(params.search && { search: params.search }),
    ...(params.categoryId && { categoryId: params.categoryId }),
    ...(params.published && { published: params.published }),
  });

  const response = await fetch(`/api/admin/realisations?${searchParams}`);
  if (!response.ok) throw new Error("Failed to fetch realisations");
  return response.json();
}

async function fetchCategories(): Promise<Category[]> {
  const response = await fetch("/api/admin/realisation-categories");
  if (!response.ok) throw new Error("Failed to fetch categories");
  return response.json();
}

async function createRealisation(data: RealisationFormData) {
  const response = await fetch("/api/admin/realisations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create realisation");
  }
  return response.json();
}

async function updateRealisation(id: string, data: Partial<RealisationFormData>) {
  const response = await fetch(`/api/admin/realisations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update realisation");
  }
  return response.json();
}

async function deleteRealisation(id: string) {
  const response = await fetch(`/api/admin/realisations/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete realisation");
  }
  return response.json();
}

export default function RealisationsPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [publishedFilter, setPublishedFilter] = useState<string | undefined>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRealisation, setSelectedRealisation] = useState<Realisation | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  const { data, isLoading, isError } = useQuery<RealisationsResponse>({
    queryKey: ["realisations", page, search, categoryId, publishedFilter],
    queryFn: () => fetchRealisations({ page, limit: 10, search, categoryId, published: publishedFilter }),
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["realisation-categories"],
    queryFn: fetchCategories,
  });

  const form = useForm<RealisationFormData>({
    resolver: zodResolver(realisationSchema),
    defaultValues: {
      titleFr: "",
      titleEn: "",
      descriptionFr: "",
      descriptionEn: "",
      client: "",
      date: "",
      location: "",
      imageUrl: "",
      gallery: [],
      published: false,
      featured: false,
      categoryId: null,
    },
  });

  const editForm = useForm<RealisationFormData>({
    resolver: zodResolver(realisationSchema),
    defaultValues: {
      titleFr: "",
      titleEn: "",
      descriptionFr: "",
      descriptionEn: "",
      client: "",
      date: "",
      location: "",
      imageUrl: "",
      gallery: [],
      published: false,
      featured: false,
      categoryId: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: createRealisation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["realisations"] });
      setIsCreateOpen(false);
      form.reset();
      setGalleryUrls([]);
      toast.success("Realisation created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RealisationFormData> }) =>
      updateRealisation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["realisations"] });
      setIsEditOpen(false);
      setSelectedRealisation(null);
      editForm.reset();
      setGalleryUrls([]);
      toast.success("Realisation updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRealisation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["realisations"] });
      setIsDeleteOpen(false);
      setSelectedRealisation(null);
      toast.success("Realisation deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = (realisation: Realisation) => {
    setSelectedRealisation(realisation);
    const gallery = realisation.gallery || [];
    setGalleryUrls(gallery);
    editForm.reset({
      titleFr: realisation.titleFr,
      titleEn: realisation.titleEn,
      descriptionFr: realisation.descriptionFr || "",
      descriptionEn: realisation.descriptionEn || "",
      client: realisation.client || "",
      date: realisation.date ? new Date(realisation.date).toISOString().split("T")[0] : "",
      location: realisation.location || "",
      imageUrl: realisation.imageUrl || "",
      gallery: gallery,
      published: realisation.published,
      featured: realisation.featured,
      categoryId: realisation.category?.id || null,
    });
    setIsEditOpen(true);
  };

  const handleDelete = (realisation: Realisation) => {
    setSelectedRealisation(realisation);
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

  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Realisations</h1>
          <p className="text-muted-foreground">
            Manage your portfolio projects and achievements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/realisations/categories">
              Manage Categories
            </Link>
          </Button>
          <Button onClick={() => {
            setGalleryUrls([]);
            form.reset();
            setIsCreateOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Realisation
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search realisations..."
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
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
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
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Published</SelectItem>
                <SelectItem value="false">Draft</SelectItem>
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
              Failed to load realisations. Please try again.
            </div>
          ) : data?.realisations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No realisations found.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.realisations.map((realisation) => (
                      <TableRow key={realisation.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {realisation.imageUrl ? (
                              <div className="h-12 w-12 rounded overflow-hidden bg-muted flex items-center justify-center">
                                <img
                                  src={realisation.imageUrl}
                                  alt={realisation.titleFr}
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
                                {realisation.titleFr}
                                {realisation.featured && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {realisation.client && `Client: ${realisation.client}`}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {realisation.category ? (
                            <Badge variant="outline">
                              {realisation.category.nameFr}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={realisation.published ? "default" : "secondary"}>
                            {realisation.published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(realisation.date)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(realisation)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(realisation)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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
                    Showing {(page - 1) * 10 + 1} to{" "}
                    {Math.min(page * 10, data.pagination.total)} of{" "}
                    {data.pagination.total} realisations
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

      {/* Create Realisation Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Realisation</DialogTitle>
            <DialogDescription>
              Add a new portfolio project.
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
                        <FormLabel>Title (French) *</FormLabel>
                        <FormControl>
                          <Input placeholder="Titre du projet" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="descriptionFr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (French)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Description du projet..." {...field} />
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
                        <FormLabel>Title (English) *</FormLabel>
                        <FormControl>
                          <Input placeholder="Project title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="descriptionEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (English)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Project description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <FormControl>
                        <Input placeholder="Client name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Project location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
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

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the URL of the featured image for this project.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Image Gallery</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://..."
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={addGalleryUrl}>
                    Add
                  </Button>
                </div>
                {galleryUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {galleryUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Gallery ${index + 1}`}
                          className="h-20 w-full object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeGalleryUrl(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
                      <FormLabel className="!mt-0">Published</FormLabel>
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
                      <FormLabel className="!mt-0">Featured</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Realisation Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Realisation</DialogTitle>
            <DialogDescription>
              Update project information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => {
              if (selectedRealisation) {
                updateMutation.mutate({ id: selectedRealisation.id, data });
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
                        <FormLabel>Title (French) *</FormLabel>
                        <FormControl>
                          <Input placeholder="Titre du projet" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="descriptionFr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (French)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Description du projet..." {...field} />
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
                        <FormLabel>Title (English) *</FormLabel>
                        <FormControl>
                          <Input placeholder="Project title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="descriptionEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (English)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Project description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <FormControl>
                        <Input placeholder="Client name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Project location" {...field} />
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
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
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

              <FormField
                control={editForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Image Gallery</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://..."
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={addEditGalleryUrl}>
                    Add
                  </Button>
                </div>
                {galleryUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {galleryUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Gallery ${index + 1}`}
                          className="h-20 w-full object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeEditGalleryUrl(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
                      <FormLabel className="!mt-0">Published</FormLabel>
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
                      <FormLabel className="!mt-0">Featured</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update
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
            <AlertDialogTitle>Delete Realisation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedRealisation?.titleFr}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedRealisation && deleteMutation.mutate(selectedRealisation.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
