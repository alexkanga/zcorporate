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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  nameFr: string;
  nameEn: string;
  slug: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  order: number;
  _count?: {
    Article: number;
  };
}

const categorySchema = z.object({
  nameFr: z.string().min(1, "Le nom français est requis"),
  nameEn: z.string().min(1, "Le nom anglais est requis"),
  slug: z.string().min(1, "Le slug est requis"),
  descriptionFr: z.string().optional(),
  descriptionEn: z.string().optional(),
  order: z.number().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

async function fetchCategories(): Promise<Category[]> {
  const response = await fetch("/api/admin/article-categories");
  if (!response.ok) throw new Error("Failed to fetch categories");
  return response.json();
}

async function createCategory(data: CategoryFormData) {
  const response = await fetch("/api/admin/article-categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create category");
  }
  return response.json();
}

async function updateCategory(id: string, data: Partial<CategoryFormData>) {
  const response = await fetch(`/api/admin/article-categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update category");
  }
  return response.json();
}

async function deleteCategory(id: string) {
  const response = await fetch(`/api/admin/article-categories/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete category");
  }
  return response.json();
}

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function ArticleCategoriesPage() {
  const queryClient = useQueryClient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { data: categories, isLoading, isError } = useQuery<Category[]>({
    queryKey: ["article-categories"],
    queryFn: fetchCategories,
  });

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nameFr: "",
      nameEn: "",
      slug: "",
      descriptionFr: "",
      descriptionEn: "",
      order: 0,
    },
  });

  const editForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nameFr: "",
      nameEn: "",
      slug: "",
      descriptionFr: "",
      descriptionEn: "",
      order: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article-categories"] });
      setIsCreateOpen(false);
      form.reset();
      toast.success("Catégorie créée avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryFormData> }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article-categories"] });
      setIsEditOpen(false);
      setSelectedCategory(null);
      editForm.reset();
      toast.success("Catégorie mise à jour avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article-categories"] });
      setIsDeleteOpen(false);
      setSelectedCategory(null);
      toast.success("Catégorie supprimée avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    editForm.reset({
      nameFr: category.nameFr,
      nameEn: category.nameEn,
      slug: category.slug,
      descriptionFr: category.descriptionFr || "",
      descriptionEn: category.descriptionEn || "",
      order: category.order,
    });
    setIsEditOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  const handleNameFrChange = (value: string, formType: 'create' | 'edit') => {
    const targetForm = formType === 'create' ? form : editForm;
    targetForm.setValue('nameFr', value);
    if (!targetForm.getValues('slug')) {
      targetForm.setValue('slug', generateSlug(value));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catégories d'articles</h1>
          <p className="text-muted-foreground">
            Gérer les catégories pour les articles
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/articles">
              Retour aux articles
            </Link>
          </Button>
          <Button onClick={() => {
            form.reset();
            setIsCreateOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une catégorie
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-muted-foreground">
              Erreur lors du chargement des catégories. Veuillez réessayer.
            </div>
          ) : !categories || categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune catégorie trouvée.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Articles</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{category.nameFr}</div>
                          <div className="text-sm text-muted-foreground">{category.nameEn}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{category.slug}</Badge>
                      </TableCell>
                      <TableCell>
                        {category._count?.Article || 0}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(category)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(category)}
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
          )}
        </CardContent>
      </Card>

      {/* Create Category Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une catégorie</DialogTitle>
            <DialogDescription>
              Ajouter une nouvelle catégorie d'articles.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="nameFr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom (Français) *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nom de la catégorie" 
                        {...field}
                        onChange={(e) => handleNameFrChange(e.target.value, 'create')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom (English) *</FormLabel>
                    <FormControl>
                      <Input placeholder="Category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="category-slug" {...field} />
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
                    <FormLabel>Description (Français)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description..." {...field} />
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
                      <Textarea placeholder="Description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

      {/* Edit Category Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la catégorie</DialogTitle>
            <DialogDescription>
              Mettre à jour les informations de la catégorie.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => {
              if (selectedCategory) {
                updateMutation.mutate({ id: selectedCategory.id, data });
              }
            })} className="space-y-4">
              <FormField
                control={editForm.control}
                name="nameFr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom (Français) *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de la catégorie" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom (English) *</FormLabel>
                    <FormControl>
                      <Input placeholder="Category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="category-slug" {...field} />
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
                    <FormLabel>Description (Français)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description..." {...field} />
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
                      <Textarea placeholder="Description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            <AlertDialogTitle>Supprimer la catégorie</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer &quot;{selectedCategory?.nameFr}&quot;?
              {(selectedCategory?._count?.Article || 0) > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Attention: Cette catégorie contient {selectedCategory?._count?.Article} article(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCategory && deleteMutation.mutate(selectedCategory.id)}
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
