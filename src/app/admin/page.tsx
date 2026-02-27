"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  Mail,
  Calendar,
  FolderOpen,
  MessageSquare,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  Activity,
  Zap,
  Shield,
  Globe,
} from "lucide-react";
import Link from "next/link";

const stats = [
  {
    title: "Utilisateurs",
    titleEn: "Users",
    value: "12",
    change: "+2 ce mois",
    changeEn: "+2 this month",
    icon: Users,
    href: "/admin/users",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Articles",
    titleEn: "Articles",
    value: "45",
    change: "+5 ce mois",
    changeEn: "+5 this month",
    icon: FileText,
    href: "/admin/resources",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Messages",
    titleEn: "Messages",
    value: "23",
    change: "8 non lus",
    changeEn: "8 unread",
    icon: Mail,
    href: "/admin/contact/messages",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    title: "Événements",
    titleEn: "Events",
    value: "8",
    change: "3 à venir",
    changeEn: "3 upcoming",
    icon: Calendar,
    href: "/admin/events",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    title: "Réalisations",
    titleEn: "Projects",
    value: "34",
    change: "+2 ce mois",
    changeEn: "+2 this month",
    icon: FolderOpen,
    href: "/admin/realisations",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    title: "Ressources",
    titleEn: "Resources",
    value: "67",
    change: "1.2k téléchargements",
    changeEn: "1.2k downloads",
    icon: FolderOpen,
    href: "/admin/resources",
    gradient: "from-indigo-500 to-blue-500",
  },
];

const recentActivity = [
  {
    id: "1",
    action: "Nouvel utilisateur inscrit",
    actionEn: "New user registered",
    user: "john@example.com",
    time: "Il y a 2 heures",
    timeEn: "2 hours ago",
    type: "user",
    color: "bg-blue-500",
  },
  {
    id: "2",
    action: "Article publié",
    actionEn: "Article published",
    user: "admin@company.com",
    time: "Il y a 4 heures",
    timeEn: "4 hours ago",
    type: "content",
    color: "bg-emerald-500",
  },
  {
    id: "3",
    action: "Message reçu",
    actionEn: "Message received",
    user: "visitor@example.com",
    time: "Il y a 5 heures",
    timeEn: "5 hours ago",
    type: "message",
    color: "bg-orange-500",
  },
  {
    id: "4",
    action: "Événement créé",
    actionEn: "Event created",
    user: "admin@company.com",
    time: "Hier",
    timeEn: "Yesterday",
    type: "event",
    color: "bg-violet-500",
  },
  {
    id: "5",
    action: "Paramètres mis à jour",
    actionEn: "Settings updated",
    user: "admin@company.com",
    time: "Hier",
    timeEn: "Yesterday",
    type: "settings",
    color: "bg-gray-500",
  },
];

const quickActions = [
  {
    title: "Ajouter un utilisateur",
    titleEn: "Add User",
    href: "/admin/users?action=add",
    icon: Plus,
    description: "Créer un nouveau compte",
    descriptionEn: "Create a new account",
    color: "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200",
  },
  {
    title: "Nouvel article",
    titleEn: "New Article",
    href: "/admin/resources?action=add",
    icon: FileText,
    description: "Rédiger un article",
    descriptionEn: "Write an article",
    color: "hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200",
  },
  {
    title: "Voir les messages",
    titleEn: "View Messages",
    href: "/admin/contact/messages",
    icon: Mail,
    description: "Consulter les messages",
    descriptionEn: "Check messages",
    color: "hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200",
  },
  {
    title: "Créer un événement",
    titleEn: "Create Event",
    href: "/admin/events?action=add",
    icon: Calendar,
    description: "Planifier un événement",
    descriptionEn: "Schedule an event",
    color: "hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200",
  },
];

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      {/* Welcome Section with gradient background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary)]/90 to-[var(--color-secondary)] p-8 text-white">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-accent)]/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-6 w-6 text-[var(--color-accent-light)]" />
            <Badge className="bg-white/20 text-white border-0">
              Tableau de bord
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Bienvenue, {session?.user?.name || "Admin"} !
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Voici ce qui se passe sur votre site aujourd'hui. Gérez votre contenu, 
            suivez les activités et optimisez vos performances.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0 bg-white shadow-md">
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50 -mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-lg">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[var(--color-primary)]" />
                Activité récente
              </CardTitle>
              <CardDescription>Les dernières actions sur votre site</CardDescription>
            </div>
            <Badge variant="secondary" className="font-normal">
              5 actions
            </Badge>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 rounded-xl border bg-gray-50/50 p-4 hover:bg-gray-100/50 transition-colors"
                >
                  <div className={`h-2 w-2 rounded-full ${activity.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.user}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b bg-gray-50/50 -mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[var(--color-secondary)]" />
              Actions rapides
            </CardTitle>
            <CardDescription>Tâches courantes</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <Button
                    variant="outline"
                    className={`w-full justify-start h-auto py-3 px-4 transition-all duration-300 ${action.color}`}
                  >
                    <action.icon className="h-4 w-4 mr-3" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overview Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader className="border-b bg-gray-50/50 -mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-[var(--color-accent)]" />
              Aperçu du contenu
            </CardTitle>
            <CardDescription>Résumé de votre contenu publié</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                <div className="text-3xl font-bold text-blue-600">34</div>
                <div className="text-xs text-blue-600/70 mt-1">Pages publiées</div>
              </div>
              <div className="text-center p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                <div className="text-3xl font-bold text-emerald-600">12</div>
                <div className="text-xs text-emerald-600/70 mt-1">Brouillons</div>
              </div>
              <div className="text-center p-5 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
                <div className="text-3xl font-bold text-violet-600">89</div>
                <div className="text-xs text-violet-600/70 mt-1">Fichiers média</div>
              </div>
              <div className="text-center p-5 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
                <div className="text-3xl font-bold text-orange-600">5</div>
                <div className="text-xs text-orange-600/70 mt-1">En attente</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="border-b bg-gray-50/50 -mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[var(--color-primary)]" />
              État du système
            </CardTitle>
            <CardDescription>Informations système</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-dashed">
              <span className="text-sm text-muted-foreground">Version</span>
              <Badge variant="secondary" className="font-mono">v1.0.0</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-dashed">
              <span className="text-sm text-muted-foreground">Statut</span>
              <Badge className="bg-emerald-500 hover:bg-emerald-500">En ligne</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-dashed">
              <span className="text-sm text-muted-foreground">Sauvegarde</span>
              <span className="text-sm font-medium">Aujourd'hui, 3h00</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Stockage</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full" />
                </div>
                <span className="text-sm font-medium">2.4 GB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
