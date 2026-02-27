import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Global search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const locale = searchParams.get('locale') || 'fr';
    const type = searchParams.get('type');

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [], total: 0 });
    }

    const results: unknown[] = [];

    // Search articles
    if (!type || type === 'articles') {
      const articles = await db.article.findMany({
        where: {
          deletedAt: null,
          published: true,
          OR: [
            { titleFr: { contains: query, mode: 'insensitive' } },
            { titleEn: { contains: query, mode: 'insensitive' } },
            { contentFr: { contains: query, mode: 'insensitive' } },
            { contentEn: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
        orderBy: { publishedAt: 'desc' },
        include: { category: true },
      });

      results.push(
        ...articles.map((article) => ({
          type: 'article',
          id: article.id,
          slug: article.slug,
          title: locale === 'en' && article.titleEn ? article.titleEn : article.titleFr,
          excerpt: locale === 'en' && article.excerptEn ? article.excerptEn : article.excerptFr,
          imageUrl: article.imageUrl,
          date: article.publishedAt,
        }))
      );
    }

    // Search resources
    if (!type || type === 'resources') {
      const resources = await db.resource.findMany({
        where: {
          deletedAt: null,
          published: true,
          OR: [
            { titleFr: { contains: query, mode: 'insensitive' } },
            { titleEn: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      });

      results.push(
        ...resources.map((resource) => ({
          type: 'resource',
          id: resource.id,
          title: locale === 'en' && resource.titleEn ? resource.titleEn : resource.titleFr,
          fileType: resource.fileType,
        }))
      );
    }

    // Search realisations
    if (!type || type === 'realisations') {
      const realisations = await db.realisation.findMany({
        where: {
          deletedAt: null,
          published: true,
          OR: [
            { titleFr: { contains: query, mode: 'insensitive' } },
            { titleEn: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      });

      results.push(
        ...realisations.map((realisation) => ({
          type: 'realisation',
          id: realisation.id,
          title: locale === 'en' && realisation.titleEn ? realisation.titleEn : realisation.titleFr,
          imageUrl: realisation.imageUrl,
        }))
      );
    }

    return NextResponse.json({ results, total: results.length, query });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
