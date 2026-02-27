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

    let cta = await db.homeCTA.findUnique({
      where: { id: 'home-cta' },
    });

    if (!cta) {
      cta = await db.homeCTA.create({
        data: {
          id: 'home-cta',
          titleFr: 'Prêt à faire la différence ?',
          titleEn: 'Ready to make a difference?',
        },
      });
    }

    return NextResponse.json(cta);
  } catch (error) {
    console.error('Error fetching home cta:', error);
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

    const cta = await db.homeCTA.upsert({
      where: { id: 'home-cta' },
      update: data,
      create: { id: 'home-cta', ...data },
    });

    return NextResponse.json(cta);
  } catch (error) {
    console.error('Error updating home cta:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
