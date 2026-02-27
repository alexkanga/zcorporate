import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const realisationUpdateSchema = z.object({
  titleFr: z.string().min(1, "French title is required").optional(),
  titleEn: z.string().min(1, "English title is required").optional(),
  descriptionFr: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  client: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  gallery: z.array(z.string()).optional().nullable(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  categoryId: z.string().optional().nullable(),
});

// GET /api/admin/realisations/[id]
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

    const realisation = await db.realisation.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: {
          select: { id: true, nameFr: true, nameEn: true, slug: true },
        },
      },
    });

    if (!realisation) {
      return NextResponse.json(
        { error: "Realisation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...realisation,
      gallery: realisation.gallery ? JSON.parse(realisation.gallery) : [],
    });
  } catch (error) {
    console.error("Error fetching realisation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/realisations/[id]
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
    const data = realisationUpdateSchema.parse(body);

    const existing = await db.realisation.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Realisation not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (data.titleFr !== undefined) updateData.titleFr = data.titleFr;
    if (data.titleEn !== undefined) updateData.titleEn = data.titleEn;
    if (data.descriptionFr !== undefined) updateData.descriptionFr = data.descriptionFr;
    if (data.descriptionEn !== undefined) updateData.descriptionEn = data.descriptionEn;
    if (data.client !== undefined) updateData.client = data.client;
    if (data.date !== undefined) updateData.date = data.date ? new Date(data.date) : null;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.gallery !== undefined) {
      updateData.gallery = data.gallery && data.gallery.length > 0 
        ? JSON.stringify(data.gallery) 
        : null;
    }
    if (data.published !== undefined) updateData.published = data.published;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

    const realisation = await db.realisation.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, nameFr: true, nameEn: true, slug: true },
        },
      },
    });

    return NextResponse.json({
      ...realisation,
      gallery: realisation.gallery ? JSON.parse(realisation.gallery) : [],
    });
  } catch (error) {
    console.error("Error updating realisation:", error);
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

// DELETE /api/admin/realisations/[id] - Soft delete
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

    const existing = await db.realisation.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Realisation not found" },
        { status: 404 }
      );
    }

    // Soft delete
    await db.realisation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting realisation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
