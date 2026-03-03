import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - List all pages
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const pages = await db.page.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des pages' },
      { status: 500 }
    );
  }
}

// POST - Create a new page
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const data = await request.json();
    
    const page = await db.page.create({
      data: {
        id: data.id || `page-${Date.now()}`,
        slug: data.slug,
        titleFr: data.titleFr,
        titleEn: data.titleEn,
        contentFr: data.contentFr || null,
        contentEn: data.contentEn || null,
        metaTitleFr: data.metaTitleFr || null,
        metaTitleEn: data.metaTitleEn || null,
        metaDescriptionFr: data.metaDescriptionFr || null,
        metaDescriptionEn: data.metaDescriptionEn || null,
        published: data.published ?? false,
        order: data.order ?? 0,
        showInMenu: data.showInMenu ?? false,
        parentId: data.parentId || null,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la page' },
      { status: 500 }
    );
  }
}
