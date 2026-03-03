import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// API for AboutPage content management - Updated

// GET - Fetch AboutPage content
export async function GET() {
  try {
    const aboutPage = await db.aboutPage.findUnique({
      where: { id: 'about-page' },
    });

    if (!aboutPage) {
      // Create default AboutPage if not exists
      const defaultAboutPage = await db.aboutPage.create({
        data: {
          id: 'about-page',
        },
      });
      return NextResponse.json(defaultAboutPage);
    }

    return NextResponse.json(aboutPage);
  } catch (error) {
    console.error('Error fetching about page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about page' },
      { status: 500 }
    );
  }
}

// Helper to clean data - remove null values for required fields
function cleanAboutPageData(data: Record<string, unknown>) {
  // Required fields that must have values (from Prisma schema)
  const requiredFields = ['heroTitleFr', 'heroTitleEn'];
  
  // Default values for required fields
  const defaults: Record<string, string> = {
    heroTitleFr: 'À Propos de Nous',
    heroTitleEn: 'About Us',
  };
  
  const cleaned = { ...data };
  
  // Ensure required fields have values
  for (const field of requiredFields) {
    if (cleaned[field] === null || cleaned[field] === undefined || cleaned[field] === '') {
      cleaned[field] = defaults[field];
    }
  }
  
  // Convert empty strings to null for optional fields
  const optionalStringFields = [
    'heroSubtitleFr', 'heroSubtitleEn', 'heroBadgeFr', 'heroBadgeEn',
    'heroImageUrl', 'heroImageAltFr', 'heroImageAltEn',
    'heroVideoUrl', 'heroVideoType',
    'mainTitleFr', 'mainTitleEn', 'mainContentFr', 'mainContentEn',
    'mainImageUrl', 'mainImageAltFr', 'mainImageAltEn',
    'mainVideoUrl', 'mainVideoType',
    'stat1Value', 'stat1LabelFr', 'stat1LabelEn',
    'stat2Value', 'stat2LabelFr', 'stat2LabelEn',
    'stat3Value', 'stat3LabelFr', 'stat3LabelEn',
    'stat4Value', 'stat4LabelFr', 'stat4LabelEn',
    'missionTitleFr', 'missionTitleEn', 'missionContentFr', 'missionContentEn', 'missionIcon',
    'valuesTitleFr', 'valuesTitleEn', 'valuesContentFr', 'valuesContentEn',
    'ctaTitleFr', 'ctaTitleEn', 'ctaSubtitleFr', 'ctaSubtitleEn',
    'ctaButtonTextFr', 'ctaButtonTextEn', 'ctaButtonUrl',
    'floatingBadgeTitleFr', 'floatingBadgeTitleEn', 'floatingBadgeTextFr', 'floatingBadgeTextEn',
    'menuLabelFr', 'menuLabelEn',
  ];
  
  for (const field of optionalStringFields) {
    if (cleaned[field] === '') {
      cleaned[field] = null;
    }
  }
  
  // Ensure numeric fields are numbers
  if (typeof cleaned.menuOrder === 'string') {
    cleaned.menuOrder = parseInt(cleaned.menuOrder as string, 10) || 0;
  }
  
  // Ensure boolean fields are booleans
  if (typeof cleaned.showInMenu === 'string') {
    cleaned.showInMenu = cleaned.showInMenu === 'true';
  }
  if (typeof cleaned.published === 'string') {
    cleaned.published = cleaned.published === 'true';
  }
  
  return cleaned;
}

// PUT - Update AboutPage content
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const rawData = await request.json();
    const data = cleanAboutPageData(rawData);

    const aboutPage = await db.aboutPage.upsert({
      where: { id: 'about-page' },
      create: {
        id: 'about-page',
        heroTitleFr: data.heroTitleFr || 'À Propos de Nous',
        heroTitleEn: data.heroTitleEn || 'About Us',
        ...data,
      },
      update: data,
    });

    return NextResponse.json(aboutPage);
  } catch (error) {
    console.error('Error updating about page:', error);
    return NextResponse.json(
      { error: 'Failed to update about page' },
      { status: 500 }
    );
  }
}
