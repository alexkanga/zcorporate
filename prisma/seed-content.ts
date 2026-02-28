import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// Sample image URLs (using placeholder images)
const sampleImages = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
  'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
  'https://images.unsplash.com/photo-1497215842964-222b56dc185e?w=800',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
  'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
];

// Sample YouTube video IDs for embedding
const sampleVideos = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://www.youtube.com/watch?v=jNQXAC9IVRw',
  'https://www.youtube.com/watch?v=9bZkp7q19f0',
  'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
  'https://www.youtube.com/watch?v=JGwWNGJdvx8',
  'https://www.youtube.com/watch?v=OPf0YbXqDm0',
];

// Sample gallery images (3 per project)
const getGallery = (index: number) => {
  const base = index * 3;
  return JSON.stringify([
    sampleImages[base % sampleImages.length],
    sampleImages[(base + 1) % sampleImages.length],
    sampleImages[(base + 2) % sampleImages.length],
  ]);
};

// Sample videos (2 per project)
const getVideos = (index: number) => {
  return JSON.stringify([
    sampleVideos[index % sampleVideos.length],
    sampleVideos[(index + 1) % sampleVideos.length],
  ]);
};

// Realisation data
const realisationsData = [
  { titleFr: 'Rénovation du Siège Social AAEA', titleEn: 'AAEA Headquarters Renovation', client: 'AAEA', location: 'Paris, France' },
  { titleFr: 'Construction Centre de Formation', titleEn: 'Training Center Construction', client: 'Ministère de l\'Éducation', location: 'Lyon, France' },
  { titleFr: 'Aménagement Espace Coworking', titleEn: 'Coworking Space Design', client: 'StartupHub', location: 'Marseille, France' },
  { titleFr: 'Réalisation Parc Solaire', titleEn: 'Solar Park Implementation', client: 'GreenEnergy SA', location: 'Bordeaux, France' },
  { titleFr: 'Construction Complexe Sportif', titleEn: 'Sports Complex Construction', client: 'Ville de Toulouse', location: 'Toulouse, France' },
  { titleFr: 'Rénovation Hôtel 4 Étoiles', titleEn: '4-Star Hotel Renovation', client: 'HotelGroup', location: 'Nice, France' },
  { titleFr: 'Développement Application Mobile', titleEn: 'Mobile App Development', client: 'TechCorp', location: 'Remote' },
  { titleFr: 'Installation Système Sécurité', titleEn: 'Security System Installation', client: 'SecureBank', location: 'Paris, France' },
  { titleFr: 'Construction École Primaire', titleEn: 'Primary School Construction', client: 'Mairie de Nantes', location: 'Nantes, France' },
  { titleFr: 'Aménagement Bureau Moderne', titleEn: 'Modern Office Design', client: 'InnovateTech', location: 'Strasbourg, France' },
  { titleFr: 'Projet Infrastructure Routière', titleEn: 'Road Infrastructure Project', client: 'Ministère des Transports', location: 'Lille, France' },
  { titleFr: 'Centre de Recherche Biomédicale', titleEn: 'Biomedical Research Center', client: 'Health Institute', location: 'Montpellier, France' },
];

