import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ColorInjector } from "@/components/providers/ColorInjector";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AAEA",
    template: "%s | AAEA",
  },
  description: "Votre partenaire technologique de confiance",
  authors: [{ name: "AAEA Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This is the single root layout that provides HTML structure for all routes
  // - For locale routes: the [locale]/layout.tsx injects dynamic colors and locale-specific settings
  // - For admin routes: the admin/layout.tsx provides the admin interface structure
  // - For other routes: this layout provides the base structure
  return (
    <html lang="fr" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Color injector will set CSS variables on the root element */}
        <ColorInjector />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
