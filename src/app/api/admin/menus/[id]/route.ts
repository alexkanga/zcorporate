import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema for menu item update
const menuItemUpdateSchema = z.object({
  parentId: z.string().nullable(),
  order: z.number().int().min(0),
  slug: z.string().min(1, "Slug is required"),
  route: z.string().min(1, "Route is required"),
  labelFr: z.string().min(1, "French label is required"),
  labelEn: z.string().min(1, "English label is required"),
  visible: z.boolean(),
  location: z.enum(["HEADER", "FOOTER", "BOTH"]),
  icon: z.string().nullable(),
  external: z.boolean(),
});

// Helper function to check authentication
async function checkAuth(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  if (!token) {
    return { authorized: false, error: "Unauthorized" };
  }
  
  const userRole = token.role as string;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return { authorized: false, error: "Forbidden" };
  }
  
  return { authorized: true, token };
}

// GET /api/admin/menus/[id] - Get a single menu item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.error === "Unauthorized" ? 401 : 403 });
    }
    
    const { id } = await params;
    
    const menuItem = await db.menuItem.findUnique({
      where: { id, deletedAt: null },
      include: {
        other_MenuItem: {
          where: { deletedAt: null },
          orderBy: { order: "asc" },
        },
      },
    });
    
    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }
    
    // Transform to expected format
    const result = {
      ...menuItem,
      children: menuItem.other_MenuItem || [],
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching menu item:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu item" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/menus/[id] - Update a menu item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.error === "Unauthorized" ? 401 : 403 });
    }
    
    const { id } = await params;
    const body = await request.json();
    
    // Validate input
    const validatedData = menuItemUpdateSchema.parse(body);
    
    // Check if menu item exists
    const existingItem = await db.menuItem.findUnique({
      where: { id, deletedAt: null },
    });
    
    if (!existingItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }
    
    // Check for slug conflict (excluding current item)
    const slugConflict = await db.menuItem.findFirst({
      where: {
        slug: validatedData.slug,
        deletedAt: null,
        NOT: { id },
      },
    });
    
    if (slugConflict) {
      return NextResponse.json(
        { error: "A menu item with this slug already exists" },
        { status: 400 }
      );
    }
    
    // Prevent setting parent to self or descendant
    if (validatedData.parentId === id) {
      return NextResponse.json(
        { error: "Cannot set parent to self" },
        { status: 400 }
      );
    }
    
    // Update menu item
    const menuItem = await db.menuItem.update({
      where: { id },
      data: {
        parentId: validatedData.parentId,
        order: validatedData.order,
        slug: validatedData.slug,
        route: validatedData.route,
        labelFr: validatedData.labelFr,
        labelEn: validatedData.labelEn,
        visible: validatedData.visible,
        location: validatedData.location,
        icon: validatedData.icon,
        external: validatedData.external,
      },
    });
    
    return NextResponse.json(menuItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error updating menu item:", error);
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/menus/[id] - Delete a menu item (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.error === "Unauthorized" ? 401 : 403 });
    }
    
    const { id } = await params;
    
    // Check if menu item exists
    const existingItem = await db.menuItem.findUnique({
      where: { id, deletedAt: null },
      include: {
        other_MenuItem: {
          where: { deletedAt: null },
        },
      },
    });
    
    if (!existingItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }
    
    // Soft delete the item and all its children
    const now = new Date();
    
    // Delete children first
    if (existingItem.other_MenuItem.length > 0) {
      await db.menuItem.updateMany({
        where: {
          parentId: id,
          deletedAt: null,
        },
        data: {
          deletedAt: now,
        },
      });
    }
    
    // Delete the item
    await db.menuItem.update({
      where: { id },
      data: {
        deletedAt: now,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
