import { db } from "@/lib/db";
import type { SiteSettings, MenuItem, MenuLocation } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";

export interface SiteSettingsData extends SiteSettings {
  menuItems: MenuItem[];
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
}

/**
 * Get site settings from database
 * Returns default values if no settings exist
 * Uses noStore() to prevent caching
 */
export async function getSiteSettings(): Promise<SiteSettingsData> {
  // Prevent caching of this data
  noStore();
  
  // Get or create site settings
  let settings = await db.siteSettings.findUnique({
    where: { id: "site-settings" },
  });

  if (!settings) {
    // Create default settings
    settings = await db.siteSettings.create({
      data: {
        id: "site-settings",
        color1: "#362981",
        color2: "#009446",
        color3: "#029CB1",
        color4: "#9AD2E2",
        siteNameFr: "AAEA",
        siteNameEn: "AAEA",
      },
    });
  }

  // Get menu items
  const menuItems = await db.menuItem.findMany({
    where: {
      deletedAt: null,
      visible: true,
    },
    orderBy: { order: "asc" },
  });

  return {
    ...settings,
    menuItems,
  };
}

/**
 * Get only site settings (without menu items)
 */
export async function getSiteSettingsOnly(): Promise<SiteSettings> {
  // Prevent caching
  noStore();
  
  let settings = await db.siteSettings.findUnique({
    where: { id: "site-settings" },
  });

  if (!settings) {
    settings = await db.siteSettings.create({
      data: {
        id: "site-settings",
        color1: "#362981",
        color2: "#009446",
        color3: "#029CB1",
        color4: "#9AD2E2",
        siteNameFr: "AAEA",
        siteNameEn: "AAEA",
      },
    });
  }

  return settings;
}

/**
 * Get menu items by location
 */
export async function getMenuItems(location: MenuLocation): Promise<MenuItem[]> {
  // Prevent caching
  noStore();
  
  const menuItems = await db.menuItem.findMany({
    where: {
      deletedAt: null,
      visible: true,
      OR: [{ location }, { location: "BOTH" }],
    },
    orderBy: { order: "asc" },
  });

  return menuItems;
}

/**
 * Parse social links JSON string
 */
export function parseSocialLinks(socialLinksJson: string | null): SocialLinks {
  if (!socialLinksJson) return {};

  try {
    return JSON.parse(socialLinksJson) as SocialLinks;
  } catch {
    return {};
  }
}

/**
 * Get site name by locale
 */
export function getSiteName(
  settings: SiteSettings,
  locale: "fr" | "en"
): string {
  return locale === "fr" ? settings.siteNameFr : settings.siteNameEn;
}

/**
 * Get site description by locale
 */
export function getSiteDescription(
  settings: SiteSettings,
  locale: "fr" | "en"
): string | null {
  return locale === "fr"
    ? settings.siteDescriptionFr
    : settings.siteDescriptionEn;
}

/**
 * Get logo alt text by locale
 */
export function getLogoAlt(
  settings: SiteSettings,
  locale: "fr" | "en"
): string {
  return locale === "fr"
    ? settings.logoAltFr || settings.siteNameFr
    : settings.logoAltEn || settings.siteNameEn;
}

/**
 * Get menu item label by locale
 */
export function getMenuItemLabel(
  item: MenuItem,
  locale: "fr" | "en"
): string {
  return locale === "fr" ? item.labelFr : item.labelEn;
}

/**
 * Get working hours by locale
 */
export function getWorkingHours(
  settings: SiteSettings,
  locale: "fr" | "en"
): string | null {
  return locale === "fr" ? settings.workingHoursFr : settings.workingHoursEn;
}
