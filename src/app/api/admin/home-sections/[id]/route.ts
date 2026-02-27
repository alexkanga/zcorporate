import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// PUT update a home section
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    const section = await db.homeSection.upsert({
      where: { id },
      update: {
        titleFr: data.titleFr,
        titleEn: data.titleEn,
        subtitleFr: data.subtitleFr,
        subtitleEn: data.subtitleEn,
        buttonTextFr: data.buttonTextFr,
        buttonTextEn: data.buttonTextEn,
        buttonUrl: data.buttonUrl,
      },
      create: {
        id,
        titleFr: data.titleFr,
        titleEn: data.titleEn,
        subtitleFr: data.subtitleFr,
        subtitleEn: data.subtitleEn,
        buttonTextFr: data.buttonTextFr,
        buttonTextEn: data.buttonTextEn,
        buttonUrl: data.buttonUrl,
      },
    });

    // Revalidate homepage
    revalidatePath('/', 'layout');
    revalidatePath('/fr', 'page');
    revalidatePath('/en', 'page');

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error updating home section:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
