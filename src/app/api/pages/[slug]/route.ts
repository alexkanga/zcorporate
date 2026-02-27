import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const page = await db.page.findFirst({
      where: {
        slug,
        deletedAt: null,
        published: true,
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found', data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: page });
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page', data: null },
      { status: 500 }
    );
  }
}
