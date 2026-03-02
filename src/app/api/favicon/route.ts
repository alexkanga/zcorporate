import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const settings = await db.siteSettings.findUnique({
      where: { id: "site-settings" },
      select: { faviconUrl: true },
    });

    if (settings?.faviconUrl) {
      // Redirect to the favicon URL
      return NextResponse.redirect(settings.faviconUrl);
    }

    // Return a default favicon or 404
    // For now, return a simple SVG as default
    const defaultFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="6" fill="#362981"/>
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="white" font-size="18" font-weight="bold" font-family="Arial">A</text>
    </svg>`;

    return new NextResponse(defaultFavicon, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching favicon:", error);
    
    // Return default favicon on error
    const defaultFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="6" fill="#362981"/>
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="white" font-size="18" font-weight="bold" font-family="Arial">A</text>
    </svg>`;

    return new NextResponse(defaultFavicon, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
}
