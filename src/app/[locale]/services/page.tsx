import { setRequestLocale } from 'next-intl/server';
import { type Locale } from '@/i18n';
import { db } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { 
  ArrowRight, Target, Heart, Megaphone, Check, Play, Sparkles, Users, Award, 
  TrendingUp, Shield, Zap, Globe, Lightbulb, Star, Quote, ChevronRight,
  Layers, Rocket, Eye, Clock, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { getSiteSettingsOnly } from '@/lib/site-settings';
import { ServicesSection } from '@/components/public/sections/ServicesSection';

// Force dynamic rendering to ensure content is always fresh
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ServicesPageProps {
  params: Promise<{ locale: string }>;
}

// Helper to get localized content with FR fallback
function getLocalizedText(
  fr: string | null | undefined,
  en: string | null | undefined,
  locale: Locale
): string | null {
  if (locale === "en" && en) return en;
  return fr || null;
}

// Helper to get video embed URL
function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // YouTube patterns
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  
  // Vimeo patterns
  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  // Dailymotion patterns
  const dailymotionMatch = url.match(/(?:dailymotion\.com\/video\/|dai\.ly\/|dailymotion\.com\/embed\/video\/)([a-zA-Z0-9]+)/);
  if (dailymotionMatch) {
    return `https://www.dailymotion.com/embed/video/${dailymotionMatch[1]}`;
  }
  
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const servicesPage = await db.servicesPage.findUnique({
    where: { id: 'services-page' },
  });

  const title = locale === 'fr' 
    ? (servicesPage?.heroTitleFr || 'Nos Services')
    : (servicesPage?.heroTitleEn || 'Our Services');

  return {
    title,
    description: locale === 'fr'
      ? 'Découvrez nos services et solutions'
      : 'Discover our services and solutions',
  };
}

