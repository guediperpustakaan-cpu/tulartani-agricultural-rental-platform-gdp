import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const rows = await db.select().from(categories).orderBy(desc(categories.id));
  return NextResponse.json({ categories: rows });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Hanya admin yang dapat menambah kategori." }, { status: 403 });
  }
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const icon = String(body.icon ?? "Cog").trim();
  if (!name) {
    return NextResponse.json({ error: "Nama kategori wajib diisi." }, { status: 400 });
  }
  const [created] = await db.insert(categories).values({ name, icon }).returning();
  return NextResponse.json({ category: created }, { status: 201 });
}
