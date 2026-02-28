"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Palette,
  Image,
  Menu,
  Map,
  ArrowRight,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface SiteSettings {
  id: string;
  logoUrl: string | null;
  logoAltFr: string | null;
  logoAltEn: string | null;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  siteNameFr: string;
  siteNameEn: string;
  siteDescriptionFr: string | null;
  siteDescriptionEn: string | null;
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

const settingsCards = [
  {
    title: "Logo & Branding",
    description: "Upload your logo and configure alt text",
    href: "/admin/settings/logo",
    icon: Image,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Colors",
    description: "Customize your brand colors",
    href: "/admin/settings/colors",
    icon: Palette,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
  },
  {
    title: "Menus",
    description: "Manage navigation menus",
    href: "/admin/settings/menus",
    icon: Menu,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Maps",
    description: "Configure Google Maps settings",
    href: "/admin/settings/maps",
    icon: Map,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Pagination",
    description: "Configure items per page",
    href: "/admin/settings/pagination",
    icon: FileText,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
];

export default function SettingsPage() {
  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const getStatusIcon = (value: string | null | number | undefined) => {
    if (value === null || value === undefined || value === "") {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your site configuration and appearance
        </p>
      </div>

      {/* Settings Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {settingsCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <CardTitle className="text-base">{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{card.description}</CardDescription>
                <div className="flex items-center mt-3 text-sm text-primary">
                  Configure <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Current Settings Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
          <CardDescription>
            Overview of your current site settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Logo Status */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Logo & Branding</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Logo uploaded</span>
                    {getStatusIcon(settings?.logoUrl)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Alt text (FR)</span>
                    {getStatusIcon(settings?.logoAltFr)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Alt text (EN)</span>
                    {getStatusIcon(settings?.logoAltEn)}
                  </div>
                </div>
              </div>

              {/* Colors Status */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Brand Colors</h4>
                <div className="flex gap-2 flex-wrap">
                  <div
                    className="w-10 h-10 rounded-lg border shadow-sm"
                    style={{ backgroundColor: settings?.color1 }}
                    title={`Primary: ${settings?.color1}`}
                  />
                  <div
                    className="w-10 h-10 rounded-lg border shadow-sm"
                    style={{ backgroundColor: settings?.color2 }}
                    title={`Secondary: ${settings?.color2}`}
                  />
                  <div
                    className="w-10 h-10 rounded-lg border shadow-sm"
                    style={{ backgroundColor: settings?.color3 }}
                    title={`Accent: ${settings?.color3}`}
                  />
                  <div
                    className="w-10 h-10 rounded-lg border shadow-sm"
                    style={{ backgroundColor: settings?.color4 }}
                    title={`Light: ${settings?.color4}`}
                  />
                </div>
              </div>

              {/* Site Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Site Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Site name (FR)</span>
                    <span className="text-muted-foreground">{settings?.siteNameFr}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Site name (EN)</span>
                    <span className="text-muted-foreground">{settings?.siteNameEn}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Contact email</span>
                    {getStatusIcon(settings?.email)}
                  </div>
                </div>
              </div>

              {/* Maps Status */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Maps Configuration</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Latitude</span>
                    {getStatusIcon(settings?.mapLatitude)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Longitude</span>
                    {getStatusIcon(settings?.mapLongitude)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>API Key</span>
                    {getStatusIcon(settings?.mapApiKey)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
