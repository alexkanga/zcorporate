import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

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

    // Get articles with category and author
    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        include: {
          User: {
            select: {
              id: true,
              name: true,
            },
          },
          ArticleCategory: {
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
          { publishedAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.article.count({ where }),
    ]);

    // Get categories for filter
    const categories = await db.articleCategory.findMany({
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

    // Transform articles to match expected format
    const transformedArticles = articles.map(article => {
      // Parse gallery and videos to get counts
      let photoCount = 0;
      let videoCount = 0;
      
      try {
        const gallery = article.gallery ? JSON.parse(article.gallery) : [];
        photoCount = Array.isArray(gallery) ? gallery.length : 0;
      } catch {
        photoCount = 0;
      }
      
      try {
        const videos = article.videos ? JSON.parse(article.videos) : [];
        videoCount = Array.isArray(videos) ? videos.length : 0;
      } catch {
        videoCount = 0;
      }
      
      return {
        ...article,
        author: article.User ? { id: article.User.id, name: article.User.name } : null,
        category: article.ArticleCategory ? {
          id: article.ArticleCategory.id,
          nameFr: article.ArticleCategory.nameFr,
          nameEn: article.ArticleCategory.nameEn,
          slug: article.ArticleCategory.slug,
        } : null,
        photoCount,
        videoCount,
      };
    });

    return NextResponse.json({
      data: transformedArticles,
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles', data: [], categories: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
      { status: 500 }
    );
  }
}
