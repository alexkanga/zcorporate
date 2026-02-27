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
          author: { select: { name: true } },
          category: { select: { nameFr: true, nameEn: true, slug: true } },
        },
      }),
    ]);

    return { sliders, homeAbout, services, testimonials, partners, homeCTA, latestArticles };
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
      <ServicesSection services={data.services} locale={locale as Locale} />

      {/* Testimonials Section */}
      <TestimonialsSection
        testimonials={data.testimonials}
        locale={locale as Locale}
      />

      {/* Partners Section */}
      <PartnersSection partners={data.partners} locale={locale as Locale} />

      {/* CTA Section */}
      <CTASection homeCTA={data.homeCTA} locale={locale as Locale} />

      {/* Latest Articles Section */}
      <LatestArticles articles={data.latestArticles} locale={locale as Locale} />
    </main>
  );
}
