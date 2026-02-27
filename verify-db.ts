import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('=== VÉRIFICATION DES DONNÉES DE LA PAGE D\'ACCUEIL ===\n');

  // 1. HomeAbout - Section À propos
  console.log('1. HomeAbout (Section À propos):');
  const homeAbout = await prisma.homeAbout.findUnique({ where: { id: 'home-about' } });
  if (homeAbout) {
    console.log('   ✅ Données trouvées:');
    console.log('   - Titre FR:', homeAbout.titleFr);
    console.log('   - Badge FR:', homeAbout.badgeTextFr);
    console.log('   - Stat 1:', homeAbout.stat1Value, '-', homeAbout.stat1LabelFr);
    console.log('   - Floating Badge:', homeAbout.floatingBadgeTitleFr);
    console.log('   - Image URL:', homeAbout.imageUrl);
  } else {
    console.log('   ❌ Aucune donnée');
  }

  // 2. HomeCTA - Appel à l'action
  console.log('\n2. HomeCTA (Appel à l\'action):');
  const homeCTA = await prisma.homeCTA.findUnique({ where: { id: 'home-cta' } });
  if (homeCTA) {
    console.log('   ✅ Données trouvées:');
    console.log('   - Titre FR:', homeCTA.titleFr);
    console.log('   - Badge FR:', homeCTA.badgeTextFr);
  }

  // 3. HomeSections - Titres des sections
  console.log('\n3. HomeSections (Titres des sections):');
  const sections = await prisma.homeSection.findMany();
  for (const section of sections) {
    console.log(`   ✅ ${section.id}:`);
    console.log(`      - Titre FR: ${section.titleFr}`);
    console.log(`      - Sous-titre FR: ${section.subtitleFr}`);
  }

  // 4. Sliders
  console.log('\n4. Sliders (Carrousel):');
  const sliders = await prisma.slider.findMany({ where: { deletedAt: null, visible: true } });
  console.log('   ✅ Nombre:', sliders.length);
  if (sliders.length > 0) {
    console.log('   - Premier slider:', sliders[0].titleFr);
    console.log('   - Image URL:', sliders[0].imageUrl);
  }

  // 5. Services
  console.log('\n5. Services:');
  const services = await prisma.service.findMany({ where: { deletedAt: null, visible: true } });
  console.log('   ✅ Nombre:', services.length);

  // 6. Testimonials
  console.log('\n6. Témoignages:');
  const testimonials = await prisma.testimonial.findMany({ where: { deletedAt: null, visible: true } });
  console.log('   ✅ Nombre:', testimonials.length);

  // 7. Partners
  console.log('\n7. Partenaires:');
  const partners = await prisma.partner.findMany({ where: { deletedAt: null, visible: true } });
  console.log('   ✅ Nombre:', partners.length);

  // 8. Articles
  console.log('\n8. Articles:');
  const articles = await prisma.article.findMany({ where: { deletedAt: null, published: true }, take: 3 });
  console.log('   ✅ Nombre publiés:', articles.length);
  if (articles.length > 0) {
    console.log('   - Premier article:', articles[0].titleFr);
    console.log('   - Image URL:', articles[0].imageUrl);
  }

  // 9. SiteSettings
  console.log('\n9. SiteSettings (Infos contact):');
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'site-settings' } });
  if (settings) {
    console.log('   ✅ Trouvé:');
    console.log('   - Email:', settings.email);
    console.log('   - Téléphone:', settings.phone);
  }

  console.log('\n=== RÉSUMÉ ===');
  console.log('Toutes les données de la page d\'accueil proviennent de la base de données PostgreSQL.');
  console.log('Les valeurs TEST devraient être visibles sur le frontend.');
  
  await prisma.$disconnect();
}

verify();
