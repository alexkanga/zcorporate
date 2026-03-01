"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

const paginationSchema = z.object({
  articlesPerPage: z.number().min(1).max(50),
  realisationsPerPage: z.number().min(1).max(50),
  resourcesPerPage: z.number().min(1).max(50),
  eventsPerPage: z.number().min(1).max(50),
});

type PaginationFormData = z.infer<typeof paginationSchema>;

interface SiteSettings {
  id: string;
  articlesPerPage: number;
  realisationsPerPage: number;
  resourcesPerPage: number;
  eventsPerPage: number;
  siteNameFr: string;
  siteNameEn: string;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  mapZoom: number;
}

const PAGINATION_LABELS = {
  articlesPerPage: {
    fr: "Actualités par page",
    en: "Articles per page",
    description: "Nombre d'articles affichés sur la page actualités"
  },
  realisationsPerPage: {
    fr: "Réalisations par page",
    en: "Projects per page",
    description: "Nombre de réalisations affichées sur la page portfolio"
  },
  resourcesPerPage: {
    fr: "Ressources par page",
    en: "Resources per page",
    description: "Nombre de ressources affichées sur la page documentation"
  },
  eventsPerPage: {
    fr: "Événements par page",
    en: "Events per page",
    description: "Nombre d'événements affichés sur la page agenda"
  },
};

async function fetchSettings(): Promise<SiteSettings> {
  const response = await fetch("/api/admin/settings");
  if (!response.ok) throw new Error("Failed to fetch settings");
  return response.json();
}

async function updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
  const response = await fetch("/api/admin/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update settings");
  }
  return response.json();
}

export default function PaginationSettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const form = useForm<PaginationFormData>({
    resolver: zodResolver(paginationSchema),
    defaultValues: {
      articlesPerPage: 10,
      realisationsPerPage: 9,
      resourcesPerPage: 12,
      eventsPerPage: 6,
    },
    values: settings ? {
      articlesPerPage: settings.articlesPerPage,
      realisationsPerPage: settings.realisationsPerPage,
      resourcesPerPage: settings.resourcesPerPage,
      eventsPerPage: settings.eventsPerPage,
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Paramètres de pagination enregistrés avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: PaginationFormData) => {
    if (!settings) return;
    
    // Send ALL required fields plus pagination updates
    updateMutation.mutate({
      // Pagination fields
      articlesPerPage: data.articlesPerPage,
      realisationsPerPage: data.realisationsPerPage,
      resourcesPerPage: data.resourcesPerPage,
      eventsPerPage: data.eventsPerPage,
      // Required fields from existing settings
      siteNameFr: settings.siteNameFr || "AAEA",
      siteNameEn: settings.siteNameEn || "AAEA",
      color1: settings.color1 || "#362981",
      color2: settings.color2 || "#009446",
      color3: settings.color3 || "#029CB1",
      color4: settings.color4 || "#9AD2E2",
      mapZoom: settings.mapZoom || 15,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pagination</h1>
          <p className="text-muted-foreground">
            Configurer le nombre d&apos;éléments affichés par page
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres de pagination</CardTitle>
          <CardDescription>
            Définissez le nombre d&apos;éléments à afficher sur chaque page de liste.
            Ces paramètres affectent l&apos;expérience utilisateur sur le site public.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-10 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {(Object.keys(PAGINATION_LABELS) as Array<keyof typeof PAGINATION_LABELS>).map((key) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>
                    {PAGINATION_LABELS[key].fr} / {PAGINATION_LABELS[key].en}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {PAGINATION_LABELS[key].description}
                  </p>
                  <Input
                    id={key}
                    type="number"
                    min={1}
                    max={50}
                    {...form.register(key, { valueAsNumber: true })}
                    className="w-32"
                  />
                  {form.formState.errors[key] && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors[key]?.message}
                    </p>
                  )}
                </div>
              ))}

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu des paramètres</CardTitle>
          <CardDescription>
            Valeurs actuelles appliquées sur le site public
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.keys(PAGINATION_LABELS) as Array<keyof typeof PAGINATION_LABELS>).map((key) => (
              <div key={key} className="p-4 rounded-lg border bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">
                  {PAGINATION_LABELS[key].fr}
                </p>
                <p className="text-2xl font-bold text-[var(--color-primary)]">
                  {form.watch(key) || settings?.[key] || '-'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">éléments/page</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
