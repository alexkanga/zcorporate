# CAHIER DES CHARGES - Application Web AAEA
## Association pour l'Avancement de l'Environnement et de l'Agriculture

---

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Stack technique](#2-stack-technique)
3. [Architecture de la base de données](#3-architecture-de-la-base-de-données)
4. [Structure des routes](#4-structure-des-routes)
5. [Composants et interfaces](#5-composants-et-interfaces)
6. [Système d'authentification](#6-système-dauthentification)
7. [Internationalisation](#7-internationalisation)
8. [API Routes](#8-api-routes)
9. [Fonctionnalités détaillées](#9-fonctionnalités-détaillées)
10. [Design et UX](#10-design-et-ux)
11. [Menu Actualités](#11-menu-actualités)
12. [Instructions pour l'agent IA](#12-instructions-pour-lagent-ia)

---

## 1. Présentation du projet

### 1.1 Objectif
Créer un site web corporatif bilingue (Français/Anglais) pour l'AAEA avec :
- Un site public présentant l'association, ses services, réalisations, ressources et événements
- Un panneau d'administration complet pour gérer tout le contenu
- Un système de gestion de contenu (CMS) personnalisé

### 1.2 Contexte
L'AAEA est une organisation dédiée à la promotion de pratiques agricoles durables et à la protection de l'environnement en Afrique de l'Ouest.

---

## 2. Stack technique

### 2.1 Framework et langages
| Technologie | Version | Description |
|-------------|---------|-------------|
| Next.js | 16.x | Framework React avec App Router |
| TypeScript | 5.x | Langage typé |
| React | 19.x | Bibliothèque UI |

### 2.2 Base de données
| Technologie | Version | Description |
|-------------|---------|-------------|
| PostgreSQL | Neon Serverless | Base de données relationnelle |
| Prisma | 6.x | ORM TypeScript |

### 2.3 Styling
| Technologie | Version | Description |
|-------------|---------|-------------|
| Tailwind CSS | 4.x | Framework CSS utilitaire |
| shadcn/ui | New York style | Composants UI |
| Lucide React | Latest | Icônes |
| Framer Motion | 12.x | Animations |

### 2.4 Autres dépendances
| Package | Version | Usage |
|---------|---------|-------|
| next-auth | 4.24.x | Authentification |
| next-intl | 4.x | Internationalisation |
| react-hook-form | 7.x | Formulaires |
| zod | 4.x | Validation |
| @tanstack/react-query | 5.x | Requêtes serveur |
| @tanstack/react-table | 8.x | Tableaux de données |
| nodemailer | 7.x | Emails |
| bcryptjs | Latest | Hash mots de passe |

---

## 3. Architecture de la base de données

### 3.1 Schéma Prisma complet

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== ENUMS ====================

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}

enum EntityType {
  ARTICLE
  RESOURCE
  REALISATION
  EVENT
}

enum MenuLocation {
  HEADER
  FOOTER
  BOTH
}

enum Role {
  USER
  ADMIN
  SUPER_ADMIN
}

// ==================== MODELS ====================

model User {
  id                String           @id
  email             String           @unique
  password          String
  name              String?
  avatar            String?
  role              Role             @default(USER)
  active            Boolean          @default(true)
  emailVerified     DateTime?
  lastLogin         DateTime?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  deletedAt         DateTime?
  Approval_requestedByIdToUser Approval[] @relation("Approval_requestedByIdToUser")
  Approval_reviewedByIdToUser  Approval[] @relation("Approval_reviewedByIdToUser")
  Article           Article[]
  ContactMessage    ContactMessage[]
  MediaAsset        MediaAsset[]

  @@index([deletedAt])
  @@index([email])
  @@index([role])
}

model Approval {
  id                    String         @id
  status                ApprovalStatus @default(PENDING)
  entityType            EntityType
  entityId              String
  comment               String?
  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt
  reviewedAt            DateTime?
  requestedById         String
  reviewedById          String?
  User_Approval_requestedByIdToUser User @relation("Approval_requestedByIdToUser", fields: [requestedById], references: [id], onDelete: Cascade)
  User_Approval_reviewedByIdToUser  User? @relation("Approval_reviewedByIdToUser", fields: [reviewedById], references: [id])

  @@unique([entityType, entityId])
  @@index([entityType])
  @@index([requestedById])
  @@index([reviewedById])
  @@index([status])
}

model Article {
  id              String           @id
  titleFr         String
  titleEn         String
  slug            String           @unique
  contentFr       String
  contentEn       String
  excerptFr       String?
  excerptEn       String?
  imageUrl        String?
  imageAltFr      String?
  imageAltEn      String?
  gallery         String?          // JSON array of image URLs
  videos          String?          // JSON array of video URLs
  published       Boolean          @default(false)
  featured        Boolean          @default(false)
  publishedAt     DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  deletedAt       DateTime?
  authorId        String
  categoryId      String?
  User            User             @relation(fields: [authorId], references: [id], onDelete: Cascade)
  ArticleCategory ArticleCategory? @relation(fields: [categoryId], references: [id])

  @@index([authorId])
  @@index([categoryId])
  @@index([deletedAt])
  @@index([featured])
  @@index([publishedAt])
  @@index([published])
  @@index([slug])
}

model ArticleCategory {
  id            String    @id
  nameFr        String
  nameEn        String
  slug          String    @unique
  descriptionFr String?
  descriptionEn String?
  order         Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
  Article       Article[]

  @@index([deletedAt])
  @@index([order])
  @@index([slug])
}

model ContactInfo {
  id             String   @id @default("contact-info")
  titleFr        String?
  titleEn        String?
  descriptionFr  String?
  descriptionEn  String?
  address        String?
  email          String?
  phone          String?
  phone2         String?
  workingHoursFr String?
  workingHoursEn String?
  mapEmbedUrl    String?
  updatedAt      DateTime @updatedAt
  emailBcc       String?
  emailCc1       String?
  emailCc2       String?
  emailTo        String   @default("contact@example.com")
}

model ContactMessage {
  id           String    @id
  name         String
  email        String
  phone        String?
  subject      String?
  message      String
  isRead       Boolean   @default(false)
  readAt       DateTime?
  replied      Boolean   @default(false)
  repliedAt    DateTime?
  replyMessage String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  repliedById  String?
  User         User?     @relation(fields: [repliedById], references: [id])

  @@index([createdAt])
  @@index([email])
  @@index([isRead])
}

model Event {
  id            String    @id
  titleFr       String
  titleEn       String
  descriptionFr String?
  descriptionEn String?
  date          DateTime
  endDate       DateTime?
  location      String?
  imageUrl      String?
  imageAltFr    String?
  imageAltEn    String?
  gallery       String?
  videos        String?
  published     Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  @@index([date])
  @@index([deletedAt])
  @@index([published])
}

model HomeAbout {
  id           String   @id @default("home-about")
  titleFr      String
  titleEn      String
  contentFr    String
  contentEn    String
  imageUrl     String?
  imageAltFr   String?
  imageAltEn   String?
  buttonTextFr String?
  buttonTextEn String?
  buttonUrl    String?
  updatedAt    DateTime @updatedAt
}

model HomeCTA {
  id           String   @id @default("home-cta")
  titleFr      String
  titleEn      String
  subtitleFr   String?
  subtitleEn   String?
  buttonTextFr String?
  buttonTextEn String?
  buttonUrl    String?
  updatedAt    DateTime @updatedAt
}

model MediaAsset {
  id            String    @id
  filename      String
  originalName  String
  url           String
  mimeType      String
  size          Int
  width         Int?
  height        Int?
  altFr         String?
  altEn         String?
  titleFr       String?
  titleEn       String?
  descriptionFr String?
  descriptionEn String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
  uploadedById  String?
  User          User?     @relation(fields: [uploadedById], references: [id])

  @@index([deletedAt])
  @@index([mimeType])
  @@index([uploadedById])
}

model MenuItem {
  id             String       @id
  parentId       String?
  order          Int          @default(0)
  slug           String
  route          String
  labelFr        String
  labelEn        String
  visible        Boolean      @default(true)
  location       MenuLocation @default(HEADER)
  icon           String?
  external       Boolean      @default(false)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  deletedAt      DateTime?
  MenuItem       MenuItem?    @relation("MenuItemToMenuItem", fields: [parentId], references: [id], onDelete: Cascade)
  other_MenuItem MenuItem[]   @relation("MenuItemToMenuItem")

  @@index([deletedAt])
  @@index([location])
  @@index([order])
  @@index([parentId])
  @@index([slug])
}

model Page {
  id                String    @id
  parentId          String?
  slug              String    @unique
  titleFr           String
  titleEn           String
  contentFr         String?
  contentEn         String?
  metaTitleFr       String?
  metaTitleEn       String?
  metaDescriptionFr String?
  metaDescriptionEn String?
  published         Boolean   @default(false)
  order             Int       @default(0)
  showInMenu        Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  deletedAt         DateTime?
  Page              Page?     @relation("PageToPage", fields: [parentId], references: [id])
  other_Page        Page[]    @relation("PageToPage")

  @@index([deletedAt])
  @@index([parentId])
  @@index([published])
  @@index([slug])
}

model Partner {
  id        String    @id
  name      String
  logoUrl   String
  website   String?
  order     Int       @default(0)
  visible   Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  @@index([deletedAt])
  @@index([order])
  @@index([visible])
}

model Realisation {
  id                  String               @id
  titleFr             String
  titleEn             String
  descriptionFr       String?
  descriptionEn       String?
  client              String?
  date                DateTime?
  location            String?
  imageUrl            String?
  gallery             String?
  videos              String?
  published           Boolean              @default(false)
  featured            Boolean              @default(false)
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
  deletedAt           DateTime?
  categoryId          String?
  RealisationCategory RealisationCategory? @relation(fields: [categoryId], references: [id])

  @@index([categoryId])
  @@index([deletedAt])
  @@index([featured])
  @@index([published])
}

model RealisationCategory {
  id            String        @id
  nameFr        String
  nameEn        String
  slug          String        @unique
  descriptionFr String?
  descriptionEn String?
  order         Int           @default(0)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  deletedAt     DateTime?
  Realisation   Realisation[]

  @@index([deletedAt])
  @@index([order])
  @@index([slug])
}

model Resource {
  id               String            @id
  titleFr          String
  titleEn          String
  descriptionFr    String?
  descriptionEn    String?
  fileUrl          String
  fileType         String
  fileSize         Int
  fileName         String
  files            String?           // JSON array for multiple files
  published        Boolean           @default(false)
  downloadCount    Int               @default(0)
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  deletedAt        DateTime?
  categoryId       String?
  ResourceCategory ResourceCategory? @relation(fields: [categoryId], references: [id])

  @@index([categoryId])
  @@index([deletedAt])
  @@index([published])
}

model ResourceCategory {
  id            String     @id
  nameFr        String
  nameEn        String
  slug          String     @unique
  descriptionFr String?
  descriptionEn String?
  order         Int        @default(0)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  deletedAt     DateTime?
  Resource      Resource[]

  @@index([deletedAt])
  @@index([order])
  @@index([slug])
}

model Service {
  id            String    @id
  titleFr       String
  titleEn       String
  descriptionFr String?
  descriptionEn String?
  icon          String?
  imageUrl      String?
  imageAltFr    String?
  imageAltEn    String?
  order         Int       @default(0)
  visible       Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  @@index([deletedAt])
  @@index([order])
  @@index([visible])
}

model SiteSettings {
  id                  String   @id @default("site-settings")
  logoUrl             String?
  logoAltFr           String?
  logoAltEn           String?
  faviconUrl          String?  // Nouveau champ pour favicon
  color1              String   @default("#362981")
  color2              String   @default("#009446")
  color3              String   @default("#029CB1")
  color4              String   @default("#9AD2E2")
  siteNameFr          String   @default("AAEA")
  siteNameEn          String   @default("AAEA")
  siteDescriptionFr   String?
  siteDescriptionEn   String?
  address             String?
  email               String?
  phone               String?
  phone2              String?
  workingHoursFr      String?
  workingHoursEn      String?
  socialLinks         String?  // JSON object
  mapLatitude         Float?
  mapLongitude        Float?
  mapZoom             Int      @default(15)
  mapApiKey           String?
  metaTitleFr         String?
  metaTitleEn         String?
  metaDescriptionFr   String?
  metaDescriptionEn   String?
  metaKeywords        String?
  googleAnalyticsId   String?
  googleTagManagerId  String?
  articlesPerPage     Int      @default(10)
  realisationsPerPage Int      @default(9)
  resourcesPerPage    Int      @default(12)
  eventsPerPage       Int      @default(6)
  updatedAt           DateTime @updatedAt
}

model Slider {
  id           String    @id
  titleFr      String
  titleEn      String
  subtitleFr   String?
  subtitleEn   String?
  buttonTextFr String?
  buttonTextEn String?
  buttonUrl    String?
  imageUrl     String
  imageAltFr   String?
  imageAltEn   String?
  order        Int       @default(0)
  visible      Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  deletedAt    DateTime?

  @@index([deletedAt])
  @@index([order])
  @@index([visible])
}

model Testimonial {
  id        String    @id
  name      String
  company   String?
  textFr    String
  textEn    String
  avatar    String?
  rating    Int       @default(5)
  order     Int       @default(0)
  visible   Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  @@index([deletedAt])
  @@index([order])
  @@index([visible])
}
```

---

## 4. Structure des routes

### 4.1 Routes publiques (localisées)

```
src/app/
├── [locale]/
│   ├── page.tsx                    # Page d'accueil
│   ├── a-propos/
│   │   └── page.tsx               # Page À propos
│   ├── actualites/                 # NOUVEAU - Menu Actualités
│   │   ├── page.tsx               # Liste des articles
│   │   └── [slug]/
│   │       └── page.tsx           # Article détaillé
│   ├── solutions/
│   │   └── page.tsx               # Page Solutions/Services
│   ├── realisations/
│   │   ├── page.tsx               # Liste des réalisations
│   │   └── [id]/
│   │       └── page.tsx           # Réalisation détaillée
│   ├── ressources/
│   │   ├── page.tsx               # Liste des ressources
│   │   └── [id]/
│   │       └── page.tsx           # Ressource détaillée
│   ├── evenements/
│   │   ├── page.tsx               # Liste des événements
│   │   └── [id]/
│   │       └── page.tsx           # Événement détaillé
│   └── contact/
│       └── page.tsx               # Page contact
```

### 4.2 Routes d'administration

```
src/app/
├── admin/
│   ├── page.tsx                   # Dashboard
│   ├── layout.tsx                 # Layout admin avec sidebar
│   ├── settings/
│   │   ├── page.tsx               # Vue d'ensemble paramètres
│   │   ├── logo/
│   │   │   └── page.tsx           # Logo & favicon
│   │   ├── colors/
│   │   │   └── page.tsx           # Couleurs de marque
│   │   ├── menus/
│   │   │   └── page.tsx           # Gestion des menus
│   │   └── maps/
│   │       └── page.tsx           # Configuration carte
│   ├── users/
│   │   ├── page.tsx               # Liste utilisateurs
│   │   └── [id]/
│   │       └── page.tsx           # Édition utilisateur
│   ├── home/
│   │   ├── page.tsx               # Vue d'ensemble accueil
│   │   ├── slider/
│   │   │   └── page.tsx           # Gestion slider
│   │   ├── about/
│   │   │   └── page.tsx           # Section À propos
│   │   ├── services/
│   │   │   └── page.tsx           # Services
│   │   ├── testimonials/
│   │   │   └── page.tsx           # Témoignages
│   │   ├── partners/
│   │   │   └── page.tsx           # Partenaires
│   │   └── cta/
│   │       └── page.tsx           # Call-to-action
│   ├── articles/                   # NOUVEAU - Gestion articles
│   │   ├── page.tsx               # Liste articles
│   │   ├── new/
│   │   │   └── page.tsx           # Nouvel article
│   │   ├── [id]/
│   │   │   └── page.tsx           # Édition article
│   │   └── categories/
│   │       └── page.tsx           # Catégories articles
│   ├── realisations/
│   │   ├── page.tsx               # Liste réalisations
│   │   ├── new/
│   │   │   └── page.tsx           # Nouvelle réalisation
│   │   ├── [id]/
│   │   │   └── page.tsx           # Édition réalisation
│   │   └── categories/
│   │       └── page.tsx           # Catégories réalisations
│   ├── resources/
│   │   ├── page.tsx               # Liste ressources
│   │   ├── new/
│   │   │   └── page.tsx           # Nouvelle ressource
│   │   ├── [id]/
│   │   │   └── page.tsx           # Édition ressource
│   │   └── categories/
│   │       └── page.tsx           # Catégories ressources
│   ├── events/
│   │   ├── page.tsx               # Liste événements
│   │   ├── new/
│   │   │   └── page.tsx           # Nouvel événement
│   │   └── [id]/
│   │       └── page.tsx           # Édition événement
│   └── contact/
│       ├── page.tsx               # Vue d'ensemble contact
│       ├── messages/
│       │   ├── page.tsx           # Liste messages
│       │   └── [id]/
│       │       └── page.tsx       # Détail message
│       └── info/
│           └── page.tsx           # Informations contact
```

---

## 5. Composants et interfaces

### 5.1 Composants publics

#### Header (`src/components/public/Header.tsx`)
```typescript
interface HeaderProps {
  logoUrl: string | null;
  siteName: string;
  menuItems: MenuItem[];
}

// Fonctionnalités :
// - Logo cliquable
// - Navigation responsive (mobile menu)
// - Switcher de langue (FR/EN)
// - Bouton connexion (si non connecté)
// - Menu utilisateur (si connecté)
```

#### Footer (`src/components/public/Footer.tsx`)
```typescript
interface FooterProps {
  settings: SiteSettings;
  menuItems: MenuItem[];
}

// Sections :
// - Logo et description
// - Liens navigation
// - Informations contact
// - Réseaux sociaux
// - Copyright
```

#### HeroSlider (`src/components/public/sections/HeroSlider.tsx`)
```typescript
interface Slider {
  id: string;
  titleFr: string;
  titleEn: string;
  subtitleFr: string | null;
  subtitleEn: string | null;
  buttonTextFr: string | null;
  buttonTextEn: string | null;
  buttonUrl: string | null;
  imageUrl: string;
  imageAltFr: string | null;
  imageAltEn: string | null;
  order: number;
  visible: boolean;
}

interface HeroSliderProps {
  sliders: Slider[];
  locale: 'fr' | 'en';
}

// Fonctionnalités :
// - Carousel automatique
// - Navigation par points
// - Animation de texte
// - Bouton CTA
// - Responsive
```

#### AboutSection (`src/components/public/sections/AboutSection.tsx`)
```typescript
interface HomeAbout {
  id: string;
  titleFr: string;
  titleEn: string;
  contentFr: string;
  contentEn: string;
  imageUrl: string | null;
  imageAltFr: string | null;
  imageAltEn: string | null;
}

interface AboutSectionProps {
  homeAbout: HomeAbout | null;
  locale: 'fr' | 'en';
}

// Layout :
// - Image à gauche, texte à droite
// - Fond blanc
// - Pas de bouton "En savoir plus"
```

#### ServicesSection (`src/components/public/sections/ServicesSection.tsx`)
```typescript
interface Service {
  id: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  icon: string | null;  // Nom de l'icône Lucide
  imageUrl: string | null;
  order: number;
  visible: boolean;
}

// Affichage :
// - Grille responsive (1/2/3/4 colonnes)
// - Icône au-dessus
// - Titre et description
// - Animation au survol
```

#### TestimonialsSection (`src/components/public/sections/TestimonialsSection.tsx`)
```typescript
interface Testimonial {
  id: string;
  name: string;
  company: string | null;
  textFr: string;
  textEn: string;
  avatar: string | null;
  rating: number;
  order: number;
  visible: boolean;
}

// Affichage :
// - Carousel
// - Avatar
// - Citation
// - Nom et entreprise
// - Étoiles de notation
```

#### PartnersSection (`src/components/public/sections/PartnersSection.tsx`)
```typescript
interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  website: string | null;
  order: number;
  visible: boolean;
}

// Affichage :
// - Grille de logos
// - Liens vers sites web
// - Animation au survol
```

#### CTASection (`src/components/public/sections/CTASection.tsx`)
```typescript
interface HomeCTA {
  id: string;
  titleFr: string;
  titleEn: string;
  subtitleFr: string | null;
  subtitleEn: string | null;
  buttonTextFr: string | null;
  buttonTextEn: string | null;
  buttonUrl: string | null;
}

// Design :
// - Fond avec dégradé de couleurs de marque
// - Texte centré
// - Bouton CTA proéminent
```

#### LatestArticles (`src/components/public/sections/LatestArticles.tsx`)
```typescript
interface Article {
  id: string;
  titleFr: string;
  titleEn: string;
  slug: string;
  excerptFr: string | null;
  excerptEn: string | null;
  imageUrl: string | null;
  publishedAt: Date | null;
  author: { name: string | null } | null;
  category: { nameFr: string; nameEn: string; slug: string } | null;
}

// Affichage :
// - 3 derniers articles
// - Cards avec image, titre, extrait
// - Auteur et catégorie
// - Lien vers l'article complet
```

### 5.2 Composants admin

#### AdminSidebar (`src/components/admin/AdminSidebar.tsx`)
```typescript
interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  children?: NavItem[];
}

// Sections :
// - Dashboard
// - Paramètres (sous-menu)
// - Accueil (sous-menu)
// - Articles (sous-menu)
// - Réalisations (sous-menu)
// - Ressources (sous-menu)
// - Événements
// - Contact (sous-menu)
// - Utilisateurs
```

#### AdminHeader (`src/components/admin/AdminHeader.tsx`)
```typescript
// Fonctionnalités :
// - Breadcrumb
// - Barre de recherche
// - Notifications
// - Menu utilisateur
// - Bouton déconnexion
```

---

## 6. Système d'authentification

### 6.1 Configuration NextAuth

```typescript
// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.active) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        await db.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    }
  }
};
```

### 6.2 Middleware de protection

```typescript
// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed"
});

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Routes admin protégées
    if (pathname.startsWith("/admin")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      const role = token.role as string;
      const roleLevel = { USER: 10, ADMIN: 50, SUPER_ADMIN: 100 };

      // Routes réservées SUPER_ADMIN
      const superAdminRoutes = ["/admin/users", "/admin/settings"];
      if (superAdminRoutes.some(r => pathname.startsWith(r))) {
        if (roleLevel[role as keyof typeof roleLevel] < 100) {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
      }

      // Routes nécessitant ADMIN minimum
      if (roleLevel[role as keyof typeof roleLevel] < 50) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Appliquer i18n pour les routes publiques
    if (!pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
      return intlMiddleware(req);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|upload).*)"]
};
```

### 6.3 Niveaux de permission

| Rôle | Niveau | Permissions |
|------|--------|-------------|
| USER | 10 | Lecture seule |
| ADMIN | 50 | CRUD contenu, pas de gestion utilisateurs |
| SUPER_ADMIN | 100 | Accès complet, gestion utilisateurs et paramètres |

---

## 7. Internationalisation

### 7.1 Configuration

```typescript
// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "as-needed"
});
```

### 7.2 Structure des traductions

```json
// messages/fr.json
{
  "navigation": {
    "home": "Accueil",
    "about": "À propos",
    "solutions": "Solutions",
    "actualites": "Actualités",
    "realisations": "Réalisations",
    "resources": "Ressources",
    "events": "Événements",
    "contact": "Contact"
  },
  "common": {
    "readMore": "Lire la suite",
    "learnMore": "En savoir plus",
    "discover": "Découvrir",
    "submit": "Envoyer",
    "cancel": "Annuler",
    "save": "Enregistrer",
    "delete": "Supprimer",
    "edit": "Modifier",
    "loading": "Chargement...",
    "error": "Une erreur est survenue"
  },
  "header": {
    "login": "Connexion",
    "logout": "Déconnexion",
    "dashboard": "Tableau de bord"
  },
  "footer": {
    "rights": "Tous droits réservés",
    "legalNotice": "Mentions légales",
    "privacyPolicy": "Politique de confidentialité"
  },
  "home": {
    "heroTitle": "Bienvenue à l'AAEA",
    "heroSubtitle": "Ensemble pour un avenir durable",
    "aboutTitle": "Qui sommes-nous",
    "servicesTitle": "Nos services",
    "testimonialsTitle": "Témoignages",
    "partnersTitle": "Nos partenaires",
    "ctaTitle": "Prêt à faire la différence ?",
    "latestArticles": "Dernières actualités"
  },
  "actualites": {
    "title": "Actualités",
    "subtitle": "Les dernières nouvelles de l'AAEA",
    "publishedOn": "Publié le",
    "by": "par",
    "in": "dans",
    "noArticles": "Aucun article publié",
    "categories": "Catégories",
    "allCategories": "Toutes les catégories"
  },
  "admin": {
    "dashboard": "Tableau de bord",
    "settings": "Paramètres",
    "users": "Utilisateurs",
    "articles": "Articles",
    "realisations": "Réalisations",
    "resources": "Ressources",
    "events": "Événements",
    "contact": "Contact"
  }
}
```

---

## 8. API Routes

### 8.1 Routes publiques

#### GET /api/home
Retourne toutes les données pour la page d'accueil.

```typescript
// Response
{
  sliders: Slider[];
  homeAbout: HomeAbout | null;
  services: Service[];
  testimonials: Testimonial[];
  partners: Partner[];
  homeCTA: HomeCTA | null;
  latestArticles: Article[];
}
```

#### POST /api/contact
Soumet un message de contact.

```typescript
// Request
{
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

// Response
{ success: true, id: string }
```

#### GET /api/articles
Liste des articles publiés.

```typescript
// Query params
?page=1&category=slug&featured=true

// Response
{
  articles: Article[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  }
}
```

#### GET /api/articles/[slug]
Article détaillé par slug.

### 8.2 Routes admin

#### GET/PUT /api/admin/settings
Gestion des paramètres du site.

#### GET/POST /api/admin/articles
Liste et création d'articles.

#### PUT/DELETE /api/admin/articles/[id]
Modification et suppression d'article.

#### GET/POST /api/admin/sliders
Gestion des slides du hero.

#### GET/POST /api/admin/partners
Gestion des partenaires.

#### GET/POST /api/admin/services
Gestion des services.

#### GET/POST /api/admin/testimonials
Gestion des témoignages.

#### GET/POST /api/admin/events
Gestion des événements.

#### GET/POST /api/admin/realisations
Gestion des réalisations.

#### GET/POST /api/admin/resources
Gestion des ressources.

---

## 9. Fonctionnalités détaillées

### 9.1 Page d'accueil

| Section | Données | Actions |
|---------|---------|---------|
| Hero Slider | Sliders actifs, ordonnés | Navigation automatique, boutons CTA |
| À propos | HomeAbout unique | Texte descriptif, image |
| Services | Services visibles, ordonnés | Grille responsive |
| Témoignages | Testimonials visibles | Carousel |
| Partenaires | Partners visibles | Grille de logos |
| CTA | HomeCTA unique | Bouton d'action |
| Articles | 3 derniers articles publiés | Cards avec lien |

### 9.2 Page Actualités (NOUVEAU)

**Route:** `/[locale]/actualites`

#### Liste des articles
- Affichage en grille (3 colonnes desktop)
- Filtre par catégorie (sidebar)
- Pagination (10 articles par page)
- Recherche par mot-clé
- Cards avec : image, titre, extrait, date, auteur, catégorie

#### Article détaillé
**Route:** `/[locale]/actualites/[slug]`

- Image de couverture
- Titre et catégorie
- Auteur et date de publication
- Contenu riche (MDX)
- Galerie d'images
- Vidéos intégrées
- Partage social
- Articles liés

### 9.3 Panneau d'administration

#### Dashboard
- Statistiques : utilisateurs, articles, messages, événements
- Activité récente
- Actions rapides
- État du système

#### Gestion des articles (NOUVEAU)
- Liste avec filtres et recherche
- Éditeur MDX pour le contenu
- Upload d'images
- Gestion des catégories
- Publication/dépublication
- Mise en avant (featured)
- Prévisualisation

#### Gestion du contenu
- **Slider:** CRUD complet, ordonnancement drag & drop
- **Services:** CRUD, icônes Lucide
- **Témoignages:** CRUD, notation par étoiles
- **Partenaires:** CRUD, upload logos
- **CTA:** Édition unique

#### Paramètres
- **Logo/Favicon:** Upload, preview
- **Couleurs:** 4 couleurs de marque avec color picker
- **Menus:** Drag & drop, hiérarchie
- **SEO:** Meta tags globaux

---

## 10. Design et UX

### 10.1 Couleurs de marque

| Variable | Défaut | Usage |
|----------|--------|-------|
| `--color-primary` | #362981 | Boutons principaux, liens |
| `--color-secondary` | #009446 | Accents, succès |
| `--color-accent` | #029CB1 | Highlights |
| `--color-light` | #9AD2E2 | Arrière-plans légers |

### 10.2 Typographie

```css
/* Tailwind config */
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  heading: ['Inter', 'system-ui', 'sans-serif'],
}
```

### 10.3 Animations

```css
/* Animations personnalisées */
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes gradient-x {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

.animate-gradient-x {
  animation: gradient-x 3s ease infinite;
  background-size: 200% 200%;
}
```

### 10.4 Responsive Design

| Breakpoint | Largeur | Colonnes grille |
|------------|---------|-----------------|
| sm | 640px | 1 |
| md | 768px | 2 |
| lg | 1024px | 3 |
| xl | 1280px | 4 |

---

## 11. Menu Actualités

### 11.1 Ajout dans le menu de navigation

Le menu "Actualités" doit être ajouté à la navigation principale :

**Position:** Entre "Solutions" et "Réalisations"

**Configuration MenuItem:**
```typescript
{
  id: "menu-actualites",
  slug: "actualites",
  route: "/actualites",
  labelFr: "Actualités",
  labelEn: "News",
  location: "HEADER",
  order: 3, // Après Solutions (order: 2)
  visible: true
}
```

### 11.2 Pages à créer

#### `/[locale]/actualites/page.tsx`
```typescript
// Page liste des articles
// - Breadcrumb
// - Titre et description
// - Filtres (catégorie, recherche)
// - Grille d'articles (pagination)
// - Sidebar avec catégories
```

#### `/[locale]/actualites/[slug]/page.tsx`
```typescript
// Page article détaillé
// - Image de couverture
// - Titre, catégorie, date, auteur
// - Contenu MDX
// - Galerie et vidéos
// - Partage social
// - Articles liés
```

### 11.3 Section admin articles

#### `/admin/articles/page.tsx`
```typescript
// Liste des articles
// - Table avec colonnes : titre, catégorie, statut, date
// - Actions : éditer, supprimer, publier/dépublier
// - Filtres et recherche
// - Bouton "Nouvel article"
```

#### `/admin/articles/new/page.tsx`
```typescript
// Formulaire création article
// - Titre FR/EN
// - Slug auto-généré
// - Contenu MDX (éditeur riche)
// - Image de couverture (upload)
// - Galerie et vidéos
// - Catégorie (select)
// - Publication (toggle)
// - Featured (toggle)
// - SEO (meta title, description)
```

#### `/admin/articles/[id]/page.tsx`
```typescript
// Formulaire édition article
// - Mêmes champs que création
// - Prévisualisation
```

#### `/admin/articles/categories/page.tsx`
```typescript
// Gestion des catégories
// - Liste avec ordre
// - CRUD catégories
```

---

## 12. Instructions pour l'agent IA

### 12.1 Ordre de développement

1. **Phase 1: Infrastructure**
   - Initialiser Next.js 16 avec TypeScript
   - Configurer Prisma avec PostgreSQL
   - Créer le schéma de base de données complet
   - Configurer next-intl pour l'i18n
   - Configurer shadcn/ui

2. **Phase 2: Authentification**
   - Configurer NextAuth avec credentials
   - Créer le middleware de protection
   - Implémenter le système de rôles

3. **Phase 3: Layouts**
   - Layout public avec Header/Footer
   - Layout admin avec Sidebar
   - Providers (Auth, Theme, Query, Locale)

4. **Phase 4: Pages publiques**
   - Page d'accueil avec toutes les sections
   - Pages À propos, Solutions, Contact
   - Pages Actualités (liste et détail)
   - Pages Réalisations, Ressources, Événements

5. **Phase 5: Administration**
   - Dashboard
   - Gestion du contenu (slider, services, etc.)
   - Gestion des articles (CRUD complet)
   - Gestion des autres entités
   - Paramètres du site

6. **Phase 6: Finitions**
   - Animations et transitions
   - SEO et métadonnées
   - Tests et corrections
   - Seed de données

### 12.2 Points d'attention

1. **Cohérence des relations Prisma**
   - Vérifier les noms de relations (ex: `User` pas `author`)
   - Utiliser les bons champs dans les includes

2. **Internationalisation**
   - Toujours utiliser les traductions via `useTranslations`
   - Générer les slugs uniques
   - Contenu dupliqué FR/EN pour chaque entité

3. **Upload de fichiers**
   - Utiliser Vercel Blob Storage pour la production
   - Stocker les URLs dans les champs `imageUrl`, `logoUrl`, etc.

4. **Sécurité**
   - Valider toutes les entrées avec Zod
   - Protéger les routes admin par rôle
   - Ne pas exposer les mots de passe

5. **Performance**
   - Utiliser le cache de Next.js
   - Pagination pour les listes
   - Lazy loading des images

### 12.3 Données de seed

Inclure un script de seed avec :
- 3 utilisateurs (super_admin, admin, user)
- 12 articles de démonstration
- 4 sliders
- 4 services
- 3 témoignages
- 12 partenaires
- 12 réalisations
- 12 ressources
- 12 événements
- Paramètres du site par défaut
- Menu items avec "Actualités"

---

## Annexe: Fichiers de configuration

### next.config.ts
```typescript
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/routing.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { hostname: "*.blob.vercel-storage.com" },
      { hostname: "localhost" }
    ]
  }
};

export default withNextIntl(nextConfig);
```

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        light: "var(--color-light)"
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "gradient-x": "gradient-x 3s ease infinite"
      }
    }
  }
} satisfies Config;
```

---

**Document créé pour la reproduction exacte de l'application AAEA**
**Version: 1.0**
**Date: Janvier 2025**
