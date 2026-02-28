import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'upcoming', 'past', or null for all
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');

    const now = new Date();

    // Build date filter
    let dateFilter = {};
    if (filter === 'upcoming') {
      dateFilter = { gte: now };
    } else if (filter === 'past') {
      dateFilter = { lt: now };
    }

    // Build where clause
    const where = {
      deletedAt: null,
      published: true,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
    };

    // Get total count
    const total = await db.event.count({ where });

    // Get events with pagination
    const events = await db.event.findMany({
      where,
      orderBy: {
        date: filter === 'past' ? 'desc' : 'asc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Parse gallery and videos JSON
    const parsedEvents = events.map(event => {
      let gallery: string[] = [];
      let videos: string[] = [];

      if (event.gallery) {
        try {
          gallery = JSON.parse(event.gallery);
        } catch {
          gallery = [];
        }
      }

      if (event.videos) {
        try {
          videos = JSON.parse(event.videos);
        } catch {
          videos = [];
        }
      }

      return {
        ...event,
        gallery,
        videos,
      };
    });

    return NextResponse.json({
      data: parsedEvents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events', data: [], pagination: { page: 1, limit: 6, total: 0, totalPages: 0 } },
      { status: 500 }
    );
  }
}
