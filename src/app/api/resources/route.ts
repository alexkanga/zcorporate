import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const fileType = searchParams.get('fileType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

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

    // Get total count
    const total = await db.resource.count({ where });

    // Get resources with category and pagination
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
      skip: (page - 1) * limit,
      take: limit,
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

    // Get unique file types from all resources
    const allResources = await db.resource.findMany({
      where: { deletedAt: null, published: true },
      select: { fileType: true },
    });
    const fileTypes = [...new Set(allResources.map(r => r.fileType.split('/')[0]))];

    return NextResponse.json({
      data: resources,
      categories,
      fileTypes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources', data: [], categories: [], fileTypes: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } },
      { status: 500 }
    );
  }
}
