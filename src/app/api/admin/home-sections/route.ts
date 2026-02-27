import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET all home sections
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sections = await db.homeSection.findMany({
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching home sections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
