'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Target,
  Users,
  Lightbulb,
  Award,
  Calendar,
  MapPin,
  Linkedin,
  Download,
  ArrowRight,
  Quote,
  ChevronRight,
  Briefcase,
  Building,
  TrendingUp,
  Handshake,
  Globe,
  Heart,
  FileText,
  Play,
  CheckCircle2,
  Star,
} from 'lucide-react';

export default function DirectorMessagePage() {
  const locale = useLocale() as 'fr' | 'en';

  // Static content - French
  const contentFr = {
    // Hero
    heroBadge: 'Leadership',
    heroTitle: 'Mot du Directeur Exécutif',
    heroSubtitle: 'Gouvernance',
    directorName: 'Dr. Emmanuel Kanga',
    directorCivility: 'M.',
    directorPosition: 'Directeur Exécutif',
    introText: 'Bienvenue sur le site de l\'AAEA. Je suis honoré de vous présenter notre organisation, notre vision et notre engagement envers le développement agricole durable en Afrique.',
    quote: 'Ensemble, construisons une agriculture africaine prospère, résiliente et respectueuse de l\'environnement.',
    
    // Key Messages
    keyMessagesTitle: 'Message en synthèse',
    keyMessages: [
      'Renforcer l\'impact sectoriel de l\'agriculture africaine',
      'Accélérer la transformation digitale du secteur agricole',
      'Consolider les partenariats régionaux et internationaux',
    ],
    prioritiesTitle: 'Priorités de l\'année',
    priorities: [
      'Performance institutionnelle',
      'Innovation et digitalisation',
      'Partenariats stratégiques',
    ],
    commitmentsTitle: 'Nos engagements',
    commitments: [
      'Excellence et transparence dans nos actions',
      'Impact mesurable sur les communautés rurales',
      'Durabilité environnementale',
    ],
    
    // Stats
    stats: [
      { value: '15+', label: 'Années d\'expérience' },
      { value: '50+', label: 'Projets menés' },
      { value: '20+', label: 'Partenaires' },
    ],
    
    // Main Content
    mainContentTitle: 'Mot du Directeur',
    mainContent: `
      <h2>Chers partenaires et visiteurs,</h2>
      <p>C'est avec une grande fierté et un profond sens de la responsabilité que je vous adresse ce message en tant que Directeur Exécutif de l'AAEA. Notre organisation s'engage chaque jour à transformer l'agriculture africaine en un moteur de développement économique et social durable.</p>
      
      <h2>Notre contexte et notre mission</h2>
      <p>L'Afrique dispose d'un potentiel agricole immense, encore largement sous-exploité. Face aux défis du changement climatique, de la sécurité alimentaire et de la croissance démographique, l'AAEA se positionne comme un acteur clé de la transformation agricole du continent. Notre mission est d'accompagner les acteurs agricoles dans leur transition vers des pratiques plus durables et plus productives.</p>
      
      <h2>Bilan de l'année écoulée</h2>
      <p>L'année 2024 a été marquée par des avancées significatives. Nous avons lancé plusieurs programmes d'envergure, renforcé nos partenariats avec les institutions internationales et accru notre impact sur le terrain. Nos équipes ont travaillé sans relâche pour atteindre nos objectifs stratégiques.</p>
      <ul>
        <li>Plus de 10 000 agriculteurs formés aux techniques agricoles durables</li>
        <li>5 nouveaux projets de développement lancés dans 3 pays</li>
        <li>Partenariats stratégiques avec la Banque Mondiale et la FAO</li>
      </ul>
      
      <h2>Défis et opportunités</h2>
      <p>Le secteur agricole africain fait face à des défis majeurs : accès au financement, infrastructures insuffisantes, effets du changement climatique. Cependant, ces défis représentent autant d'opportunités d'innovation et de transformation. La digitalisation, les énergies renouvelables et l'agriculture de précision ouvrent de nouvelles perspectives passionnantes.</p>
      
      <h2>Notre vision stratégique</h2>
      <p>À l'horizon 2030, nous ambitionnons de contribuer significativement à la sécurité alimentaire en Afrique, de promouvoir une agriculture résiliente au changement climatique, et de créer des emplois durables pour les jeunes et les femmes en milieu rural. Cette vision se décline en quatre axes stratégiques : l'innovation, le partenariat, le renforcement des capacités et le plaidoyer.</p>
      
      <h2>Remerciements</h2>
      <p>Je tiens à exprimer ma profonde gratitude à nos partenaires techniques et financiers, aux gouvernements qui nous accompagnent, et surtout à nos équipes sur le terrain dont le dévouement est notre plus grande force. Ensemble, nous construisons un avenir meilleur pour l'agriculture africaine.</p>
      
      <h2>Appel à l'action</h2>
      <p>Je vous invite à rejoindre notre mouvement pour une agriculture africaine prospère. Que vous soyez investisseur, décideur politique, chercheur ou simplement citoyen engagé, votre contribution compte. Ensemble, transformons l'agriculture africaine.</p>
    `,
    
    // Strategic Priorities
    strategicTitle: 'Priorités stratégiques',
    strategicSubtitle: 'Les axes majeurs de notre développement et de notre action',
    strategicPriorities: [
      {
        title: 'Performance institutionnelle',
        description: 'Renforcer nos capacités organisationnelles pour un impact optimal',
        icon: 'trending',
        color: 'primary',
      },
      {
        title: 'Innovation et digitalisation',
        description: 'Intégrer les technologies numériques au service de l\'agriculture',
        icon: 'lightbulb',
        color: 'secondary',
      },
      {
        title: 'Partenariats stratégiques',
        description: 'Développer des alliances pour amplifier notre impact',
        icon: 'handshake',
        color: 'tertiary',
      },
      {
        title: 'Impact communautaire',
        description: 'Améliorer les conditions de vie des populations rurales',
        icon: 'heart',
        color: 'primary',
      },
    ],
    
    // Director Bio
    bioTitle: 'Le Directeur en bref',
    bioSectionTitle: 'Parcours professionnel',
    bioContent: `
      <p>Dr. Emmanuel Kanga est un expert en développement agricole avec plus de 15 ans d'expérience dans le secteur. Avant de rejoindre l'AAEA, il a occupé des postes de direction dans plusieurs organisations internationales.</p>
      <p>Il a contribué à la conception et à la mise en œuvre de programmes de développement agricole dans plus de 20 pays africains, touchant des millions de bénéficiaires.</p>
      <p>Son expertise couvre la politique agricole, le financement du développement, et la gestion de projets complexes.</p>
    `,
    inOfficeSince: 'En fonction depuis',
    startDate: 'Janvier 2020',
    specialties: ['Gestion de projet', 'Politique agricole', 'Développement durable', 'Leadership stratégique'],
    distinctions: ['Chevalier de l\'Ordre du Mérite Agricole', 'Prix de l\'Excellence en Développement 2023'],
    
    // CTA
    cta1Text: 'Voir notre Équipe',
    cta1Url: '/presentation/notre-equipe',
    cta2Text: 'Télécharger le rapport annuel',
    
    // Navigation
    navTitle: 'Pages associées',
    navItems: [
      { title: 'Gouvernance', subtitle: 'Notre organisation', url: '/presentation/a-propos', icon: 'building' },
      { title: 'Notre Équipe', subtitle: 'Découvrez l\'équipe', url: '/presentation/notre-equipe', icon: 'users' },
      { title: 'Plan stratégique', subtitle: 'Télécharger le document', url: '#', icon: 'file' },
      { title: 'Contact', subtitle: 'Nous contacter', url: '/contact', icon: 'map' },
    ],
    
    // Signature
    lastUpdated: 'Dernière mise à jour',
    closingPhrase: 'Ensemble, construisons l\'avenir de l\'agriculture africaine.',
  };

  // Static content - English
  const contentEn = {
    // Hero
    heroBadge: 'Leadership',
    heroTitle: 'Message from the Executive Director',
    heroSubtitle: 'Governance',
    directorName: 'Dr. Emmanuel Kanga',
    directorCivility: 'Mr.',
    directorPosition: 'Executive Director',
    introText: 'Welcome to the AAEA website. I am honored to present our organization, our vision and our commitment to sustainable agricultural development in Africa.',
    quote: 'Together, let\'s build a prosperous, resilient and environmentally respectful African agriculture.',
    
    // Key Messages
    keyMessagesTitle: 'Key Messages Summary',
    keyMessages: [
      'Strengthen the sectoral impact of African agriculture',
      'Accelerate the digital transformation of the agricultural sector',
      'Consolidate regional and international partnerships',
    ],
    prioritiesTitle: 'Year Priorities',
    priorities: [
      'Institutional performance',
      'Innovation and digitalization',
      'Strategic partnerships',
    ],
    commitmentsTitle: 'Our Commitments',
    commitments: [
      'Excellence and transparency in our actions',
      'Measurable impact on rural communities',
      'Environmental sustainability',
    ],
    
    // Stats
    stats: [
      { value: '15+', label: 'Years of experience' },
      { value: '50+', label: 'Projects led' },
      { value: '20+', label: 'Partners' },
    ],
    
    // Main Content
    mainContentTitle: 'Director\'s Message',
    mainContent: `
      <h2>Dear partners and visitors,</h2>
      <p>It is with great pride and a deep sense of responsibility that I address you as Executive Director of AAEA. Our organization is committed every day to transforming African agriculture into an engine of sustainable economic and social development.</p>
      
      <h2>Our context and mission</h2>
      <p>Africa has immense agricultural potential, still largely underexploited. Facing climate change, food security, and demographic growth challenges, AAEA positions itself as a key player in the continent's agricultural transformation. Our mission is to support agricultural stakeholders in their transition to more sustainable and productive practices.</p>
      
      <h2>Year in review</h2>
      <p>2024 has been marked by significant advances. We launched several major programs, strengthened our partnerships with international institutions, and increased our field impact. Our teams have worked tirelessly to achieve our strategic objectives.</p>
      <ul>
        <li>Over 10,000 farmers trained in sustainable agricultural techniques</li>
        <li>5 new development projects launched in 3 countries</li>
        <li>Strategic partnerships with the World Bank and FAO</li>
      </ul>
      
      <h2>Challenges and opportunities</h2>
      <p>The African agricultural sector faces major challenges: access to finance, insufficient infrastructure, and climate change effects. However, these challenges represent opportunities for innovation and transformation. Digitalization, renewable energies, and precision agriculture open exciting new perspectives.</p>
      
      <h2>Our strategic vision</h2>
      <p>By 2030, we aim to significantly contribute to food security in Africa, promote climate-resilient agriculture, and create sustainable jobs for youth and women in rural areas. This vision is structured around four strategic axes: innovation, partnership, capacity building, and advocacy.</p>
      
      <h2>Acknowledgments</h2>
      <p>I would like to express my deep gratitude to our technical and financial partners, the governments that support us, and especially our field teams whose dedication is our greatest strength. Together, we are building a better future for African agriculture.</p>
      
      <h2>Call to action</h2>
      <p>I invite you to join our movement for a prosperous African agriculture. Whether you are an investor, policy maker, researcher, or simply an engaged citizen, your contribution matters. Together, let's transform African agriculture.</p>
    `,
    
    // Strategic Priorities
    strategicTitle: 'Strategic Priorities',
    strategicSubtitle: 'The major axes of our development and action',
    strategicPriorities: [
      {
        title: 'Institutional Performance',
        description: 'Strengthen our organizational capacities for optimal impact',
        icon: 'trending',
        color: 'primary',
      },
      {
        title: 'Innovation & Digitalization',
        description: 'Integrate digital technologies at the service of agriculture',
        icon: 'lightbulb',
        color: 'secondary',
      },
      {
        title: 'Strategic Partnerships',
        description: 'Develop alliances to amplify our impact',
        icon: 'handshake',
        color: 'tertiary',
      },
      {
        title: 'Community Impact',
        description: 'Improve living conditions of rural populations',
        icon: 'heart',
        color: 'primary',
      },
    ],
    
    // Director Bio
    bioTitle: 'The Director at a Glance',
    bioSectionTitle: 'Professional Background',
    bioContent: `
      <p>Dr. Emmanuel Kanga is an agricultural development expert with over 15 years of experience in the sector. Before joining AAEA, he held leadership positions in several international organizations.</p>
      <p>He contributed to the design and implementation of agricultural development programs in over 20 African countries, reaching millions of beneficiaries.</p>
      <p>His expertise covers agricultural policy, development finance, and complex project management.</p>
    `,
    inOfficeSince: 'In office since',
    startDate: 'January 2020',
    specialties: ['Project Management', 'Agricultural Policy', 'Sustainable Development', 'Strategic Leadership'],
    distinctions: ['Knight of the Order of Agricultural Merit', 'Excellence in Development Award 2023'],
    
    // CTA
    cta1Text: 'View our Team',
    cta1Url: '/presentation/notre-equipe',
    cta2Text: 'Download annual report',
    
    // Navigation
    navTitle: 'Related Pages',
    navItems: [
      { title: 'Governance', subtitle: 'Our organization', url: '/presentation/a-propos', icon: 'building' },
      { title: 'Our Team', subtitle: 'Meet the team', url: '/presentation/notre-equipe', icon: 'users' },
      { title: 'Strategic Plan', subtitle: 'Download document', url: '#', icon: 'file' },
      { title: 'Contact', subtitle: 'Contact us', url: '/contact', icon: 'map' },
    ],
    
    // Signature
    lastUpdated: 'Last updated',
    closingPhrase: 'Together, let\'s build the future of African agriculture.',
  };

  const content = locale === 'fr' ? contentFr : contentEn;

  const iconMap: Record<string, React.ReactNode> = {
    trending: <TrendingUp className="w-6 h-6" />,
    lightbulb: <Lightbulb className="w-6 h-6" />,
    handshake: <Handshake className="w-6 h-6" />,
    heart: <Heart className="w-6 h-6" />,
    target: <Target className="w-6 h-6" />,
    building: <Building className="w-6 h-6" />,
    users: <Users className="w-6 h-6" />,
    file: <FileText className="w-6 h-6" />,
    map: <MapPin className="w-6 h-6" />,
  };

  const navIconMap: Record<string, React.ReactNode> = {
    building: <Building className="w-8 h-8 text-[var(--color-primary)]" />,
    users: <Users className="w-8 h-8 text-[var(--color-secondary)]" />,
    file: <FileText className="w-8 h-8 text-[var(--color-tertiary)]" />,
    map: <MapPin className="w-8 h-8 text-[var(--color-primary)]" />,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Premium Design */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 via-background to-[var(--color-secondary)]/5" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--color-primary)]/10 to-transparent" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--color-secondary)]/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Director Photo */}
              <div className="order-2 lg:order-1">
                <div className="relative max-w-md mx-auto lg:mx-0">
                  {/* Photo frame with decorative border */}
                  <div className="absolute -inset-4 bg-gradient-to-tr from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-tertiary)] rounded-3xl opacity-20 blur-sm" />
                  <div className="absolute -inset-2 bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl opacity-30" />
                  
                  {/* Photo container */}
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20">
                    <Image
                      src="/images/director-portrait.jpg"
                      alt={`${content.directorCivility} ${content.directorName}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* Fallback placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10">
                      <Users className="w-32 h-32 text-[var(--color-primary)]/30" />
                    </div>
                  </div>
                  
                  {/* Stats overlay */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 md:p-6 flex gap-4 md:gap-8 border border-gray-100 dark:border-gray-800">
                    {content.stats.map((stat, idx) => (
                      <div key={idx} className="text-center">
                        <div className={`text-xl md:text-2xl font-bold ${
                          idx === 0 ? 'text-[var(--color-primary)]' :
                          idx === 1 ? 'text-[var(--color-secondary)]' :
                          'text-[var(--color-tertiary)]'
                        }`}>
                          {stat.value}
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Decorative badge */}
                  <div className="absolute -top-3 -right-3 bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    {content.heroBadge}
                  </div>
                </div>
              </div>

              {/* Hero Content */}
              <div className="order-1 lg:order-2 lg:pl-8">
                {/* Breadcrumb badge */}
                <div className="flex items-center gap-2 mb-6">
                  <Badge variant="outline" className="text-[var(--color-primary)] border-[var(--color-primary)]/30">
                    {content.heroSubtitle}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="secondary" className="bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
                    {content.heroBadge}
                  </Badge>
                </div>
                
                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-tertiary)] bg-clip-text text-transparent">
                    {content.heroTitle}
                  </span>
                </h1>
                
                {/* Director info */}
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                    {content.directorCivility} {content.directorName}
                  </h2>
                  <p className="text-lg text-[var(--color-primary)] font-medium mt-1">
                    {content.directorPosition}
                  </p>
                </div>

                {/* Intro text */}
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {content.introText}
                </p>

                {/* Quote */}
                <Card className="bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 border-l-4 border-[var(--color-primary)] mb-8 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Quote className="w-10 h-10 text-[var(--color-primary)] flex-shrink-0 opacity-50" />
                      <p className="italic text-lg md:text-xl leading-relaxed">
                        &ldquo;{content.quote}&rdquo;
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Link href={content.cta1Url}>
                    <Button size="lg" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white cursor-pointer shadow-lg shadow-[var(--color-primary)]/20">
                      {content.cta1Text}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="cursor-pointer border-2">
                    <Download className="mr-2 w-5 h-5" />
                    {content.cta2Text}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Messages Section - Scannable Summary */}
      <section className="py-20 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-[var(--color-primary)] border-[var(--color-primary)]/30">
                {locale === 'fr' ? 'En bref' : 'At a glance'}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {content.keyMessagesTitle}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] mx-auto rounded-full" />
            </div>

            {/* Three columns */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Key Messages */}
              <Card className="group hover:shadow-xl transition-all duration-500 border-t-4 border-t-[var(--color-primary)] overflow-hidden">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-7 h-7 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-xl font-bold mb-6 text-[var(--color-primary)]">
                    {content.keyMessagesTitle}
                  </h3>
                  <ul className="space-y-4">
                    {content.keyMessages.map((msg, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 text-[var(--color-secondary)] flex-shrink-0" />
                        <span className="text-foreground/80">{msg}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Priorities */}
              <Card className="group hover:shadow-xl transition-all duration-500 border-t-4 border-t-[var(--color-secondary)] overflow-hidden">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-secondary)]/10 to-[var(--color-secondary)]/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-7 h-7 text-[var(--color-secondary)]" />
                  </div>
                  <h3 className="text-xl font-bold mb-6 text-[var(--color-secondary)]">
                    {content.prioritiesTitle}
                  </h3>
                  <ul className="space-y-4">
                    {content.priorities.map((priority, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Star className="w-5 h-5 mt-0.5 text-[var(--color-primary)] flex-shrink-0" />
                        <span className="text-foreground/80">{priority}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Commitments */}
              <Card className="group hover:shadow-xl transition-all duration-500 border-t-4 border-t-[var(--color-tertiary)] overflow-hidden">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-tertiary)]/10 to-[var(--color-tertiary)]/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-7 h-7 text-[var(--color-tertiary)]" />
                  </div>
                  <h3 className="text-xl font-bold mb-6 text-[var(--color-tertiary)]">
                    {content.commitmentsTitle}
                  </h3>
                  <ul className="space-y-4">
                    {content.commitments.map((commitment, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Heart className="w-5 h-5 mt-0.5 text-[var(--color-secondary)] flex-shrink-0" />
                        <span className="text-foreground/80">{commitment}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section - Director's Message */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-[var(--color-secondary)] border-[var(--color-secondary)]/30">
                {locale === 'fr' ? 'Message complet' : 'Full message'}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                {content.mainContentTitle}
              </h2>
            </div>
            
            {/* Content card */}
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardContent className="p-8 md:p-12 lg:p-16">
                <div 
                  className="prose prose-lg max-w-none dark:prose-invert 
                    prose-headings:text-[var(--color-primary)] 
                    prose-headings:font-bold
                    prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:first:mt-0
                    prose-p:text-foreground/80 prose-p:leading-relaxed
                    prose-li:text-foreground/80
                    prose-a:text-[var(--color-secondary)] prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-foreground
                    prose-ul:my-6 prose-li:my-2"
                  dangerouslySetInnerHTML={{ __html: content.mainContent }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Strategic Priorities Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-[var(--color-tertiary)] border-[var(--color-tertiary)]/30">
                {locale === 'fr' ? 'Vision' : 'Vision'}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {content.strategicTitle}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {content.strategicSubtitle}
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-tertiary)] mx-auto rounded-full mt-6" />
            </div>

            {/* Priority cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {content.strategicPriorities.map((priority, idx) => (
                <Card 
                  key={idx} 
                  className="group hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer border-0 bg-white dark:bg-gray-900"
                >
                  <CardContent className="p-6 relative">
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                      priority.color === 'primary' ? 'bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent' :
                      priority.color === 'secondary' ? 'bg-gradient-to-br from-[var(--color-secondary)]/5 to-transparent' :
                      'bg-gradient-to-br from-[var(--color-tertiary)]/5 to-transparent'
                    }`} />
                    
                    <div className="relative z-10">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${
                        priority.color === 'primary' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' :
                        priority.color === 'secondary' ? 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]' :
                        'bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)]'
                      }`}>
                        {iconMap[priority.icon]}
                      </div>
                      
                      {/* Number badge */}
                      <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                        {idx + 1}
                      </div>
                      
                      {/* Content */}
                      <h3 className="text-lg font-bold mb-3 group-hover:text-[var(--color-primary)] transition-colors">
                        {priority.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {priority.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Director Biography Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-[var(--color-primary)] border-[var(--color-primary)]/30">
                {locale === 'fr' ? 'Biographie' : 'Biography'}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                {content.bioTitle}
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Professional Background */}
              <Card className="shadow-lg border-0 overflow-hidden">
                <CardContent className="p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--color-primary)]">
                      {content.bioSectionTitle}
                    </h3>
                  </div>
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert prose-p:text-muted-foreground prose-p:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: content.bioContent }}
                  />
                  
                  {/* Social links */}
                  <div className="flex gap-4 mt-8 pt-6 border-t">
                    <a 
                      href="#"
                      className="w-11 h-11 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a 
                      href="#"
                      className="w-11 h-11 rounded-xl bg-[var(--color-secondary)]/10 flex items-center justify-center text-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-white transition-all duration-300"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Info cards */}
              <div className="space-y-6">
                {/* In office since */}
                <Card className="shadow-md border-0 overflow-hidden">
                  <CardContent className="p-6 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary)]/50 flex items-center justify-center">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">{content.inOfficeSince}</div>
                      <div className="text-muted-foreground">{content.startDate}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Specialties */}
                <Card className="shadow-md border-0 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Briefcase className="w-5 h-5 text-[var(--color-primary)]" />
                      <h4 className="font-bold">{locale === 'fr' ? 'Spécialités' : 'Specialties'}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {content.specialties.map((specialty, idx) => (
                        <Badge key={idx} variant="secondary" className="px-4 py-2 text-sm">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Distinctions */}
                <Card className="shadow-md border-0 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Award className="w-5 h-5 text-[var(--color-secondary)]" />
                      <h4 className="font-bold">{locale === 'fr' ? 'Distinctions' : 'Distinctions'}</h4>
                    </div>
                    <ul className="space-y-3">
                      {content.distinctions.map((distinction, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Star className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{distinction}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Decorative line */}
            <div className="w-32 h-1 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-tertiary)] mx-auto rounded-full mb-10" />
            
            {/* Signature style name */}
            <div className="text-4xl md:text-5xl font-serif italic text-[var(--color-primary)] mb-4">
              {content.directorName}
            </div>
            
            <p className="text-xl font-semibold mb-2">
              {content.directorCivility} {content.directorName}
            </p>
            <p className="text-[var(--color-primary)] font-medium mb-6">
              {content.directorPosition}
            </p>
            
            {/* Closing phrase */}
            <Card className="bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 border-0 mb-8">
              <CardContent className="p-6">
                <p className="italic text-lg text-muted-foreground">
                  {content.closingPhrase}
                </p>
              </CardContent>
            </Card>
            
            <p className="text-sm text-muted-foreground">
              {content.lastUpdated}: {new Date().toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Section */}
      <section className="py-16 bg-muted/30 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold">{content.navTitle}</h2>
            </div>
            
            {/* Navigation cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {content.navItems.map((item, idx) => (
                <Link key={idx} href={item.url}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 bg-white dark:bg-gray-900 overflow-hidden">
                    <CardContent className="p-6 relative">
                      {/* Hover gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative z-10 flex items-start gap-4">
                        <div className="group-hover:scale-110 transition-transform duration-300">
                          {navIconMap[item.icon]}
                        </div>
                        <div>
                          <div className="font-bold text-lg group-hover:text-[var(--color-primary)] transition-colors">
                            {item.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
