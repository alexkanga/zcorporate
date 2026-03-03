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

// Force dynamic rendering to ensure content is always fresh
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AboutPageProps {
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

  const aboutPage = await db.aboutPage.findUnique({
    where: { id: 'about-page' },
  });

  const title = locale === 'fr' 
    ? (aboutPage?.heroTitleFr || 'À Propos de Nous')
    : (aboutPage?.heroTitleEn || 'About Us');

  return {
    title,
    description: locale === 'fr'
      ? 'Découvrez notre histoire, notre mission et nos valeurs'
      : 'Discover our story, mission and values',
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const currentLocale = locale as Locale;

  // Get about page content and site settings
  const [aboutPage, siteSettings] = await Promise.all([
    db.aboutPage.findUnique({
      where: { id: 'about-page' },
    }),
    getSiteSettingsOnly(),
  ]);

  // If page doesn't exist or is not published, show placeholder
  if (!aboutPage || !aboutPage.published) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="max-w-md mx-4 border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <Badge variant="outline" className="mb-4">
              {currentLocale === 'fr' ? 'Page non configurée' : 'Page not configured'}
            </Badge>
            <h1 className="text-2xl font-bold mb-4">
              {currentLocale === 'fr' ? 'Page À Propos' : 'About Page'}
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
  const heroTitle = getLocalizedText(aboutPage.heroTitleFr, aboutPage.heroTitleEn, currentLocale) || (currentLocale === 'fr' ? 'À Propos de Nous' : 'About Us');
  const heroSubtitle = getLocalizedText(aboutPage.heroSubtitleFr, aboutPage.heroSubtitleEn, currentLocale);
  const heroBadge = getLocalizedText(aboutPage.heroBadgeFr, aboutPage.heroBadgeEn, currentLocale) || (currentLocale === 'fr' ? 'Présentation' : 'Presentation');
  const heroImageAlt = getLocalizedText(aboutPage.heroImageAltFr, aboutPage.heroImageAltEn, currentLocale) || heroTitle;
  
  const mainTitle = getLocalizedText(aboutPage.mainTitleFr, aboutPage.mainTitleEn, currentLocale);
  const mainContent = getLocalizedText(aboutPage.mainContentFr, aboutPage.mainContentEn, currentLocale);
  const mainImageAlt = getLocalizedText(aboutPage.mainImageAltFr, aboutPage.mainImageAltEn, currentLocale);
  
  const stat1Label = getLocalizedText(aboutPage.stat1LabelFr, aboutPage.stat1LabelEn, currentLocale);
  const stat2Label = getLocalizedText(aboutPage.stat2LabelFr, aboutPage.stat2LabelEn, currentLocale);
  const stat3Label = getLocalizedText(aboutPage.stat3LabelFr, aboutPage.stat3LabelEn, currentLocale);
  const stat4Label = getLocalizedText(aboutPage.stat4LabelFr, aboutPage.stat4LabelEn, currentLocale);
  
  const missionTitle = getLocalizedText(aboutPage.missionTitleFr, aboutPage.missionTitleEn, currentLocale);
  const missionContent = getLocalizedText(aboutPage.missionContentFr, aboutPage.missionContentEn, currentLocale);
  
  const valuesTitle = getLocalizedText(aboutPage.valuesTitleFr, aboutPage.valuesTitleEn, currentLocale);
  const valuesContent = getLocalizedText(aboutPage.valuesContentFr, aboutPage.valuesContentEn, currentLocale);
  
  const ctaTitle = getLocalizedText(aboutPage.ctaTitleFr, aboutPage.ctaTitleEn, currentLocale);
  const ctaSubtitle = getLocalizedText(aboutPage.ctaSubtitleFr, aboutPage.ctaSubtitleEn, currentLocale);
  const ctaButtonText = getLocalizedText(aboutPage.ctaButtonTextFr, aboutPage.ctaButtonTextEn, currentLocale);
  
  const floatingBadgeTitle = getLocalizedText(aboutPage.floatingBadgeTitleFr, aboutPage.floatingBadgeTitleEn, currentLocale);
  const floatingBadgeText = getLocalizedText(aboutPage.floatingBadgeTextFr, aboutPage.floatingBadgeTextEn, currentLocale);

  // Check if we have video or image
  const heroVideoEmbed = aboutPage.heroVideoUrl ? getVideoEmbedUrl(aboutPage.heroVideoUrl) : null;
  const mainVideoEmbed = aboutPage.mainVideoUrl ? getVideoEmbedUrl(aboutPage.mainVideoUrl) : null;
  
  // Check if we have at least one stat
  const hasStats = aboutPage.stat1Value || aboutPage.stat2Value || aboutPage.stat3Value || aboutPage.stat4Value;

  // Colors from admin
  const colors = {
    primary: siteSettings.color1,
    secondary: siteSettings.color2,
    accent: siteSettings.color3,
    light: siteSettings.color4,
  };

  // Stats data with icons
  const stats = [
    { value: aboutPage.stat1Value, label: stat1Label, icon: TrendingUp, color: colors.primary },
    { value: aboutPage.stat2Value, label: stat2Label, icon: Users, color: colors.secondary },
    { value: aboutPage.stat3Value, label: stat3Label, icon: Award, color: colors.accent },
    { value: aboutPage.stat4Value, label: stat4Label, icon: Globe, color: colors.primary },
  ].filter(stat => stat.value);

  // Core values/features
  const features = [
    { 
      icon: Shield, 
      title: currentLocale === 'fr' ? 'Fiabilité' : 'Reliability', 
      desc: currentLocale === 'fr' ? 'Solutions éprouvées et fiables' : 'Proven and reliable solutions',
      color: colors.primary 
    },
    { 
      icon: Zap, 
      title: currentLocale === 'fr' ? 'Innovation' : 'Innovation', 
      desc: currentLocale === 'fr' ? 'Technologies de pointe' : 'Cutting-edge technologies',
      color: colors.secondary 
    },
    { 
      icon: Lightbulb, 
      title: currentLocale === 'fr' ? 'Expertise' : 'Expertise', 
      desc: currentLocale === 'fr' ? 'Équipe hautement qualifiée' : 'Highly qualified team',
      color: colors.accent 
    },
    { 
      icon: Star, 
      title: currentLocale === 'fr' ? 'Excellence' : 'Excellence', 
      desc: currentLocale === 'fr' ? 'Engagement qualité' : 'Quality commitment',
      color: colors.primary 
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Premium Full Width */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Gradient mesh */}
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
          
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(${colors.primary} 1px, transparent 1px),
                linear-gradient(90deg, ${colors.primary} 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
          
          {/* Floating orbs */}
          <div 
            className="absolute top-20 right-1/4 w-72 h-72 rounded-full blur-3xl animate-pulse"
            style={{ background: `${colors.accent}20`, animationDuration: '4s' }}
          />
          <div 
            className="absolute bottom-20 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
            style={{ background: `${colors.secondary}15`, animationDuration: '5s' }}
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

              {/* Stats Row */}
              {hasStats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
                  {stats.map((stat, i) => (
                    <div 
                      key={i}
                      className="group relative p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div 
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"
                        style={{ background: stat.color }}
                      />
                      <stat.icon 
                        className="h-5 w-5 mb-2 transition-transform group-hover:scale-110"
                        style={{ color: stat.color }}
                      />
                      <div 
                        className="text-2xl font-bold"
                        style={{ color: colors.primary }}
                      >
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{stat.label || ''}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Media Side */}
            {(aboutPage.heroImageUrl || heroVideoEmbed) && (
              <div className="relative">
                {/* Main Media Container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                  {/* Decorative ring */}
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
                  ) : aboutPage.heroImageUrl ? (
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={aboutPage.heroImageUrl}
                        alt={heroImageAlt || ""}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ background: `linear-gradient(135deg, ${colors.primary}10, transparent)` }}
                      />
                    </div>
                  ) : null}

                  {/* Floating badge on image */}
                  {!heroVideoEmbed && floatingBadgeTitle && (
                    <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-xl transform transition-transform duration-300 group-hover:translate-y-[-4px]">
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
            <div className={`grid grid-cols-1 gap-16 items-center ${aboutPage.mainImageUrl || mainVideoEmbed ? 'lg:grid-cols-2' : 'max-w-4xl mx-auto'}`}>
              {/* Content */}
              <div className={aboutPage.mainImageUrl || mainVideoEmbed ? 'order-2 lg:order-1' : ''}>
                {mainTitle && (
                  <div className="mb-6">
                    <Badge 
                      variant="outline" 
                      className="mb-4 px-4 py-1 rounded-full"
                      style={{ borderColor: colors.accent, color: colors.accent }}
                    >
                      {currentLocale === 'fr' ? 'Notre Histoire' : 'Our Story'}
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

                {/* Quick features */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {features.slice(0, 4).map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div 
                        className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${feature.color}15` }}
                      >
                        <feature.icon className="h-5 w-5" style={{ color: feature.color }} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: colors.primary }}>
                          {feature.title}
                        </div>
                        <div className="text-xs text-gray-500">{feature.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Media */}
              {(aboutPage.mainImageUrl || mainVideoEmbed) && (
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
                      ) : aboutPage.mainImageUrl ? (
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src={aboutPage.mainImageUrl}
                            alt={mainImageAlt || ""}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: `linear-gradient(135deg, ${colors.primary}10, transparent)` }}
                          />
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>

                  {/* Decorative element */}
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

      {/* Mission & Values Section - Premium Cards */}
      {(missionContent || valuesContent) && (
        <section 
          className="py-24 relative"
          style={{ background: `linear-gradient(180deg, #fafafa 0%, ${colors.light}10 100%)` }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge 
                variant="outline" 
                className="mb-4 px-4 py-1 rounded-full"
                style={{ borderColor: colors.accent, color: colors.accent }}
              >
                {currentLocale === 'fr' ? 'Ce qui nous définit' : 'What defines us'}
              </Badge>
              <h2 
                className="text-3xl sm:text-4xl font-bold"
                style={{ color: colors.primary }}
              >
                {currentLocale === 'fr' ? 'Notre ADN' : 'Our DNA'}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Mission Card */}
              {missionContent && (
                <Card 
                  className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white rounded-3xl"
                >
                  {/* Top accent bar */}
                  <div 
                    className="h-1.5"
                    style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})` }}
                  />
                  <CardContent className="p-8 relative">
                    {/* Background decoration */}
                    <div 
                      className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5 group-hover:opacity-10 transition-opacity -translate-y-1/2 translate-x-1/2"
                      style={{ background: colors.primary }}
                    />
                    
                    <div className="relative">
                      <div 
                        className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform"
                        style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}
                      >
                        <Target className="h-8 w-8 text-white" />
                      </div>
                      
                      <h3 
                        className="text-2xl font-bold mb-4"
                        style={{ color: colors.primary }}
                      >
                        {missionTitle || (currentLocale === 'fr' ? 'Notre Mission' : 'Our Mission')}
                      </h3>
                      
                      <div
                        className="text-gray-600 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: missionContent }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Values Card */}
              {valuesContent && (
                <Card 
                  className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white rounded-3xl"
                >
                  {/* Top accent bar */}
                  <div 
                    className="h-1.5"
                    style={{ background: `linear-gradient(90deg, ${colors.secondary}, ${colors.light})` }}
                  />
                  <CardContent className="p-8 relative">
                    {/* Background decoration */}
                    <div 
                      className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5 group-hover:opacity-10 transition-opacity -translate-y-1/2 translate-x-1/2"
                      style={{ background: colors.secondary }}
                    />
                    
                    <div className="relative">
                      <div 
                        className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform"
                        style={{ background: `linear-gradient(135deg, ${colors.secondary}, ${colors.light})` }}
                      >
                        <Heart className="h-8 w-8 text-white" />
                      </div>
                      
                      <h3 
                        className="text-2xl font-bold mb-4"
                        style={{ color: colors.primary }}
                      >
                        {valuesTitle || (currentLocale === 'fr' ? 'Nos Valeurs' : 'Our Values')}
                      </h3>
                      
                      <div
                        className="text-gray-600 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: valuesContent }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Card 
                key={i}
                className="group border border-gray-100 hover:border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white rounded-2xl overflow-hidden"
              >
                <CardContent className="p-6 text-center relative">
                  {/* Hover overlay */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity"
                    style={{ background: feature.color }}
                  />
                  
                  <div 
                    className="h-16 w-16 mx-auto mb-5 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: `${feature.color}15` }}
                  >
                    <feature.icon className="h-8 w-8" style={{ color: feature.color }} />
                  </div>
                  
                  <h4 className="font-bold text-lg mb-2" style={{ color: colors.primary }}>
                    {feature.title}
                  </h4>
                  
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section 
        className="py-20 relative overflow-hidden"
        style={{ background: colors.primary }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <Quote className="absolute top-10 left-10 h-32 w-32 text-white" />
          <Quote className="absolute bottom-10 right-10 h-32 w-32 text-white rotate-180" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Quote className="h-12 w-12 mx-auto mb-6 opacity-50" style={{ color: colors.light }} />
            <blockquote className="text-2xl sm:text-3xl font-medium text-white leading-relaxed mb-6">
              {currentLocale === 'fr' 
                ? "L'excellence n'est pas un acte, mais une habitude. Nous nous engageons chaque jour à dépasser vos attentes."
                : "Excellence is not an act, but a habit. We commit every day to exceed your expectations."}
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div 
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{ background: `${colors.light}30` }}
              >
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <div className="text-white font-semibold">
                  {currentLocale === 'fr' ? 'AAEA Team' : 'Équipe AAEA'}
                </div>
                <div className="text-white/70 text-sm">
                  {currentLocale === 'fr' ? 'Engagement qualité' : 'Quality Commitment'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {ctaTitle && (
        <section 
          className="py-24 relative overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` 
          }}
        >
          {/* Decorative shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
              style={{ background: 'white' }}
            />
            <div 
              className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-10"
              style={{ background: 'white' }}
            />
            <div 
              className="absolute top-1/2 left-1/4 w-4 h-4 rounded-full opacity-20"
              style={{ background: 'white' }}
            />
            <div 
              className="absolute top-1/3 right-1/3 w-6 h-6 rounded-full opacity-15"
              style={{ background: 'white' }}
            />
          </div>
          
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
              
              {ctaButtonText && aboutPage.ctaButtonUrl && (
                <Link href={aboutPage.ctaButtonUrl}>
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
