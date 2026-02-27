"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Settings,
  Users,
  Home,
  Info,
  Briefcase,
  FolderOpen,
  Calendar,
  Mail,
  ChevronRight,
  Palette,
  Map,
  Menu,
  Image,
  MessageSquare,
  Building2,
  FileText,
  Link2,
  Sparkles,
  LogOut,
} from "lucide-react";

const navigation = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Paramètres",
    icon: Settings,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    children: [
      { title: "Logo", href: "/admin/settings/logo", icon: Image, color: "text-violet-600" },
      { title: "Couleurs", href: "/admin/settings/colors", icon: Palette, color: "text-pink-600" },
      { title: "Menus", href: "/admin/settings/menus", icon: Menu, color: "text-indigo-600" },
      { title: "Cartes", href: "/admin/settings/maps", icon: Map, color: "text-teal-600" },
    ],
  },
  {
    title: "Utilisateurs",
    href: "/admin/users",
    icon: Users,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  {
    title: "Accueil",
    icon: Home,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    children: [
      { title: "Slider", href: "/admin/home/slider", icon: Image, color: "text-orange-600" },
      { title: "À propos", href: "/admin/home/about", icon: Info, color: "text-cyan-600" },
      { title: "Services", href: "/admin/home/services", icon: Briefcase, color: "text-blue-600" },
      { title: "Témoignages", href: "/admin/home/testimonials", icon: MessageSquare, color: "text-yellow-600" },
      { title: "Partenaires", href: "/admin/home/partners", icon: Building2, color: "text-purple-600" },
      { title: "CTA", href: "/admin/home/cta", icon: Link2, color: "text-pink-600" },
    ],
  },
  {
    title: "À propos",
    icon: Info,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
    children: [
      { title: "Pages", href: "/admin/about/pages", icon: FileText, color: "text-cyan-600" },
    ],
  },
  {
    title: "Solutions",
    icon: Briefcase,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    children: [
      { title: "Pages", href: "/admin/solutions/pages", icon: FileText, color: "text-blue-600" },
    ],
  },
  {
    title: "Réalisations",
    href: "/admin/realisations",
    icon: FolderOpen,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Ressources",
    href: "/admin/resources",
    icon: FolderOpen,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  {
    title: "Événements",
    href: "/admin/events",
    icon: Calendar,
    color: "text-rose-600",
    bgColor: "bg-rose-100",
  },
  {
    title: "Contact",
    icon: Mail,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    children: [
      { title: "Messages", href: "/admin/contact/messages", icon: MessageSquare, color: "text-teal-600" },
      { title: "Infos", href: "/admin/contact/info", icon: Info, color: "text-cyan-600" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isGroupActive = (children?: { href: string }[]) => {
    if (!children) return false;
    return children.some((child) => pathname.startsWith(child.href));
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-gray-200">
      {/* Header with branding */}
      <SidebarHeader className="border-b border-gray-200 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-white/10 data-[active=true]:bg-white/20">
              <Link href="/admin" className="text-white">
                <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-white/20 text-white">
                  <Sparkles className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold text-base">AAEA Admin</span>
                  <span className="text-xs text-white/70">Corporate CMS</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigation.map((item) => {
                if (item.children) {
                  const groupActive = isGroupActive(item.children);
                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={groupActive}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton 
                            tooltip={item.title}
                            className={cn(
                              "rounded-lg transition-all duration-200",
                              groupActive && "bg-gray-100 font-medium"
                            )}
                          >
                            {item.icon && (
                              <div className={cn(
                                "p-1.5 rounded-lg",
                                item.bgColor || "bg-gray-100"
                              )}>
                                <item.icon className={cn("size-4", item.color)} />
                              </div>
                            )}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-gray-400" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="ml-4 mt-1 border-l-2 border-gray-200 pl-3">
                            {item.children.map((child) => (
                              <SidebarMenuSubItem key={child.href}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isActive(child.href)}
                                  className="rounded-lg transition-all duration-200"
                                >
                                  <Link href={child.href} className="flex items-center gap-2">
                                    {child.icon && <child.icon className={cn("size-4", child.color)} />}
                                    <span>{child.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                const active = isActive(item.href!, item.exact);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={active}
                      className={cn(
                        "rounded-lg transition-all duration-200",
                        active && "bg-gray-100 font-medium"
                      )}
                    >
                      <Link href={item.href!} className="flex items-center gap-2">
                        {item.icon && (
                          <div className={cn(
                            "p-1.5 rounded-lg",
                            active ? item.bgColor : "bg-gray-100"
                          )}>
                            <item.icon className={cn("size-4", active ? item.color : "text-gray-500")} />
                          </div>
                        )}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gray-50">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white text-sm font-bold">
                {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium truncate">
                  {session?.user?.name || "Utilisateur"}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {session?.user?.role?.replace("_", " ")}
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}

// Helper function
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
