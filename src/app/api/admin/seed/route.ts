import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient, Role, MenuLocation } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// POST - Run seed (protected)
export async function POST(request: NextRequest) {
  try {
    const seedSecret = request.headers.get('x-seed-secret');
    
    if (seedSecret !== process.env.SEED_SECRET) {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('🌱 Starting seed from API...');

    const superAdminPassword = await bcrypt.hash('SuperAdmin123!', 10);

    await prisma.user.upsert({
      where: { email: 'superadmin@aaea.com' },
      update: {},
      create: {
        email: 'superadmin@aaea.com',
        password: superAdminPassword,
        name: 'Super Administrateur',
        role: Role.SUPER_ADMIN,
        active: true,
      },
    });

    await prisma.siteSettings.upsert({
      where: { id: 'site-settings' },
      update: {},
      create: {
        id: 'site-settings',
        logoUrl: '/logo_aaea.jpg',
        color1: '#362981',
        color2: '#009446',
        color3: '#029CB1',
        color4: '#9AD2E2',
        siteNameFr: 'AAEA',
        siteNameEn: 'AAEA',
      },
    });

    const menuItems = [
      { slug: 'accueil', route: '/', labelFr: 'Accueil', labelEn: 'Home', location: MenuLocation.HEADER, order: 0 },
      { slug: 'a-propos', route: '/a-propos', labelFr: 'Présentation', labelEn: 'Presentation', location: MenuLocation.HEADER, order: 1 },
      { slug: 'solutions', route: '/solutions', labelFr: 'Solutions', labelEn: 'Solutions', location: MenuLocation.HEADER, order: 2 },
      { slug: 'actualites', route: '/actualites', labelFr: 'Actualités', labelEn: 'News', location: MenuLocation.HEADER, order: 3 },
      { slug: 'contact', route: '/contact', labelFr: 'Contact', labelEn: 'Contact', location: MenuLocation.HEADER, order: 4 },
    ];

    for (const item of menuItems) {
      const existing = await prisma.menuItem.findFirst({ where: { slug: item.slug, deletedAt: null } });
      if (!existing) await prisma.menuItem.create({ data: item });
    }

    await prisma.homeAbout.upsert({
      where: { id: 'home-about' },
      update: {},
      create: { id: 'home-about', titleFr: 'Qui sommes-nous', titleEn: 'Who we are', contentFr: '', contentEn: '' },
    });

    await prisma.homeCTA.upsert({
      where: { id: 'home-cta' },
      update: {},
      create: { id: 'home-cta', titleFr: 'Contactez-nous', titleEn: 'Contact us' },
    });

    await prisma.contactInfo.upsert({
      where: { id: 'contact-info' },
      update: {},
      create: { id: 'contact-info' },
    });

    return NextResponse.json({ success: true, message: 'Seed completed successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
