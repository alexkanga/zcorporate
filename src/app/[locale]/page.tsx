import { type Locale } from "@/i18n";
import { db } from "@/lib/db";
import { HeroSlider } from "@/components/public/sections/HeroSlider";
import { AboutSection } from "@/components/public/sections/AboutSection";
import { ServicesSection } from "@/components/public/sections/ServicesSection";
import { TestimonialsSection } from "@/components/public/sections/TestimonialsSection";
import { PartnersSection } from "@/components/public/sections/PartnersSection";
import { CTASection } from "@/components/public/sections/CTASection";
import { LatestArticles } from "@/components/public/sections/LatestArticles";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

// Fetch homepage data directly from database
async function getHomeData() {
  try {
    const [
      sliders,
      homeAbout,
      services,
      testimonials,
      partners,
      homeCTA,
      latestArticles,
      servicesSection,
      testimonialsSection,
      partnersSection,
      articlesSection,
      siteSettings,
    ] = await Promise.all([
      db.slider.findMany({
        where: { visible: true, deletedAt: null },
        orderBy: { order: 'asc' },
      }),
      db.homeAbout.findUnique({
        where: { id: 'home-about' },
      }),
      db.service.findMany({
        where: { visible: true, deletedAt: null },
        orderBy: { order: 'asc' },
      }),
      db.testimonial.findMany({
        where: { visible: true, deletedAt: null },
        orderBy: { order: 'asc' },
      }),
      db.partner.findMany({
        where: { visible: true, deletedAt: null },
        orderBy: { order: 'asc' },
      }),
      db.homeCTA.findUnique({
        where: { id: 'home-cta' },
      }),
      db.article.findMany({
        where: { published: true, deletedAt: null },
        orderBy: { publishedAt: 'desc' },
        take: 3,
        include: {
          User: { select: { name: true } },
          ArticleCategory: { select: { nameFr: true, nameEn: true, slug: true } },
        },
      }),
      db.homeSection.findUnique({ where: { id: 'services' } }),
      db.homeSection.findUnique({ where: { id: 'testimonials' } }),
      db.homeSection.findUnique({ where: { id: 'partners' } }),
      db.homeSection.findUnique({ where: { id: 'articles' } }),
      db.siteSettings.findUnique({ where: { id: 'site-settings' } }),
    ]);

    // Transform articles to match expected format
    const transformedArticles = latestArticles.map(article => ({
      ...article,
      author: article.User ? { name: article.User.name } : null,
      category: article.ArticleCategory ? {
        nameFr: article.ArticleCategory.nameFr,
        nameEn: article.ArticleCategory.nameEn,
        slug: article.ArticleCategory.slug,
      } : null,
    }));

    return { 
      sliders, 
      homeAbout, 
      services, 
      testimonials, 
      partners, 
      homeCTA, 
      latestArticles: transformedArticles,
      sections: {
        services: servicesSection,
        testimonials: testimonialsSection,
        partners: partnersSection,
        articles: articlesSection,
      },
      siteSettings,
    };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return {
      sliders: [],
      homeAbout: null,
      services: [],
      testimonials: [],
      partners: [],
      homeCTA: null,
      latestArticles: [],
      sections: {
        services: null,
        testimonials: null,
        partners: null,
        articles: null,
      },
      siteSettings: null,
    };
  }
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const data = await getHomeData();

  return (
    <main className="min-h-screen">
      {/* Hero Slider Section */}
      <HeroSlider sliders={data.sliders} locale={locale as Locale} />

      {/* About Section */}
      <AboutSection homeAbout={data.homeAbout} locale={locale as Locale} />

      {/* Services Section */}
      <ServicesSection 
        services={data.services} 
        sectionData={data.sections.services}
        locale={locale as Locale} 
      />

      {/* Testimonials Section */}
      <TestimonialsSection
        testimonials={data.testimonials}
        sectionData={data.sections.testimonials}
        locale={locale as Locale}
      />

      {/* Partners Section */}
      <PartnersSection 
        partners={data.partners} 
        sectionData={data.sections.partners}
        locale={locale as Locale} 
      />

      {/* CTA Section */}
      <CTASection 
        homeCTA={data.homeCTA} 
        siteSettings={data.siteSettings}
        locale={locale as Locale} 
      />

      {/* Latest Articles Section */}
      <LatestArticles 
        articles={data.latestArticles} 
        sectionData={data.sections.articles}
        locale={locale as Locale} 
      />
    </main>
  );
}
