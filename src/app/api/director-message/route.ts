import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Public API for DirectorMessage

// GET - Fetch DirectorMessage content for frontend
export async function GET() {
  try {
    const directorMessage = await db.directorMessage.findUnique({
      where: { id: 'director-message' },
    });

    if (!directorMessage || !directorMessage.published) {
      return NextResponse.json({ 
        data: null,
        message: 'Director message not found or not published'
      });
    }

    // Fetch priorities
    const priorities = await db.directorPriority.findMany({
      where: { visible: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      data: {
        ...directorMessage,
        priorities,
      },
    });
  } catch (error) {
    console.error('Error fetching director message:', error);
    return NextResponse.json(
      { error: 'Failed to fetch director message' },
      { status: 500 }
    );
  }
}
