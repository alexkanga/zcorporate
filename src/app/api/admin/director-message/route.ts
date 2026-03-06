import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// API for DirectorMessage content management

// GET - Fetch DirectorMessage content
export async function GET() {
  try {
    let directorMessage = await db.directorMessage.findUnique({
      where: { id: 'director-message' },
    });

    if (!directorMessage) {
      // Create default DirectorMessage if not exists
      directorMessage = await db.directorMessage.create({
        data: {
          id: 'director-message',
        },
      });
    }

    // Fetch priorities
    const priorities = await db.directorPriority.findMany({
      where: { visible: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      ...directorMessage,
      priorities,
    });
  } catch (error) {
    console.error('Error fetching director message:', error);
    return NextResponse.json(
      { error: 'Failed to fetch director message' },
      { status: 500 }
    );
  }
}

// Helper to clean data
function cleanDirectorMessageData(data: Record<string, unknown>) {
  const requiredFields = ['heroTitleFr', 'heroTitleEn'];
  
  const defaults: Record<string, string> = {
    heroTitleFr: 'Mot du Directeur Exécutif',
    heroTitleEn: 'Message from the Executive Director',
  };
  
  const cleaned = { ...data };
  
  // Ensure required fields have values
  for (const field of requiredFields) {
    if (cleaned[field] === null || cleaned[field] === undefined || cleaned[field] === '') {
      cleaned[field] = defaults[field];
    }
  }
  
  // Convert empty strings to null for optional string fields
  const optionalStringFields = [
    'heroSubtitleFr', 'heroSubtitleEn', 'heroBadgeFr', 'heroBadgeEn',
    'directorFirstName', 'directorLastName', 'directorCivility',
    'directorPositionFr', 'directorPositionEn', 'directorPositionShortFr', 'directorPositionShortEn',
    'directorPhotoUrl', 'directorPhotoAltFr', 'directorPhotoAltEn', 'directorSignatureUrl',
    'introTextFr', 'introTextEn', 'quoteFr', 'quoteEn',
    'contentFr', 'contentEn',
    'bioShortFr', 'bioShortEn', 'bioLongFr', 'bioLongEn',
    'directorSpecialties', 'directorDistinctions', 'directorLinkedInUrl', 'directorTwitterUrl',
    'videoUrl', 'videoType', 'galleryImages',
    'stat1Value', 'stat1LabelFr', 'stat1LabelEn',
    'stat2Value', 'stat2LabelFr', 'stat2LabelEn',
    'stat3Value', 'stat3LabelFr', 'stat3LabelEn',
    'keyMessagesFr', 'keyMessagesEn', 'prioritiesFr', 'prioritiesEn',
    'commitmentsFr', 'commitmentsEn',
    'cta1TextFr', 'cta1TextEn', 'cta1Url',
    'cta2TextFr', 'cta2TextEn', 'cta2Url',
    'cta3TextFr', 'cta3TextEn', 'cta3Url',
    'metaTitleFr', 'metaTitleEn', 'metaDescriptionFr', 'metaDescriptionEn', 'ogImageUrl',
    'portraitPosition', 'layoutStyle',
  ];
  
  for (const field of optionalStringFields) {
    if (cleaned[field] === '') {
      cleaned[field] = null;
    }
  }
  
  // Ensure numeric fields are numbers
  if (typeof cleaned.directorExperienceYears === 'string') {
    cleaned.directorExperienceYears = parseInt(cleaned.directorExperienceYears as string, 10) || null;
  }
  
  // Ensure boolean fields are booleans
  const booleanFields = [
    'showHero', 'showKeyMessages', 'showPriorities', 'showBiography',
    'showVideo', 'showGallery', 'showStats', 'showCta', 'showNavigation',
    'cta1External', 'cta2External', 'cta3External', 'published',
  ];
  
  for (const field of booleanFields) {
    if (typeof cleaned[field] === 'string') {
      cleaned[field] = cleaned[field] === 'true';
    }
  }
  
  // Handle date fields
  if (cleaned.directorStartDate === '') {
    cleaned.directorStartDate = null;
  }
  if (cleaned.publishedAt === '') {
    cleaned.publishedAt = null;
  }
  
  // Remove priorities from the data (handled separately)
  delete cleaned.priorities;
  
  return cleaned;
}

// PUT - Update DirectorMessage content
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
    const data = cleanDirectorMessageData(rawData);

    const directorMessage = await db.directorMessage.upsert({
      where: { id: 'director-message' },
      create: {
        id: 'director-message',
        heroTitleFr: data.heroTitleFr || 'Mot du Directeur Exécutif',
        heroTitleEn: data.heroTitleEn || 'Message from the Executive Director',
        ...data,
      },
      update: data,
    });

    return NextResponse.json(directorMessage);
  } catch (error) {
    console.error('Error updating director message:', error);
    return NextResponse.json(
      { error: 'Failed to update director message' },
      { status: 500 }
    );
  }
}
