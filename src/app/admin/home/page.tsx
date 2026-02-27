import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Images, FileText, Briefcase, MessageSquare, Handshake, Megaphone, Heading
} from 'lucide-react';

const sections = [
  { 
    href: '/admin/home/slider', 
    icon: Images, 
    title: 'Slider', 
    description: 'Gérer les diapositives du carrousel principal' 
  },
  { 
    href: '/admin/home/about', 
    icon: FileText, 
    title: 'À propos', 
    description: 'Modifier la section À propos de la page d\'accueil' 
  },
  { 
    href: '/admin/home/services', 
    icon: Briefcase, 
    title: 'Services', 
    description: 'Gérer les services affichés sur la page d\'accueil' 
  },
  { 
    href: '/admin/home/testimonials', 
    icon: MessageSquare, 
    title: 'Témoignages', 
    description: 'Gérer les témoignages clients' 
  },
  { 
    href: '/admin/home/partners', 
    icon: Handshake, 
    title: 'Partenaires', 
    description: 'Gérer les logos des partenaires' 
  },
  { 
    href: '/admin/home/cta', 
    icon: Megaphone, 
    title: 'CTA', 
    description: 'Modifier l\'appel à l\'action' 
  },
  { 
    href: '/admin/home/sections', 
    icon: Heading, 
    title: 'Titres des sections', 
    description: 'Modifier les titres et sous-titres de toutes les sections' 
  },
];

export default function HomeAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion de la page d&apos;accueil</h1>
        <p className="text-muted-foreground">
          Configurez les différentes sections de la page d&apos;accueil
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <section.icon className="h-6 w-6 text-primary" />
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
