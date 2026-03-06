import { db } from "@/lib/db";
import type { SiteSettings, MenuItem, MenuLocation, Page } from "@prisma/client";
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

// Extended MenuItem type that can include pages
export type MenuItemWithPages = MenuItem & {
  isPage?: boolean;
};

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
 * Also includes AboutPage if showInMenu=true as child of "Présentation" menu
 */
export async function getMenuItems(location: MenuLocation): Promise<MenuItem[]> {
  // Prevent caching
  noStore();
  
  // Get regular menu items
  const menuItems = await db.menuItem.findMany({
    where: {
      deletedAt: null,
      visible: true,
      OR: [{ location }, { location: "BOTH" }],
    },
    orderBy: { order: "asc" },
  });

  // If location is HEADER or BOTH, also include AboutPage if showInMenu
  if (location === "HEADER" || location === "BOTH") {
    // Find the "Présentation" menu item to use as parent for AboutPage
    const presentationMenu = menuItems.find(
      (item) => item.slug === "presentation" || item.slug === "a-propos"
    );
    
    // Get AboutPage if it should be shown in menu
    const aboutPage = await db.aboutPage.findUnique({
      where: { id: 'about-page' },
    });

    // Create menu item for AboutPage if it exists and showInMenu is true
    if (aboutPage && aboutPage.showInMenu && aboutPage.published) {
      const aboutMenuItem: MenuItem = {
        id: 'about-page-menu',
        // Set parentId to "Présentation" menu so it appears as dropdown child
        parentId: presentationMenu?.id || null,
        order: aboutPage.menuOrder,
        slug: 'a-propos',
        route: '/presentation/a-propos',
        labelFr: aboutPage.menuLabelFr || aboutPage.heroTitleFr || 'À Propos',
        labelEn: aboutPage.menuLabelEn || aboutPage.heroTitleEn || 'About Us',
        visible: true,
        location: "HEADER" as MenuLocation,
        icon: null,
        external: false,
        createdAt: new Date(),
        updatedAt: aboutPage.updatedAt,
        deletedAt: null,
      };
      
      // Add AboutPage to menu items
      return [...menuItems, aboutMenuItem].sort((a, b) => a.order - b.order);
    }
  }

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

/**
 * Get a published page by slug
 * Returns null if page doesn't exist or is not published
 */
export async function getPublishedPage(slug: string): Promise<Page | null> {
  noStore();
  
  const page = await db.page.findFirst({
    where: {
      slug,
      deletedAt: null,
      published: true,
    },
  });

  return page;
}

/**
 * Get page title by locale
 */
export function getPageTitle(
  page: Page,
  locale: "fr" | "en"
): string {
  return locale === "fr" ? page.titleFr : page.titleEn;
}

/**
 * Get page content by locale
 */
export function getPageContent(
  page: Page,
  locale: "fr" | "en"
): string | null {
  return locale === "fr" ? page.contentFr : page.contentEn;
}

/**
 * Get all published pages that should be shown in menu
 */
export async function getPagesInMenu(): Promise<Page[]> {
  noStore();
  
  const pages = await db.page.findMany({
    where: {
      deletedAt: null,
      published: true,
      showInMenu: true,
    },
    orderBy: { order: "asc" },
  });

  return pages;
}
