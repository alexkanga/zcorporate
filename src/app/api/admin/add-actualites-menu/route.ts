import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Add actualités menu item (one-time setup)
export async function POST(request: NextRequest) {
  try {
    // Check if actualités menu exists
    const existing = await db.menuItem.findFirst({
      where: { slug: 'actualites' },
    });

    if (existing) {
      return NextResponse.json({ 
        message: 'Actualités menu item already exists',
        menuItem: existing 
      });
    }

    // Get the max order for header menu
    const maxOrderItem = await db.menuItem.findFirst({
      where: { location: 'HEADER' },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const order = (maxOrderItem?.order ?? 3) + 1;

    // Create the menu item
    const menuItem = await db.menuItem.create({
      data: {
        id: crypto.randomUUID(),
        slug: 'actualites',
        route: '/actualites',
        labelFr: 'Actualités',
        labelEn: 'News',
        location: 'HEADER',
        order: order,
        visible: true,
      },
    });

    return NextResponse.json({ 
      message: 'Actualités menu item created successfully',
      menuItem 
    });
  } catch (error) {
    console.error('Error creating actualités menu:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
