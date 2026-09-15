import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { equipment } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item] = await db.select().from(equipment).where(eq(equipment.id, Number(id))).limit(1);
  if (!item) return NextResponse.json({ error: "Alat tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ equipment: item });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });

  const { id } = await params;
  const equipmentId = Number(id);
  const [item] = await db.select().from(equipment).where(eq(equipment.id, equipmentId)).limit(1);
  if (!item) return NextResponse.json({ error: "Alat tidak ditemukan." }, { status: 404 });
  if (item.ownerId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Anda bukan pemilik alat ini." }, { status: 403 });
  }

  const body = await request.json();
  const name = String(body.name ?? item.name).trim();
  const description = String(body.description ?? item.description).trim();
  const pricePerDay = Number(body.pricePerDay ?? item.pricePerDay);
  const categoryId = Number(body.categoryId ?? item.categoryId);
  const locationName = String(body.locationName ?? item.locationName).trim();
  const status = body.status ?? item.status;

  if (!name || !description || !pricePerDay || !categoryId) {
    return NextResponse.json({ error: "Data alat tidak lengkap." }, { status: 400 });
  }

  const [updated] = await db
    .update(equipment)
    .set({
      name,
      description,
      pricePerDay,
      categoryId,
      locationName,
      locationLat: body.locationLat !== undefined ? String(body.locationLat) : item.locationLat,
      locationLong: body.locationLong !== undefined ? String(body.locationLong) : item.locationLong,
      imageUrl: body.imageUrl !== undefined ? String(body.imageUrl) : item.imageUrl,
      status,
    })
    .where(eq(equipment.id, equipmentId))
    .returning();

  return NextResponse.json({ equipment: updated });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });

  const { id } = await params;
  const equipmentId = Number(id);
  const [item] = await db.select().from(equipment).where(eq(equipment.id, equipmentId)).limit(1);
  if (!item) return NextResponse.json({ error: "Alat tidak ditemukan." }, { status: 404 });
  if (item.ownerId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Anda bukan pemilik alat ini." }, { status: 403 });
  }

  await db.delete(equipment).where(eq(equipment.id, equipmentId));
  return NextResponse.json({ ok: true });
}
