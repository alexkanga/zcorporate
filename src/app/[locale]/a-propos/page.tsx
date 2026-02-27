import { setRequestLocale } from 'next-intl/server';
import { type Locale } from '@/i18n';
import { db } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Target, Users, Lightbulb, Heart, Award, Globe } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { Metadata } from 'next';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === 'fr' ? 'À propos' : 'About',
    description: locale === 'fr'
      ? 'Découvrez notre histoire et notre mission'
      : 'Discover our story and mission',
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const currentLocale = locale as Locale;

  // Try to fetch page from database
  let pageData = null;
  try {
    pageData = await db.page.findFirst({
      where: {
        slug: 'a-propos',
        deletedAt: null,
        published: true,
      },
    });
  } catch (error) {
    console.error('Error fetching page:', error);
  }

  // Get localized content
  const title = pageData?.titleFr || pageData?.titleEn || (currentLocale === 'fr' ? 'À propos de nous' : 'About us');
  const content = currentLocale === 'fr'
    ? (pageData?.contentFr || null)
    : (pageData?.contentEn || null);

  // Default content if no page found
  const defaultContent = {
    story: currentLocale === 'fr'
      ? 'Fondée avec passion, notre entreprise s\'est développée pour devenir un leader dans notre domaine. Notre parcours est marqué par l\'innovation, l\'engagement envers l\'excellence et une vision claire de l\'avenir.'
      : 'Founded with passion, our company has grown to become a leader in our field. Our journey is marked by innovation, commitment to excellence, and a clear vision for the future.',
    mission: currentLocale === 'fr'
      ? 'Nous nous engageons à fournir des solutions innovantes et de qualité à nos clients, en accompagnant leur transformation numérique et en contribuant à leur succès durable.'
      : 'We are committed to providing innovative, high-quality solutions to our clients, supporting their digital transformation and contributing to their sustainable success.',
  };

  const values = [
    {
      icon: Lightbulb,
      title: currentLocale === 'fr' ? 'Innovation' : 'Innovation',
      description: currentLocale === 'fr'
        ? 'Nous repoussons constamment les limites pour offrir des solutions avant-gardistes.'
        : 'We constantly push boundaries to deliver cutting-edge solutions.',
    },
    {
      icon: Award,
      title: currentLocale === 'fr' ? 'Excellence' : 'Excellence',
      description: currentLocale === 'fr'
        ? 'Nous visons la perfection dans chaque projet que nous entreprenons.'
        : 'We strive for perfection in every project we undertake.',
    },
    {
      icon: Heart,
      title: currentLocale === 'fr' ? 'Intégrité' : 'Integrity',
      description: currentLocale === 'fr'
        ? 'Nous agissons avec honnêteté et transparence dans toutes nos interactions.'
        : 'We act with honesty and transparency in all our interactions.',
    },
    {
      icon: Users,
      title: currentLocale === 'fr' ? 'Collaboration' : 'Collaboration',
      description: currentLocale === 'fr'
        ? 'Nous croyons en la puissance du travail d\'équipe et du partenariat.'
        : 'We believe in the power of teamwork and partnership.',
    },
  ];

  const stats = [
    { value: '500+', label: currentLocale === 'fr' ? 'Clients satisfaits' : 'Satisfied clients' },
    { value: '1000+', label: currentLocale === 'fr' ? 'Projets réalisés' : 'Projects completed' },
    { value: '15+', label: currentLocale === 'fr' ? 'Années d\'expérience' : 'Years of experience' },
    { value: '50+', label: currentLocale === 'fr' ? 'Membres de l\'équipe' : 'Team members' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--color-primary)]/10 via-background to-[var(--color-secondary)]/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              {currentLocale === 'fr' ? 'Notre histoire' : 'Our Story'}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {currentLocale === 'fr'
                ? 'Découvrez notre histoire, notre mission et nos valeurs'
                : 'Discover our story, mission, and values'}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      {content ? (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-8 prose prose-lg dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Story Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <Badge variant="outline" className="mb-4">
                      {currentLocale === 'fr' ? 'Notre histoire' : 'Our Story'}
                    </Badge>
                    <h2 className="text-3xl font-bold mb-6">
                      {currentLocale === 'fr'
                        ? 'Un parcours d\'excellence'
                        : 'A Journey of Excellence'}
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {defaultContent.story}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="aspect-square rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 flex items-center justify-center">
                      <Globe className="w-32 h-32 text-[var(--color-primary)]/40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="order-2 md:order-1 relative">
                    <div className="aspect-square rounded-2xl bg-gradient-to-br from-[var(--color-secondary)]/20 to-[var(--color-primary)]/20 flex items-center justify-center">
                      <Target className="w-32 h-32 text-[var(--color-secondary)]/40" />
                    </div>
                  </div>
                  <div className="order-1 md:order-2">
                    <Badge variant="outline" className="mb-4">
                      {currentLocale === 'fr' ? 'Notre mission' : 'Our Mission'}
                    </Badge>
                    <h2 className="text-3xl font-bold mb-6">
                      {currentLocale === 'fr'
                        ? 'Accompagner votre réussite'
                        : 'Supporting Your Success'}
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {defaultContent.mission}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                {currentLocale === 'fr' ? 'Nos valeurs' : 'Our Values'}
              </Badge>
              <h2 className="text-3xl font-bold">
                {currentLocale === 'fr'
                  ? 'Ce qui nous anime'
                  : 'What Drives Us'}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center group-hover:bg-[var(--color-primary)]/20 transition-colors">
                        <value.icon className="w-6 h-6 text-[var(--color-primary)]" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                  <div className="text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              {currentLocale === 'fr'
                ? 'Prêt à collaborer avec nous ?'
                : 'Ready to work with us?'}
            </h2>
            <p className="text-muted-foreground mb-8">
              {currentLocale === 'fr'
                ? 'Contactez-nous pour discuter de votre projet'
                : 'Contact us to discuss your project'}
            </p>
            <Link href="/contact">
              <Button size="lg" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white">
                {currentLocale === 'fr' ? 'Nous contacter' : 'Contact us'}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
