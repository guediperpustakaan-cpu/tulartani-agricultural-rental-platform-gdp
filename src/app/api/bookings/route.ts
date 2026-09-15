import { NextResponse } from "next/server";
import { and, desc, eq, gte, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { bookings, equipment, payments, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { daysBetween, todayISO } from "@/lib/utils";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });

  const url = new URL(request.url);
  const mine = url.searchParams.get("mine") === "1";
  const owner = url.searchParams.get("owner") === "1";

  const conditions: SQL[] = [];
  if (mine) conditions.push(eq(bookings.renterId, user.id));
  if (owner) conditions.push(eq(bookings.equipmentId, equipment.id), eq(equipment.ownerId, user.id));

  const rows = await db
    .select({
      id: bookings.id,
      renterId: bookings.renterId,
      equipmentId: bookings.equipmentId,
      startDate: bookings.startDate,
      endDate: bookings.endDate,
      totalPrice: bookings.totalPrice,
      status: bookings.status,
      createdAt: bookings.createdAt,
      equipmentName: equipment.name,
      equipmentImage: equipment.imageUrl,
      pricePerDay: equipment.pricePerDay,
      locationName: equipment.locationName,
      renterName: users.name,
      renterPhone: users.phone,
      paymentStatus: payments.paymentStatus,
      paymentDate: payments.paymentDate,
    })
    .from(bookings)
    .innerJoin(equipment, eq(bookings.equipmentId, equipment.id))
    .innerJoin(users, eq(bookings.renterId, users.id))
    .leftJoin(payments, eq(payments.bookingId, bookings.id))
    .where(and(...conditions))
    .orderBy(desc(bookings.createdAt));

  return NextResponse.json({ bookings: rows });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  if (user.role === "ADMIN") {
    return NextResponse.json({ error: "Admin tidak dapat membuat pesanan." }, { status: 403 });
  }

  const body = await request.json();
  const equipmentId = Number(body.equipmentId);
  const startDate = String(body.startDate ?? "");
  const endDate = String(body.endDate ?? "");

  if (!equipmentId || !startDate || !endDate) {
    return NextResponse.json({ error: "Data pesanan tidak lengkap." }, { status: 400 });
  }
  if (startDate < todayISO()) {
    return NextResponse.json({ error: "Tanggal mulai tidak boleh di masa lalu." }, { status: 400 });
  }
  if (endDate < startDate) {
    return NextResponse.json({ error: "Tanggal selesai harus setelah tanggal mulai." }, { status: 400 });
  }

  const [item] = await db.select().from(equipment).where(eq(equipment.id, equipmentId)).limit(1);
  if (!item) return NextResponse.json({ error: "Alat tidak ditemukan." }, { status: 404 });
  if (item.status === "MAINTENANCE") {
    return NextResponse.json({ error: "Alat sedang dalam perawatan." }, { status: 400 });
  }
  if (item.ownerId === user.id) {
    return NextResponse.json({ error: "Anda tidak dapat menyewa alat milik sendiri." }, { status: 400 });
  }

  // overlap check with active bookings
  const overlap = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.equipmentId, equipmentId),
        sql`${bookings.status} IN ('PENDING', 'CONFIRMED')`,
        sql`${bookings.startDate} <= ${endDate} AND ${bookings.endDate} >= ${startDate}`
      )
    )
    .limit(1);
  if (overlap.length > 0) {
    return NextResponse.json({ error: "Tanggal tersebut sudah dipesan oleh penyewa lain." }, { status: 409 });
  }

  const totalPrice = daysBetween(startDate, endDate) * item.pricePerDay;

  const [booking] = await db
    .insert(bookings)
    .values({
      renterId: user.id,
      equipmentId,
      startDate,
      endDate,
      totalPrice,
      status: "PENDING",
    })
    .returning();

  await db.insert(payments).values({
    bookingId: booking.id,
    amount: totalPrice,
    paymentStatus: "UNPAID",
  });

  return NextResponse.json({ ...booking, totalPrice }, { status: 201 });
}
