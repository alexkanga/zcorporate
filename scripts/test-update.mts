import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const timestamp = new Date().toISOString()

  // Update Services section
  await prisma.homeSection.update({
    where: { id: "services" },
    data: {
      titleFr: "✅ NOS SERVICES TEST " + timestamp.slice(0, 19),
      titleEn: "✅ OUR SERVICES TEST " + timestamp.slice(0, 19),
      subtitleFr: "✅ Services professionnels - vérification BD",
      subtitleEn: "✅ Professional services - DB verification"
    }
  })
  console.log("✅ Services updated")

  // Update Testimonials section
  await prisma.homeSection.update({
    where: { id: "testimonials" },
    data: {
      titleFr: "✅ TÉMOIGNAGES TEST " + timestamp.slice(0, 19),
      titleEn: "✅ TESTIMONIALS TEST " + timestamp.slice(0, 19),
      subtitleFr: "✅ Avis de nos clients - vérification BD",
      subtitleEn: "✅ Client reviews - DB verification"
    }
  })
  console.log("✅ Testimonials updated")

  // Update Partners section
  await prisma.homeSection.update({
    where: { id: "partners" },
    data: {
      titleFr: "✅ PARTENAIRES TEST " + timestamp.slice(0, 19),
      titleEn: "✅ PARTNERS TEST " + timestamp.slice(0, 19),
      subtitleFr: "✅ Ils nous font confiance - vérification BD",
      subtitleEn: "✅ They trust us - DB verification",
      buttonTextFr: "✅ Devenir Partenaire TEST",
      buttonTextEn: "✅ Become Partner TEST"
    }
  })
  console.log("✅ Partners updated")

  // Update Articles section
  await prisma.homeSection.update({
    where: { id: "articles" },
    data: {
      titleFr: "✅ ACTUALITÉS TEST " + timestamp.slice(0, 19),
      titleEn: "✅ NEWS TEST " + timestamp.slice(0, 19),
      subtitleFr: "✅ Restez informé - vérification BD",
      subtitleEn: "✅ Stay informed - DB verification",
      buttonTextFr: "✅ Voir les actualités TEST",
      buttonTextEn: "✅ View news TEST"
    }
  })
  console.log("✅ Articles updated")

  // Update About section
  await prisma.homeAbout.update({
    where: { id: "home-about" },
    data: {
      badgeTextFr: "✅ NOTRE HISTOIRE " + timestamp.slice(0, 19),
      badgeTextEn: "✅ OUR STORY " + timestamp.slice(0, 19),
      stat1Value: "25+",
      stat1LabelFr: "✅ Années d'Expérience TEST",
      stat1LabelEn: "✅ Years Experience TEST",
      stat2Value: "999+",
      stat2LabelFr: "✅ Projets Réalisés TEST",
      stat2LabelEn: "✅ Projects Completed TEST",
      stat3Value: "99.9%",
      stat3LabelFr: "✅ Satisfaction Client TEST",
      stat3LabelEn: "✅ Client Satisfaction TEST",
      floatingBadgeTitleFr: "✅ Excellence Certifiée TEST",
      floatingBadgeTitleEn: "✅ Certified Excellence TEST"
    }
  })
  console.log("✅ About updated")

  // Update CTA section
  await prisma.homeCTA.update({
    where: { id: "home-cta" },
    data: {
      badgeTextFr: "✅ CONTACTEZ-NOUS " + timestamp.slice(0, 19),
      badgeTextEn: "✅ CONTACT US " + timestamp.slice(0, 19)
    }
  })
  console.log("✅ CTA updated")

  console.log("\n🎉 ALL DATABASE UPDATES COMPLETED!")
  console.log("Check the frontend homepage to verify the changes appear.")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
