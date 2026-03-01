import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const realisation = await db.realisation.findFirst({
      where: {
        id,
        deletedAt: null,
        published: true,
      },
      include: {
        RealisationCategory: {
          select: {
            id: true,
            nameFr: true,
            nameEn: true,
            slug: true,
          },
        },
      },
    });

    if (!realisation) {
      return NextResponse.json(
        { error: 'Realisation not found', data: null },
        { status: 404 }
      );
    }

    // Parse gallery JSON if exists
    let gallery: string[] = [];
    if (realisation.gallery) {
      try {
        gallery = JSON.parse(realisation.gallery);
      } catch {
        gallery = [];
      }
    }

    // Parse videos JSON if exists
    let videos: string[] = [];
    if (realisation.videos) {
      try {
        videos = JSON.parse(realisation.videos);
      } catch {
        videos = [];
      }
    }

    return NextResponse.json({
      data: {
        ...realisation,
        gallery,
        videos,
        category: realisation.RealisationCategory ? {
          id: realisation.RealisationCategory.id,
          nameFr: realisation.RealisationCategory.nameFr,
          nameEn: realisation.RealisationCategory.nameEn,
          slug: realisation.RealisationCategory.slug,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error fetching realisation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch realisation', data: null },
      { status: 500 }
    );
  }
}
