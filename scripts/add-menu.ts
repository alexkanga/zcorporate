import { PrismaClient, MenuLocation } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // First, update the order of existing items to make room
  await prisma.menuItem.updateMany({
    where: { 
      location: MenuLocation.HEADER,
      order: { gte: 5 }
    },
    data: { order: { increment: 1 } }
  });

  // Also update for BOTH location
  await prisma.menuItem.updateMany({
    where: { 
      location: MenuLocation.BOTH,
      order: { gte: 5 }
    },
    data: { order: { increment: 1 } }
  });

  // Check if menu already exists
  const existing = await prisma.menuItem.findUnique({
    where: { id: 'menu-actualites' }
  });

  if (existing) {
    console.log('⚠️ Menu "Actualités" already exists');
    return;
  }

  // Create the Actualités menu item
  const menuItem = await prisma.menuItem.create({
    data: {
      id: 'menu-actualites',
      slug: 'actualites',
      route: '/actualites',
      labelFr: 'Actualités',
      labelEn: 'News',
      visible: true,
      location: MenuLocation.HEADER,
      order: 5,
      external: false,
    }
  });

  console.log('✅ Menu "Actualités" created:', menuItem);
  
  // List all header menus
  const allMenus = await prisma.menuItem.findMany({
    where: { 
      OR: [
        { location: MenuLocation.HEADER },
        { location: MenuLocation.BOTH }
      ]
    },
    orderBy: { order: 'asc' }
  });
  console.log('\n📋 All HEADER menus:');
  allMenus.forEach(m => console.log(`  ${m.order}: ${m.labelFr} -> ${m.route}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
