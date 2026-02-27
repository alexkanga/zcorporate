import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const realisationSchema = z.object({
  titleFr: z.string().min(1, "French title is required"),
  titleEn: z.string().min(1, "English title is required"),
  descriptionFr: z.string().optional(),
  descriptionEn: z.string().optional(),
  client: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  imageUrl: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  categoryId: z.string().optional().nullable(),
});

// GET /api/admin/realisations
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
          { client: { contains: search } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(published !== null && published !== "all" && { published: published === "true" }),
    };

    const [realisations, total] = await Promise.all([
      db.realisation.findMany({
        where,
        include: {
          category: {
            select: { id: true, nameFr: true, nameEn: true, slug: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.realisation.count({ where }),
    ]);

    return NextResponse.json({
      realisations: realisations.map((r) => ({
        ...r,
        gallery: r.gallery ? JSON.parse(r.gallery) : [],
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching realisations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/realisations
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
    const data = realisationSchema.parse(body);

    const realisation = await db.realisation.create({
      data: {
        titleFr: data.titleFr,
        titleEn: data.titleEn,
        descriptionFr: data.descriptionFr || null,
        descriptionEn: data.descriptionEn || null,
        client: data.client || null,
        date: data.date ? new Date(data.date) : null,
        location: data.location || null,
        imageUrl: data.imageUrl || null,
        gallery: data.gallery && data.gallery.length > 0 ? JSON.stringify(data.gallery) : null,
        published: data.published ?? false,
        featured: data.featured ?? false,
        categoryId: data.categoryId || null,
      },
      include: {
        category: {
          select: { id: true, nameFr: true, nameEn: true, slug: true },
        },
      },
    });

    return NextResponse.json({
      ...realisation,
      gallery: realisation.gallery ? JSON.parse(realisation.gallery) : [],
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating realisation:", error);
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
