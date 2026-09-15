import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, reviews, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const equipmentId = url.searchParams.get("equipmentId");
  const bookingId = url.searchParams.get("bookingId");

  const conditions = [];
  if (equipmentId) conditions.push(eq(bookings.equipmentId, Number(equipmentId)));
  if (bookingId) conditions.push(eq(reviews.bookingId, Number(bookingId)));

  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      renterName: users.name,
      bookingId: reviews.bookingId,
    })
    .from(reviews)
    .innerJoin(bookings, eq(reviews.bookingId, bookings.id))
    .innerJoin(users, eq(reviews.renterId, users.id))
    .where(and(...conditions))
    .orderBy(desc(reviews.createdAt));

  return NextResponse.json({ reviews: rows });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });

  const body = await request.json();
  const bookingId = Number(body.bookingId);
  const rating = Number(body.rating);
  const comment = String(body.comment ?? "").trim();

  if (!bookingId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating harus antara 1 sampai 5." }, { status: 400 });
  }

  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  if (!booking) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  if (booking.renterId !== user.id) {
    return NextResponse.json({ error: "Anda bukan penyewa pesanan ini." }, { status: 403 });
  }
  if (booking.status !== "COMPLETED") {
    return NextResponse.json({ error: "Ulasan hanya bisa diberikan setelah sewa selesai." }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.bookingId, bookingId))
    .limit(1);
  if (existing) {
    return NextResponse.json({ error: "Anda sudah memberi ulasan untuk pesanan ini." }, { status: 409 });
  }

  const [created] = await db
    .insert(reviews)
    .values({ bookingId, renterId: user.id, rating, comment })
    .returning();

  return NextResponse.json({ review: created }, { status: 201 });
}
