import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Fetch all homepage data in parallel
    const [
      sliders,
      homeAbout,
      services,
      testimonials,
      partners,
      homeCTA,
      latestArticles,
    ] = await Promise.all([
      // Fetch visible sliders ordered by order field
      db.slider.findMany({
        where: {
          visible: true,
          deletedAt: null,
        },
        orderBy: { order: 'asc' },
      }),
      // Fetch home about section
      db.homeAbout.findUnique({
        where: { id: 'home-about' },
      }),
      // Fetch visible services ordered by order field
      db.service.findMany({
        where: {
          visible: true,
          deletedAt: null,
        },
        orderBy: { order: 'asc' },
      }),
      // Fetch visible testimonials ordered by order field
      db.testimonial.findMany({
        where: {
          visible: true,
          deletedAt: null,
        },
        orderBy: { order: 'asc' },
      }),
      // Fetch visible partners ordered by order field
      db.partner.findMany({
        where: {
          visible: true,
          deletedAt: null,
        },
        orderBy: { order: 'asc' },
      }),
      // Fetch home CTA section
      db.homeCTA.findUnique({
        where: { id: 'home-cta' },
      }),
      // Fetch 3 latest published articles
      db.article.findMany({
        where: {
          published: true,
          deletedAt: null,
        },
        orderBy: { publishedAt: 'desc' },
        take: 3,
        include: {
          User: {
            select: {
              name: true,
            },
          },
          ArticleCategory: {
            select: {
              nameFr: true,
              nameEn: true,
              slug: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      sliders,
      homeAbout,
      services,
      testimonials,
      partners,
      homeCTA,
      latestArticles,
    });
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homepage data' },
      { status: 500 }
    );
  }
}
