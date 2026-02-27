"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ClientOnly } from "@/components/ClientOnly";
import { Search, Menu, LogIn, LogOut, LayoutDashboard, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@prisma/client";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "@/i18n";

interface HeaderProps {
  logoUrl?: string | null;
  siteName: string;
  menuItems: MenuItem[];
}

// Group menu items by parent for nested menus
function groupMenuItems(items: MenuItem[]) {
  const rootItems = items.filter((item) => !item.parentId);
  const childItems = items.filter((item) => item.parentId);

  return rootItems.map((item) => ({
    ...item,
    children: childItems.filter((child) => child.parentId === item.id),
  }));
}

export function Header({ logoUrl, siteName, menuItems }: HeaderProps) {
  const t = useTranslations("header");
  const locale = useLocale() as "fr" | "en";
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const groupedItems = groupMenuItems(menuItems);

  const getLabel = (item: MenuItem) =>
    locale === "fr" ? item.labelFr : item.labelEn;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.refresh();
  };

  const handleSearch = () => {
    console.log("Search clicked");
  };

  // Check if a menu item is active
  const isActive = (route: string) => {
    if (route === "/" || route === "") {
      return pathname === "/" || pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname === route || pathname.startsWith(route + "/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-[var(--color-primary)]/20 bg-white/95 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group relative">
          {logoUrl ? (
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={logoUrl}
                alt={t("logoAlt")}
                className="h-10 w-auto object-contain transition-all duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[var(--color-primary)]/0 group-hover:bg-[var(--color-primary)]/5 transition-colors duration-300 rounded-lg" />
            </div>
          ) : (
            <span className="text-xl font-bold text-[var(--color-primary)] transition-all duration-300 group-hover:text-[var(--color-secondary)] relative">
              {siteName}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--color-secondary)] group-hover:w-full transition-all duration-300" />
            </span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {groupedItems.map((item) => {
                if (item.children.length > 0) {
                  return (
                    <NavigationMenuItem key={item.id}>
                      <NavigationMenuTrigger 
                        className={cn(
                          "px-4 py-2 text-sm font-medium bg-transparent rounded-lg transition-all duration-300 relative",
                          "hover:bg-[var(--color-primary)] hover:text-white",
                          "data-[state=open]:bg-[var(--color-primary)] data-[state=open]:text-white",
                          isActive(item.route) 
                            ? "text-[var(--color-primary)] font-semibold" 
                            : "text-gray-700"
                        )}
                      >
                        <span className="relative">
                          {getLabel(item)}
                          {/* Active underline indicator */}
                          {isActive(item.route) && (
                            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--color-secondary)] rounded-full" />
                          )}
                        </span>
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white rounded-xl shadow-2xl border border-[var(--color-primary)]/10 animate-in fade-in-0 zoom-in-95 duration-200">
                          {item.children.map((child) => (
                            <ListItem
                              key={child.id}
                              title={getLabel(child)}
                              href={child.external ? child.route : `/${locale}${child.route}`}
                              external={child.external}
                            >
                              {child.slug}
                            </ListItem>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  );
                }

                const active = isActive(item.route);

                return (
                  <NavigationMenuItem key={item.id}>
                    {item.external ? (
                      <NavigationMenuLink
                        className={cn(
                          "px-4 py-2 text-sm font-medium bg-transparent rounded-lg transition-all duration-300 cursor-pointer relative",
                          "hover:bg-[var(--color-primary)] hover:text-white",
                          active 
                            ? "text-[var(--color-primary)] font-semibold" 
                            : "text-gray-700"
                        )}
                        onClick={() => window.open(item.route, "_blank")}
                      >
                        <span className="relative">
                          {getLabel(item)}
                          {active && (
                            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--color-secondary)] rounded-full" />
                          )}
                        </span>
                      </NavigationMenuLink>
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link 
                          href={item.route}
                          className={cn(
                            "px-4 py-2 text-sm font-medium bg-transparent rounded-lg transition-all duration-300 relative",
                            "hover:bg-[var(--color-primary)] hover:text-white",
                            active 
                              ? "text-[var(--color-primary)] font-semibold" 
                              : "text-gray-700"
                          )}
                        >
                          <span className="relative">
                            {getLabel(item)}
                            {active && (
                              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--color-secondary)] rounded-full" />
                            )}
                          </span>
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSearch}
            aria-label={t("searchAria")}
            className="hidden sm:flex text-gray-600 hover:text-white hover:bg-[var(--color-primary)] transition-all duration-300 rounded-full"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Language Switcher */}
          <ClientOnly>
            <LanguageSwitcher />
          </ClientOnly>

          {/* Auth buttons */}
          {session ? (
            <div className="hidden items-center gap-2 sm:flex">
              {session.user?.role && ["ADMIN", "SUPER_ADMIN"].includes(session.user.role) && (
                <Link href="/admin">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-600 hover:text-white hover:bg-[var(--color-accent)] transition-all duration-300"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    {t("dashboard")}
                  </Button>
                </Link>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-gray-600 hover:text-white hover:bg-[var(--color-secondary)] transition-all duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t("logout")}
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-600 hover:text-white hover:bg-[var(--color-primary)] transition-all duration-300"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {t("login")}
                </Button>
              </Link>
              <Link href="/register">
                <Button 
                  size="sm"
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {t("register")}
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <ClientOnly>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label={t("menu")}
                  className="text-gray-700 hover:text-white hover:bg-[var(--color-primary)] transition-all duration-300"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-[300px] sm:w-[400px] bg-white border-l-4 border-[var(--color-primary)]"
            >
              <SheetHeader>
                <SheetTitle className="text-[var(--color-primary)]">{t("menu")}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                {/* Mobile Navigation */}
                <nav className="flex flex-col gap-1">
                  {groupedItems.map((item) => {
                    const active = isActive(item.route);
                    return (
                      <div key={item.id}>
                        <Link
                          href={item.external ? "#" : item.route}
                          onClick={() => {
                            if (item.external) {
                              window.open(item.route, "_blank");
                            }
                            setMobileMenuOpen(false);
                          }}
                          className={cn(
                            "flex items-center justify-between rounded-lg px-4 py-3 text-base font-medium transition-all duration-300",
                            active
                              ? "bg-[var(--color-primary)] text-white shadow-md"
                              : "text-gray-700 hover:text-white hover:bg-[var(--color-primary)]"
                          )}
                        >
                          {getLabel(item)}
                          <ChevronRight className={cn(
                            "h-4 w-4 transition-transform duration-300",
                            active ? "text-white" : "text-gray-400"
                          )} />
                        </Link>
                        {item.children.length > 0 && (
                          <div className="ml-4 mt-1 flex flex-col gap-1 border-l-2 border-[var(--color-accent)]">
                            {item.children.map((child) => {
                              const childActive = isActive(child.route);
                              return (
                                <Link
                                  key={child.id}
                                  href={child.external ? "#" : child.route}
                                  onClick={() => {
                                    if (child.external) {
                                      window.open(child.route, "_blank");
                                    }
                                    setMobileMenuOpen(false);
                                  }}
                                  className={cn(
                                    "rounded-lg px-4 py-2 text-sm transition-all duration-300",
                                    childActive
                                      ? "bg-[var(--color-secondary)] text-white"
                                      : "text-gray-600 hover:bg-[var(--color-secondary)] hover:text-white"
                                  )}
                                >
                                  {getLabel(child)}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>

                {/* Mobile Search */}
                <Button
                  variant="outline"
                  className="justify-start border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all duration-300"
                  onClick={handleSearch}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {t("searchAria")}
                </Button>

                {/* Mobile Auth */}
                <div className="mt-4 flex flex-col gap-2 border-t border-gray-200 pt-4">
                  {session ? (
                    <>
                      {session.user?.role && ["ADMIN", "SUPER_ADMIN"].includes(session.user.role) && (
                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white hover:border-[var(--color-accent)] transition-all duration-300"
                          >
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            {t("dashboard")}
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        className="w-full justify-start border-[var(--color-secondary)] text-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-white hover:border-[var(--color-secondary)] transition-all duration-300"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        {t("logout")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button 
                          variant="outline" 
                          className="w-full border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all duration-300"
                        >
                          <LogIn className="mr-2 h-4 w-4" />
                          {t("login")}
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white shadow-md hover:shadow-xl transition-all duration-300">
                          {t("register")}
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          </ClientOnly>
        </div>
      </div>
    </header>
  );
}

// List item component for dropdown menus
const ListItem = ({
  className,
  title,
  children,
  href,
  external,
  ...props
}: {
  className?: string;
  title: string;
  children: React.ReactNode;
  href: string;
  external?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300",
            "hover:bg-[var(--color-primary)] hover:text-white",
            "focus:bg-[var(--color-primary)] focus:text-white",
            "hover:shadow-lg",
            className
          )}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          {...props}
        >
          <div className="text-sm font-semibold leading-none text-[var(--color-primary)] transition-colors duration-300">
            {title}
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground transition-colors duration-300">
            {children}
          </p>
          <ChevronRight className="h-3 w-3 text-[var(--color-accent)] mt-2" />
        </Link>
      </NavigationMenuLink>
    </li>
  );
};
