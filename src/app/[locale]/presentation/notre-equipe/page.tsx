'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Building,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Search,
  Filter,
  ArrowRight,
  Quote,
  ChevronRight,
  Briefcase,
  Calendar,
  Globe,
  Heart,
  Target,
  Lightbulb,
  Award,
  TrendingUp,
  UserCheck,
  Sparkles,
  Layers,
  Network,
  X,
} from 'lucide-react';

// Types
interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  civility: string;
  positionFr: string;
  positionEn: string;
  department: string;
  location: string;
  bioFr: string;
  bioEn: string;
  photoUrl: string | null;
  linkedInUrl: string | null;
  twitterUrl: string | null;
  email: string | null;
  expertise: string[];
  isLeadership: boolean;
  order: number;
}

// Static team data
const teamMembers: TeamMember[] = [
  // Leadership Team
  {
    id: '1',
    firstName: 'Emmanuel',
    lastName: 'Kanga',
    civility: 'Dr.',
    positionFr: 'Directeur Exécutif',
    positionEn: 'Executive Director',
    department: 'leadership',
    location: 'Kinshasa, RDC',
    bioFr: 'Plus de 15 ans d\'expérience dans le développement agricole. Expert en politiques agricoles et gestion de projets.',
    bioEn: 'Over 15 years of experience in agricultural development. Expert in agricultural policies and project management.',
    photoUrl: null,
    linkedInUrl: '#',
    twitterUrl: '#',
    email: 'e.kanga@aaea.org',
    expertise: ['Politique agricole', 'Gestion de projet', 'Leadership stratégique'],
    isLeadership: true,
    order: 1,
  },
  {
    id: '2',
    firstName: 'Marie-Claire',
    lastName: 'Moussa',
    civility: 'Mme',
    positionFr: 'Directrice des Opérations',
    positionEn: 'Director of Operations',
    department: 'leadership',
    location: 'Dakar, Sénégal',
    bioFr: 'Experte en gestion opérationnelle avec une forte expérience dans les programmes de développement.',
    bioEn: 'Expert in operational management with strong experience in development programs.',
    photoUrl: null,
    linkedInUrl: '#',
    twitterUrl: null,
    email: 'mc.moussa@aaea.org',
    expertise: ['Opérations', 'Gestion de programmes', 'Développement durable'],
    isLeadership: true,
    order: 2,
  },
  {
    id: '3',
    firstName: 'Jean-Baptiste',
    lastName: 'Ouédraogo',
    civility: 'M.',
    positionFr: 'Directeur Financier',
    positionEn: 'Chief Financial Officer',
    department: 'leadership',
    location: 'Abidjan, Côte d\'Ivoire',
    bioFr: 'Spécialiste en finance de développement et gestion budgétaire des organisations internationales.',
    bioEn: 'Specialist in development finance and budget management of international organizations.',
    photoUrl: null,
    linkedInUrl: '#',
    twitterUrl: '#',
    email: 'jb.ouedraogo@aaea.org',
    expertise: ['Finance', 'Audit', 'Gestion budgétaire'],
    isLeadership: true,
    order: 3,
  },
  {
    id: '4',
    firstName: 'Aminata',
    lastName: 'Diallo',
    civility: 'Mme',
    positionFr: 'Directrice des Partenariats',
    positionEn: 'Director of Partnerships',
    department: 'leadership',
    location: 'Bamako, Mali',
    bioFr: 'Experte en mobilisation de ressources et développement de partenariats stratégiques.',
    bioEn: 'Expert in resource mobilization and strategic partnership development.',
    photoUrl: null,
    linkedInUrl: '#',
    twitterUrl: null,
    email: 'a.diallo@aaea.org',
    expertise: ['Partenariats', 'Mobilisation de ressources', 'Relations institutionnelles'],
    isLeadership: true,
    order: 4,
  },
  // Technical Experts
  {
    id: '5',
    firstName: 'Ibrahim',
    lastName: 'Sow',
    civility: 'M.',
    positionFr: 'Expert en Agroécologie',
    positionEn: 'Agroecology Expert',
    department: 'technique',
    location: 'Conakry, Guinée',
    bioFr: 'Spécialiste des systèmes agricoles durables et de l\'agroécologie en zone tropicale.',
    bioEn: 'Specialist in sustainable agricultural systems and agroecology in tropical zones.',
    photoUrl: null,
    linkedInUrl: '#',
    twitterUrl: null,
    email: 'i.sow@aaea.org',
    expertise: ['Agroécologie', 'Agriculture durable', 'Sols'],
    isLeadership: false,
    order: 5,
  },
  {
    id: '6',
    firstName: 'Fatou',
    lastName: 'Ndiaye',
    civility: 'Mme',
    positionFr: 'Experte en Genre et Développement',
    positionEn: 'Gender and Development Expert',
    department: 'technique',
    location: 'Dakar, Sénégal',
    bioFr: 'Experte en intégration du genre dans les programmes de développement agricole.',
    bioEn: 'Expert in gender integration in agricultural development programs.',
    photoUrl: null,
    linkedInUrl: '#',
    twitterUrl: '#',
    email: 'f.ndiaye@aaea.org',
    expertise: ['Genre', 'Développement rural', 'Autonomisation des femmes'],
    isLeadership: false,
    order: 6,
  },
  {
    id: '7',
    firstName: 'Kofi',
    lastName: 'Mensah',
    civility: 'M.',
    positionFr: 'Expert en Chaîne de Valeur',
    positionEn: 'Value Chain Expert',
    department: 'technique',
    location: 'Accra, Ghana',
    bioFr: 'Spécialiste du développement des chaînes de valeur agricoles et de l\'entrepreneuriat rural.',
    bioEn: 'Specialist in agricultural value chain development and rural entrepreneurship.',
    photoUrl: null,
    linkedInUrl: '#',
    twitterUrl: null,
    email: 'k.mensah@aaea.org',
    expertise: ['Chaîne de valeur', 'Entrepreneuriat', 'Marchés agricoles'],
    isLeadership: false,
    order: 7,
  },
  // Support Functions
  {
    id: '8',
    firstName: 'Aïssata',
    lastName: 'Traoré',
    civility: 'Mme',
    positionFr: 'Responsable Communication',
    positionEn: 'Communications Manager',
    department: 'support',
    location: 'Bamako, Mali',
    bioFr: 'Experte en communication stratégique et relations publiques pour le développement.',
    bioEn: 'Expert in strategic communication and public relations for development.',
    photoUrl: null,
    linkedInUrl: '#',
    twitterUrl: '#',
    email: 'a.traore@aaea.org',
    expertise: ['Communication', 'Relations publiques', 'Marketing digital'],
    isLeadership: false,
    order: 8,
  },
  {
    id: '9',
    firstName: 'Ousmane',
    lastName: 'Ba',
    civility: 'M.',
    positionFr: 'Responsable IT',
    positionEn: 'IT Manager',
    department: 'support',
    location: 'Dakar, Sénégal',
    bioFr: 'Spécialiste en systèmes d\'information et transformation digitale.',
    bioEn: 'Specialist in information systems and digital transformation.',
    photoUrl: null,
    linkedInUrl: '#',
    twitterUrl: null,
    email: 'o.ba@aaea.org',
    expertise: ['IT', 'Digital', 'Systèmes d\'information'],
    isLeadership: false,
    order: 9,
  },
  {
    id: '10',
    firstName: 'Ramatou',
    lastName: 'Hassane',
    civility: 'Mme',
    positionFr: 'Responsable RH',
    positionEn: 'HR Manager',
    department: 'support',
    location: 'Niamey, Niger',
    bioFr: 'Experte en gestion des ressources humaines et développement des talents.',
    bioEn: 'Expert in human resources management and talent development.',
    photoUrl: null,
    linkedInUrl: '#',
    twitterUrl: null,
    email: 'r.hassane@aaea.org',
    expertise: ['Ressources humaines', 'Formation', 'Développement des talents'],
    isLeadership: false,
    order: 10,
  },
  // Regional Offices
  {
    id: '11',
    firstName: 'Moussa',
    lastName: 'Koné',
    civility: 'M.',
    positionFr: 'Représentant Afrique de l\'Ouest',
    positionEn: 'West Africa Representative',
    department: 'regional',
    location: 'Abidjan, Côte d\'Ivoire',
    bioFr: 'Coordination des activités de l\'AAEA en Afrique de l\'Ouest.',
    bioEn: 'Coordination of AAEA activities in West Africa.',
    photoUrl: null,
    linkedInUrl: '#',
    twitterUrl: null,
    email: 'm.kone@aaea.org',
    expertise: ['Coordination régionale', 'Plaidoyer', 'Partenariats locaux'],
    isLeadership: false,
    order: 11,
  },
  {
    id: '12',
    firstName: 'Esperance',
    lastName: 'Kasongo',
    civility: 'Mme',
    positionFr: 'Représentante Afrique Centrale',
    positionEn: 'Central Africa Representative',
    department: 'regional',
    location: 'Kinshasa, RDC',
    bioFr: 'Coordination des activités de l\'AAEA en Afrique Centrale.',
    bioEn: 'Coordination of AAEA activities in Central Africa.',
    photoUrl: null,
    linkedInUrl: '#',
    twitterUrl: '#',
    email: 'e.kasongo@aaea.org',
    expertise: ['Coordination régionale', 'Programmes', 'Renforcement des capacités'],
    isLeadership: false,
    order: 12,
  },
];

