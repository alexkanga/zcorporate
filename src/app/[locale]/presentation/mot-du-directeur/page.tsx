'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Target,
  Users,
  Lightbulb,
  Award,
  Calendar,
  MapPin,
  Linkedin,
  Twitter,
  ExternalLink,
  Download,
  ArrowRight,
  Quote,
  ChevronRight,
  Briefcase,
  Clock,
  Building,
} from 'lucide-react';

interface DirectorPriority {
  id: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  icon: string | null;
  imageUrl: string | null;
  color: string | null;
  linkUrl: string | null;
  linkExternal: boolean;
  order: number;
  visible: boolean;
}

interface DirectorMessage {
  id: string;
  // Hero
  heroTitleFr: string;
  heroTitleEn: string;
  heroSubtitleFr: string | null;
  heroSubtitleEn: string | null;
  heroBadgeFr: string | null;
  heroBadgeEn: string | null;
  // Director Identity
  directorFirstName: string | null;
  directorLastName: string | null;
  directorCivility: string | null;
  directorPositionFr: string | null;
  directorPositionEn: string | null;
  directorPositionShortFr: string | null;
  directorPositionShortEn: string | null;
  directorPhotoUrl: string | null;
  directorPhotoAltFr: string | null;
  directorPhotoAltEn: string | null;
  directorSignatureUrl: string | null;
  // Summary
  introTextFr: string | null;
  introTextEn: string | null;
  quoteFr: string | null;
  quoteEn: string | null;
  // Content
  contentFr: string | null;
  contentEn: string | null;
  // Biography
  bioShortFr: string | null;
  bioShortEn: string | null;
  bioLongFr: string | null;
  bioLongEn: string | null;
  directorStartDate: string | null;
  directorExperienceYears: number | null;
  directorSpecialties: string | null;
  directorDistinctions: string | null;
  directorLinkedInUrl: string | null;
  directorTwitterUrl: string | null;
  // Stats
  showStats: boolean;
  stat1Value: string | null;
  stat1LabelFr: string | null;
  stat1LabelEn: string | null;
  stat2Value: string | null;
  stat2LabelFr: string | null;
  stat2LabelEn: string | null;
  stat3Value: string | null;
  stat3LabelFr: string | null;
  stat3LabelEn: string | null;
  // Key Messages (JSON)
  keyMessagesFr: string | null;
  keyMessagesEn: string | null;
  prioritiesFr: string | null;
  prioritiesEn: string | null;
  commitmentsFr: string | null;
  commitmentsEn: string | null;
  // CTA
  cta1TextFr: string | null;
  cta1TextEn: string | null;
  cta1Url: string | null;
  cta1External: boolean;
  cta2TextFr: string | null;
  cta2TextEn: string | null;
  cta2Url: string | null;
  cta2External: boolean;
  // Section Visibility
  showHero: boolean;
  showKeyMessages: boolean;
  showPriorities: boolean;
  showBiography: boolean;
  showVideo: boolean;
  showCta: boolean;
  showNavigation: boolean;
  // Layout
  portraitPosition: string | null;
  // Publication
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
  // Priorities (relation)
  priorities?: DirectorPriority[];
}

async function fetchDirectorMessage() {
  const response = await fetch('/api/director-message');
  const data = await response.json();
  return data.data;
}

const iconMap: Record<string, React.ReactNode> = {
  target: <Target className="w-6 h-6" />,
  users: <Users className="w-6 h-6" />,
  lightbulb: <Lightbulb className="w-6 h-6" />,
  award: <Award className="w-6 h-6" />,
  briefcase: <Briefcase className="w-6 h-6" />,
  calendar: <Calendar className="w-6 h-6" />,
};

function parseJsonArray(jsonStr: string | null): string[] {
  if (!jsonStr) return [];
  try {
    return JSON.parse(jsonStr);
  } catch {
    return [];
  }
}

