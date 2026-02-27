import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const fileType = searchParams.get('fileType');

    // Build filter conditions
    const where: {
      deletedAt: null;
      published: boolean;
      categoryId?: string | null;
      fileType?: { startsWith: string };
    } = {
      deletedAt: null,
      published: true,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (fileType) {
      where.fileType = { startsWith: fileType };
    }

    // Get resources with category
    const resources = await db.resource.findMany({
      where,
      include: {
        ResourceCategory: {
          select: {
            id: true,
            nameFr: true,
            nameEn: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get categories for filter
    const categories = await db.resourceCategory.findMany({
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

    // Get unique file types
    const fileTypes = [...new Set(resources.map(r => r.fileType.split('/')[0]))];

    return NextResponse.json({
      data: resources,
      categories,
      fileTypes,
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources', data: [], categories: [], fileTypes: [] },
      { status: 500 }
    );
  }
}
