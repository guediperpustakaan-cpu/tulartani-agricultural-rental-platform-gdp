import { NextResponse } from "next/server";
import { and, desc, eq, ilike, ne, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { bookings, categories, equipment, reviews } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const kategori = url.searchParams.get("kategori");
  const owner = url.searchParams.get("owner");
  const semua = url.searchParams.get("semua") === "1";

  const conditions: SQL[] = [eq(equipment.isVerified, true)];
  if (!semua) conditions.push(ne(equipment.status, "MAINTENANCE"));
  if (q) conditions.push(or(ilike(equipment.name, `%${q}%`), ilike(equipment.locationName, `%${q}%`))!);
  if (kategori) conditions.push(eq(equipment.categoryId, Number(kategori)));

  if (owner) {
    const ownerId = Number(owner);
    if (!user || (user.id !== ownerId && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Tidak diizinkan melihat data ini." }, { status: 403 });
    }
    conditions.splice(0, conditions.length);
    conditions.push(eq(equipment.ownerId, ownerId));
  }

  const rows = await db
    .select({
      id: equipment.id,
      name: equipment.name,
      description: equipment.description,
      pricePerDay: equipment.pricePerDay,
      locationName: equipment.locationName,
      locationLat: equipment.locationLat,
      locationLong: equipment.locationLong,
      status: equipment.status,
      imageUrl: equipment.imageUrl,
      isVerified: equipment.isVerified,
      categoryId: equipment.categoryId,
      categoryName: categories.name,
      ownerId: equipment.ownerId,
      createdAt: equipment.createdAt,
    })
    .from(equipment)
    .innerJoin(categories, eq(equipment.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(equipment.createdAt));

  const ratingRows = await db
    .select({
      equipmentId: bookings.equipmentId,
      rating: reviews.rating,
    })
    .from(reviews)
    .innerJoin(bookings, eq(reviews.bookingId, bookings.id));

  const ratingMap = new Map<number, { sum: number; count: number }>();
  for (const r of ratingRows) {
    const cur = ratingMap.get(r.equipmentId) ?? { sum: 0, count: 0 };
    cur.sum += r.rating;
    cur.count += 1;
    ratingMap.set(r.equipmentId, cur);
  }

  const items = rows.map((e) => {
    const r = ratingMap.get(e.id);
    return { ...e, ratingAvg: r ? r.sum / r.count : null, reviewCount: r?.count ?? 0 };
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "OWNER" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Hanya pemilik alat yang dapat menambahkan alat." }, { status: 403 });
  }
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  const pricePerDay = Number(body.pricePerDay);
  const categoryId = Number(body.categoryId);
  const locationName = String(body.locationName ?? "").trim();

  if (!name || !description || !pricePerDay || !categoryId) {
    return NextResponse.json({ error: "Nama, deskripsi, harga, dan kategori wajib diisi." }, { status: 400 });
  }

  const [created] = await db
    .insert(equipment)
    .values({
      ownerId: user.id,
      categoryId,
      name,
      description,
      pricePerDay,
      locationName,
      locationLat: body.locationLat ? String(body.locationLat) : null,
      locationLong: body.locationLong ? String(body.locationLong) : null,
      imageUrl: body.imageUrl ? String(body.imageUrl) : null,
      status: "AVAILABLE",
      isVerified: false,
    })
    .returning();

  return NextResponse.json({ equipment: created }, { status: 201 });
}
