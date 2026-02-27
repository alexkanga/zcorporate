import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');

    const events = await db.event.findMany({
      where: {
        deletedAt: null,
        ...(published !== null && { published: published === 'true' }),
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const event = await db.event.create({
      data: {
        titleFr: body.titleFr,
        titleEn: body.titleEn,
        descriptionFr: body.descriptionFr || null,
        descriptionEn: body.descriptionEn || null,
        date: body.date ? new Date(body.date) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
        location: body.location || null,
        imageUrl: body.imageUrl || null,
        gallery: body.gallery || null,
        videos: body.videos || null,
        published: body.published ?? false,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
