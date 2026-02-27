import { config } from 'dotenv';
import { resolve } from 'path';

// Load env from the correct path
config({ path: resolve(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping of article slugs to their correct image filenames
// Using keywords to match articles with images
const keywordMapping: Record<string, string> = {
  'agriculture-biologique': 'agriculture-biologique.jpg',
  'agriculture-conservation': 'agriculture-conservation.jpg',
  'agroforesterie': 'agroforesterie.jpg',
  'changement-climatique': 'changement-climatique.jpg',
  'energies-renouvelables': 'energies-renouvelables.jpg',
  'entrepreneuriat-jeunes': 'entrepreneuriat-jeunes.jpg',
  'fertilite-sol': 'fertilite-sol.jpg',
  'gestion-eau': 'gestion-eau.jpg',
  'irrigation-goutte': 'irrigation-goutte.jpg',
  'lutte-ravageurs': 'lutte-ravageurs.jpg',
  'partenariat-fao': 'partenariat-fao.jpg',
  'programme-formation': 'programme-formation.jpg',
};

// Map actual article slugs to images
const slugToImageMapping: Record<string, string> = {
  'lancement-programme-2025': 'programme-formation.jpg',
  'enjeux-agriculture-durable-afrique': 'agriculture-conservation.jpg',
  'conseils-irrigation-efficace': 'irrigation-goutte.jpg',
  'partenariat-fao-2025': 'partenariat-fao.jpg',
  'impact-changement-climatique': 'changement-climatique.jpg',
  'techniques-compostage': 'fertilite-sol.jpg',
  'resultats-reforestation-2024': 'agroforesterie.jpg',
  'agroforesterie-solution-avenir': 'agroforesterie.jpg',
  'protection-cultures-biologiques': 'agriculture-biologique.jpg',
  'formation-formateurs-reussite': 'entrepreneuriat-jeunes.jpg',
  'benefices-rotation-cultures': 'gestion-eau.jpg',
  'innovation-agriculture-precision': 'energies-renouvelables.jpg',
};

async function main() {
  console.log('Updating article image URLs...');
  
  const articles = await prisma.article.findMany({
    select: { id: true, slug: true, imageUrl: true },
  });
  
  console.log(`Found ${articles.length} articles`);
  
  for (const article of articles) {
    const slug = article.slug;
    const imageFile = slugToImageMapping[slug];
    
    if (imageFile) {
      const newImageUrl = `/uploads/articles/${imageFile}`;
      
      console.log(`Updating article ${slug}: ${article.imageUrl} -> ${newImageUrl}`);
      
      await prisma.article.update({
        where: { id: article.id },
        data: { imageUrl: newImageUrl },
      });
    } else {
      console.log(`No image mapping found for article: ${slug}`);
    }
  }
  
  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
