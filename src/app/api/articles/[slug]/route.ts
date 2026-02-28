import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const article = await db.article.findFirst({
      where: {
        slug,
        published: true,
        deletedAt: null,
      },
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
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Transform to match expected format
    const transformedArticle = {
      ...article,
      author: article.User ? { id: article.User.id, name: article.User.name } : null,
      category: article.ArticleCategory ? {
        id: article.ArticleCategory.id,
        nameFr: article.ArticleCategory.nameFr,
        nameEn: article.ArticleCategory.nameEn,
        slug: article.ArticleCategory.slug,
      } : null,
      gallery: article.gallery ? JSON.parse(article.gallery) : [],
      videos: article.videos ? JSON.parse(article.videos) : [],
    };

    return NextResponse.json({ data: transformedArticle });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
