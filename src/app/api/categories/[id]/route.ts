import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Hanya admin yang dapat mengubah kategori." }, { status: 403 });
  }
  const { id } = await params;
  const categoryId = Number(id);
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const icon = String(body.icon ?? "Cog").trim();
  if (!name) {
    return NextResponse.json({ error: "Nama kategori wajib diisi." }, { status: 400 });
  }
  const [updated] = await db
    .update(categories)
    .set({ name, icon })
    .where(eq(categories.id, categoryId))
    .returning();
  if (!updated) {
    return NextResponse.json({ error: "Kategori tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json({ category: updated });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Hanya admin yang dapat menghapus kategori." }, { status: 403 });
  }
  const { id } = await params;
  const categoryId = Number(id);
  await db.delete(categories).where(eq(categories.id, categoryId));
  return NextResponse.json({ ok: true });
}
