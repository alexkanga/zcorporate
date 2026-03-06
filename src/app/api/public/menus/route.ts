import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const menuItems = await db.menuItem.findMany({
      where: { 
        deletedAt: null,
        visible: true,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      count: menuItems.length,
      header: menuItems.filter(m => m.location === "HEADER" || m.location === "BOTH"),
      footer: menuItems.filter(m => m.location === "FOOTER" || m.location === "BOTH"),
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
