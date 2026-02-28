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
  publishedAt: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

// GET /api/admin/articles/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const article = await db.article.findFirst({
      where: { id, deletedAt: null },
      include: {
        User: {
          select: { id: true, name: true },
        },
        ArticleCategory: {
          select: { id: true, nameFr: true, nameEn: true, slug: true },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...article,
      gallery: article.gallery ? JSON.parse(article.gallery) : [],
      videos: article.videos ? JSON.parse(article.videos) : [],
    });
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/articles/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = articleSchema.parse(body);

    // Check if slug already exists for another article
    if (data.slug) {
      const existingArticle = await db.article.findFirst({
        where: { slug: data.slug, NOT: { id } },
      });

      if (existingArticle) {
        return NextResponse.json(
          { error: "An article with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const article = await db.article.update({
      where: { id },
      data: {
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
    });
  } catch (error) {
    console.error("Error updating article:", error);
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

// DELETE /api/admin/articles/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Soft delete
    await db.article.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
