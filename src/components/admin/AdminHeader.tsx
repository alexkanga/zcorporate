"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Settings, Home, ExternalLink, Bell, Search } from "lucide-react";
import Link from "next/link";

const routeLabels: Record<string, string> = {
  admin: "Dashboard",
  settings: "Paramètres",
  logo: "Logo",
  colors: "Couleurs",
  menus: "Menus",
  maps: "Cartes",
  users: "Utilisateurs",
  home: "Accueil",
  slider: "Slider",
  about: "À propos",
  services: "Services",
  testimonials: "Témoignages",
  partners: "Partenaires",
  cta: "CTA",
  solutions: "Solutions",
  pages: "Pages",
  realisations: "Réalisations",
  resources: "Ressources",
  events: "Événements",
  contact: "Contact",
  messages: "Messages",
  info: "Informations",
};

export function AdminHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: { label: string; href: string }[] = [];

    let currentPath = "";
    segments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({
        label,
        href: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const user = session?.user;

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-gradient-to-r from-violet-500 to-purple-500 text-white";
      case "ADMIN":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-gray-200 bg-white/80 backdrop-blur-md px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hover:bg-gray-100 rounded-lg transition-colors" />
        
        <div className="hidden md:block h-6 w-px bg-gray-200" />
        
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <BreadcrumbItem key={crumb.href}>
                {index < breadcrumbs.length - 1 ? (
                  <>
                    <BreadcrumbLink asChild className="hover:text-[var(--color-primary)] transition-colors">
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                ) : (
                  <BreadcrumbPage className="font-semibold text-[var(--color-primary)]">
                    {crumb.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-gray-100 rounded-xl">
          <Search className="h-4 w-4 text-gray-500" />
          <span className="sr-only">Rechercher</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 rounded-xl">
          <Bell className="h-4 w-4 text-gray-500" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          <span className="sr-only">Notifications</span>
        </Button>

        <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block" />

        {/* View Site */}
        <Button 
          variant="outline" 
          size="sm" 
          asChild 
          className="hidden md:flex gap-2 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all duration-300"
        >
          <Link href="/" target="_blank" title="Voir le site">
            <ExternalLink className="h-4 w-4" />
            <span>Voir le site</span>
          </Link>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 flex items-center gap-2 px-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Avatar className="h-8 w-8 ring-2 ring-gray-100">
                <AvatarImage src={user?.avatar || undefined} alt={user?.name || "User"} />
                <AvatarFallback className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white text-xs font-bold">
                  {getInitials(user?.name, user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col items-start gap-0.5">
                <span className="text-sm font-medium">{user?.name || user?.email}</span>
                {user?.role && (
                  <Badge className={`text-[10px] px-1.5 py-0 h-4 font-normal ${getRoleBadgeStyle(user.role)}`}>
                    {user.role.replace("_", " ")}
                  </Badge>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar || undefined} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold">
                      {getInitials(user?.name, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{user?.name || "Utilisateur"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/admin/profile" className="flex items-center gap-3 py-2">
                <User className="h-4 w-4" />
                <span>Mon profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/admin/settings" className="flex items-center gap-3 py-2">
                <Settings className="h-4 w-4" />
                <span>Paramètres</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
