import { setRequestLocale } from 'next-intl/server';
import { type Locale } from '@/i18n';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Code2,
  Cloud,
  Shield,
  Database,
  Zap,
  Smartphone,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { Metadata } from 'next';

interface SolutionsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === 'fr' ? 'Solutions' : 'Solutions',
    description: locale === 'fr'
      ? 'Des solutions adaptées à vos besoins'
      : 'Solutions tailored to your needs',
  };
}

export default async function SolutionsPage({ params }: SolutionsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const currentLocale = locale as Locale;

  // Try to fetch page from database
  let pageData = null;
  try {
    pageData = await db.page.findFirst({
      where: {
        slug: 'solutions',
        deletedAt: null,
        published: true,
      },
    });
  } catch (error) {
    console.error('Error fetching page:', error);
  }

  // Get localized content
  const title = pageData?.titleFr || pageData?.titleEn || (currentLocale === 'fr' ? 'Nos solutions' : 'Our solutions');
  const content = currentLocale === 'fr'
    ? (pageData?.contentFr || null)
    : (pageData?.contentEn || null);

  // Default solutions data
  const solutions = [
    {
      icon: Code2,
      title: currentLocale === 'fr' ? 'Développement Web' : 'Web Development',
      description: currentLocale === 'fr'
        ? 'Sites web modernes, applications web progressives et plateformes sur mesure.'
        : 'Modern websites, progressive web apps, and custom platforms.',
      features: currentLocale === 'fr'
        ? ['Sites responsive', 'E-commerce', 'Applications métier', 'API & Intégrations']
        : ['Responsive sites', 'E-commerce', 'Business apps', 'API & Integrations'],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Smartphone,
      title: currentLocale === 'fr' ? 'Applications Mobiles' : 'Mobile Applications',
      description: currentLocale === 'fr'
        ? 'Applications iOS et Android natives ou cross-platform pour votre entreprise.'
        : 'Native or cross-platform iOS and Android apps for your business.',
      features: currentLocale === 'fr'
        ? ['iOS & Android', 'React Native', 'Flutter', 'Applications métier']
        : ['iOS & Android', 'React Native', 'Flutter', 'Business apps'],
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Cloud,
      title: currentLocale === 'fr' ? 'Cloud & Infrastructure' : 'Cloud & Infrastructure',
      description: currentLocale === 'fr'
        ? 'Migration cloud, architecture scalable et optimisation des coûts.'
        : 'Cloud migration, scalable architecture, and cost optimization.',
      features: currentLocale === 'fr'
        ? ['AWS', 'Azure', 'Google Cloud', 'DevOps']
        : ['AWS', 'Azure', 'Google Cloud', 'DevOps'],
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Shield,
      title: currentLocale === 'fr' ? 'Cybersécurité' : 'Cybersecurity',
      description: currentLocale === 'fr'
        ? 'Audits de sécurité, protection des données et conformité réglementaire.'
        : 'Security audits, data protection, and regulatory compliance.',
      features: currentLocale === 'fr'
        ? ['Audits', 'Pentest', 'RGPD', 'Formation']
        : ['Audits', 'Pentest', 'GDPR', 'Training'],
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Database,
      title: currentLocale === 'fr' ? 'Data & Analytics' : 'Data & Analytics',
      description: currentLocale === 'fr'
        ? 'Exploitation de vos données, BI et tableaux de bord décisionnels.'
        : 'Leverage your data with BI and decision-making dashboards.',
      features: currentLocale === 'fr'
        ? ['Big Data', 'Business Intelligence', 'Machine Learning', 'Dashboards']
        : ['Big Data', 'Business Intelligence', 'Machine Learning', 'Dashboards'],
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Zap,
      title: currentLocale === 'fr' ? 'Transformation Digitale' : 'Digital Transformation',
      description: currentLocale === 'fr'
        ? 'Accompagnement stratégique pour votre transition numérique.'
        : 'Strategic support for your digital transition.',
      features: currentLocale === 'fr'
        ? ['Conseil', 'Stratégie', 'Formation', 'Accompagnement']
        : ['Consulting', 'Strategy', 'Training', 'Support'],
      color: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--color-primary)]/10 via-background to-[var(--color-secondary)]/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              {currentLocale === 'fr' ? 'Expertise' : 'Expertise'}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {currentLocale === 'fr'
                ? 'Des solutions technologiques innovantes pour répondre à vos défis business'
                : 'Innovative technology solutions to address your business challenges'}
            </p>
          </div>
        </div>
      </section>

      {/* Content from Database or Default Grid */}
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
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {solutions.map((solution, index) => (
                  <Card
                    key={index}
                    className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${solution.color}`} />
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${solution.color} flex items-center justify-center mb-4`}>
                        <solution.icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{solution.title}</CardTitle>
                      <CardDescription className="text-base">
                        {solution.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {solution.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button variant="ghost" className="mt-4 w-full group-hover:bg-[var(--color-primary)]/10">
                        {currentLocale === 'fr' ? 'En savoir plus' : 'Learn more'}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  {currentLocale === 'fr'
                    ? 'Besoin d\'une solution sur mesure ?'
                    : 'Need a custom solution?'}
                </h2>
                <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                  {currentLocale === 'fr'
                    ? 'Notre équipe d\'experts est prête à vous accompagner dans la réalisation de vos projets.'
                    : 'Our team of experts is ready to support you in achieving your projects.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                      {currentLocale === 'fr' ? 'Nous contacter' : 'Contact us'}
                    </Button>
                  </Link>
                  <Link href="/realisations">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 border-white/30 hover:bg-white/20">
                      {currentLocale === 'fr' ? 'Voir nos réalisations' : 'View our projects'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                {currentLocale === 'fr' ? 'Notre approche' : 'Our Approach'}
              </Badge>
              <h2 className="text-3xl font-bold">
                {currentLocale === 'fr'
                  ? 'Comment nous travaillons'
                  : 'How We Work'}
              </h2>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: '01',
                  title: currentLocale === 'fr' ? 'Découverte' : 'Discovery',
                  description: currentLocale === 'fr'
                    ? 'Analyse de vos besoins et objectifs'
                    : 'Analysis of your needs and objectives',
                },
                {
                  step: '02',
                  title: currentLocale === 'fr' ? 'Conception' : 'Design',
                  description: currentLocale === 'fr'
                    ? 'Élaboration de la solution adaptée'
                    : 'Development of the adapted solution',
                },
                {
                  step: '03',
                  title: currentLocale === 'fr' ? 'Développement' : 'Development',
                  description: currentLocale === 'fr'
                    ? 'Réalisation technique avec tests'
                    : 'Technical implementation with tests',
                },
                {
                  step: '04',
                  title: currentLocale === 'fr' ? 'Livraison' : 'Delivery',
                  description: currentLocale === 'fr'
                    ? 'Déploiement et accompagnement'
                    : 'Deployment and support',
                },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="text-6xl font-bold text-[var(--color-primary)]/10 absolute -top-4 -left-2">
                    {item.step}
                  </div>
                  <div className="relative pt-8">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
