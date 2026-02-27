import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let about = await db.homeAbout.findUnique({
      where: { id: 'home-about' },
    });

    if (!about) {
      about = await db.homeAbout.create({
        data: {
          id: 'home-about',
          titleFr: 'Qui sommes-nous',
          titleEn: 'Who we are',
          contentFr: '',
          contentEn: '',
        },
      });
    }

    return NextResponse.json(about);
  } catch (error) {
    console.error('Error fetching home about:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const about = await db.homeAbout.upsert({
      where: { id: 'home-about' },
      update: data,
      create: { id: 'home-about', ...data },
    });

    return NextResponse.json(about);
  } catch (error) {
    console.error('Error updating home about:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
