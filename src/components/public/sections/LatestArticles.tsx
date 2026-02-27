"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowRight, User, Clock } from "lucide-react";
import type { Locale } from "@/i18n";

interface Article {
  id: string;
  titleFr: string;
  titleEn: string;
  slug: string;
  excerptFr: string | null;
  excerptEn: string | null;
  imageUrl: string | null;
  imageAltFr: string | null;
  imageAltEn: string | null;
  publishedAt: Date | null;
  author: {
    name: string | null;
  } | null;
  category: {
    nameFr: string;
    nameEn: string;
    slug: string;
  } | null;
}

interface LatestArticlesProps {
  articles: Article[];
  locale: Locale;
}

// Helper to get localized content with FR fallback
function getLocalizedText(
  fr: string | null,
  en: string | null,
  locale: Locale
): string | null {
  if (locale === "en" && en) return en;
  return fr;
}

// Format date in localized format
function formatDate(date: Date | null, locale: Locale): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ArticleCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      <Skeleton className="aspect-[16/9] w-full" />
      <CardContent className="p-6">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

function LatestArticlesSkeleton() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function LatestArticles({ articles, locale }: LatestArticlesProps) {
  if (!articles || articles.length === 0) {
    return <LatestArticlesSkeleton />;
  }

  const title = locale === "en" ? "Latest Articles" : "Derniers Articles";
  const subtitle =
    locale === "en"
      ? "Stay updated with our latest news and insights"
      : "Restez informé de nos dernières actualités et perspectives";
  const readMore = locale === "en" ? "Read More" : "Lire la suite";
  const viewAll = locale === "en" ? "View All Articles" : "Voir Tous les Articles";

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-[var(--color-accent)]/5 rounded-full translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-[var(--color-primary)]/5 rounded-full -translate-x-1/2 blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16">
          <div>
            <div className="inline-block mb-4">
              <div className="h-1 w-12 bg-[var(--color-secondary)] rounded-full" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-primary)] mb-4">
              {title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>
          <Button
            asChild
            className="mt-6 lg:mt-0 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 group px-6 py-3 rounded-full"
          >
            <a href={`/${locale === "en" ? "en/" : ""}blog`}>
              {viewAll}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => {
            const articleTitle = getLocalizedText(
              article.titleFr,
              article.titleEn,
              locale
            );
            const excerpt = getLocalizedText(
              article.excerptFr,
              article.excerptEn,
              locale
            );
            const categoryName = article.category
              ? getLocalizedText(
                  article.category.nameFr,
                  article.category.nameEn,
                  locale
                )
              : null;
            const imageAlt = getLocalizedText(
              article.imageAltFr,
              article.imageAltEn,
              locale
            );

            return (
              <Card
                key={article.id}
                className="h-full overflow-hidden bg-white border-2 border-gray-100 hover:border-[var(--color-primary)]/30 rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--color-primary)]/10 hover:-translate-y-2 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                {article.imageUrl && (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={imageAlt || articleTitle || ""}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Category Badge */}
                    {categoryName && (
                      <div className="absolute top-4 left-4">
                        <span className="inline-block px-4 py-1.5 bg-[var(--color-secondary)] text-white text-sm font-semibold rounded-full shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                          {categoryName}
                        </span>
                      </div>
                    )}

                    {/* Clock icon overlay on hover */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
                        <Clock className="h-5 w-5 text-[var(--color-primary)]" />
                      </div>
                    </div>
                  </div>
                )}

                <CardContent className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-[var(--color-primary)] transition-colors duration-300 line-clamp-2 leading-tight">
                    <a href={`/${locale === "en" ? "en/" : ""}blog/${article.slug}`}>
                      {articleTitle}
                    </a>
                  </h3>

                  {/* Excerpt */}
                  {excerpt && (
                    <p className="text-gray-600 mb-5 line-clamp-2 leading-relaxed">
                      {excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    {/* Date */}
                    {article.publishedAt && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-[var(--color-accent)]" />
                        <time dateTime={new Date(article.publishedAt).toISOString()}>
                          {formatDate(article.publishedAt, locale)}
                        </time>
                      </div>
                    )}
                    {/* Author */}
                    {article.author?.name && (
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-[var(--color-accent)]" />
                        <span>{article.author.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Read More Link */}
                  <a
                    href={`/${locale === "en" ? "en/" : ""}blog/${article.slug}`}
                    className="inline-flex items-center gap-2 text-[var(--color-primary)] font-semibold group-hover:text-[var(--color-secondary)] transition-colors duration-300"
                  >
                    {readMore}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { LatestArticlesSkeleton };
