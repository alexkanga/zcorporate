import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Validation schema for settings update - all fields optional for partial updates
const settingsSchema = z.object({
  // Logo
  logoUrl: z.string().nullable().optional(),
  faviconUrl: z.string().nullable().optional(),
  logoAltFr: z.string().nullable().optional(),
  logoAltEn: z.string().nullable().optional(),
  
  // Colors
  color1: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
  color2: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
  color3: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
  color4: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
  
  // Site info
  siteNameFr: z.string().min(1, "Site name (FR) is required").optional(),
  siteNameEn: z.string().min(1, "Site name (EN) is required").optional(),
  siteDescriptionFr: z.string().nullable().optional(),
  siteDescriptionEn: z.string().nullable().optional(),
  
  // Contact info
  address: z.string().nullable().optional(),
  email: z.string().email("Invalid email").nullable().or(z.literal("")).optional(),
  phone: z.string().nullable().optional(),
  phone2: z.string().nullable().optional(),
  workingHoursFr: z.string().nullable().optional(),
  workingHoursEn: z.string().nullable().optional(),
  
  // Social links
  socialLinks: z.string().nullable().optional(),
  
  // Google Maps
  mapLatitude: z.number().min(-90).max(90).nullable().optional(),
  mapLongitude: z.number().min(-180).max(180).nullable().optional(),
  mapZoom: z.number().min(1).max(20).optional(),
  mapApiKey: z.string().nullable().optional(),
  
  // SEO
  metaTitleFr: z.string().nullable().optional(),
  metaTitleEn: z.string().nullable().optional(),
  metaDescriptionFr: z.string().nullable().optional(),
  metaDescriptionEn: z.string().nullable().optional(),
  metaKeywords: z.string().nullable().optional(),
  
  // Analytics
  googleAnalyticsId: z.string().nullable().optional(),
  googleTagManagerId: z.string().nullable().optional(),
  
  // Pagination
  articlesPerPage: z.number().min(1).max(50).optional(),
  realisationsPerPage: z.number().min(1).max(50).optional(),
  resourcesPerPage: z.number().min(1).max(50).optional(),
  eventsPerPage: z.number().min(1).max(50).optional(),
});

// GET /api/admin/settings - Get site settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
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
          mapZoom: 15,
        },
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - Update site settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const body = await request.json();
    
    // Validate input
    const validatedData = settingsSchema.parse(body);
    
    // Get existing settings or create default
    const existingSettings = await db.siteSettings.findUnique({
      where: { id: "site-settings" },
    });
    
    // Merge with existing settings for partial updates
    const dataToUpdate = {
      // Logo (use new value or keep existing)
      logoUrl: validatedData.logoUrl ?? existingSettings?.logoUrl,
      faviconUrl: validatedData.faviconUrl ?? existingSettings?.faviconUrl,
      logoAltFr: validatedData.logoAltFr ?? existingSettings?.logoAltFr,
      logoAltEn: validatedData.logoAltEn ?? existingSettings?.logoAltEn,
      
      // Colors
      color1: validatedData.color1 ?? existingSettings?.color1 ?? "#362981",
      color2: validatedData.color2 ?? existingSettings?.color2 ?? "#009446",
      color3: validatedData.color3 ?? existingSettings?.color3 ?? "#029CB1",
      color4: validatedData.color4 ?? existingSettings?.color4 ?? "#9AD2E2",
      
      // Site info
      siteNameFr: validatedData.siteNameFr ?? existingSettings?.siteNameFr ?? "AAEA",
      siteNameEn: validatedData.siteNameEn ?? existingSettings?.siteNameEn ?? "AAEA",
      siteDescriptionFr: validatedData.siteDescriptionFr ?? existingSettings?.siteDescriptionFr,
      siteDescriptionEn: validatedData.siteDescriptionEn ?? existingSettings?.siteDescriptionEn,
      
      // Contact info
      address: validatedData.address ?? existingSettings?.address,
      email: validatedData.email ?? existingSettings?.email,
      phone: validatedData.phone ?? existingSettings?.phone,
      phone2: validatedData.phone2 ?? existingSettings?.phone2,
      workingHoursFr: validatedData.workingHoursFr ?? existingSettings?.workingHoursFr,
      workingHoursEn: validatedData.workingHoursEn ?? existingSettings?.workingHoursEn,
      
      // Social links
      socialLinks: validatedData.socialLinks ?? existingSettings?.socialLinks,
      
      // Google Maps
      mapLatitude: validatedData.mapLatitude ?? existingSettings?.mapLatitude,
      mapLongitude: validatedData.mapLongitude ?? existingSettings?.mapLongitude,
      mapZoom: validatedData.mapZoom ?? existingSettings?.mapZoom ?? 15,
      mapApiKey: validatedData.mapApiKey ?? existingSettings?.mapApiKey,
      
      // SEO
      metaTitleFr: validatedData.metaTitleFr ?? existingSettings?.metaTitleFr,
      metaTitleEn: validatedData.metaTitleEn ?? existingSettings?.metaTitleEn,
      metaDescriptionFr: validatedData.metaDescriptionFr ?? existingSettings?.metaDescriptionFr,
      metaDescriptionEn: validatedData.metaDescriptionEn ?? existingSettings?.metaDescriptionEn,
      metaKeywords: validatedData.metaKeywords ?? existingSettings?.metaKeywords,
      
      // Analytics
      googleAnalyticsId: validatedData.googleAnalyticsId ?? existingSettings?.googleAnalyticsId,
      googleTagManagerId: validatedData.googleTagManagerId ?? existingSettings?.googleTagManagerId,
      
      // Pagination
      articlesPerPage: validatedData.articlesPerPage ?? existingSettings?.articlesPerPage ?? 10,
      realisationsPerPage: validatedData.realisationsPerPage ?? existingSettings?.realisationsPerPage ?? 9,
      resourcesPerPage: validatedData.resourcesPerPage ?? existingSettings?.resourcesPerPage ?? 12,
      eventsPerPage: validatedData.eventsPerPage ?? existingSettings?.eventsPerPage ?? 6,
    };
    
    // Update settings
    const settings = await db.siteSettings.upsert({
      where: { id: "site-settings" },
      update: dataToUpdate,
      create: {
        id: "site-settings",
        ...dataToUpdate,
      },
    });
    
    // Revalidate all pages that use site settings
    revalidatePath("/", "layout");
    revalidatePath("/fr", "layout");
    revalidatePath("/en", "layout");
    revalidatePath("/fr/", "page");
    revalidatePath("/en/", "page");
    revalidatePath("/fr/a-propos", "page");
    revalidatePath("/en/about", "page");
    revalidatePath("/fr/solutions", "page");
    revalidatePath("/en/solutions", "page");
    revalidatePath("/fr/contact", "page");
    revalidatePath("/en/contact", "page");
    
    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
