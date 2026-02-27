import { type Locale } from "@/i18n";
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

// Types for API response
interface Slider {
  id: string;
  titleFr: string;
  titleEn: string;
  subtitleFr: string | null;
  subtitleEn: string | null;
  buttonTextFr: string | null;
  buttonTextEn: string | null;
  buttonUrl: string | null;
  imageUrl: string;
  imageAltFr: string | null;
  imageAltEn: string | null;
}

interface HomeAbout {
  id: string;
  titleFr: string;
  titleEn: string;
  contentFr: string;
  contentEn: string;
  imageUrl: string | null;
  imageAltFr: string | null;
  imageAltEn: string | null;
  buttonTextFr: string | null;
  buttonTextEn: string | null;
  buttonUrl: string | null;
}

interface Service {
  id: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  icon: string | null;
  imageUrl: string | null;
  imageAltFr: string | null;
  imageAltEn: string | null;
}

interface Testimonial {
  id: string;
  name: string;
  company: string | null;
  textFr: string;
  textEn: string;
  avatar: string | null;
  rating: number;
}

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  website: string | null;
}

interface HomeCTA {
  id: string;
  titleFr: string;
  titleEn: string;
  subtitleFr: string | null;
  subtitleEn: string | null;
  buttonTextFr: string | null;
  buttonTextEn: string | null;
  buttonUrl: string | null;
}

interface Article {
  id: string;
  titleFr: string;
  titleEn: string;
  slug: string;
  excerptFr: string | null;
  excerptEn: string | null;
  imageUrl: string | null;
  imageAltFr: string | null;
  imageAltEn: string | null;
  publishedAt: Date | null;
  author: {
    name: string | null;
  } | null;
  category: {
    nameFr: string;
    nameEn: string;
    slug: string;
  } | null;
}

interface HomeData {
  sliders: Slider[];
  homeAbout: HomeAbout | null;
  services: Service[];
  testimonials: Testimonial[];
  partners: Partner[];
  homeCTA: HomeCTA | null;
  latestArticles: Article[];
}

// Fetch homepage data from API
async function getHomeData(): Promise<HomeData> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    const response = await fetch(`${baseUrl}/api/home`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch home data");
    }
    return response.json();
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
