"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Upload, Loader2, Image as ImageIcon, Trash2 } from "lucide-react";
import Link from "next/link";

const logoSchema = z.object({
  logoUrl: z.string().nullable(),
  faviconUrl: z.string().nullable(),
  logoAltFr: z.string().nullable(),
  logoAltEn: z.string().nullable(),
  siteNameFr: z.string().min(1, "Site name (FR) is required"),
  siteNameEn: z.string().min(1, "Site name (EN) is required"),
  siteDescriptionFr: z.string().nullable(),
  siteDescriptionEn: z.string().nullable(),
});

type LogoFormData = z.infer<typeof logoSchema>;

interface SiteSettings {
  id: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  logoAltFr: string | null;
  logoAltEn: string | null;
  siteNameFr: string;
  siteNameEn: string;
  siteDescriptionFr: string | null;
  siteDescriptionEn: string | null;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  mapLatitude: number | null;
  mapLongitude: number | null;
  mapZoom: number;
  mapApiKey: string | null;
  socialLinks: string | null;
  phone2: string | null;
  workingHoursFr: string | null;
  workingHoursEn: string | null;
  metaTitleFr: string | null;
  metaTitleEn: string | null;
  metaDescriptionFr: string | null;
  metaDescriptionEn: string | null;
  metaKeywords: string | null;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
}

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

export default function LogoSettingsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [faviconPreviewUrl, setFaviconPreviewUrl] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const form = useForm<LogoFormData>({
    resolver: zodResolver(logoSchema),
    values: {
      logoUrl: settings?.logoUrl || null,
      faviconUrl: settings?.faviconUrl || null,
      logoAltFr: settings?.logoAltFr || null,
      logoAltEn: settings?.logoAltEn || null,
      siteNameFr: settings?.siteNameFr || "",
      siteNameEn: settings?.siteNameEn || "",
      siteDescriptionFr: settings?.siteDescriptionFr || null,
      siteDescriptionEn: settings?.siteDescriptionEn || null,
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Paramètres enregistrés avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner un fichier image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image doit faire moins de 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "logos");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      form.setValue("logoUrl", data.url);
      toast.success("Logo uploadé avec succès");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Échec de l'upload du logo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFaviconSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type - accept ico, png, svg
    const validTypes = ["image/x-icon", "image/png", "image/svg+xml", "image/ico"];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.ico')) {
      toast.error("Veuillez sélectionner un fichier .ico, .png ou .svg");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Le favicon doit faire moins de 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFaviconPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploadingFavicon(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "favicons");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      form.setValue("faviconUrl", data.url);
      toast.success("Favicon uploadé avec succès");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Échec de l'upload du favicon");
    } finally {
      setIsUploadingFavicon(false);
    }
  };

  const handleRemoveLogo = () => {
    form.setValue("logoUrl", null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFavicon = () => {
    form.setValue("faviconUrl", null);
    setFaviconPreviewUrl(null);
    if (faviconInputRef.current) {
      faviconInputRef.current.value = "";
    }
  };

  const onSubmit = (data: LogoFormData) => {
    updateMutation.mutate({
      ...data,
      color1: settings?.color1 || "#362981",
      color2: settings?.color2 || "#009446",
      color3: settings?.color3 || "#029CB1",
      color4: settings?.color4 || "#9AD2E2",
      mapZoom: settings?.mapZoom || 15,
    });
  };

  const currentLogo = previewUrl || form.watch("logoUrl");
  const currentFavicon = faviconPreviewUrl || form.watch("faviconUrl");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logo & Branding</h1>
          <p className="text-muted-foreground">
            Uploadez votre logo et favicon, et configurez les informations du site
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
            <CardDescription>
              Uploadez votre logo. Taille recommandée: 200x60px, format PNG ou SVG.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center min-h-[160px] bg-muted/30">
                  {currentLogo ? (
                    <div className="relative">
                      <img
                        src={currentLogo}
                        alt="Logo preview"
                        className="max-h-24 max-w-full object-contain"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={handleRemoveLogo}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <ImageIcon className="h-10 w-10 mb-2" />
                      <p className="text-sm">Aucun logo</p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {isUploading ? "Upload..." : "Uploader Logo"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favicon Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Favicon</CardTitle>
            <CardDescription>
              Uploadez votre favicon. Taille recommandée: 32x32px ou 16x16px, format ICO, PNG ou SVG.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center min-h-[160px] bg-muted/30">
                  {currentFavicon ? (
                    <div className="relative">
                      <img
                        src={currentFavicon}
                        alt="Favicon preview"
                        className="max-h-16 max-w-full object-contain"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={handleRemoveFavicon}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <ImageIcon className="h-10 w-10 mb-2" />
                      <p className="text-sm">Aucun favicon</p>
                    </div>
                  )}
                </div>

                <input
                  ref={faviconInputRef}
                  type="file"
                  accept=".ico,.png,.svg,image/x-icon,image/png,image/svg+xml"
                  className="hidden"
                  onChange={handleFaviconSelect}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => faviconInputRef.current?.click()}
                  disabled={isUploadingFavicon}
                >
                  {isUploadingFavicon ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {isUploadingFavicon ? "Upload..." : "Uploader Favicon"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logo Alt Text & Site Name */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Informations du Site</CardTitle>
            <CardDescription>
              Configurez le nom du site et le texte alternatif du logo pour l&apos;accessibilité
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="siteNameFr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du Site (Français)</FormLabel>
                        <FormControl>
                          <Input placeholder="AAEA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="siteNameEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du Site (Anglais)</FormLabel>
                        <FormControl>
                          <Input placeholder="AAEA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logoAltFr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texte Alt Logo (Français)</FormLabel>
                        <FormControl>
                          <Input placeholder="Logo de l'entreprise" {...field} value={field.value || ""} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logoAltEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texte Alt Logo (Anglais)</FormLabel>
                        <FormControl>
                          <Input placeholder="Company logo" {...field} value={field.value || ""} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="siteDescriptionFr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description du Site (Français)</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre partenaire technologique de confiance" {...field} value={field.value || ""} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="siteDescriptionEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description du Site (Anglais)</FormLabel>
                        <FormControl>
                          <Input placeholder="Your trusted technology partner" {...field} value={field.value || ""} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.reset()}
                    >
                      Réinitialiser
                    </Button>
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
