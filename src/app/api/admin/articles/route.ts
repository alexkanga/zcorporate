import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const articleSchema = z.object({
  titleFr: z.string().min(1, "French title is required"),
  titleEn: z.string().min(1, "English title is required"),
  slug: z.string().min(1, "Slug is required"),
  contentFr: z.string().optional(),
  contentEn: z.string().optional(),
  excerptFr: z.string().optional(),
  excerptEn: z.string().optional(),
  imageUrl: z.string().optional(),
  imageAltFr: z.string().optional(),
  imageAltEn: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  publishedAt: z.string().optional(),
  categoryId: z.string().optional().nullable(),
});

// GET /api/admin/articles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");
    const published = searchParams.get("published");

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { titleFr: { contains: search } },
          { titleEn: { contains: search } },
          { slug: { contains: search } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(published !== null && published !== "all" && { published: published === "true" }),
    };

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        include: {
          User: {
            select: { id: true, name: true },
          },
          ArticleCategory: {
            select: { id: true, nameFr: true, nameEn: true, slug: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.article.count({ where }),
    ]);

    return NextResponse.json({
      articles: articles.map((a) => ({
        ...a,
        gallery: a.gallery ? JSON.parse(a.gallery) : [],
        videos: a.videos ? JSON.parse(a.videos) : [],
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/articles
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const data = articleSchema.parse(body);

    // Check if slug already exists
    const existingArticle = await db.article.findUnique({
      where: { slug: data.slug },
    });

    if (existingArticle) {
      return NextResponse.json(
        { error: "An article with this slug already exists" },
        { status: 400 }
      );
    }

    const article = await db.article.create({
      data: {
        id: crypto.randomUUID(),
        titleFr: data.titleFr,
        titleEn: data.titleEn,
        slug: data.slug,
        contentFr: data.contentFr || "",
        contentEn: data.contentEn || "",
        excerptFr: data.excerptFr || null,
        excerptEn: data.excerptEn || null,
        imageUrl: data.imageUrl || null,
        imageAltFr: data.imageAltFr || null,
        imageAltEn: data.imageAltEn || null,
        gallery: data.gallery && data.gallery.length > 0 ? JSON.stringify(data.gallery) : null,
        videos: data.videos && data.videos.length > 0 ? JSON.stringify(data.videos) : null,
        published: data.published ?? false,
        featured: data.featured ?? false,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : data.published ? new Date() : null,
        categoryId: data.categoryId || null,
        authorId: session.user.id,
      },
      include: {
        User: {
          select: { id: true, name: true },
        },
        ArticleCategory: {
          select: { id: true, nameFr: true, nameEn: true, slug: true },
        },
      },
    });

    return NextResponse.json({
      ...article,
      gallery: article.gallery ? JSON.parse(article.gallery) : [],
      videos: article.videos ? JSON.parse(article.videos) : [],
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