// Resource data
const ressourcesData = [
  { titleFr: 'Guide de Démarrage AAEA', titleEn: 'AAEA Getting Started Guide', fileType: 'application/pdf', fileSize: 2500000 },
  { titleFr: 'Manuel de Formation', titleEn: 'Training Manual', fileType: 'application/pdf', fileSize: 5200000 },
  { titleFr: 'Rapport Annuel 2025', titleEn: 'Annual Report 2025', fileType: 'application/pdf', fileSize: 8100000 },
  { titleFr: 'Présentation Projets', titleEn: 'Projects Presentation', fileType: 'application/vnd.ms-powerpoint', fileSize: 15000000 },
  { titleFr: 'Documentation Technique', titleEn: 'Technical Documentation', fileType: 'application/pdf', fileSize: 3200000 },
  { titleFr: 'Guide des Bonnes Pratiques', titleEn: 'Best Practices Guide', fileType: 'application/pdf', fileSize: 1800000 },
  { titleFr: 'Modèles de Contrats', titleEn: 'Contract Templates', fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileSize: 950000 },
  { titleFr: 'Catalogue Services', titleEn: 'Services Catalog', fileType: 'application/pdf', fileSize: 4200000 },
  { titleFr: 'Formation Sécurité', titleEn: 'Security Training', fileType: 'application/pdf', fileSize: 2800000 },
  { titleFr: 'Procédures Qualité', titleEn: 'Quality Procedures', fileType: 'application/pdf', fileSize: 1100000 },
  { titleFr: 'Guide Installation', titleEn: 'Installation Guide', fileType: 'application/pdf', fileSize: 3500000 },
  { titleFr: 'FAQ Utilisateurs', titleEn: 'User FAQ', fileType: 'application/pdf', fileSize: 850000 },
];

// Event data - dates around Feb 28, 2026
// Current date: Feb 28, 2026
// Past events: before Feb 28, 2026
// Upcoming events: Feb 29, 2026 and later
const evenementsData = [
  { titleFr: 'Conférence Annuelle AAEA', titleEn: 'AAEA Annual Conference', date: new Date('2026-03-15'), location: 'Paris, France', upcoming: true },
  { titleFr: 'Salon Professionnel', titleEn: 'Professional Trade Show', date: new Date('2026-03-20'), location: 'Lyon, France', upcoming: true },
  { titleFr: 'Formation Continue', titleEn: 'Continuing Education', date: new Date('2026-04-05'), location: 'Marseille, France', upcoming: true },
  { titleFr: 'Séminaire Technique', titleEn: 'Technical Seminar', date: new Date('2026-04-15'), location: 'Bordeaux, France', upcoming: true },
  { titleFr: 'Journée Portes Ouvertes', titleEn: 'Open House Day', date: new Date('2026-05-01'), location: 'Toulouse, France', upcoming: true },
  { titleFr: 'Sommet Énergies Renouvelables', titleEn: 'Renewable Energy Summit', date: new Date('2026-05-20'), location: 'Nice, France', upcoming: true },
  { titleFr: 'Atelier Innovation', titleEn: 'Innovation Workshop', date: new Date('2026-02-15'), location: 'Nantes, France', upcoming: false },
  { titleFr: 'Conférence Presse', titleEn: 'Press Conference', date: new Date('2026-02-01'), location: 'Paris, France', upcoming: false },
  { titleFr: 'Rencontre Partenaires', titleEn: 'Partners Meeting', date: new Date('2026-01-20'), location: 'Strasbourg, France', upcoming: false },
  { titleFr: 'Cérémonie Remise Prix', titleEn: 'Award Ceremony', date: new Date('2026-01-10'), location: 'Lille, France', upcoming: false },
  { titleFr: 'Forum Emploi', titleEn: 'Job Forum', date: new Date('2025-12-15'), location: 'Montpellier, France', upcoming: false },
  { titleFr: 'Lancement Projet', titleEn: 'Project Launch', date: new Date('2025-12-01'), location: 'Rennes, France', upcoming: false },
];

