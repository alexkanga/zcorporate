"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Loader2, Map as MapIcon, Search } from "lucide-react";
import Link from "next/link";

const mapsSchema = z.object({
  mapLatitude: z.number().min(-90).max(90).nullable(),
  mapLongitude: z.number().min(-180).max(180).nullable(),
  mapZoom: z.number().min(1).max(20),
  mapApiKey: z.string().nullable(),
});

type MapsFormData = z.infer<typeof mapsSchema>;

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

// Default location (Paris, France)
const DEFAULT_LATITUDE = 48.8566;
const DEFAULT_LONGITUDE = 2.3522;
const DEFAULT_ZOOM = 15;

export default function MapsSettingsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const form = useForm<MapsFormData>({
    resolver: zodResolver(mapsSchema),
    values: {
      mapLatitude: settings?.mapLatitude ?? null,
      mapLongitude: settings?.mapLongitude ?? null,
      mapZoom: settings?.mapZoom ?? DEFAULT_ZOOM,
      mapApiKey: settings?.mapApiKey ?? null,
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Maps settings saved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const watchedLatitude = form.watch("mapLatitude");
  const watchedLongitude = form.watch("mapLongitude");
  const watchedZoom = form.watch("mapZoom");

  const onSubmit = (data: MapsFormData) => {
    updateMutation.mutate({
      ...data,
      // Preserve other settings
      siteNameFr: settings?.siteNameFr || "AAEA",
      siteNameEn: settings?.siteNameEn || "AAEA",
      color1: settings?.color1 || "#362981",
      color2: settings?.color2 || "#009446",
      color3: settings?.color3 || "#029CB1",
      color4: settings?.color4 || "#9AD2E2",
    });
  };

  // Geocoding search (using OpenStreetMap Nominatim)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const results = await response.json();

      if (results && results.length > 0) {
        const { lat, lon } = results[0];
        form.setValue("mapLatitude", parseFloat(lat));
        form.setValue("mapLongitude", parseFloat(lon));
        toast.success("Location found!");
      } else {
        toast.error("Location not found. Please try a different search.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Failed to search location. Please try again.");
    }
  };

  // Generate OpenStreetMap embed URL
  const getMapEmbedUrl = () => {
    const lat = watchedLatitude ?? DEFAULT_LATITUDE;
    const lng = watchedLongitude ?? DEFAULT_LONGITUDE;
    const zoom = watchedZoom ?? DEFAULT_ZOOM;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`;
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
          <h1 className="text-2xl font-bold tracking-tight">Maps Settings</h1>
          <p className="text-muted-foreground">
            Configure Google Maps location for your site
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle>Map Configuration</CardTitle>
            <CardDescription>
              Set the location to display on your contact page
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Search Location */}
                  <div className="space-y-2">
                    <Label>Search Location</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search for an address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
                      />
                      <Button type="button" variant="outline" onClick={handleSearch}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                      Search for a location to auto-fill coordinates
                    </FormDescription>
                  </div>

                  <FormField
                    control={form.control}
                    name="mapLatitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.000001"
                            min="-90"
                            max="90"
                            placeholder="48.8566"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === "" ? null : parseFloat(value));
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Range: -90 to 90 (default: Paris, France)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mapLongitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.000001"
                            min="-180"
                            max="180"
                            placeholder="2.3522"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === "" ? null : parseFloat(value));
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Range: -180 to 180
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mapZoom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zoom Level: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={20}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          1 = World view, 20 = Street level
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mapApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Maps API Key (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your Google Maps API key"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional. Leave empty to use OpenStreetMap instead.
                        </FormDescription>
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
                      Reset
                    </Button>
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Settings
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* Map Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapIcon className="h-5 w-5" />
              Map Preview
            </CardTitle>
            <CardDescription>
              Preview of your location on the map
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[400px] w-full rounded-lg" />
            ) : (
              <div className="space-y-4">
                {/* Map Embed */}
                <div className="rounded-lg overflow-hidden border h-[300px]">
                  <iframe
                    src={getMapEmbedUrl()}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    title="Map preview"
                  />
                </div>

                {/* Coordinates Display */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-muted-foreground">Latitude</div>
                    <div className="font-mono font-medium">
                      {watchedLatitude?.toFixed(6) ?? "Not set"}
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-muted-foreground">Longitude</div>
                    <div className="font-mono font-medium">
                      {watchedLongitude?.toFixed(6) ?? "Not set"}
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <Label>Quick Presets</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        form.setValue("mapLatitude", 48.8566);
                        form.setValue("mapLongitude", 2.3522);
                        toast.success("Location set to Paris, France");
                      }}
                    >
                      Paris, France
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        form.setValue("mapLatitude", 51.5074);
                        form.setValue("mapLongitude", -0.1278);
                        toast.success("Location set to London, UK");
                      }}
                    >
                      London, UK
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        form.setValue("mapLatitude", 40.7128);
                        form.setValue("mapLongitude", -74.006);
                        toast.success("Location set to New York, USA");
                      }}
                    >
                      New York, USA
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        form.setValue("mapLatitude", 35.6762);
                        form.setValue("mapLongitude", 139.6503);
                        toast.success("Location set to Tokyo, Japan");
                      }}
                    >
                      Tokyo, Japan
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
