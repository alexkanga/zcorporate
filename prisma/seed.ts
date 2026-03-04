import { PrismaClient, Role, MenuLocation } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to generate date-only (no time)
function dateOnly(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00.000Z');
}

// Helper function to generate gallery JSON (3 photos + 3 videos)
function generateGallery(id: string): string {
  return JSON.stringify([
    `/images/gallery/${id}-photo-1.jpg`,
    `/images/gallery/${id}-photo-2.jpg`,
    `/images/gallery/${id}-photo-3.jpg`,
  ]);
}

function generateVideos(id: string): string {
  return JSON.stringify([
    `https://youtube.com/watch?v=${id}-vid-1`,
    `https://youtube.com/watch?v=${id}-vid-2`,
    `https://youtube.com/watch?v=${id}-vid-3`,
  ]);
}

// Helper function to generate files JSON for resources
function generateFiles(baseUrl: string, baseName: string, baseType: string, baseSize: number): string {
  return JSON.stringify([
    { url: baseUrl, name: baseName, type: baseType, size: baseSize },
    { url: baseUrl.replace(/\.[^.]+$/, '-supplement-1.pdf'), name: baseName.replace(/\.[^.]+$/, '-supplement-1.pdf'), type: 'application/pdf', size: 500000 },
    { url: baseUrl.replace(/\.[^.]+$/, '-supplement-2.pdf'), name: baseName.replace(/\.[^.]+$/, '-supplement-2.pdf'), type: 'application/pdf', size: 300000 },
  ]);
}

