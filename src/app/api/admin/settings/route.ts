import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Validation schema for settings update
const settingsSchema = z.object({
  // Logo
  logoUrl: z.string().nullable(),
  logoAltFr: z.string().nullable(),
  logoAltEn: z.string().nullable(),
  
  // Colors
  color1: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  color2: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  color3: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  color4: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  
  // Site info
  siteNameFr: z.string().min(1, "Site name (FR) is required"),
  siteNameEn: z.string().min(1, "Site name (EN) is required"),
  siteDescriptionFr: z.string().nullable(),
  siteDescriptionEn: z.string().nullable(),
  
  // Contact info
  address: z.string().nullable(),
  email: z.string().email("Invalid email").nullable().or(z.literal("")),
  phone: z.string().nullable(),
  phone2: z.string().nullable(),
  workingHoursFr: z.string().nullable(),
  workingHoursEn: z.string().nullable(),
  
  // Social links
  socialLinks: z.string().nullable(),
  
  // Google Maps
  mapLatitude: z.number().min(-90).max(90).nullable(),
  mapLongitude: z.number().min(-180).max(180).nullable(),
  mapZoom: z.number().min(1).max(20),
  mapApiKey: z.string().nullable(),
  
  // SEO
  metaTitleFr: z.string().nullable(),
  metaTitleEn: z.string().nullable(),
  metaDescriptionFr: z.string().nullable(),
  metaDescriptionEn: z.string().nullable(),
  metaKeywords: z.string().nullable(),
  
  // Analytics
  googleAnalyticsId: z.string().nullable(),
  googleTagManagerId: z.string().nullable(),
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
    
    // Update settings
    const settings = await db.siteSettings.upsert({
      where: { id: "site-settings" },
      update: {
        // Logo
        logoUrl: validatedData.logoUrl,
        logoAltFr: validatedData.logoAltFr,
        logoAltEn: validatedData.logoAltEn,
        
        // Colors
        color1: validatedData.color1,
        color2: validatedData.color2,
        color3: validatedData.color3,
        color4: validatedData.color4,
        
        // Site info
        siteNameFr: validatedData.siteNameFr,
        siteNameEn: validatedData.siteNameEn,
        siteDescriptionFr: validatedData.siteDescriptionFr,
        siteDescriptionEn: validatedData.siteDescriptionEn,
        
        // Contact info
        address: validatedData.address,
        email: validatedData.email || null,
        phone: validatedData.phone,
        phone2: validatedData.phone2,
        workingHoursFr: validatedData.workingHoursFr,
        workingHoursEn: validatedData.workingHoursEn,
        
        // Social links
        socialLinks: validatedData.socialLinks,
        
        // Google Maps
        mapLatitude: validatedData.mapLatitude,
        mapLongitude: validatedData.mapLongitude,
        mapZoom: validatedData.mapZoom,
        mapApiKey: validatedData.mapApiKey,
        
        // SEO
        metaTitleFr: validatedData.metaTitleFr,
        metaTitleEn: validatedData.metaTitleEn,
        metaDescriptionFr: validatedData.metaDescriptionFr,
        metaDescriptionEn: validatedData.metaDescriptionEn,
        metaKeywords: validatedData.metaKeywords,
        
        // Analytics
        googleAnalyticsId: validatedData.googleAnalyticsId,
        googleTagManagerId: validatedData.googleTagManagerId,
      },
      create: {
        id: "site-settings",
        logoUrl: validatedData.logoUrl,
        logoAltFr: validatedData.logoAltFr,
        logoAltEn: validatedData.logoAltEn,
        color1: validatedData.color1,
        color2: validatedData.color2,
        color3: validatedData.color3,
        color4: validatedData.color4,
        siteNameFr: validatedData.siteNameFr,
        siteNameEn: validatedData.siteNameEn,
        siteDescriptionFr: validatedData.siteDescriptionFr,
        siteDescriptionEn: validatedData.siteDescriptionEn,
        address: validatedData.address,
        email: validatedData.email || null,
        phone: validatedData.phone,
        phone2: validatedData.phone2,
        workingHoursFr: validatedData.workingHoursFr,
        workingHoursEn: validatedData.workingHoursEn,
        socialLinks: validatedData.socialLinks,
        mapLatitude: validatedData.mapLatitude,
        mapLongitude: validatedData.mapLongitude,
        mapZoom: validatedData.mapZoom,
        mapApiKey: validatedData.mapApiKey,
        metaTitleFr: validatedData.metaTitleFr,
        metaTitleEn: validatedData.metaTitleEn,
        metaDescriptionFr: validatedData.metaDescriptionFr,
        metaDescriptionEn: validatedData.metaDescriptionEn,
        metaKeywords: validatedData.metaKeywords,
        googleAnalyticsId: validatedData.googleAnalyticsId,
        googleTagManagerId: validatedData.googleTagManagerId,
      },
    });
    
    // Revalidate all pages that use site settings
    // This ensures the colors are updated immediately
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
