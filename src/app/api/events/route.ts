import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'upcoming', 'past', or null for all

    const now = new Date();

    // Build date filter
    let dateFilter = {};
    if (filter === 'upcoming') {
      dateFilter = { gte: now };
    } else if (filter === 'past') {
      dateFilter = { lt: now };
    }

    // Get events
    const events = await db.event.findMany({
      where: {
        deletedAt: null,
        published: true,
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      orderBy: {
        date: filter === 'past' ? 'desc' : 'asc',
      },
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
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events', data: [] },
      { status: 500 }
    );
  }
}
