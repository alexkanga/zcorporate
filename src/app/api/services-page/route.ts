import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch public services page data
export async function GET() {
  try {
    const servicesPage = await db.servicesPage.findUnique({
      where: { id: 'services-page' },
    });

    if (!servicesPage || !servicesPage.published) {
      return NextResponse.json(null);
    }

    return NextResponse.json(servicesPage);
  } catch (error) {
    console.error('Error fetching services page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services page' },
      { status: 500 }
    );
  }
}
