"use client";

import { useState, useEffect } from "react";
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
import { ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";

const colorSchema = z.object({
  color1: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  color2: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  color3: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  color4: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
});

type ColorFormData = z.infer<typeof colorSchema>;

interface SiteSettings {
  id: string;
  logoUrl: string | null;
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
}

const DEFAULT_COLORS = {
  color1: "#362981", // Violet principal
  color2: "#009446", // Vert principal
  color3: "#029CB1", // Teal
  color4: "#9AD2E2", // Bleu clair
};

const COLOR_LABELS = {
  color1: { fr: "Couleur Principale", en: "Primary Color" },
  color2: { fr: "Couleur Secondaire", en: "Secondary Color" },
  color3: { fr: "Couleur d'Accent", en: "Accent Color" },
  color4: { fr: "Couleur Claire", en: "Light Color" },
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

export default function ColorSettingsPage() {
  const queryClient = useQueryClient();
  const [liveColors, setLiveColors] = useState<ColorFormData>(DEFAULT_COLORS);

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const form = useForm<ColorFormData>({
    resolver: zodResolver(colorSchema),
    values: {
      color1: settings?.color1 || DEFAULT_COLORS.color1,
      color2: settings?.color2 || DEFAULT_COLORS.color2,
      color3: settings?.color3 || DEFAULT_COLORS.color3,
      color4: settings?.color4 || DEFAULT_COLORS.color4,
    },
  });

  // Update live preview when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      setLiveColors({
        color1: value.color1 || DEFAULT_COLORS.color1,
        color2: value.color2 || DEFAULT_COLORS.color2,
        color3: value.color3 || DEFAULT_COLORS.color3,
        color4: value.color4 || DEFAULT_COLORS.color4,
      });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Colors saved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: ColorFormData) => {
    updateMutation.mutate({
      ...data,
      // Preserve other settings
      siteNameFr: settings?.siteNameFr || "AAEA",
      siteNameEn: settings?.siteNameEn || "AAEA",
      mapZoom: settings?.mapZoom || 15,
    });
  };

  const handleReset = () => {
    form.setValue("color1", DEFAULT_COLORS.color1);
    form.setValue("color2", DEFAULT_COLORS.color2);
    form.setValue("color3", DEFAULT_COLORS.color3);
    form.setValue("color4", DEFAULT_COLORS.color4);
    toast.info("Colors reset to defaults");
  };

  const watchedColors = form.watch();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brand Colors</h1>
          <p className="text-muted-foreground">
            Customize your site&apos;s color scheme
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Color Pickers */}
        <Card>
          <CardHeader>
            <CardTitle>Color Settings</CardTitle>
            <CardDescription>
              Choose colors for your brand. Click on a color to pick a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {(Object.keys(DEFAULT_COLORS) as Array<keyof typeof DEFAULT_COLORS>).map((colorKey) => (
                  <div key={colorKey} className="flex items-start gap-4">
                    {/* Color Preview */}
                    <div
                      className="w-16 h-16 rounded-lg border shadow-sm flex-shrink-0 cursor-pointer relative overflow-hidden"
                      style={{ backgroundColor: watchedColors[colorKey] }}
                    >
                      <input
                        type="color"
                        value={watchedColors[colorKey]}
                        onChange={(e) => form.setValue(colorKey, e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>

                    {/* Color Input */}
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={colorKey}>
                        {COLOR_LABELS[colorKey].fr} / {COLOR_LABELS[colorKey].en}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={colorKey}
                          value={watchedColors[colorKey]}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                              form.setValue(colorKey, value as `#${string}`);
                            }
                          }}
                          placeholder="#000000"
                          className="font-mono"
                        />
                        <input
                          type="color"
                          value={watchedColors[colorKey]}
                          onChange={(e) => form.setValue(colorKey, e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border"
                        />
                      </div>
                      {form.formState.errors[colorKey] && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors[colorKey]?.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset to Defaults
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Colors
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              See how your colors will look on the site
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Preview Header */}
            <div className="space-y-4">
              <div className="rounded-lg border overflow-hidden">
                {/* Mock Header */}
                <div
                  className="p-4 flex items-center justify-between"
                  style={{ backgroundColor: liveColors.color1 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: liveColors.color2 }}
                    >
                      A
                    </div>
                    <span className="text-white font-semibold">Site Name</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-1 rounded text-sm text-white/80">Home</div>
                    <div className="px-3 py-1 rounded text-sm text-white/80">About</div>
                    <div className="px-3 py-1 rounded text-sm text-white/80">Contact</div>
                  </div>
                </div>

                {/* Mock Hero */}
                <div
                  className="p-8 text-center"
                  style={{ backgroundColor: liveColors.color4 }}
                >
                  <h2 className="text-2xl font-bold mb-2" style={{ color: liveColors.color1 }}>
                    Welcome to Our Site
                  </h2>
                  <p className="mb-4" style={{ color: liveColors.color3 }}>
                    Your trusted technology partner
                  </p>
                  <button
                    className="px-6 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: liveColors.color2 }}
                  >
                    Get Started
                  </button>
                </div>

                {/* Mock Content */}
                <div className="p-6 grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4 text-center">
                      <div
                        className="w-10 h-10 rounded-full mx-auto mb-2"
                        style={{ backgroundColor: liveColors.color3 }}
                      />
                      <h3
                        className="font-medium mb-1"
                        style={{ color: liveColors.color1 }}
                      >
                        Feature {i}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Description text
                      </p>
                    </div>
                  ))}
                </div>

                {/* Mock Footer */}
                <div
                  className="p-4 text-center text-white text-sm"
                  style={{ backgroundColor: liveColors.color1 }}
                >
                  © 2024 Site Name. All rights reserved.
                </div>
              </div>

              {/* Color Swatches */}
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(DEFAULT_COLORS) as Array<keyof typeof DEFAULT_COLORS>).map((colorKey) => (
                  <div key={colorKey} className="text-center">
                    <div
                      className="h-12 rounded border mb-1"
                      style={{ backgroundColor: liveColors[colorKey] }}
                    />
                    <p className="text-xs text-muted-foreground font-mono">
                      {liveColors[colorKey]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
