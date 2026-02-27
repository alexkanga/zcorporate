"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Send,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import type { MenuItem, SiteSettings } from "@prisma/client";
import { parseSocialLinks } from "@/lib/site-settings";
import { useState } from "react";

interface FooterProps {
  logoUrl?: string | null;
  siteName: string;
  settings: Pick<
    SiteSettings,
    | "address"
    | "email"
    | "phone"
    | "phone2"
    | "workingHoursFr"
    | "workingHoursEn"
    | "socialLinks"
  >;
  menuItems: MenuItem[];
}

const socialIcons = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
};

export function Footer({ logoUrl, siteName, settings, menuItems }: FooterProps) {
  const t = useTranslations("footer");
  const locale = useLocale() as "fr" | "en";
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const socialLinks = parseSocialLinks(settings.socialLinks);
  const workingHours =
    locale === "fr" ? settings.workingHoursFr : settings.workingHoursEn;

  const footerMenuItems = menuItems.filter(
    (item) => item.location === "FOOTER" || item.location === "BOTH"
  );

  const getLabel = (item: MenuItem) =>
    locale === "fr" ? item.labelFr : item.labelEn;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log("Subscribe:", email);
      setSubscribed(true);
      setEmail("");
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary)]/95 to-[var(--color-primary)]/90 text-white">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-[var(--color-secondary)] via-[var(--color-accent)] to-[var(--color-secondary)]" />
      
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="space-y-6">
            <Link href="/" className="inline-block group">
              {logoUrl ? (
                <div className="bg-white p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <img
                    src={logoUrl}
                    alt={siteName}
                    className="h-12 w-auto object-contain"
                  />
                </div>
              ) : (
                <span className="text-2xl font-bold text-white transition-colors duration-300 group-hover:text-[var(--color-accent-light)]">
                  {siteName}
                </span>
              )}
            </Link>
            <p className="text-sm text-white/80 leading-relaxed">{t("description")}</p>

            {/* Social links */}
            {Object.keys(socialLinks).length > 0 && (
              <div className="flex items-center gap-3">
                {Object.entries(socialLinks).map(([platform, url]) => {
                  if (!url) return null;
                  const Icon = socialIcons[platform as keyof typeof socialIcons];
                  if (!Icon) return null;
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t(`social.${platform}`)}
                      className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-[var(--color-primary)] hover:scale-110 transition-all duration-300 shadow-sm hover:shadow-lg"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick links column */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-white/90 border-b border-white/20 pb-2">
              {t("links.title")}
            </h3>
            <nav className="flex flex-col gap-3">
              {footerMenuItems.length > 0 ? (
                footerMenuItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.route}
                    className="text-sm text-white/80 transition-all duration-300 hover:text-white hover:translate-x-1 flex items-center gap-2 group"
                    {...(item.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {getLabel(item)}
                    {item.external && <ExternalLink className="h-3 w-3" />}
                  </Link>
                ))
              ) : (
                <>
                  <Link
                    href={`/${locale}/privacy`}
                    className="text-sm text-white/80 transition-all duration-300 hover:text-white hover:translate-x-1 flex items-center gap-2 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {t("links.privacy")}
                  </Link>
                  <Link
                    href={`/${locale}/terms`}
                    className="text-sm text-white/80 transition-all duration-300 hover:text-white hover:translate-x-1 flex items-center gap-2 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {t("links.terms")}
                  </Link>
                  <Link
                    href={`/${locale}/legal`}
                    className="text-sm text-white/80 transition-all duration-300 hover:text-white hover:translate-x-1 flex items-center gap-2 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {t("links.legal")}
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Contact column */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-white/90 border-b border-white/20 pb-2">
              {t("contact.title")}
            </h3>
            <div className="space-y-4">
              {settings.address && (
                <div className="flex items-start gap-3 text-sm text-white/80 group">
                  <div className="mt-0.5 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-secondary)] transition-colors duration-300">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="leading-relaxed">{settings.address}</span>
                </div>
              )}
              {settings.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="flex items-center gap-3 text-sm text-white/80 transition-all duration-300 hover:text-white group"
                >
                  <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-secondary)] transition-colors duration-300">
                    <Phone className="h-4 w-4" />
                  </div>
                  {settings.phone}
                </a>
              )}
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-3 text-sm text-white/80 transition-all duration-300 hover:text-white group"
                >
                  <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-secondary)] transition-colors duration-300">
                    <Mail className="h-4 w-4" />
                  </div>
                  {settings.email}
                </a>
              )}
              {workingHours && (
                <div className="text-sm text-white/80 mt-4 p-3 rounded-lg bg-white/5">
                  <span className="font-medium text-white">{t("contact.hours")}: </span>
                  {workingHours}
                </div>
              )}
            </div>
          </div>

          {/* Newsletter column */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-white/90 border-b border-white/20 pb-2">
              {t("newsletter.title")}
            </h3>
            <p className="mb-4 text-sm text-white/80 leading-relaxed">
              {t("newsletter.description")}
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-[var(--color-secondary)]/20 text-[var(--color-accent-light)]">
                <Send className="h-5 w-5" />
                <span className="text-sm font-medium">{t("newsletter.success")}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder={t("newsletter.placeholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-4 pr-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white focus:ring-white/30"
                    required
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-white text-[var(--color-primary)] font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group hover:bg-[var(--color-accent-light)] hover:text-[var(--color-primary)]"
                >
                  <Send className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  {t("newsletter.subscribe")}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-black/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row">
          <p className="text-sm text-white/70">
            {t("copyright", { year: currentYear })}
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
            <Link
              href={`/${locale}/privacy`}
              className="transition-colors hover:text-white"
            >
              {t("links.privacy")}
            </Link>
            <Separator orientation="vertical" className="h-4 bg-white/20" />
            <Link
              href={`/${locale}/terms`}
              className="transition-colors hover:text-white"
            >
              {t("links.terms")}
            </Link>
            <Separator orientation="vertical" className="h-4 bg-white/20" />
            <Link
              href={`/${locale}/cookies`}
              className="transition-colors hover:text-white"
            >
              {t("links.cookies")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