async function main() {
  console.log('🌱 Starting seed...');

  // ==================== USERS ====================
  console.log('Creating users...');
  
  const superAdminPassword = await bcrypt.hash('SuperAdmin123!', 10);
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const userPassword = await bcrypt.hash('User123!', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@aaea.com' },
    update: { password: superAdminPassword },
    create: {
      id: 'user-superadmin',
      email: 'superadmin@aaea.com',
      password: superAdminPassword,
      name: 'Super Administrateur',
      role: Role.SUPER_ADMIN,
      active: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@aaea.com' },
    update: { password: adminPassword },
    create: {
      id: 'user-admin',
      email: 'admin@aaea.com',
      password: adminPassword,
      name: 'Administrateur',
      role: Role.ADMIN,
      active: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@aaea.com' },
    update: { password: userPassword },
    create: {
      id: 'user-standard',
      email: 'user@aaea.com',
      password: userPassword,
      name: 'Utilisateur',
      role: Role.USER,
      active: true,
    },
  });

  console.log(`✅ Users ready: ${superAdmin.email}, ${admin.email}, ${user.email}`);

  // ==================== SITE SETTINGS ====================
  console.log('Creating site settings...');

  await prisma.siteSettings.upsert({
    where: { id: 'site-settings' },
    update: {},
    create: {
      id: 'site-settings',
      logoUrl: '/logo_aaea.jpg',
      logoAltFr: 'AAEA - Logo',
      logoAltEn: 'AAEA - Logo',
      color1: '#362981',
      color2: '#009446',
      color3: '#029CB1',
      color4: '#9AD2E2',
      siteNameFr: 'AAEA',
      siteNameEn: 'AAEA',
      siteDescriptionFr: "Association pour l'Avancement de l'Environnement et de l'Agriculture",
      siteDescriptionEn: 'Association for the Advancement of Environment and Agriculture',
      address: 'Riviera 2, Bureau Annexe AFWASA, AAEA, Abidjan, Côte d\'Ivoire',
      email: 'contact@aaea.org',
      phone: '+225 07 00 00 00 00',
      phone2: '+225 07 00 00 00 01',
      workingHoursFr: 'Lundi - Vendredi: 8h00 - 17h00',
      workingHoursEn: 'Monday - Friday: 8:00 AM - 5:00 PM',
      socialLinks: JSON.stringify({
        facebook: 'https://facebook.com/aaea',
        twitter: 'https://twitter.com/aaea',
        linkedin: 'https://linkedin.com/company/aaea',
        instagram: 'https://instagram.com/aaea',
        youtube: 'https://youtube.com/aaea',
      }),
      mapLatitude: 5.3397184,
      mapLongitude: -4.02849795,
      mapZoom: 15,
    },
  });

  console.log('✅ Site settings ready');

  // ==================== MENU ITEMS ====================
  console.log('Creating menu items...');

  // Delete the duplicate menu item if it exists
  await prisma.menuItem.deleteMany({
    where: { id: 'menu-presentation' }
  });

  const menuItems = [
    { id: 'menu-accueil', slug: 'accueil', route: '/', labelFr: 'Accueil', labelEn: 'Home', location: MenuLocation.HEADER, order: 0 },
    { id: 'menu-a-propos', slug: 'a-propos', route: '#', labelFr: 'Présentation', labelEn: 'Presentation', location: MenuLocation.HEADER, order: 1 },
    { id: 'menu-services', slug: 'services', route: '/services', labelFr: 'Services', labelEn: 'Services', location: MenuLocation.HEADER, order: 2 },
    { id: 'menu-realisations', slug: 'realisations', route: '/realisations', labelFr: 'Réalisations', labelEn: 'Projects', location: MenuLocation.HEADER, order: 3 },
    { id: 'menu-ressources', slug: 'ressources', route: '/ressources', labelFr: 'Ressources', labelEn: 'Resources', location: MenuLocation.HEADER, order: 4 },
    { id: 'menu-evenements', slug: 'evenements', route: '/evenements', labelFr: 'Événements', labelEn: 'Events', location: MenuLocation.HEADER, order: 5 },
    { id: 'menu-contact', slug: 'contact', route: '/contact', labelFr: 'Contact', labelEn: 'Contact', location: MenuLocation.HEADER, order: 6 },
    { id: 'menu-mentions', slug: 'mentions-legales', route: '/mentions-legales', labelFr: 'Mentions légales', labelEn: 'Legal notice', location: MenuLocation.FOOTER, order: 0 },
    { id: 'menu-confidentialite', slug: 'politique-confidentialite', route: '/politique-confidentialite', labelFr: 'Politique de confidentialité', labelEn: 'Privacy policy', location: MenuLocation.FOOTER, order: 1 },
    { id: 'menu-conditions', slug: 'conditions-utilisation', route: '/conditions-utilisation', labelFr: "Conditions d'utilisation", labelEn: 'Terms of use', location: MenuLocation.FOOTER, order: 2 },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {
        labelFr: item.labelFr,
        labelEn: item.labelEn,
        slug: item.slug,
        route: item.route,
        location: item.location,
        order: item.order,
      },
      create: item,
    });
  }

  console.log('✅ Menu items ready');

  // ==================== SLIDERS ====================
  console.log('Creating sliders...');

  const sliders = [
    { id: 'slider-1', titleFr: "Bienvenue à l'AAEA", titleEn: 'Welcome to AAEA', subtitleFr: 'Ensemble pour un avenir durable et une agriculture responsable', subtitleEn: 'Together for a sustainable future and responsible agriculture', buttonTextFr: 'Découvrir', buttonTextEn: 'Discover', buttonUrl: '/a-propos', imageUrl: '/images/slider-1.jpg', imageAltFr: 'Paysage naturel', imageAltEn: 'Natural landscape', order: 0, visible: true },
    { id: 'slider-2', titleFr: 'Nos Services Innovants', titleEn: 'Our Innovative Services', subtitleFr: "Technologies durables pour l'agriculture de demain", subtitleEn: "Sustainable technologies for tomorrow's agriculture", buttonTextFr: 'En savoir plus', buttonTextEn: 'Learn more', buttonUrl: '/services', imageUrl: '/images/slider-2.jpg', imageAltFr: 'Agriculture moderne', imageAltEn: 'Modern agriculture', order: 1, visible: true },
    { id: 'slider-3', titleFr: 'Formez-vous avec nous', titleEn: 'Train with us', subtitleFr: 'Programmes de formation pour les agriculteurs et les communautés rurales', subtitleEn: 'Training programs for farmers and rural communities', buttonTextFr: 'Nos formations', buttonTextEn: 'Our training', buttonUrl: '/services', imageUrl: '/images/slider-3.jpg', imageAltFr: 'Formation agricole', imageAltEn: 'Agricultural training', order: 2, visible: true },
    { id: 'slider-4', titleFr: "Engagez-vous pour l'environnement", titleEn: 'Commit to the environment', subtitleFr: 'Rejoignez notre mission pour protéger la biodiversité et les ressources naturelles', subtitleEn: 'Join our mission to protect biodiversity and natural resources', buttonTextFr: 'Nous rejoindre', buttonTextEn: 'Join us', buttonUrl: '/contact', imageUrl: '/images/slider-4.jpg', imageAltFr: "Protection de l'environnement", imageAltEn: 'Environmental protection', order: 3, visible: true },
  ];

  for (const slider of sliders) {
    await prisma.slider.upsert({
      where: { id: slider.id },
      update: {},
      create: slider,
    });
  }

  console.log('✅ Sliders ready');

  // ==================== HOME ABOUT & CTA ====================
  await prisma.homeAbout.upsert({
    where: { id: 'home-about' },
    update: {},
    create: {
      id: 'home-about',
      titleFr: 'Qui sommes-nous',
      titleEn: 'Who we are',
      contentFr: "L'AAEA est une organisation dédiée à la promotion de pratiques agricoles durables et à la protection de l'environnement. Nous travaillons avec les communautés locales, les agriculteurs et les décideurs pour créer un avenir plus vert.",
      contentEn: 'AAEA is an organization dedicated to promoting sustainable agricultural practices and protecting the environment. We work with local communities, farmers, and policymakers to create a greener future.',
      imageUrl: '/images/about.jpg',
      imageAltFr: 'Notre équipe en action',
      imageAltEn: 'Our team in action',
      buttonTextFr: 'En savoir plus',
      buttonTextEn: 'Learn more',
      buttonUrl: '/a-propos',
      badgeTextFr: 'À Propos',
      badgeTextEn: 'About Us',
      stat1Value: '10+',
      stat1LabelFr: "Ans d'Expérience",
      stat1LabelEn: 'Years Experience',
      stat2Value: '500+',
      stat2LabelFr: 'Projets Réalisés',
      stat2LabelEn: 'Projects Completed',
      stat3Value: '100%',
      stat3LabelFr: 'Clients Satisfaits',
      stat3LabelEn: 'Client Satisfaction',
      floatingBadgeTitleFr: 'Excellence Certifiée',
      floatingBadgeTitleEn: 'Certified Excellence',
      floatingBadgeTextFr: 'Qualité garantie',
      floatingBadgeTextEn: 'Quality guaranteed',
    },
  });

  await prisma.homeCTA.upsert({
    where: { id: 'home-cta' },
    update: {},
    create: {
      id: 'home-cta',
      titleFr: 'Prêt à faire la différence ?',
      titleEn: 'Ready to make a difference?',
      subtitleFr: 'Rejoignez-nous dans notre mission pour un avenir durable.',
      subtitleEn: 'Join us in our mission for a sustainable future.',
      buttonTextFr: 'Contactez-nous',
      buttonTextEn: 'Contact us',
      buttonUrl: '/contact',
      badgeTextFr: "Commencez Aujourd'hui",
      badgeTextEn: 'Get Started Today',
    },
  });

  // ==================== HOME SECTIONS (Titles & Subtitles) ====================
  console.log('Creating home sections...');

  const homeSections = [
    { 
      id: 'services', 
      titleFr: 'Nos Services', 
      titleEn: 'Our Services',
      subtitleFr: 'Découvrez notre gamme complète de services conçus pour répondre à vos besoins',
      subtitleEn: 'Discover our comprehensive range of services designed to meet your needs',
    },
    { 
      id: 'testimonials', 
      titleFr: 'Ce Que Disent Nos Clients', 
      titleEn: 'What Our Clients Say',
      subtitleFr: 'Découvrez les témoignages de nos partenaires satisfaits',
      subtitleEn: 'Discover testimonials from our satisfied partners',
    },
    { 
      id: 'partners', 
      titleFr: 'Nos Partenaires', 
      titleEn: 'Our Partners',
      subtitleFr: 'Ils nous font confiance à travers le monde',
      subtitleEn: 'Trusted by leading organizations worldwide',
      buttonTextFr: 'Devenir Partenaire',
      buttonTextEn: 'Become a Partner',
      buttonUrl: '/contact',
    },
    { 
      id: 'articles', 
      titleFr: 'Dernières Actualités', 
      titleEn: 'Latest News',
      subtitleFr: 'Restez informé de nos dernières actualités et perspectives',
      subtitleEn: 'Stay updated with our latest news and insights',
      buttonTextFr: 'Voir Tous les Articles',
      buttonTextEn: 'View All Articles',
      buttonUrl: '/actualites',
    },
  ];

  for (const section of homeSections) {
    await prisma.homeSection.upsert({
      where: { id: section.id },
      update: {},
      create: section,
    });
  }

  console.log('✅ Home sections ready');

  // ==================== SERVICES ====================
  console.log('Creating services...');

  const services = [
    { id: 'service-1', titleFr: 'Formation Agricole', titleEn: 'Agricultural Training', descriptionFr: 'Programmes de formation pour les agriculteurs sur les pratiques durables.', descriptionEn: 'Training programs for farmers on sustainable practices.', icon: 'GraduationCap', order: 0, visible: true },
    { id: 'service-2', titleFr: 'Consultation Environnementale', titleEn: 'Environmental Consulting', descriptionFr: 'Conseils experts pour les projets de développement durable.', descriptionEn: 'Expert advice for sustainable development projects.', icon: 'Leaf', order: 1, visible: true },
    { id: 'service-3', titleFr: 'Recherche & Innovation', titleEn: 'Research & Innovation', descriptionFr: 'Recherche sur les technologies agricoles innovantes.', descriptionEn: 'Research on innovative agricultural technologies.', icon: 'Lightbulb', order: 2, visible: true },
    { id: 'service-4', titleFr: 'Développement Communautaire', titleEn: 'Community Development', descriptionFr: 'Programmes de développement pour les communautés rurales.', descriptionEn: 'Development programs for rural communities.', icon: 'Users', order: 3, visible: true },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {},
      create: service,
    });
  }

  console.log('✅ Services ready');

  // ==================== TESTIMONIALS ====================
  console.log('Creating testimonials...');

  const testimonials = [
    { id: 'testimonial-1', name: 'Marie Dupont', company: 'AgriTech Solutions', textFr: "L'AAEA nous a aidés à transformer nos pratiques agricoles. Les résultats sont remarquables.", textEn: 'AAEA helped us transform our agricultural practices. The results are remarkable.', rating: 5, order: 0, visible: true },
    { id: 'testimonial-2', name: 'Jean Martin', company: 'Coopérative Agricole du Sud', textFr: 'Une équipe professionnelle et passionnée. Nos agriculteurs ont beaucoup appris.', textEn: 'A professional and passionate team. Our farmers have learned a lot.', rating: 5, order: 1, visible: true },
    { id: 'testimonial-3', name: 'Sophie Bernard', company: 'Green Future Foundation', textFr: 'Un partenaire incontournable pour tout projet de développement durable.', textEn: 'An essential partner for any sustainable development project.', rating: 5, order: 2, visible: true },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: testimonial.id },
      update: {},
      create: testimonial,
    });
  }

  console.log('✅ Testimonials ready');

  // ==================== PARTNERS ====================
  console.log('Creating partners...');

  const partners = [
    { id: 'partner-1', name: "Ministère de l'Agriculture", logoUrl: '/images/partners/ministere.png', website: 'https://agriculture.gouv.fr', order: 0, visible: true },
    { id: 'partner-2', name: 'FAO', logoUrl: '/images/partners/fao.png', website: 'https://fao.org', order: 1, visible: true },
    { id: 'partner-3', name: 'Banque Mondiale', logoUrl: '/images/partners/worldbank.png', website: 'https://worldbank.org', order: 2, visible: true },
    { id: 'partner-4', name: 'Union Européenne', logoUrl: '/images/partners/eu.png', website: 'https://europa.eu', order: 3, visible: true },
    { id: 'partner-5', name: 'USAID', logoUrl: '/images/partners/usaid.png', website: 'https://usaid.gov', order: 4, visible: true },
    { id: 'partner-6', name: 'GIZ', logoUrl: '/images/partners/giz.png', website: 'https://giz.de', order: 5, visible: true },
    { id: 'partner-7', name: 'AFD', logoUrl: '/images/partners/afd.png', website: 'https://afd.fr', order: 6, visible: true },
    { id: 'partner-8', name: 'CIRAD', logoUrl: '/images/partners/cirad.png', website: 'https://cirad.fr', order: 7, visible: true },
    { id: 'partner-9', name: 'IRD', logoUrl: '/images/partners/ird.png', website: 'https://ird.fr', order: 8, visible: true },
    { id: 'partner-10', name: 'CGIAR', logoUrl: '/images/partners/cgiar.png', website: 'https://cgiar.org', order: 9, visible: true },
    { id: 'partner-11', name: 'Bill & Melinda Gates Foundation', logoUrl: '/images/partners/gates.png', website: 'https://gatesfoundation.org', order: 10, visible: true },
    { id: 'partner-12', name: 'WWF', logoUrl: '/images/partners/wwf.png', website: 'https://wwf.org', order: 11, visible: true },
  ];

  for (const partner of partners) {
    await prisma.partner.upsert({
      where: { id: partner.id },
      update: {},
      create: partner,
    });
  }

  console.log('✅ Partners ready');

  // ==================== CATEGORIES ====================
  console.log('Creating categories...');

  // Realisation categories - use slug for upsert
  const realisationCategories = [
    { id: 'cat-real-1', nameFr: 'Agriculture Durable', nameEn: 'Sustainable Agriculture', slug: 'agriculture-durable', order: 0 },
    { id: 'cat-real-2', nameFr: 'Énergies Renouvelables', nameEn: 'Renewable Energies', slug: 'energies-renouvelables', order: 1 },
    { id: 'cat-real-3', nameFr: "Gestion de l'Eau", nameEn: 'Water Management', slug: 'gestion-eau', order: 2 },
    { id: 'cat-real-4', nameFr: 'Biodiversité', nameEn: 'Biodiversity', slug: 'biodiversite', order: 3 },
  ];

  for (const cat of realisationCategories) {
    await prisma.realisationCategory.upsert({
      where: { slug: cat.slug },
      update: { nameFr: cat.nameFr, nameEn: cat.nameEn, order: cat.order },
      create: cat,
    });
  }

  // Resource categories
  const resourceCategories = [
    { id: 'cat-res-1', nameFr: 'Guides & Manuels', nameEn: 'Guides & Manuals', slug: 'guides-manuels', order: 0 },
    { id: 'cat-res-2', nameFr: 'Rapports', nameEn: 'Reports', slug: 'rapports', order: 1 },
    { id: 'cat-res-3', nameFr: 'Présentations', nameEn: 'Presentations', slug: 'presentations', order: 2 },
    { id: 'cat-res-4', nameFr: 'Documents Techniques', nameEn: 'Technical Documents', slug: 'documents-techniques', order: 3 },
  ];

  for (const cat of resourceCategories) {
    await prisma.resourceCategory.upsert({
      where: { slug: cat.slug },
      update: { nameFr: cat.nameFr, nameEn: cat.nameEn, order: cat.order },
      create: cat,
    });
  }

  // Article categories
  const articleCategories = [
    { id: 'cat-art-1', nameFr: 'Actualités', nameEn: 'News', slug: 'actualites', order: 0 },
    { id: 'cat-art-2', nameFr: 'Conseils', nameEn: 'Tips', slug: 'conseils', order: 1 },
    { id: 'cat-art-3', nameFr: 'Études', nameEn: 'Studies', slug: 'etudes', order: 2 },
  ];

  for (const cat of articleCategories) {
    await prisma.articleCategory.upsert({
      where: { slug: cat.slug },
      update: { nameFr: cat.nameFr, nameEn: cat.nameEn, order: cat.order },
      create: cat,
    });
  }

  console.log('✅ Categories ready');

  // ==================== 12 REALISATIONS ====================
  console.log('Creating 12 realisations...');

  const realisations = [
    { id: 'real-1', titleFr: 'Projet de Reforestation Nord', titleEn: 'North Reforestation Project', descriptionFr: 'Plantation de 50 000 arbres dans la région nord pour lutter contre la désertification.', descriptionEn: 'Planting 50,000 trees in the northern region to combat desertification.', client: "Ministère de l'Environnement", date: dateOnly('2024-01-15'), location: 'Région Nord, Côte d\'Ivoire', imageUrl: '/images/realisations/real-1.jpg', slug: 'agriculture-durable', published: true, featured: true },
    { id: 'real-2', titleFr: 'Installation Solaire Villageoise', titleEn: 'Village Solar Installation', descriptionFr: 'Électrification solaire de 10 villages avec systèmes photovoltaïques autonomes.', descriptionEn: 'Solar electrification of 10 villages with autonomous photovoltaic systems.', client: 'ADB', date: dateOnly('2024-02-20'), location: 'Région Centre, Côte d\'Ivoire', imageUrl: '/images/realisations/real-2.jpg', slug: 'energies-renouvelables', published: true, featured: true },
    { id: 'real-3', titleFr: "Système d'Irrigation Goutte-à-Goutte", titleEn: 'Drip Irrigation System', descriptionFr: "Installation de systèmes d'irrigation efficace pour 200 agriculteurs.", descriptionEn: 'Installation of efficient irrigation systems for 200 farmers.', client: 'FAO', date: dateOnly('2024-03-10'), location: 'Région Sud, Côte d\'Ivoire', imageUrl: '/images/realisations/real-3.jpg', slug: 'gestion-eau', published: true, featured: false },
    { id: 'real-4', titleFr: 'Réserve Naturelle Communautaire', titleEn: 'Community Nature Reserve', descriptionFr: 'Création d\'une réserve de 500 hectares gérée par les communautés locales.', descriptionEn: 'Creation of a 500-hectare reserve managed by local communities.', client: 'WWF', date: dateOnly('2024-04-05'), location: 'Région Ouest, Côte d\'Ivoire', imageUrl: '/images/realisations/real-4.jpg', slug: 'biodiversite', published: true, featured: true },
    { id: 'real-5', titleFr: 'Ferme École Modèle', titleEn: 'Model Farm School', descriptionFr: 'Construction d\'une ferme école pour former 500 jeunes agriculteurs par an.', descriptionEn: 'Construction of a farm school to train 500 young farmers per year.', client: 'Union Européenne', date: dateOnly('2024-05-12'), location: 'Abidjan, Côte d\'Ivoire', imageUrl: '/images/realisations/real-5.jpg', slug: 'agriculture-durable', published: true, featured: false },
    { id: 'real-6', titleFr: 'Biogaz Agricole', titleEn: 'Agricultural Biogas', descriptionFr: 'Installation de digesteurs pour la production de biogaz à partir de déchets agricoles.', descriptionEn: 'Installation of digesters for biogas production from agricultural waste.', client: 'GIZ', date: dateOnly('2024-06-18'), location: 'Région Est, Côte d\'Ivoire', imageUrl: '/images/realisations/real-6.jpg', slug: 'energies-renouvelables', published: true, featured: false },
    { id: 'real-7', titleFr: 'Puits Forés Villageois', titleEn: 'Village Wells Drilling', descriptionFr: 'Forage de 25 puits pour l\'accès à l\'eau potable dans les zones rurales.', descriptionEn: 'Drilling of 25 wells for access to drinking water in rural areas.', client: 'USAID', date: dateOnly('2024-07-22'), location: 'Région Nord, Côte d\'Ivoire', imageUrl: '/images/realisations/real-7.jpg', slug: 'gestion-eau', published: true, featured: true },
    { id: 'real-8', titleFr: 'Corridor Écologique', titleEn: 'Ecological Corridor', descriptionFr: 'Création d\'un corridor écologique de 20 km reliant deux aires protégées.', descriptionEn: 'Creation of a 20 km ecological corridor linking two protected areas.', client: 'CIRAD', date: dateOnly('2024-08-30'), location: 'Région Ouest, Côte d\'Ivoire', imageUrl: '/images/realisations/real-8.jpg', slug: 'biodiversite', published: true, featured: false },
    { id: 'real-9', titleFr: 'Agriculture de Conservation', titleEn: 'Conservation Agriculture', descriptionFr: 'Formation de 300 agriculteurs aux techniques d\'agriculture de conservation.', descriptionEn: 'Training of 300 farmers in conservation agriculture techniques.', client: 'AFD', date: dateOnly('2024-09-15'), location: 'Région Centre, Côte d\'Ivoire', imageUrl: '/images/realisations/real-9.jpg', slug: 'agriculture-durable', published: true, featured: false },
    { id: 'real-10', titleFr: 'Mini-Centrale Hydroélectrique', titleEn: 'Mini Hydroelectric Plant', descriptionFr: 'Construction d\'une mini-centrale hydroélectrique de 500 kW.', descriptionEn: 'Construction of a 500 kW mini hydroelectric plant.', client: 'Banque Mondiale', date: dateOnly('2024-10-08'), location: 'Région Ouest, Côte d\'Ivoire', imageUrl: '/images/realisations/real-10.jpg', slug: 'energies-renouvelables', published: true, featured: true },
    { id: 'real-11', titleFr: 'Bassin de Rétention', titleEn: 'Retention Basin', descriptionFr: 'Construction de 5 bassins de rétention pour l\'agriculture pluviale.', descriptionEn: 'Construction of 5 retention basins for rainfed agriculture.', client: 'FAO', date: dateOnly('2024-11-20'), location: 'Région Nord, Côte d\'Ivoire', imageUrl: '/images/realisations/real-11.jpg', slug: 'gestion-eau', published: true, featured: false },
    { id: 'real-12', titleFr: 'Apiers Communautaires', titleEn: 'Community Apiaries', descriptionFr: 'Installation de 100 ruches pour la pollinisation et production de miel.', descriptionEn: 'Installation of 100 hives for pollination and honey production.', client: 'IRD', date: dateOnly('2024-12-05'), location: 'Région Sud, Côte d\'Ivoire', imageUrl: '/images/realisations/real-12.jpg', slug: 'biodiversite', published: true, featured: false },
  ];

  for (const real of realisations) {
    const category = await prisma.realisationCategory.findUnique({ where: { slug: real.slug } });
    await prisma.realisation.upsert({
      where: { id: real.id },
      update: {},
      create: {
        id: real.id,
        titleFr: real.titleFr,
        titleEn: real.titleEn,
        descriptionFr: real.descriptionFr,
        descriptionEn: real.descriptionEn,
        client: real.client,
        date: real.date,
        location: real.location,
        imageUrl: real.imageUrl,
        gallery: generateGallery(real.id),
        videos: generateVideos(real.id),
        published: real.published,
        featured: real.featured,
        categoryId: category?.id,
      },
    });
  }

  console.log('✅ 12 Réalisations créées');

  // ==================== 12 EVENTS ====================
  console.log('Creating 12 events...');

  const events = [
    { id: 'event-1', titleFr: "Forum National de l'Agriculture", titleEn: 'National Agriculture Forum', descriptionFr: 'Grand forum rassemblant les acteurs du secteur agricole pour échanger sur les innovations.', descriptionEn: 'Major forum bringing together agricultural sector actors to exchange on innovations.', date: dateOnly('2025-03-15'), endDate: dateOnly('2025-03-17'), location: 'Palais des Congrès, Abidjan', imageUrl: '/images/events/event-1.jpg', published: true },
    { id: 'event-2', titleFr: "Journée de l'Arbre", titleEn: 'Tree Day', descriptionFr: 'Célébration de la journée de l\'arbre avec plantation de 10 000 arbres.', descriptionEn: 'Celebration of Tree Day with planting of 10,000 trees.', date: dateOnly('2025-03-21'), endDate: null, location: 'Région Nord, Côte d\'Ivoire', imageUrl: '/images/events/event-2.jpg', published: true },
    { id: 'event-3', titleFr: 'Formation Agroécologie', titleEn: 'Agroecology Training', descriptionFr: 'Session de formation sur les pratiques agroécologiques pour 100 agriculteurs.', descriptionEn: 'Training session on agroecological practices for 100 farmers.', date: dateOnly('2025-04-05'), endDate: dateOnly('2025-04-10'), location: 'Centre de Formation AAEA', imageUrl: '/images/events/event-3.jpg', published: true },
    { id: 'event-4', titleFr: 'Conférence Biodiversité', titleEn: 'Biodiversity Conference', descriptionFr: 'Conférence internationale sur la préservation de la biodiversité en Afrique.', descriptionEn: 'International conference on biodiversity preservation in Africa.', date: dateOnly('2025-04-22'), endDate: dateOnly('2025-04-24'), location: 'Hôtel Ivoire, Abidjan', imageUrl: '/images/events/event-4.jpg', published: true },
    { id: 'event-5', titleFr: "Salon de l'Environnement", titleEn: 'Environment Exhibition', descriptionFr: 'Salon annuel dédié aux solutions environnementales et durables.', descriptionEn: 'Annual exhibition dedicated to environmental and sustainable solutions.', date: dateOnly('2025-05-10'), endDate: dateOnly('2025-05-14'), location: 'Parc des Expositions, Abidjan', imageUrl: '/images/events/event-5.jpg', published: true },
    { id: 'event-6', titleFr: 'Atelier Énergies Renouvelables', titleEn: 'Renewable Energy Workshop', descriptionFr: 'Atelier pratique sur l\'installation de panneaux solaires.', descriptionEn: 'Practical workshop on solar panel installation.', date: dateOnly('2025-05-20'), endDate: dateOnly('2025-05-22'), location: 'Centre Technique AAEA', imageUrl: '/images/events/event-6.jpg', published: true },
    { id: 'event-7', titleFr: "Journée Mondiale de l'Eau", titleEn: 'World Water Day', descriptionFr: 'Sensibilisation sur la gestion durable des ressources en eau.', descriptionEn: 'Awareness raising on sustainable water resource management.', date: dateOnly('2025-03-22'), endDate: null, location: 'Abidjan, Côte d\'Ivoire', imageUrl: '/images/events/event-7.jpg', published: true },
    { id: 'event-8', titleFr: 'Fête de la Récolte', titleEn: 'Harvest Festival', descriptionFr: 'Célébration des récoltes avec les communautés agricoles partenaires.', descriptionEn: 'Celebration of harvests with partner farming communities.', date: dateOnly('2025-06-15'), endDate: null, location: 'Région Sud, Côte d\'Ivoire', imageUrl: '/images/events/event-8.jpg', published: true },
    { id: 'event-9', titleFr: 'Semaine Verte', titleEn: 'Green Week', descriptionFr: 'Semaine de sensibilisation environnementale dans les écoles.', descriptionEn: 'Environmental awareness week in schools.', date: dateOnly('2025-06-02'), endDate: dateOnly('2025-06-07'), location: 'Écoles d\'Abidjan', imageUrl: '/images/events/event-9.jpg', published: true },
    { id: 'event-10', titleFr: 'Sommet Climat Régional', titleEn: 'Regional Climate Summit', descriptionFr: 'Sommet des leaders régionaux sur l\'adaptation climatique.', descriptionEn: 'Summit of regional leaders on climate adaptation.', date: dateOnly('2025-07-10'), endDate: dateOnly('2025-07-12'), location: 'Palais des Congrès, Abidjan', imageUrl: '/images/events/event-10.jpg', published: true },
    { id: 'event-11', titleFr: 'Formation Gestion des Sols', titleEn: 'Soil Management Training', descriptionFr: 'Formation sur les techniques de conservation des sols.', descriptionEn: 'Training on soil conservation techniques.', date: dateOnly('2025-07-25'), endDate: dateOnly('2025-07-28'), location: 'Centre de Formation AAEA', imageUrl: '/images/events/event-11.jpg', published: true },
    { id: 'event-12', titleFr: 'Gala Annuel AAEA', titleEn: 'Annual AAEA Gala', descriptionFr: 'Soirée de remise des prix et levée de fonds annuelle.', descriptionEn: 'Annual awards ceremony and fundraising evening.', date: dateOnly('2025-12-10'), endDate: null, location: 'Hôtel Sofitel, Abidjan', imageUrl: '/images/events/event-12.jpg', published: true },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: {},
      create: {
        ...event,
        imageAltFr: event.titleFr,
        imageAltEn: event.titleEn,
        gallery: generateGallery(event.id),
        videos: generateVideos(event.id),
      },
    });
  }

  console.log('✅ 12 Événements créés');

  // ==================== 12 ARTICLES ====================
  console.log('Creating 12 articles...');

  const articles = [
    { id: 'article-1', titleFr: 'Lancement du programme de formation 2025', titleEn: 'Launch of the 2025 training program', slug: 'lancement-programme-2025', contentFr: '<p>Nous sommes ravis d\'annoncer le lancement de notre nouveau programme de formation agricole pour l\'année 2025. Ce programme vise à former 1000 agriculteurs aux techniques durables.</p>', contentEn: '<p>We are excited to announce the launch of our new agricultural training program for 2025. This program aims to train 1000 farmers in sustainable techniques.</p>', excerptFr: 'Découvrez notre nouveau programme de formation agricole 2025.', excerptEn: 'Discover our new 2025 agricultural training program.', imageUrl: '/images/articles/article-1.jpg', catSlug: 'actualites', published: true, featured: true, publishedAt: dateOnly('2025-01-15') },
    { id: 'article-2', titleFr: "Les enjeux de l'agriculture durable en Afrique", titleEn: 'Challenges of sustainable agriculture in Africa', slug: 'enjeux-agriculture-durable-afrique', contentFr: '<p>L\'agriculture durable représente un défi majeur pour le continent africain. Cet article explore les solutions innovantes mises en place.</p>', contentEn: '<p>Sustainable agriculture represents a major challenge for the African continent. This article explores the innovative solutions implemented.</p>', excerptFr: 'Analyse des défis et solutions pour l\'agriculture durable.', excerptEn: 'Analysis of challenges and solutions for sustainable agriculture.', imageUrl: '/images/articles/article-2.jpg', catSlug: 'etudes', published: true, featured: true, publishedAt: dateOnly('2025-01-22') },
    { id: 'article-3', titleFr: '5 conseils pour une irrigation efficace', titleEn: '5 tips for efficient irrigation', slug: 'conseils-irrigation-efficace', contentFr: '<p>Découvrez nos 5 conseils essentiels pour optimiser votre système d\'irrigation et économiser l\'eau tout en maximisant vos rendements.</p>', contentEn: '<p>Discover our 5 essential tips to optimize your irrigation system and save water while maximizing your yields.</p>', excerptFr: 'Optimisez votre irrigation avec ces 5 conseils pratiques.', excerptEn: 'Optimize your irrigation with these 5 practical tips.', imageUrl: '/images/articles/article-3.jpg', catSlug: 'conseils', published: true, featured: false, publishedAt: dateOnly('2025-02-01') },
    { id: 'article-4', titleFr: 'Nouveau partenariat avec la FAO', titleEn: 'New partnership with FAO', slug: 'partenariat-fao-2025', contentFr: '<p>L\'AAEA est fière d\'annoncer un nouveau partenariat stratégique avec la FAO pour promouvoir l\'agriculture durable en Afrique de l\'Ouest.</p>', contentEn: '<p>AAEA is proud to announce a new strategic partnership with FAO to promote sustainable agriculture in West Africa.</p>', excerptFr: 'Annonce d\'un partenariat stratégique avec la FAO.', excerptEn: 'Announcement of a strategic partnership with FAO.', imageUrl: '/images/articles/article-4.jpg', catSlug: 'actualites', published: true, featured: true, publishedAt: dateOnly('2025-02-10') },
    { id: 'article-5', titleFr: "L'impact du changement climatique sur l'agriculture", titleEn: 'Impact of climate change on agriculture', slug: 'impact-changement-climatique', contentFr: '<p>Étude approfondie sur les effets du changement climatique sur les pratiques agricoles et les stratégies d\'adaptation.</p>', contentEn: '<p>In-depth study on the effects of climate change on agricultural practices and adaptation strategies.</p>', excerptFr: 'Étude sur les effets du changement climatique en agriculture.', excerptEn: 'Study on the effects of climate change in agriculture.', imageUrl: '/images/articles/article-5.jpg', catSlug: 'etudes', published: true, featured: false, publishedAt: dateOnly('2025-02-18') },
    { id: 'article-6', titleFr: 'Techniques de compostage pour débutants', titleEn: 'Composting techniques for beginners', slug: 'techniques-compostage', contentFr: '<p>Guide pratique pour démarrer votre compostage et améliorer la fertilité de votre sol de manière naturelle.</p>', contentEn: '<p>Practical guide to start composting and improve your soil fertility naturally.</p>', excerptFr: 'Guide pratique du compostage pour améliorer vos sols.', excerptEn: 'Practical composting guide to improve your soils.', imageUrl: '/images/articles/article-6.jpg', catSlug: 'conseils', published: true, featured: false, publishedAt: dateOnly('2025-02-25') },
    { id: 'article-7', titleFr: 'Résultats du projet de reforestation', titleEn: 'Reforestation project results', slug: 'resultats-reforestation-2024', contentFr: '<p>Bilan positif du projet de reforestation avec 50 000 arbres plantés dans la région nord de la Côte d\'Ivoire.</p>', contentEn: '<p>Positive assessment of the reforestation project with 50,000 trees planted in northern Côte d\'Ivoire.</p>', excerptFr: 'Bilan du projet avec 50 000 arbres plantés.', excerptEn: 'Project assessment with 50,000 trees planted.', imageUrl: '/images/articles/article-7.jpg', catSlug: 'actualites', published: true, featured: false, publishedAt: dateOnly('2025-03-05') },
    { id: 'article-8', titleFr: "L'agroforesterie : une solution d'avenir", titleEn: 'Agroforestry: a solution for the future', slug: 'agroforesterie-solution-avenir', contentFr: '<p>Découvrez comment l\'agroforesterie combine agriculture et foresterie pour créer des systèmes plus résilients.</p>', contentEn: '<p>Discover how agroforestry combines agriculture and forestry to create more resilient systems.</p>', excerptFr: 'L\'agroforesterie au service d\'une agriculture résiliente.', excerptEn: 'Agroforestry for resilient agriculture.', imageUrl: '/images/articles/article-8.jpg', catSlug: 'etudes', published: true, featured: true, publishedAt: dateOnly('2025-03-12') },
    { id: 'article-9', titleFr: 'Protection des cultures biologiques', titleEn: 'Protecting organic crops', slug: 'protection-cultures-biologiques', contentFr: '<p>Méthodes naturelles pour protéger vos cultures contre les ravageurs sans utiliser de pesticides chimiques.</p>', contentEn: '<p>Natural methods to protect your crops against pests without using chemical pesticides.</p>', excerptFr: 'Méthodes naturelles de protection des cultures.', excerptEn: 'Natural crop protection methods.', imageUrl: '/images/articles/article-9.jpg', catSlug: 'conseils', published: true, featured: false, publishedAt: dateOnly('2025-03-20') },
    { id: 'article-10', titleFr: 'Formation de formateurs : une réussite', titleEn: 'Training of trainers: a success', slug: 'formation-formateurs-reussite', contentFr: '<p>Rétrospective sur la session de formation de formateurs qui a permis de certifier 50 nouveaux formateurs agricoles.</p>', contentEn: '<p>Retrospective on the training of trainers session that certified 50 new agricultural trainers.</p>', excerptFr: '50 nouveaux formateurs certifiés avec succès.', excerptEn: '50 new trainers successfully certified.', imageUrl: '/images/articles/article-10.jpg', catSlug: 'actualites', published: true, featured: false, publishedAt: dateOnly('2025-03-28') },
    { id: 'article-11', titleFr: 'Les bénéfices de la rotation des cultures', titleEn: 'Benefits of crop rotation', slug: 'benefices-rotation-cultures', contentFr: '<p>Comment la rotation des cultures peut améliorer la santé de votre sol et augmenter vos rendements.</p>', contentEn: '<p>How crop rotation can improve your soil health and increase your yields.</p>', excerptFr: 'Améliorez vos sols avec la rotation des cultures.', excerptEn: 'Improve your soils with crop rotation.', imageUrl: '/images/articles/article-11.jpg', catSlug: 'conseils', published: true, featured: false, publishedAt: dateOnly('2025-04-05') },
    { id: 'article-12', titleFr: "Innovation : l'agriculture de précision", titleEn: 'Innovation: precision agriculture', slug: 'innovation-agriculture-precision', contentFr: '<p>Explorer les nouvelles technologies de l\'agriculture de précision et leur application en Afrique.</p>', contentEn: '<p>Explore new precision agriculture technologies and their application in Africa.</p>', excerptFr: 'Les technologies de l\'agriculture de précision en Afrique.', excerptEn: 'Precision agriculture technologies in Africa.', imageUrl: '/images/articles/article-12.jpg', catSlug: 'etudes', published: true, featured: true, publishedAt: dateOnly('2025-04-15') },
  ];

  for (const article of articles) {
    const category = await prisma.articleCategory.findUnique({ where: { slug: article.catSlug } });
    await prisma.article.upsert({
      where: { id: article.id },
      update: {},
      create: {
        id: article.id,
        titleFr: article.titleFr,
        titleEn: article.titleEn,
        slug: article.slug,
        contentFr: article.contentFr,
        contentEn: article.contentEn,
        excerptFr: article.excerptFr,
        excerptEn: article.excerptEn,
        imageUrl: article.imageUrl,
        imageAltFr: article.titleFr,
        imageAltEn: article.titleEn,
        gallery: generateGallery(article.id),
        videos: generateVideos(article.id),
        published: article.published,
        featured: article.featured,
        publishedAt: article.publishedAt,
        authorId: superAdmin.id,
        categoryId: category?.id,
      },
    });
  }

  console.log('✅ 12 Articles créés');

  // ==================== 12 RESOURCES ====================
  console.log('Creating 12 resources...');

  const resources = [
    { id: 'resource-1', titleFr: "Guide de l'Agriculture Durable", titleEn: 'Sustainable Agriculture Guide', descriptionFr: 'Guide complet sur les pratiques agricoles durables adaptées au contexte africain.', descriptionEn: 'Complete guide on sustainable agricultural practices adapted to the African context.', fileUrl: '/files/guide-agriculture-durable.pdf', fileType: 'application/pdf', fileSize: 2500000, fileName: 'guide-agriculture-durable.pdf', catSlug: 'guides-manuels', published: true },
    { id: 'resource-2', titleFr: 'Rapport Annuel 2024', titleEn: 'Annual Report 2024', descriptionFr: 'Bilan complet des activités et réalisations de l\'AAEA en 2024.', descriptionEn: 'Complete assessment of AAEA activities and achievements in 2024.', fileUrl: '/files/rapport-annuel-2024.pdf', fileType: 'application/pdf', fileSize: 5000000, fileName: 'rapport-annuel-2024.pdf', catSlug: 'rapports', published: true },
    { id: 'resource-3', titleFr: 'Présentation Formation Agroécologie', titleEn: 'Agroecology Training Presentation', descriptionFr: 'Support de présentation pour la formation en agroécologie.', descriptionEn: 'Presentation slides for agroecology training.', fileUrl: '/files/presentation-agroecologie.pptx', fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', fileSize: 8000000, fileName: 'presentation-agroecologie.pptx', catSlug: 'presentations', published: true },
    { id: 'resource-4', titleFr: "Manuel de Gestion de l'Eau", titleEn: 'Water Management Manual', descriptionFr: 'Manuel technique sur les techniques de gestion et conservation de l\'eau.', descriptionEn: 'Technical manual on water management and conservation techniques.', fileUrl: '/files/manuel-gestion-eau.pdf', fileType: 'application/pdf', fileSize: 3500000, fileName: 'manuel-gestion-eau.pdf', catSlug: 'documents-techniques', published: true },
    { id: 'resource-5', titleFr: 'Fiches Techniques Cultures', titleEn: 'Crop Technical Sheets', descriptionFr: 'Ensemble de fiches techniques pour les principales cultures tropicales.', descriptionEn: 'Set of technical sheets for main tropical crops.', fileUrl: '/files/fiches-techniques-cultures.pdf', fileType: 'application/pdf', fileSize: 1800000, fileName: 'fiches-techniques-cultures.pdf', catSlug: 'guides-manuels', published: true },
    { id: 'resource-6', titleFr: 'Étude Impact Climatique', titleEn: 'Climate Impact Study', descriptionFr: 'Étude détaillée sur l\'impact du changement climatique sur l\'agriculture ouest-africaine.', descriptionEn: 'Detailed study on climate change impact on West African agriculture.', fileUrl: '/files/etude-impact-climatique.pdf', fileType: 'application/pdf', fileSize: 6000000, fileName: 'etude-impact-climatique.pdf', catSlug: 'rapports', published: true },
    { id: 'resource-7', titleFr: 'Présentation Énergies Renouvelables', titleEn: 'Renewable Energy Presentation', descriptionFr: 'Support de formation sur les énergies renouvelables en milieu rural.', descriptionEn: 'Training material on renewable energy in rural areas.', fileUrl: '/files/presentation-energies-renouvelables.pptx', fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', fileSize: 12000000, fileName: 'presentation-energies-renouvelables.pptx', catSlug: 'presentations', published: true },
    { id: 'resource-8', titleFr: 'Protocole Compostage', titleEn: 'Composting Protocol', descriptionFr: 'Protocole détaillé pour la mise en place d\'un système de compostage efficace.', descriptionEn: 'Detailed protocol for setting up an efficient composting system.', fileUrl: '/files/protocole-compostage.pdf', fileType: 'application/pdf', fileSize: 900000, fileName: 'protocole-compostage.pdf', catSlug: 'documents-techniques', published: true },
    { id: 'resource-9', titleFr: 'Guide Pisciculture', titleEn: 'Fish Farming Guide', descriptionFr: 'Manuel complet sur l\'élevage de poissons en contexte tropical.', descriptionEn: 'Complete manual on fish farming in tropical context.', fileUrl: '/files/guide-pisciculture.pdf', fileType: 'application/pdf', fileSize: 4200000, fileName: 'guide-pisciculture.pdf', catSlug: 'guides-manuels', published: true },
    { id: 'resource-10', titleFr: 'Rapport Partenariats', titleEn: 'Partnerships Report', descriptionFr: 'Bilan des partenariats stratégiques et leur impact sur nos projets.', descriptionEn: 'Assessment of strategic partnerships and their impact on our projects.', fileUrl: '/files/rapport-partenariats.pdf', fileType: 'application/pdf', fileSize: 2200000, fileName: 'rapport-partenariats.pdf', catSlug: 'rapports', published: true },
    { id: 'resource-11', titleFr: 'Formation Apiculture', titleEn: 'Beekeeping Training', descriptionFr: 'Support de formation sur l\'apiculture moderne et durable.', descriptionEn: 'Training material on modern and sustainable beekeeping.', fileUrl: '/files/formation-apiculture.pptx', fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', fileSize: 6500000, fileName: 'formation-apiculture.pptx', catSlug: 'presentations', published: true },
    { id: 'resource-12', titleFr: 'Spécifications Techniques Sol', titleEn: 'Soil Technical Specifications', descriptionFr: 'Document technique sur l\'analyse et l\'amélioration des sols agricoles.', descriptionEn: 'Technical document on agricultural soil analysis and improvement.', fileUrl: '/files/specifications-sol.pdf', fileType: 'application/pdf', fileSize: 1500000, fileName: 'specifications-sol.pdf', catSlug: 'documents-techniques', published: true },
  ];

  for (const resource of resources) {
    const category = await prisma.resourceCategory.findUnique({ where: { slug: resource.catSlug } });
    await prisma.resource.upsert({
      where: { id: resource.id },
      update: {},
      create: {
        id: resource.id,
        titleFr: resource.titleFr,
        titleEn: resource.titleEn,
        descriptionFr: resource.descriptionFr,
        descriptionEn: resource.descriptionEn,
        fileUrl: resource.fileUrl,
        fileType: resource.fileType,
        fileSize: resource.fileSize,
        fileName: resource.fileName,
        files: generateFiles(resource.fileUrl, resource.fileName, resource.fileType, resource.fileSize),
        published: resource.published,
        categoryId: category?.id,
      },
    });
  }

  console.log('✅ 12 Ressources créées');

  // ==================== CONTACT INFO ====================
  console.log('Creating contact info...');

  await prisma.contactInfo.upsert({
    where: { id: 'contact-info' },
    update: {},
    create: {
      id: 'contact-info',
      titleFr: 'Contactez-nous',
      titleEn: 'Contact us',
      descriptionFr: 'Nous sommes à votre disposition pour répondre à toutes vos questions.',
      descriptionEn: 'We are at your disposal to answer all your questions.',
      address: 'Riviera 2, Bureau Annexe AFWASA, AAEA, Abidjan, Côte d\'Ivoire',
      email: 'contact@aaea.org',
      phone: '+225 07 00 00 00 00',
      phone2: '+225 07 00 00 00 01',
      workingHoursFr: 'Lundi - Vendredi: 8h00 - 17h00',
      workingHoursEn: 'Monday - Friday: 8:00 AM - 5:00 PM',
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127066.36867947827!2d-4.02849795!3d5.3397184!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfc1ebea7b5c2c3f%3A0x3a3e3a3a3a3a3a3a!2sRiviera%202%2C%20Abidjan%2C%20C%C3%B4te%20d'Ivoire!5e0!3m2!1sfr!2sfr!4v1708900000000!5m2!1sfr!2sfr",
      emailTo: 'kalexane@yahoo.fr',
      emailCc1: null,
      emailCc2: null,
      emailBcc: null,
    },
  });

  console.log('✅ Contact info ready');

  // ==================== ABOUT PAGE ====================
  console.log('Creating About Page...');

  await prisma.aboutPage.upsert({
    where: { id: 'about-page' },
    update: {
      heroTitleFr: 'À Propos de l\'AAEA',
      heroTitleEn: 'About AAEA',
      heroSubtitleFr: 'Association Africaine de l\'Eau et de l\'Assainissement - Au service des communautés depuis plus de 15 ans',
      heroSubtitleEn: 'African Water and Sanitation Association - Serving communities for over 15 years',
      heroBadgeFr: 'Présentation',
      heroBadgeEn: 'Presentation',
      heroImageUrl: '/images/about.jpg',
      heroImageAltFr: 'Équipe AAEA en action',
      heroImageAltEn: 'AAEA team in action',
      // Main Content
      mainTitleFr: 'Notre Histoire',
      mainTitleEn: 'Our Story',
      mainContentFr: `<p>L'<strong>Association Africaine de l'Eau et de l'Assainissement (AAEA)</strong> est une organisation panafricaine créée avec la vision d'améliorer l'accès à l'eau potable et à l'assainissement pour tous les Africains.</p>
<p>Fondée par des experts passionnés du secteur de l'eau, l'AAEA s'est donnée pour mission de promouvoir des solutions durables et innovantes pour la gestion des ressources en eau à travers le continent.</p>
<p>Nous travaillons en étroite collaboration avec les gouvernements, les organisations internationales, les communautés locales et le secteur privé pour développer des programmes d'approvisionnement en eau potable, d'assainissement et d'hygiène adaptés aux réalités africaines.</p>`,
      mainContentEn: `<p>The <strong>African Water and Sanitation Association (AAEA)</strong> is a pan-African organization created with the vision of improving access to safe water and sanitation for all Africans.</p>
<p>Founded by passionate water sector experts, AAEA's mission is to promote sustainable and innovative solutions for water resource management across the continent.</p>
<p>We work closely with governments, international organizations, local communities, and the private sector to develop water supply, sanitation, and hygiene programs adapted to African realities.</p>`,
      mainImageUrl: '/images/about.jpg',
      mainImageAltFr: 'Projets AAEA',
      mainImageAltEn: 'AAEA Projects',
      // Statistics
      stat1Value: '15+',
      stat1LabelFr: "Années d'Expérience",
      stat1LabelEn: 'Years of Experience',
      stat2Value: '50+',
      stat2LabelFr: 'Pays Membres',
      stat2LabelEn: 'Member Countries',
      stat3Value: '5M+',
      stat3LabelFr: 'Bénéficiaires',
      stat3LabelEn: 'Beneficiaries',
      stat4Value: '200+',
      stat4LabelFr: 'Projets Réalisés',
      stat4LabelEn: 'Projects Completed',
      // Mission
      missionTitleFr: 'Notre Mission',
      missionTitleEn: 'Our Mission',
      missionContentFr: `<p>Contribuer à l'amélioration durable des conditions de vie des populations africaines en promouvant l'accès équitable à l'eau potable, à l'assainissement et à l'hygiène.</p>
<p>Nous nous engageons à:</p>
<ul>
<li>Renforcer les capacités des acteurs de l'eau et de l'assainissement</li>
<li>Promouvoir la gouvernance participative des ressources en eau</li>
<li>Développer des solutions technologiques appropriées et durables</li>
<li>Favoriser les partenariats public-privé pour le développement du secteur</li>
</ul>`,
      missionContentEn: `<p>Contribute to the sustainable improvement of living conditions for African populations by promoting equitable access to safe water, sanitation, and hygiene.</p>
<p>We are committed to:</p>
<ul>
<li>Strengthening the capacities of water and sanitation stakeholders</li>
<li>Promoting participatory water resource governance</li>
<li>Developing appropriate and sustainable technological solutions</li>
<li>Encouraging public-private partnerships for sector development</li>
</ul>`,
      // Values
      valuesTitleFr: 'Nos Valeurs',
      valuesTitleEn: 'Our Values',
      valuesContentFr: `<p><strong>Excellence:</strong> Nous visons l'excellence dans tous nos projets et programmes.</p>
<p><strong>Intégrité:</strong> Nous agissons avec transparence et éthique dans toutes nos actions.</p>
<p><strong>Innovation:</strong> Nous encourageons les solutions créatives et adaptées aux contextes locaux.</p>
<p><strong>Collaboration:</strong> Nous croyons en la force du partenariat et de la coopération.</p>
<p><strong>Durabilité:</strong> Nous privilégions les solutions à long terme respectueuses de l'environnement.</p>`,
      valuesContentEn: `<p><strong>Excellence:</strong> We aim for excellence in all our projects and programs.</p>
<p><strong>Integrity:</strong> We act with transparency and ethics in all our actions.</p>
<p><strong>Innovation:</strong> We encourage creative solutions adapted to local contexts.</p>
<p><strong>Collaboration:</strong> We believe in the power of partnership and cooperation.</p>
<p><strong>Sustainability:</strong> We prioritize long-term, environmentally-friendly solutions.</p>`,
      // CTA
      ctaTitleFr: 'Rejoignez notre mission',
      ctaTitleEn: 'Join our mission',
      ctaSubtitleFr: 'Ensemble, construisons un avenir où chaque Africain a accès à l\'eau potable et à l\'assainissement',
      ctaSubtitleEn: 'Together, let\'s build a future where every African has access to safe water and sanitation',
      ctaButtonTextFr: 'Nous contacter',
      ctaButtonTextEn: 'Contact us',
      ctaButtonUrl: '/contact',
      // Floating Badge
      floatingBadgeTitleFr: 'Certifié ISO 9001',
      floatingBadgeTitleEn: 'ISO 9001 Certified',
      floatingBadgeTextFr: 'Qualité garantie',
      floatingBadgeTextEn: 'Quality guaranteed',
      // Menu settings
      menuLabelFr: 'À Propos',
      menuLabelEn: 'About Us',
      menuOrder: 0,
      showInMenu: true,
      published: true,
    },
    create: {
      id: 'about-page',
      heroTitleFr: 'À Propos de l\'AAEA',
      heroTitleEn: 'About AAEA',
      heroSubtitleFr: 'Association Africaine de l\'Eau et de l\'Assainissement - Au service des communautés depuis plus de 15 ans',
      heroSubtitleEn: 'African Water and Sanitation Association - Serving communities for over 15 years',
      heroBadgeFr: 'Présentation',
      heroBadgeEn: 'Presentation',
      heroImageUrl: '/images/about.jpg',
      heroImageAltFr: 'Équipe AAEA en action',
      heroImageAltEn: 'AAEA team in action',
      mainTitleFr: 'Notre Histoire',
      mainTitleEn: 'Our Story',
      mainContentFr: `<p>L'<strong>Association Africaine de l'Eau et de l'Assainissement (AAEA)</strong> est une organisation panafricaine créée avec la vision d'améliorer l'accès à l'eau potable et à l'assainissement pour tous les Africains.</p>
<p>Fondée par des experts passionnés du secteur de l'eau, l'AAEA s'est donnée pour mission de promouvoir des solutions durables et innovantes pour la gestion des ressources en eau à travers le continent.</p>
<p>Nous travaillons en étroite collaboration avec les gouvernements, les organisations internationales, les communautés locales et le secteur privé pour développer des programmes d'approvisionnement en eau potable, d'assainissement et d'hygiène adaptés aux réalités africaines.</p>`,
      mainContentEn: `<p>The <strong>African Water and Sanitation Association (AAEA)</strong> is a pan-African organization created with the vision of improving access to safe water and sanitation for all Africans.</p>
<p>Founded by passionate water sector experts, AAEA's mission is to promote sustainable and innovative solutions for water resource management across the continent.</p>
<p>We work closely with governments, international organizations, local communities, and the private sector to develop water supply, sanitation, and hygiene programs adapted to African realities.</p>`,
      mainImageUrl: '/images/about.jpg',
      mainImageAltFr: 'Projets AAEA',
      mainImageAltEn: 'AAEA Projects',
      stat1Value: '15+',
      stat1LabelFr: "Années d'Expérience",
      stat1LabelEn: 'Years of Experience',
      stat2Value: '50+',
      stat2LabelFr: 'Pays Membres',
      stat2LabelEn: 'Member Countries',
      stat3Value: '5M+',
      stat3LabelFr: 'Bénéficiaires',
      stat3LabelEn: 'Beneficiaries',
      stat4Value: '200+',
      stat4LabelFr: 'Projets Réalisés',
      stat4LabelEn: 'Projects Completed',
      missionTitleFr: 'Notre Mission',
      missionTitleEn: 'Our Mission',
      missionContentFr: `<p>Contribuer à l'amélioration durable des conditions de vie des populations africaines en promouvant l'accès équitable à l'eau potable, à l'assainissement et à l'hygiène.</p>
<p>Nous nous engageons à:</p>
<ul>
<li>Renforcer les capacités des acteurs de l'eau et de l'assainissement</li>
<li>Promouvoir la gouvernance participative des ressources en eau</li>
<li>Développer des solutions technologiques appropriées et durables</li>
<li>Favoriser les partenariats public-privé pour le développement du secteur</li>
</ul>`,
      missionContentEn: `<p>Contribute to the sustainable improvement of living conditions for African populations by promoting equitable access to safe water, sanitation, and hygiene.</p>
<p>We are committed to:</p>
<ul>
<li>Strengthening the capacities of water and sanitation stakeholders</li>
<li>Promoting participatory water resource governance</li>
<li>Developing appropriate and sustainable technological solutions</li>
<li>Encouraging public-private partnerships for sector development</li>
</ul>`,
      valuesTitleFr: 'Nos Valeurs',
      valuesTitleEn: 'Our Values',
      valuesContentFr: `<p><strong>Excellence:</strong> Nous visons l'excellence dans tous nos projets et programmes.</p>
<p><strong>Intégrité:</strong> Nous agissons avec transparence et éthique dans toutes nos actions.</p>
<p><strong>Innovation:</strong> Nous encourageons les solutions créatives et adaptées aux contextes locaux.</p>
<p><strong>Collaboration:</strong> Nous croyons en la force du partenariat et de la coopération.</p>
<p><strong>Durabilité:</strong> Nous privilégions les solutions à long terme respectueuses de l'environnement.</p>`,
      valuesContentEn: `<p><strong>Excellence:</strong> We aim for excellence in all our projects and programs.</p>
<p><strong>Integrity:</strong> We act with transparency and ethics in all our actions.</p>
<p><strong>Innovation:</strong> We encourage creative solutions adapted to local contexts.</p>
<p><strong>Collaboration:</strong> We believe in the power of partnership and cooperation.</p>
<p><strong>Sustainability:</strong> We prioritize long-term, environmentally-friendly solutions.</p>`,
      ctaTitleFr: 'Rejoignez notre mission',
      ctaTitleEn: 'Join our mission',
      ctaSubtitleFr: 'Ensemble, construisons un avenir où chaque Africain a accès à l\'eau potable et à l\'assainissement',
      ctaSubtitleEn: 'Together, let\'s build a future where every African has access to safe water and sanitation',
      ctaButtonTextFr: 'Nous contacter',
      ctaButtonTextEn: 'Contact us',
      ctaButtonUrl: '/contact',
      floatingBadgeTitleFr: 'Certifié ISO 9001',
      floatingBadgeTitleEn: 'ISO 9001 Certified',
      floatingBadgeTextFr: 'Qualité garantie',
      floatingBadgeTextEn: 'Quality guaranteed',
      menuLabelFr: 'À Propos',
      menuLabelEn: 'About Us',
      menuOrder: 0,
      showInMenu: true,
      published: true,
    },
  });

  console.log('✅ About Page ready');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