export default function DirectorMessagePage() {
  const locale = useLocale() as 'fr' | 'en';
  const { data: message, isLoading } = useQuery({
    queryKey: ['director-message'],
    queryFn: fetchDirectorMessage,
  });

  const directorMessage: DirectorMessage | null = message;

  const getText = (fr: string | null, en: string | null) =>
    locale === 'fr' ? fr || en : en || fr;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-20">
          <Skeleton className="h-96 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!directorMessage || !directorMessage.published) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">
              {locale === 'fr' ? 'Page non disponible' : 'Page not available'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {locale === 'fr'
                ? 'Le mot du directeur n\'est pas encore disponible.'
                : 'The director\'s message is not yet available.'}
            </p>
            <Link href="/">
              <Button className="cursor-pointer">
                {locale === 'fr' ? 'Retour à l\'accueil' : 'Back to home'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const keyMessages = parseJsonArray(
    locale === 'fr' ? directorMessage.keyMessagesFr : directorMessage.keyMessagesEn
  );
  const priorities = parseJsonArray(
    locale === 'fr' ? directorMessage.prioritiesFr : directorMessage.prioritiesEn
  );
  const commitments = parseJsonArray(
    locale === 'fr' ? directorMessage.commitmentsFr : directorMessage.commitmentsEn
  );
  const specialties = parseJsonArray(directorMessage.directorSpecialties);
  const distinctions = parseJsonArray(directorMessage.directorDistinctions);

  const portraitOnRight = directorMessage.portraitPosition !== 'left';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {directorMessage.showHero && (
        <section className="relative bg-gradient-to-br from-[var(--color-primary)]/10 via-background to-[var(--color-secondary)]/10 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className={`max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center`}>
              {/* Director Photo */}
              <div className={`${portraitOnRight ? 'lg:order-2' : ''}`}>
                {directorMessage.directorPhotoUrl ? (
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 rounded-2xl transform rotate-3" />
                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-xl">
                      <Image
                        src={directorMessage.directorPhotoUrl}
                        alt={getText(directorMessage.directorPhotoAltFr, directorMessage.directorPhotoAltEn) || `${directorMessage.directorFirstName} ${directorMessage.directorLastName}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {directorMessage.showStats && (
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 flex gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[var(--color-primary)]">{directorMessage.stat1Value || '15+'}</div>
                          <div className="text-xs text-muted-foreground">{getText(directorMessage.stat1LabelFr, directorMessage.stat1LabelEn)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[var(--color-secondary)]">{directorMessage.stat2Value || '50+'}</div>
                          <div className="text-xs text-muted-foreground">{getText(directorMessage.stat2LabelFr, directorMessage.stat2LabelEn)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[var(--color-tertiary)]">{directorMessage.stat3Value || '20+'}</div>
                          <div className="text-xs text-muted-foreground">{getText(directorMessage.stat3LabelFr, directorMessage.stat3LabelEn)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                    <Users className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Hero Content */}
              <div className={`${portraitOnRight ? 'lg:order-1' : ''} ${portraitOnRight ? 'lg:pr-8' : 'lg:pl-8'}`}>
                {getText(directorMessage.heroBadgeFr, directorMessage.heroBadgeEn) && (
                  <Badge variant="secondary" className="mb-4">
                    {getText(directorMessage.heroBadgeFr, directorMessage.heroBadgeEn)}
                  </Badge>
                )}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                  {getText(directorMessage.heroTitleFr, directorMessage.heroTitleEn)}
                </h1>
                {getText(directorMessage.heroSubtitleFr, directorMessage.heroSubtitleEn) && (
                  <p className="text-lg text-muted-foreground mb-4">
                    {getText(directorMessage.heroSubtitleFr, directorMessage.heroSubtitleEn)}
                  </p>
                )}
                
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">
                    {getText(directorMessage.directorCivility, directorMessage.directorCivility)}{' '}
                    {directorMessage.directorFirstName} {directorMessage.directorLastName}
                  </h2>
                  <p className="text-[var(--color-primary)] font-medium">
                    {getText(directorMessage.directorPositionFr, directorMessage.directorPositionEn)}
                  </p>
                </div>

                {getText(directorMessage.introTextFr, directorMessage.introTextEn) && (
                  <p className="text-muted-foreground mb-6 text-lg">
                    {getText(directorMessage.introTextFr, directorMessage.introTextEn)}
                  </p>
                )}

                {getText(directorMessage.quoteFr, directorMessage.quoteEn) && (
                  <Card className="bg-[var(--color-primary)]/5 border-l-4 border-[var(--color-primary)] mb-6">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Quote className="w-8 h-8 text-[var(--color-primary)] flex-shrink-0" />
                        <p className="italic text-lg">
                          &ldquo;{getText(directorMessage.quoteFr, directorMessage.quoteEn)}&rdquo;
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* CTA Buttons */}
                {directorMessage.showCta && (
                  <div className="flex flex-wrap gap-4">
                    {directorMessage.cta1Url && (
                      <Link href={directorMessage.cta1Url} target={directorMessage.cta1External ? '_blank' : undefined}>
                        <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white cursor-pointer">
                          {getText(directorMessage.cta1TextFr, directorMessage.cta1TextEn)}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                    {directorMessage.cta2Url && (
                      <Link href={directorMessage.cta2Url} target={directorMessage.cta2External ? '_blank' : undefined}>
                        <Button variant="outline" className="cursor-pointer">
                          {directorMessage.cta2External && <ExternalLink className="mr-2 w-4 h-4" />}
                          {!directorMessage.cta2External && <Download className="mr-2 w-4 h-4" />}
                          {getText(directorMessage.cta2TextFr, directorMessage.cta2TextEn)}
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Key Messages Section */}
      {directorMessage.showKeyMessages && (keyMessages.length > 0 || priorities.length > 0 || commitments.length > 0) && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                {locale === 'fr' ? 'Message en synthèse' : 'Key Messages Summary'}
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                {keyMessages.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--color-primary)]">
                        <Target className="w-5 h-5" />
                        {locale === 'fr' ? 'Messages clés' : 'Key Messages'}
                      </h3>
                      <ul className="space-y-3">
                        {keyMessages.map((msg, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 mt-1 text-[var(--color-secondary)] flex-shrink-0" />
                            <span className="text-sm">{msg}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {priorities.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--color-secondary)]">
                        <Calendar className="w-5 h-5" />
                        {locale === 'fr' ? 'Priorités de l\'année' : 'Year Priorities'}
                      </h3>
                      <ul className="space-y-3">
                        {priorities.map((priority, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 mt-1 text-[var(--color-primary)] flex-shrink-0" />
                            <span className="text-sm">{priority}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {commitments.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--color-tertiary)]">
                        <Award className="w-5 h-5" />
                        {locale === 'fr' ? 'Nos engagements' : 'Our Commitments'}
                      </h3>
                      <ul className="space-y-3">
                        {commitments.map((commitment, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 mt-1 text-[var(--color-secondary)] flex-shrink-0" />
                            <span className="text-sm">{commitment}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Section */}
      {(directorMessage.contentFr || directorMessage.contentEn) && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-sm">
                <CardContent className="p-8 md:p-12">
                  <div 
                    className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-[var(--color-primary)] prose-a:text-[var(--color-secondary)]"
                    dangerouslySetInnerHTML={{ 
                      __html: getText(directorMessage.contentFr, directorMessage.contentEn) || '' 
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Strategic Priorities Cards */}
      {directorMessage.showPriorities && directorMessage.priorities && directorMessage.priorities.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
                {locale === 'fr' ? 'Priorités stratégiques' : 'Strategic Priorities'}
              </h2>
              <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                {locale === 'fr'
                  ? 'Les axes majeurs de notre développement et de notre action'
                  : 'The major axes of our development and action'}
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {directorMessage.priorities.map((priority) => (
                  <Card key={priority.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                        priority.color === 'primary' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' :
                        priority.color === 'secondary' ? 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]' :
                        priority.color === 'tertiary' ? 'bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)]' :
                        'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      }`}>
                        {iconMap[priority.icon || 'target'] || <Target className="w-6 h-6" />}
                      </div>
                      <h3 className="font-semibold mb-2">
                        {getText(priority.titleFr, priority.titleEn)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {getText(priority.descriptionFr, priority.descriptionEn)}
                      </p>
                      {priority.linkUrl && (
                        <Link 
                          href={priority.linkUrl} 
                          target={priority.linkExternal ? '_blank' : undefined}
                          className="inline-flex items-center text-sm text-[var(--color-primary)] mt-4 hover:underline"
                        >
                          {locale === 'fr' ? 'En savoir plus' : 'Learn more'}
                          <ArrowRight className="ml-1 w-4 h-4" />
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Director Biography */}
      {directorMessage.showBiography && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                {locale === 'fr' ? 'Le Directeur en bref' : 'The Director at a Glance'}
              </h2>

              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <Card>
                    <CardContent className="p-8">
                      <h3 className="text-xl font-semibold mb-4 text-[var(--color-primary)]">
                        {locale === 'fr' ? 'Parcours professionnel' : 'Professional Background'}
                      </h3>
                      <div 
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ 
                          __html: getText(directorMessage.bioLongFr, directorMessage.bioLongEn) || getText(directorMessage.bioShortFr, directorMessage.bioShortEn) || '' 
                        }}
                      />

                      <div className="flex gap-4 mt-6 pt-6 border-t">
                        {directorMessage.directorLinkedInUrl && (
                          <a 
                            href={directorMessage.directorLinkedInUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                          >
                            <Linkedin className="w-5 h-5" />
                          </a>
                        )}
                        {directorMessage.directorTwitterUrl && (
                          <a 
                            href={directorMessage.directorTwitterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-[var(--color-secondary)]/10 flex items-center justify-center text-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-white transition-colors"
                          >
                            <Twitter className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {directorMessage.directorStartDate && (
                    <Card>
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[var(--color-secondary)]/10 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-[var(--color-secondary)]" />
                        </div>
                        <div>
                          <div className="font-semibold">
                            {locale === 'fr' ? 'En fonction depuis' : 'In office since'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(directorMessage.directorStartDate).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                              year: 'numeric',
                              month: 'long',
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {specialties.length > 0 && (
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-[var(--color-primary)]" />
                          {locale === 'fr' ? 'Spécialités' : 'Specialties'}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {specialties.map((specialty, idx) => (
                            <Badge key={idx} variant="secondary">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {distinctions.length > 0 && (
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <Award className="w-5 h-5 text-[var(--color-secondary)]" />
                          {locale === 'fr' ? 'Distinctions' : 'Distinctions'}
                        </h4>
                        <ul className="space-y-2">
                          {distinctions.map((distinction, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <ChevronRight className="w-4 h-4 mt-0.5 text-[var(--color-primary)] flex-shrink-0" />
                              {distinction}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Signature Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {directorMessage.directorSignatureUrl ? (
              <Image
                src={directorMessage.directorSignatureUrl}
                alt="Signature"
                width={200}
                height={80}
                className="mx-auto mb-4"
              />
            ) : (
              <div className="text-3xl text-[var(--color-primary)] mb-4 italic">
                {directorMessage.directorFirstName} {directorMessage.directorLastName}
              </div>
            )}
            <p className="font-semibold text-lg">
              {getText(directorMessage.directorCivility, directorMessage.directorCivility)}{' '}
              {directorMessage.directorFirstName} {directorMessage.directorLastName}
            </p>
            <p className="text-muted-foreground">
              {getText(directorMessage.directorPositionFr, directorMessage.directorPositionEn)}
            </p>
            {directorMessage.updatedAt && (
              <p className="text-sm text-muted-foreground mt-4">
                {locale === 'fr' ? 'Dernière mise à jour' : 'Last updated'}:{' '}
                {new Date(directorMessage.updatedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Navigation Section */}
      {directorMessage.showNavigation && (
        <section className="py-12 bg-muted/30 border-t">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-xl font-semibold text-center mb-8">
                {locale === 'fr' ? 'Pages associées' : 'Related Pages'}
              </h2>
              <div className="grid md:grid-cols-4 gap-4">
                <Link href="/presentation/a-propos">
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Building className="w-8 h-8 text-[var(--color-primary)]" />
                      <div>
                        <div className="font-medium">{locale === 'fr' ? 'À Propos' : 'About Us'}</div>
                        <div className="text-sm text-muted-foreground">
                          {locale === 'fr' ? 'Notre organisation' : 'Our organization'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/presentation/notre-equipe">
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Users className="w-8 h-8 text-[var(--color-secondary)]" />
                      <div>
                        <div className="font-medium">{locale === 'fr' ? 'Notre Équipe' : 'Our Team'}</div>
                        <div className="text-sm text-muted-foreground">
                          {locale === 'fr' ? 'Découvrez l\'équipe' : 'Meet the team'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/contact">
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <MapPin className="w-8 h-8 text-[var(--color-tertiary)]" />
                      <div>
                        <div className="font-medium">{locale === 'fr' ? 'Contact' : 'Contact'}</div>
                        <div className="text-sm text-muted-foreground">
                          {locale === 'fr' ? 'Nous contacter' : 'Contact us'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/actualites">
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Calendar className="w-8 h-8 text-[var(--color-primary)]" />
                      <div>
                        <div className="font-medium">{locale === 'fr' ? 'Actualités' : 'News'}</div>
                        <div className="text-sm text-muted-foreground">
                          {locale === 'fr' ? 'Dernières nouvelles' : 'Latest news'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