export default async function ServicesFrontendPage({ params }: ServicesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const currentLocale = locale as Locale;

  // Get services page content, site settings, and individual services
  const [servicesPage, siteSettings, services, homeSection] = await Promise.all([
    db.servicesPage.findUnique({
      where: { id: 'services-page' },
    }),
    getSiteSettingsOnly(),
    db.service.findMany({
      where: { visible: true, deletedAt: null },
      orderBy: { order: 'asc' },
    }),
    db.homeSection.findUnique({ where: { id: 'services' } }),
  ]);

  // If page doesn't exist or is not published, show placeholder
  if (!servicesPage || !servicesPage.published) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="max-w-md mx-4 border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <Badge variant="outline" className="mb-4">
              {currentLocale === 'fr' ? 'Page non configurée' : 'Page not configured'}
            </Badge>
            <h1 className="text-2xl font-bold mb-4">
              {currentLocale === 'fr' ? 'Page Services' : 'Services Page'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {currentLocale === 'fr'
                ? 'Cette page n\'a pas encore été configurée ou publiée.'
                : 'This page has not been configured or published yet.'}
            </p>
            <Link href="/login">
              <Button className="rounded-full px-6">
                {currentLocale === 'fr' ? 'Accéder à l\'administration' : 'Access Admin Panel'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get localized content
  const heroTitle = getLocalizedText(servicesPage.heroTitleFr, servicesPage.heroTitleEn, currentLocale) || (currentLocale === 'fr' ? 'Nos Services' : 'Our Services');
  const heroSubtitle = getLocalizedText(servicesPage.heroSubtitleFr, servicesPage.heroSubtitleEn, currentLocale);
  const heroBadge = getLocalizedText(servicesPage.heroBadgeFr, servicesPage.heroBadgeEn, currentLocale) || (currentLocale === 'fr' ? 'Services' : 'Services');
  const heroImageAlt = getLocalizedText(servicesPage.heroImageAltFr, servicesPage.heroImageAltEn, currentLocale) || heroTitle;
  
  const mainTitle = getLocalizedText(servicesPage.mainTitleFr, servicesPage.mainTitleEn, currentLocale);
  const mainContent = getLocalizedText(servicesPage.mainContentFr, servicesPage.mainContentEn, currentLocale);
  const mainImageAlt = getLocalizedText(servicesPage.mainImageAltFr, servicesPage.mainImageAltEn, currentLocale);
  
  const ctaTitle = getLocalizedText(servicesPage.ctaTitleFr, servicesPage.ctaTitleEn, currentLocale);
  const ctaSubtitle = getLocalizedText(servicesPage.ctaSubtitleFr, servicesPage.ctaSubtitleEn, currentLocale);
  const ctaButtonText = getLocalizedText(servicesPage.ctaButtonTextFr, servicesPage.ctaButtonTextEn, currentLocale);
  
  const floatingBadgeTitle = getLocalizedText(servicesPage.floatingBadgeTitleFr, servicesPage.floatingBadgeTitleEn, currentLocale);
  const floatingBadgeText = getLocalizedText(servicesPage.floatingBadgeTextFr, servicesPage.floatingBadgeTextEn, currentLocale);

  // Check if we have video or image
  const heroVideoEmbed = servicesPage.heroVideoUrl ? getVideoEmbedUrl(servicesPage.heroVideoUrl) : null;
  const mainVideoEmbed = servicesPage.mainVideoUrl ? getVideoEmbedUrl(servicesPage.mainVideoUrl) : null;

  // Colors from admin
  const colors = {
    primary: siteSettings.color1,
    secondary: siteSettings.color2,
    accent: siteSettings.color3,
    light: siteSettings.color4,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 20% 40%, ${colors.light}40, transparent),
                radial-gradient(ellipse 60% 40% at 80% 60%, ${colors.accent}30, transparent),
                radial-gradient(ellipse 50% 30% at 50% 90%, ${colors.secondary}20, transparent)
              `
            }}
          />
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(${colors.primary} 1px, transparent 1px),
                linear-gradient(90deg, ${colors.primary} 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content Side */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-gray-100">
                <span 
                  className="h-2 w-2 rounded-full animate-pulse"
                  style={{ background: colors.secondary }}
                />
                <span 
                  className="text-sm font-semibold tracking-wide uppercase"
                  style={{ color: colors.primary }}
                >
                  {heroBadge}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                <span 
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                  }}
                >
                  {heroTitle}
                </span>
              </h1>

              {/* Subtitle */}
              {heroSubtitle && (
                <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                  {heroSubtitle}
                </p>
              )}
            </div>

            {/* Media Side */}
            {(servicesPage.heroImageUrl || heroVideoEmbed) && (
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                  <div 
                    className="absolute -inset-4 rounded-[2rem] opacity-20 -z-10"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.accent}, ${colors.light})`,
                      transform: 'rotate(-3deg)'
                    }}
                  />
                  
                  {heroVideoEmbed ? (
                    <div className="aspect-[4/3]">
                      <iframe
                        src={heroVideoEmbed}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : servicesPage.heroImageUrl ? (
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={servicesPage.heroImageUrl}
                        alt={heroImageAlt || ""}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  ) : null}

                  {/* Floating badge on image */}
                  {!heroVideoEmbed && floatingBadgeTitle && (
                    <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-xl">
                      <div className="flex items-center gap-4">
                        <div 
                          className="h-14 w-14 rounded-xl flex items-center justify-center text-white shadow-lg"
                          style={{ background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})` }}
                        >
                          <Check className="h-7 w-7" />
                        </div>
                        <div>
                          <div 
                            className="font-bold text-lg"
                            style={{ color: colors.primary }}
                          >
                            {floatingBadgeTitle}
                          </div>
                          <div className="text-sm text-gray-500">
                            {floatingBadgeText}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Decorative elements */}
                <div 
                  className="absolute -top-8 -right-8 w-32 h-32 rounded-2xl -z-20 opacity-60"
                  style={{ background: colors.light }}
                />
                <div 
                  className="absolute -bottom-8 -left-8 w-40 h-40 rounded-2xl -z-20 opacity-40"
                  style={{ background: colors.accent }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 border-y border-gray-100 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {[
              { icon: Shield, text: currentLocale === 'fr' ? 'Sécurisé' : 'Secure' },
              { icon: CheckCircle2, text: currentLocale === 'fr' ? 'Certifié' : 'Certified' },
              { icon: Clock, text: currentLocale === 'fr' ? '24/7 Support' : '24/7 Support' },
              { icon: Award, text: currentLocale === 'fr' ? 'Primé' : 'Award Winning' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-500">
                <item.icon className="h-5 w-5" style={{ color: colors.secondary }} />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      {(mainTitle || mainContent) && (
        <section className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className={`grid grid-cols-1 gap-16 items-center ${servicesPage.mainImageUrl || mainVideoEmbed ? 'lg:grid-cols-2' : 'max-w-4xl mx-auto'}`}>
              {/* Content */}
              <div className={servicesPage.mainImageUrl || mainVideoEmbed ? 'order-2 lg:order-1' : ''}>
                {mainTitle && (
                  <div className="mb-6">
                    <Badge 
                      variant="outline" 
                      className="mb-4 px-4 py-1 rounded-full"
                      style={{ borderColor: colors.accent, color: colors.accent }}
                    >
                      {currentLocale === 'fr' ? 'À propos' : 'About'}
                    </Badge>
                    <h2 
                      className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
                      style={{ color: colors.primary }}
                    >
                      {mainTitle}
                    </h2>
                  </div>
                )}
                {mainContent && (
                  <div
                    className="text-gray-600 text-lg leading-relaxed prose prose-lg max-w-none prose-headings:text-[var(--color-primary)] prose-a:no-underline"
                    dangerouslySetInnerHTML={{ __html: mainContent }}
                  />
                )}
              </div>

              {/* Media */}
              {(servicesPage.mainImageUrl || mainVideoEmbed) && (
                <div className="order-1 lg:order-2 relative">
                  <Card className="overflow-hidden border-0 shadow-2xl rounded-3xl group">
                    <CardContent className="p-0">
                      {mainVideoEmbed ? (
                        <div className="aspect-video">
                          <iframe
                            src={mainVideoEmbed}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : servicesPage.mainImageUrl ? (
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src={servicesPage.mainImageUrl}
                            alt={mainImageAlt || ""}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>

                  <div 
                    className="absolute -bottom-6 -right-6 w-full h-full rounded-3xl -z-10"
                    style={{ background: `linear-gradient(135deg, ${colors.light}40, ${colors.accent}30)` }}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Services List Section */}
      {services.length > 0 && (
        <ServicesSection 
          services={services} 
          sectionData={homeSection}
          locale={currentLocale} 
        />
      )}

      {/* CTA Section */}
      {ctaTitle && (
        <section 
          className="py-24 relative overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` 
          }}
        >
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="flex justify-center mb-8">
                <div 
                  className="h-20 w-20 rounded-2xl flex items-center justify-center shadow-2xl"
                  style={{ background: `${colors.light}20` }}
                >
                  <Megaphone className="h-10 w-10 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 drop-shadow-lg">
                {ctaTitle}
              </h2>
              
              {ctaSubtitle && (
                <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                  {ctaSubtitle}
                </p>
              )}
              
              {ctaButtonText && servicesPage.ctaButtonUrl && (
                <Link href={servicesPage.ctaButtonUrl}>
                  <Button
                    size="lg"
                    className="bg-white hover:bg-white/90 shadow-2xl hover:shadow-3xl transition-all duration-300 group rounded-full px-10 py-6 text-lg"
                    style={{ color: colors.primary }}
                  >
                    {ctaButtonText}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
