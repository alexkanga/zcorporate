import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";
import { z } from "zod";
import { MenuLocation } from "@prisma/client";

// Validation schema for menu item
const menuItemSchema = z.object({
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

// GET /api/admin/menus - Get all menu items
export async function GET(request: NextRequest) {
  try {
    // Debug: log cookies
    const cookieHeader = request.headers.get("cookie");
    console.log("API /admin/menus - Cookie header:", cookieHeader?.substring(0, 200));
    
    // Try getToken first (more reliable in App Router)
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    console.log("API /admin/menus - Token:", token ? { id: token.id, email: token.email, role: token.role } : null);
    
    if (!token) {
      console.log("API /admin/menus - Unauthorized: No token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userRole = token.role as string;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      console.log("API /admin/menus - Forbidden: Role is", userRole);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location") as MenuLocation | null;
    
    const whereClause: {
      deletedAt: null;
      location?: MenuLocation;
    } = {
      deletedAt: null,
    };
    
    if (location && ["HEADER", "FOOTER", "BOTH"].includes(location)) {
      whereClause.location = location;
    }
    
    const menuItems = await db.menuItem.findMany({
      where: whereClause,
      orderBy: [{ order: "asc" }],
    });
    
    // Organize items into hierarchy manually
    const allItems = menuItems.map(item => ({
      ...item,
      children: [] as typeof menuItems,
    }));
    
    // Create a map for quick lookup
    const itemMap = new Map(allItems.map(item => [item.id, item]));
    
    // Assign children to their parents
    const rootItems: typeof allItems = [];
    for (const item of allItems) {
      if (item.parentId && itemMap.has(item.parentId)) {
        itemMap.get(item.parentId)!.children.push(item);
      } else {
        rootItems.push(item);
      }
    }
    
    return NextResponse.json(rootItems);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

// POST /api/admin/menus - Create a new menu item
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userRole = token.role as string;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const body = await request.json();
    
    // Validate input
    const validatedData = menuItemSchema.parse(body);
    
    // Check if slug already exists
    const existingItem = await db.menuItem.findFirst({
      where: {
        slug: validatedData.slug,
        deletedAt: null,
      },
    });
    
    if (existingItem) {
      return NextResponse.json(
        { error: "A menu item with this slug already exists" },
        { status: 400 }
      );
    }
    
    // Create menu item
    const menuItem = await db.menuItem.create({
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
    
    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error creating menu item:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/menus - Reorder menu items
export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userRole = token.role as string;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const body = await request.json();
    const { items } = body as { items: Array<{ id: string; order: number; parentId: string | null }> };
    
    // Update order for each item
    const updatePromises = items.map((item) =>
      db.menuItem.update({
        where: { id: item.id },
        data: {
          order: item.order,
          parentId: item.parentId,
        },
      })
    );
    
    await Promise.all(updatePromises);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering menu items:", error);
    return NextResponse.json(
      { error: "Failed to reorder menu items" },
      { status: 500 }
    );
  }
}
