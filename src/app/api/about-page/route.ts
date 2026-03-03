import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch AboutPage content for frontend
export async function GET() {
  try {
    const aboutPage = await db.aboutPage.findUnique({
      where: { id: 'about-page' },
    });

    if (!aboutPage || !aboutPage.published) {
      return NextResponse.json(null);
    }

    return NextResponse.json(aboutPage);
  } catch (error) {
    console.error('Error fetching about page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about page' },
      { status: 500 }
    );
  }
}
