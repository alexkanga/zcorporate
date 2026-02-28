import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');

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

    // Get total count
    const total = await db.realisation.count({ where });

    // Get realisations with pagination
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
      skip: (page - 1) * limit,
      take: limit,
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
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching realisations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch realisations', data: [], categories: [], pagination: { page: 1, limit: 9, total: 0, totalPages: 0 } },
      { status: 500 }
    );
  }
}