const departments = [
  { id: 'all', labelFr: 'Tous les départements', labelEn: 'All departments' },
  { id: 'leadership', labelFr: 'Comité de Direction', labelEn: 'Leadership Team' },
  { id: 'technique', labelFr: 'Experts Techniques', labelEn: 'Technical Experts' },
  { id: 'support', labelFr: 'Fonctions Support', labelEn: 'Support Functions' },
  { id: 'regional', labelFr: 'Bureaux Régionaux', labelEn: 'Regional Offices' },
];

export default function NotreEquipePage() {
  const locale = useLocale() as 'fr' | 'en';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Content translations
  const content = {
    fr: {
      // Hero
      heroBadge: 'Notre Équipe',
      heroTitle: 'Une équipe engagée pour l\'agriculture africaine',
      heroSubtitle: 'Leadership & Expertise',
      heroIntro: 'Découvrez les femmes et les hommes qui portent la vision de l\'AAEA et travaillent chaque jour pour transformer l\'agriculture africaine.',
      ctaGovernance: 'Découvrir notre gouvernance',
      ctaContact: 'Contacter l\'équipe',
      
      // Stats
      statsTitle: 'L\'équipe en chiffres',
      stats: [
        { value: '50+', label: 'Collaborateurs', icon: 'users' },
        { value: '45%', label: 'De femmes', icon: 'heart' },
        { value: '200+', label: 'Années d\'expérience cumulées', icon: 'calendar' },
        { value: '12', label: 'Pays représentés', icon: 'globe' },
      ],
      
      // Introduction
      introTitle: 'Une diversité de talents au service de notre mission',
      introText: `L'AAEA réunit des professionnels passionnés et expérimentés, issus d'horizons divers mais unis par une vision commune : une agriculture africaine prospère, durable et résiliente. Notre équipe combine expertise technique, gestion stratégique et connaissance approfondie des réalités locales pour maximiser notre impact sur le terrain.`,
      introText2: `De notre comité de direction à nos experts techniques, en passant par nos fonctions support et nos représentations régionales, chaque membre contribue à notre mission de transformation agricole.`,
      
      // Team section
      teamTitle: 'Nos collaborateurs',
      teamSubtitle: 'Découvrez les talents qui font l\'AAEA',
      searchPlaceholder: 'Rechercher un nom, une fonction...',
      filterBy: 'Filtrer par département',
      noResults: 'Aucun résultat trouvé',
      clearFilters: 'Réinitialiser les filtres',
      
      // Leadership section
      leadershipTitle: 'Comité de Direction',
      leadershipSubtitle: 'Notre leadership inspire et guide notre action',
      
      // Organization
      orgTitle: 'Notre organisation',
      orgSubtitle: 'Une structure adaptée à notre mission',
      
      // Culture
      cultureTitle: 'Notre culture d\'équipe',
      cultureValues: [
        {
          title: 'Excellence',
          description: 'Nous visons l\'excellence dans tout ce que nous entreprenons.',
          icon: 'award',
        },
        {
          title: 'Collaboration',
          description: 'Nous croyons en la force du travail collaboratif.',
          icon: 'users',
        },
        {
          title: 'Innovation',
          description: 'Nous innovons pour répondre aux défis de demain.',
          icon: 'lightbulb',
        },
        {
          title: 'Impact',
          description: 'Nous mesurons notre succès à l\'impact que nous créons.',
          icon: 'target',
        },
      ],
      
      // CTA
      ctaTitle: 'Rejoignez notre équipe',
      ctaSubtitle: 'Vous partagez nos valeurs ? Découvrez nos opportunités de carrière.',
      ctaButton: 'Voir les offres d\'emploi',
      
      // Navigation
      navTitle: 'Pages associées',
      navItems: [
        { title: 'Gouvernance', subtitle: 'Notre organisation', url: '/presentation/a-propos', icon: 'building' },
        { title: 'Mot du Directeur', subtitle: 'Vision et stratégie', url: '/presentation/mot-du-directeur', icon: 'quote' },
        { title: 'Contact', subtitle: 'Nous contacter', url: '/contact', icon: 'map' },
        { title: 'Actualités', subtitle: 'Dernières nouvelles', url: '/actualites', icon: 'calendar' },
      ],
      
      // Card labels
      viewProfile: 'Voir le profil',
      contactPerson: 'Contacter',
    },
    en: {
      // Hero
      heroBadge: 'Our Team',
      heroTitle: 'A team committed to African agriculture',
      heroSubtitle: 'Leadership & Expertise',
      heroIntro: 'Discover the women and men who carry AAEA\'s vision and work every day to transform African agriculture.',
      ctaGovernance: 'Discover our governance',
      ctaContact: 'Contact the team',
      
      // Stats
      statsTitle: 'The team in numbers',
      stats: [
        { value: '50+', label: 'Collaborators', icon: 'users' },
        { value: '45%', label: 'Women', icon: 'heart' },
        { value: '200+', label: 'Cumulative years of experience', icon: 'calendar' },
        { value: '12', label: 'Countries represented', icon: 'globe' },
      ],
      
      // Introduction
      introTitle: 'A diversity of talents serving our mission',
      introText: `AAEA brings together passionate and experienced professionals from diverse backgrounds but united by a common vision: a prosperous, sustainable and resilient African agriculture. Our team combines technical expertise, strategic management and in-depth knowledge of local realities to maximize our impact in the field.`,
      introText2: `From our leadership team to our technical experts, including our support functions and regional offices, each member contributes to our mission of agricultural transformation.`,
      
      // Team section
      teamTitle: 'Our collaborators',
      teamSubtitle: 'Discover the talents that make AAEA',
      searchPlaceholder: 'Search by name, position...',
      filterBy: 'Filter by department',
      noResults: 'No results found',
      clearFilters: 'Clear filters',
      
      // Leadership section
      leadershipTitle: 'Leadership Team',
      leadershipSubtitle: 'Our leadership inspires and guides our action',
      
      // Organization
      orgTitle: 'Our organization',
      orgSubtitle: 'A structure adapted to our mission',
      
      // Culture
      cultureTitle: 'Our team culture',
      cultureValues: [
        {
          title: 'Excellence',
          description: 'We strive for excellence in everything we do.',
          icon: 'award',
        },
        {
          title: 'Collaboration',
          description: 'We believe in the power of collaborative work.',
          icon: 'users',
        },
        {
          title: 'Innovation',
          description: 'We innovate to meet tomorrow\'s challenges.',
          icon: 'lightbulb',
        },
        {
          title: 'Impact',
          description: 'We measure our success by the impact we create.',
          icon: 'target',
        },
      ],
      
      // CTA
      ctaTitle: 'Join our team',
      ctaSubtitle: 'Do you share our values? Discover our career opportunities.',
      ctaButton: 'View job offers',
      
      // Navigation
      navTitle: 'Related pages',
      navItems: [
        { title: 'Governance', subtitle: 'Our organization', url: '/presentation/a-propos', icon: 'building' },
        { title: 'Director\'s Message', subtitle: 'Vision and strategy', url: '/presentation/mot-du-directeur', icon: 'quote' },
        { title: 'Contact', subtitle: 'Contact us', url: '/contact', icon: 'map' },
        { title: 'News', subtitle: 'Latest news', url: '/actualites', icon: 'calendar' },
      ],
      
      // Card labels
      viewProfile: 'View profile',
      contactPerson: 'Contact',
    },
  };

  const t = content[locale];

  // Filter logic
  const filteredMembers = useMemo(() => {
    return teamMembers.filter((member) => {
      const matchesSearch = 
        searchQuery === '' ||
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (locale === 'fr' ? member.positionFr : member.positionEn).toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDepartment = 
        selectedDepartment === 'all' ||
        member.department === selectedDepartment;

      return matchesSearch && matchesDepartment;
    });
  }, [searchQuery, selectedDepartment, locale]);

  // Leadership members
  const leadershipMembers = teamMembers.filter(m => m.isLeadership);
  
  // Other members (non-leadership)
  const otherMembers = filteredMembers.filter(m => !m.isLeadership);

  const iconMap: Record<string, React.ReactNode> = {
    users: <Users className="w-6 h-6" />,
    heart: <Heart className="w-6 h-6" />,
    calendar: <Calendar className="w-6 h-6" />,
    globe: <Globe className="w-6 h-6" />,
    award: <Award className="w-6 h-6" />,
    lightbulb: <Lightbulb className="w-6 h-6" />,
    target: <Target className="w-6 h-6" />,
    building: <Building className="w-8 h-8 text-[var(--color-primary)]" />,
    quote: <Quote className="w-8 h-8 text-[var(--color-secondary)]" />,
    map: <MapPin className="w-8 h-8 text-[var(--color-tertiary)]" />,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 via-background to-[var(--color-secondary)]/5" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--color-secondary)]/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Badge variant="outline" className="text-[var(--color-primary)] border-[var(--color-primary)]/30">
                    {t.heroSubtitle}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="secondary" className="bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
                    {t.heroBadge}
                  </Badge>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-tertiary)] bg-clip-text text-transparent">
                    {t.heroTitle}
                  </span>
                </h1>

                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  {t.heroIntro}
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link href="/presentation/a-propos">
                    <Button size="lg" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white cursor-pointer shadow-lg shadow-[var(--color-primary)]/20">
                      {t.ctaGovernance}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="cursor-pointer border-2">
                      <Mail className="mr-2 w-5 h-5" />
                      {t.ctaContact}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Hero Image / Group Photo */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-[var(--color-primary)]/20 via-[var(--color-secondary)]/20 to-[var(--color-tertiary)]/20 rounded-3xl blur-sm" />
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 flex items-center justify-center">
                  <Image
                    src="/images/team-group.jpg"
                    alt="Notre Équipe"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Fallback */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5">
                    <Users className="w-32 h-32 text-[var(--color-primary)]/20 mb-4" />
                    <span className="text-muted-foreground/50 text-lg">Photo de l'équipe</span>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">50+</div>
                      <div className="text-sm text-muted-foreground">{locale === 'fr' ? 'Collaborateurs' : 'Collaborators'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold">{t.statsTitle}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {t.stats.map((stat, idx) => (
                <Card key={idx} className="text-center p-6 border-0 shadow-lg bg-white dark:bg-gray-900">
                  <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                    idx === 0 ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' :
                    idx === 1 ? 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]' :
                    idx === 2 ? 'bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)]' :
                    'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  }`}>
                    {iconMap[stat.icon]}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 text-[var(--color-secondary)] border-[var(--color-secondary)]/30">
              {locale === 'fr' ? 'Notre philosophie' : 'Our philosophy'}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              {t.introTitle}
            </h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>{t.introText}</p>
              <p>{t.introText2}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-[var(--color-primary)] border-[var(--color-primary)]/30">
                {locale === 'fr' ? 'Direction' : 'Leadership'}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.leadershipTitle}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.leadershipSubtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {leadershipMembers.map((member) => (
                <Card key={member.id} className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 bg-white dark:bg-gray-900">
                  <CardContent className="p-0">
                    {/* Photo */}
                    <div className="relative aspect-square bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10">
                      {member.photoUrl ? (
                        <Image
                          src={member.photoUrl}
                          alt={`${member.firstName} ${member.lastName}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 flex items-center justify-center">
                            <Users className="w-12 h-12 text-[var(--color-primary)]/40" />
                          </div>
                        </div>
                      )}
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                        <div className="flex gap-3">
                          {member.linkedInUrl && (
                            <a href={member.linkedInUrl} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                              <Linkedin className="w-5 h-5" />
                            </a>
                          )}
                          {member.twitterUrl && (
                            <a href={member.twitterUrl} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                              <Twitter className="w-5 h-5" />
                            </a>
                          )}
                          {member.email && (
                            <a href={`mailto:${member.email}`} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                              <Mail className="w-5 h-5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-1 group-hover:text-[var(--color-primary)] transition-colors">
                        {member.civility} {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-[var(--color-primary)] font-medium text-sm mb-3">
                        {locale === 'fr' ? member.positionFr : member.positionEn}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                        <MapPin className="w-3 h-3" />
                        {member.location}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {locale === 'fr' ? member.bioFr : member.bioEn}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section with Filters */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-[var(--color-tertiary)] border-[var(--color-tertiary)]/30">
                {locale === 'fr' ? 'Équipe' : 'Team'}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.teamTitle}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.teamSubtitle}</p>
            </div>

            {/* Search and Filters */}
            <div className="mb-12 space-y-6">
              {/* Search Bar */}
              <div className="max-w-xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 h-14 text-lg rounded-2xl border-2 focus:border-[var(--color-primary)]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Department Filters */}
              <div className="flex flex-wrap justify-center gap-3">
                {departments.map((dept) => (
                  <Button
                    key={dept.id}
                    variant={selectedDepartment === dept.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDepartment(dept.id)}
                    className={`rounded-full cursor-pointer ${
                      selectedDepartment === dept.id 
                        ? 'bg-[var(--color-primary)] text-white' 
                        : 'hover:bg-[var(--color-primary)]/10'
                    }`}
                  >
                    {locale === 'fr' ? dept.labelFr : dept.labelEn}
                  </Button>
                ))}
              </div>
            </div>

            {/* Results count */}
            <div className="text-center mb-8">
              <p className="text-muted-foreground">
                {filteredMembers.length} {locale === 'fr' ? 'membre(s) trouvé(s)' : 'member(s) found'}
              </p>
            </div>

            {/* Team Grid */}
            {filteredMembers.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {otherMembers.map((member) => (
                  <Card key={member.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-white dark:bg-gray-900">
                    <CardContent className="p-0">
                      {/* Photo */}
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5">
                        {member.photoUrl ? (
                          <Image
                            src={member.photoUrl}
                            alt={`${member.firstName} ${member.lastName}`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 flex items-center justify-center">
                              <Users className="w-10 h-10 text-[var(--color-primary)]/30" />
                            </div>
                          </div>
                        )}
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                          <div className="flex gap-2">
                            {member.linkedInUrl && (
                              <a href={member.linkedInUrl} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                                <Linkedin className="w-4 h-4" />
                              </a>
                            )}
                            {member.email && (
                              <a href={`mailto:${member.email}`} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                                <Mail className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="p-5">
                        <h3 className="font-semibold mb-1 group-hover:text-[var(--color-primary)] transition-colors">
                          {member.civility} {member.firstName} {member.lastName}
                        </h3>
                        <p className="text-[var(--color-primary)] text-sm font-medium mb-2">
                          {locale === 'fr' ? member.positionFr : member.positionEn}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <MapPin className="w-3 h-3" />
                          {member.location}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {member.expertise.slice(0, 2).map((exp, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
                              {exp}
                            </Badge>
                          ))}
                          {member.expertise.length > 2 && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              +{member.expertise.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-xl text-muted-foreground">{t.noResults}</p>
                <Button
                  variant="outline"
                  className="mt-4 cursor-pointer"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDepartment('all');
                  }}
                >
                  {t.clearFilters}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Organization Structure */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-[var(--color-primary)] border-[var(--color-primary)]/30">
                {locale === 'fr' ? 'Structure' : 'Structure'}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.orgTitle}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.orgSubtitle}</p>
            </div>

            {/* Organization Chart */}
            <div className="max-w-4xl mx-auto">
              <div className="grid gap-6">
                {/* Top Level - Director */}
                <div className="flex justify-center">
                  <Card className="w-full max-w-sm bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)]/80 text-white border-0 shadow-xl">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-white/20 mx-auto mb-4 flex items-center justify-center">
                        <UserCheck className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-xl mb-1">Directeur Exécutif</h3>
                      <p className="text-white/80 text-sm">{locale === 'fr' ? 'Direction générale' : 'General management'}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Connection line */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-8 bg-[var(--color-primary)]/30"></div>
                </div>

                {/* Second Level - Departments */}
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { title: locale === 'fr' ? 'Opérations' : 'Operations', icon: TrendingUp },
                    { title: locale === 'fr' ? 'Finance' : 'Finance', icon: Briefcase },
                    { title: locale === 'fr' ? 'Partenariats' : 'Partnerships', icon: Users },
                    { title: locale === 'fr' ? 'Technique' : 'Technical', icon: Lightbulb },
                  ].map((dept, idx) => (
                    <Card key={idx} className="border-t-4 border-t-[var(--color-primary)] bg-white dark:bg-gray-900">
                      <CardContent className="p-5 text-center">
                        <dept.icon className="w-8 h-8 mx-auto mb-3 text-[var(--color-primary)]" />
                        <h4 className="font-semibold">{dept.title}</h4>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Connection line */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-8 bg-[var(--color-secondary)]/30"></div>
                </div>

                {/* Third Level - Regional Offices */}
                <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {[
                    { title: locale === 'fr' ? 'Bureau Afrique de l\'Ouest' : 'West Africa Office', location: 'Dakar' },
                    { title: locale === 'fr' ? 'Bureau Afrique Centrale' : 'Central Africa Office', location: 'Kinshasa' },
                  ].map((office, idx) => (
                    <Card key={idx} className="border-l-4 border-l-[var(--color-secondary)] bg-white dark:bg-gray-900">
                      <CardContent className="p-5 flex items-center gap-4">
                        <Globe className="w-8 h-8 text-[var(--color-secondary)]" />
                        <div>
                          <h4 className="font-semibold">{office.title}</h4>
                          <p className="text-sm text-muted-foreground">{office.location}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-[var(--color-secondary)] border-[var(--color-secondary)]/30">
                {locale === 'fr' ? 'Valeurs' : 'Values'}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">{t.cultureTitle}</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {t.cultureValues.map((value, idx) => (
                <Card key={idx} className="text-center p-8 border-0 shadow-lg bg-white dark:bg-gray-900 group hover:shadow-xl transition-all duration-300">
                  <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                    idx === 0 ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' :
                    idx === 1 ? 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]' :
                    idx === 2 ? 'bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)]' :
                    'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  }`}>
                    {iconMap[value.icon]}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)]/90">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <Sparkles className="w-16 h-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.ctaTitle}</h2>
            <p className="text-lg text-white/80 mb-8">{t.ctaSubtitle}</p>
            <Link href="/contact">
              <Button size="lg" className="bg-white text-[var(--color-primary)] hover:bg-white/90 cursor-pointer shadow-lg">
                {t.ctaButton}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Navigation Section */}
      <section className="py-16 bg-muted/30 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold">{t.navTitle}</h2>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.navItems.map((item, idx) => (
                <Link key={idx} href={item.url}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 bg-white dark:bg-gray-900 overflow-hidden">
                    <CardContent className="p-6 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10 flex items-start gap-4">
                        <div className="group-hover:scale-110 transition-transform duration-300">
                          {iconMap[item.icon]}
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
