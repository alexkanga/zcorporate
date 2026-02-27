import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    // Build filter conditions
    const where: {
      deletedAt: null;
      published: boolean;
      categoryId?: string | null;
    } = {
      deletedAt: null,
      published: true,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Get realisations with category
    const realisations = await db.realisation.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            nameFr: true,
            nameEn: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Get categories for filter
    const categories = await db.realisationCategory.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        nameFr: true,
        nameEn: true,
        slug: true,
      },
    });

    return NextResponse.json({
      data: realisations,
      categories,
    });
  } catch (error) {
    console.error('Error fetching realisations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch realisations', data: [], categories: [] },
      { status: 500 }
    );
  }
}
