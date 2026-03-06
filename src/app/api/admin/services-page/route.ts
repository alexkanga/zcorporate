import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch services page data
export async function GET() {
  try {
    let servicesPage = await db.servicesPage.findUnique({
      where: { id: 'services-page' },
    });

    // Create default if doesn't exist
    if (!servicesPage) {
      servicesPage = await db.servicesPage.create({
        data: {
          id: 'services-page',
          heroTitleFr: 'Nos Services',
          heroTitleEn: 'Our Services',
          heroBadgeFr: 'Services',
          heroBadgeEn: 'Services',
          menuLabelFr: 'Services',
          menuLabelEn: 'Services',
          published: true,
          showInMenu: true,
        },
      });
    }

    return NextResponse.json(servicesPage);
  } catch (error) {
    console.error('Error fetching services page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services page' },
      { status: 500 }
    );
  }
}

// PUT - Update services page data
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    const servicesPage = await db.servicesPage.upsert({
      where: { id: 'services-page' },
      update: {
        // Hero Section
        heroTitleFr: data.heroTitleFr,
        heroTitleEn: data.heroTitleEn,
        heroSubtitleFr: data.heroSubtitleFr,
        heroSubtitleEn: data.heroSubtitleEn,
        heroBadgeFr: data.heroBadgeFr,
        heroBadgeEn: data.heroBadgeEn,
        heroImageUrl: data.heroImageUrl,
        heroImageAltFr: data.heroImageAltFr,
        heroImageAltEn: data.heroImageAltEn,
        heroVideoUrl: data.heroVideoUrl,
        heroVideoType: data.heroVideoType,
        // Main Content Section
        mainTitleFr: data.mainTitleFr,
        mainTitleEn: data.mainTitleEn,
        mainContentFr: data.mainContentFr,
        mainContentEn: data.mainContentEn,
        mainImageUrl: data.mainImageUrl,
        mainImageAltFr: data.mainImageAltFr,
        mainImageAltEn: data.mainImageAltEn,
        mainVideoUrl: data.mainVideoUrl,
        mainVideoType: data.mainVideoType,
        // CTA Section
        ctaTitleFr: data.ctaTitleFr,
        ctaTitleEn: data.ctaTitleEn,
        ctaSubtitleFr: data.ctaSubtitleFr,
        ctaSubtitleEn: data.ctaSubtitleEn,
        ctaButtonTextFr: data.ctaButtonTextFr,
        ctaButtonTextEn: data.ctaButtonTextEn,
        ctaButtonUrl: data.ctaButtonUrl,
        // Floating Badge
        floatingBadgeTitleFr: data.floatingBadgeTitleFr,
        floatingBadgeTitleEn: data.floatingBadgeTitleEn,
        floatingBadgeTextFr: data.floatingBadgeTextFr,
        floatingBadgeTextEn: data.floatingBadgeTextEn,
        // Menu settings
        menuLabelFr: data.menuLabelFr,
        menuLabelEn: data.menuLabelEn,
        menuOrder: data.menuOrder,
        showInMenu: data.showInMenu,
        // Publication
        published: data.published,
      },
      create: {
        id: 'services-page',
        heroTitleFr: data.heroTitleFr || 'Nos Services',
        heroTitleEn: data.heroTitleEn || 'Our Services',
        heroSubtitleFr: data.heroSubtitleFr,
        heroSubtitleEn: data.heroSubtitleEn,
        heroBadgeFr: data.heroBadgeFr || 'Services',
        heroBadgeEn: data.heroBadgeEn || 'Services',
        heroImageUrl: data.heroImageUrl,
        heroImageAltFr: data.heroImageAltFr,
        heroImageAltEn: data.heroImageAltEn,
        heroVideoUrl: data.heroVideoUrl,
        heroVideoType: data.heroVideoType,
        mainTitleFr: data.mainTitleFr,
        mainTitleEn: data.mainTitleEn,
        mainContentFr: data.mainContentFr,
        mainContentEn: data.mainContentEn,
        mainImageUrl: data.mainImageUrl,
        mainImageAltFr: data.mainImageAltFr,
        mainImageAltEn: data.mainImageAltEn,
        mainVideoUrl: data.mainVideoUrl,
        mainVideoType: data.mainVideoType,
        ctaTitleFr: data.ctaTitleFr,
        ctaTitleEn: data.ctaTitleEn,
        ctaSubtitleFr: data.ctaSubtitleFr,
        ctaSubtitleEn: data.ctaSubtitleEn,
        ctaButtonTextFr: data.ctaButtonTextFr,
        ctaButtonTextEn: data.ctaButtonTextEn,
        ctaButtonUrl: data.ctaButtonUrl,
        floatingBadgeTitleFr: data.floatingBadgeTitleFr,
        floatingBadgeTitleEn: data.floatingBadgeTitleEn,
        floatingBadgeTextFr: data.floatingBadgeTextFr,
        floatingBadgeTextEn: data.floatingBadgeTextEn,
        menuLabelFr: data.menuLabelFr || 'Services',
        menuLabelEn: data.menuLabelEn || 'Services',
        menuOrder: data.menuOrder || 0,
        showInMenu: data.showInMenu ?? true,
        published: data.published ?? true,
      },
    });

    return NextResponse.json(servicesPage);
  } catch (error) {
    console.error('Error updating services page:', error);
    return NextResponse.json(
      { error: 'Failed to update services page' },
      { status: 500 }
    );
  }
}