async function main() {
  console.log('Starting seed...');

  // Get or create a category for realisations
  let realisationCategory = await prisma.realisationCategory.findFirst();
  if (!realisationCategory) {
    realisationCategory = await prisma.realisationCategory.create({
      data: {
        id: randomUUID(),
        nameFr: 'Projets',
        nameEn: 'Projects',
        slug: 'projets',
        descriptionFr: 'Tous nos projets',
        descriptionEn: 'All our projects',
      },
    });
    console.log('Created realisation category');
  }

  // Get or create a category for resources
  let resourceCategory = await prisma.resourceCategory.findFirst();
  if (!resourceCategory) {
    resourceCategory = await prisma.resourceCategory.create({
      data: {
        id: randomUUID(),
        nameFr: 'Documents',
        nameEn: 'Documents',
        slug: 'documents',
        descriptionFr: 'Tous les documents',
        descriptionEn: 'All documents',
      },
    });
    console.log('Created resource category');
  }

  // Get an admin user for author reference
  const adminUser = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });

  // Seed Realisations
  console.log('Seeding realisations...');
  for (let i = 0; i < realisationsData.length; i++) {
    const data = realisationsData[i];
    const existingRealisation = await prisma.realisation.findFirst({
      where: { titleFr: data.titleFr },
    });

    if (!existingRealisation) {
      await prisma.realisation.create({
        data: {
          id: randomUUID(),
          titleFr: data.titleFr,
          titleEn: data.titleEn,
          descriptionFr: `Description détaillée du projet: ${data.titleFr}. Ce projet représente l'excellence dans notre domaine avec des résultats exceptionnels.`,
          descriptionEn: `Detailed project description: ${data.titleEn}. This project represents excellence in our field with exceptional results.`,
          client: data.client,
          location: data.location,
          imageUrl: sampleImages[i % sampleImages.length],
          gallery: getGallery(i),
          videos: getVideos(i),
          published: true,
          featured: i < 3, // First 3 are featured
          categoryId: realisationCategory.id,
          date: new Date(2025, i, 15),
        },
      });
      console.log(`Created realisation: ${data.titleFr}`);
    }
  }

  // Seed Resources
  console.log('Seeding resources...');
  for (let i = 0; i < ressourcesData.length; i++) {
    const data = ressourcesData[i];
    const existingResource = await prisma.resource.findFirst({
      where: { titleFr: data.titleFr },
    });

    if (!existingResource) {
      // Create multiple files for each resource
      const files = JSON.stringify([
        { url: `https://example.com/docs/${data.titleEn.toLowerCase().replace(/\s+/g, '-')}.pdf`, name: `${data.titleEn}.pdf`, size: data.fileSize },
        { url: `https://example.com/docs/${data.titleEn.toLowerCase().replace(/\s+/g, '-')}-guide.pdf`, name: `${data.titleEn} Guide.pdf`, size: Math.round(data.fileSize * 0.6) },
        { url: `https://example.com/docs/${data.titleEn.toLowerCase().replace(/\s+/g, '-')}-appendix.pdf`, name: `${data.titleEn} Appendix.pdf`, size: Math.round(data.fileSize * 0.4) },
      ]);

      await prisma.resource.create({
        data: {
          id: randomUUID(),
          titleFr: data.titleFr,
          titleEn: data.titleEn,
          descriptionFr: `Description du document: ${data.titleFr}. Document officiel pour accompagner vos projets.`,
          descriptionEn: `Document description: ${data.titleEn}. Official document to support your projects.`,
          fileUrl: `https://example.com/docs/${data.titleEn.toLowerCase().replace(/\s+/g, '-')}.pdf`,
          fileType: data.fileType,
          fileSize: data.fileSize,
          fileName: `${data.titleEn}.pdf`,
          files: files,
          published: true,
          categoryId: resourceCategory.id,
        },
      });
      console.log(`Created resource: ${data.titleFr}`);
    }
  }

  // Seed Events
  console.log('Seeding events...');
  for (let i = 0; i < evenementsData.length; i++) {
    const data = evenementsData[i];
    const existingEvent = await prisma.event.findFirst({
      where: { titleFr: data.titleFr },
    });

    if (!existingEvent) {
      await prisma.event.create({
        data: {
          id: randomUUID(),
          titleFr: data.titleFr,
          titleEn: data.titleEn,
          descriptionFr: `Description de l'événement: ${data.titleFr}. Un événement majeur dans notre calendrier annuel.`,
          descriptionEn: `Event description: ${data.titleEn}. A major event in our annual calendar.`,
          date: data.date,
          endDate: new Date(data.date.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
          location: data.location,
          imageUrl: sampleImages[i % sampleImages.length],
          gallery: getGallery(i),
          videos: getVideos(i),
          published: true,
        },
      });
      console.log(`Created event: ${data.titleFr}`);
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
