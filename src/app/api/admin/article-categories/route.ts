import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const categorySchema = z.object({
  nameFr: z.string().min(1, "French name is required"),
  nameEn: z.string().min(1, "English name is required"),
  slug: z.string().min(1, "Slug is required"),
  descriptionFr: z.string().optional(),
  descriptionEn: z.string().optional(),
  order: z.number().optional(),
});

// GET /api/admin/article-categories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const categories = await db.articleCategory.findMany({
      where: { deletedAt: null },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { Article: { where: { deletedAt: null } } },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching article categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/article-categories
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
    const data = categorySchema.parse(body);

    // Check if slug already exists
    const existingCategory = await db.articleCategory.findUnique({
      where: { slug: data.slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 400 }
      );
    }

    const category = await db.articleCategory.create({
      data: {
        id: crypto.randomUUID(),
        nameFr: data.nameFr,
        nameEn: data.nameEn,
        slug: data.slug,
        descriptionFr: data.descriptionFr || null,
        descriptionEn: data.descriptionEn || null,
        order: data.order ?? 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating article category:", error);
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
