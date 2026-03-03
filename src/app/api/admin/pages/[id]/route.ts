import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get a single page by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;

    const page = await db.page.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
        deletedAt: null,
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page non trouvée' }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la page' },
      { status: 500 }
    );
  }
}

// PUT - Update a page
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    // Find page by ID or slug
    const existingPage = await db.page.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
        deletedAt: null,
      },
    });

    if (!existingPage) {
      return NextResponse.json({ error: 'Page non trouvée' }, { status: 404 });
    }

    const page = await db.page.update({
      where: { id: existingPage.id },
      data: {
        titleFr: data.titleFr,
        titleEn: data.titleEn,
        contentFr: data.contentFr || null,
        contentEn: data.contentEn || null,
        metaTitleFr: data.metaTitleFr || null,
        metaTitleEn: data.metaTitleEn || null,
        metaDescriptionFr: data.metaDescriptionFr || null,
        metaDescriptionEn: data.metaDescriptionEn || null,
        published: data.published ?? existingPage.published,
        order: data.order ?? existingPage.order,
        showInMenu: data.showInMenu ?? existingPage.showInMenu,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la page' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete a page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;

    const page = await db.page.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la page' },
      { status: 500 }
    );
  }
}
