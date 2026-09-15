import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, equipment, payments } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { todayISO } from "@/lib/utils";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });

  const body = await request.json();
  const bookingId = Number(body.bookingId);
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  if (!booking) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  if (booking.renterId !== user.id) {
    return NextResponse.json({ error: "Anda bukan penyewa pesanan ini." }, { status: 403 });
  }
  if (booking.status !== "CONFIRMED") {
    return NextResponse.json({ error: "Pesanan belum dikonfirmasi pemilik." }, { status: 400 });
  }

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.bookingId, bookingId))
    .limit(1);

  if (payment && payment.paymentStatus === "PAID") {
    return NextResponse.json({ error: "Pesanan ini sudah dibayar." }, { status: 400 });
  }

  await db
    .update(payments)
    .set({ paymentStatus: "PAID", paymentDate: new Date() })
    .where(eq(payments.bookingId, bookingId));

  const today = todayISO();
  const activeNow = booking.startDate <= today && booking.endDate >= today;
  if (activeNow) {
    await db.update(equipment).set({ status: "RENTED" }).where(eq(equipment.id, booking.equipmentId));
  }

  return NextResponse.json({ ok: true });
}
