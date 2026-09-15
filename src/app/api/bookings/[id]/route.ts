import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, equipment } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { todayISO } from "@/lib/utils";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });

  const { id } = await params;
  const bookingId = Number(id);
  const body = await request.json();
  const action = String(body.action ?? "");

  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  if (!booking) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });

  const [item] = await db.select().from(equipment).where(eq(equipment.id, booking.equipmentId)).limit(1);
  const isOwner = item && item.ownerId === user.id;
  const isAdmin = user.role === "ADMIN";
  const isRenter = booking.renterId === user.id;

  const today = todayISO();
  const activeNow = booking.startDate <= today && booking.endDate >= today;

  if (action === "confirm") {
    if (!isOwner && !isAdmin) return NextResponse.json({ error: "Hanya pemilik alat yang dapat mengonfirmasi." }, { status: 403 });
    if (booking.status !== "PENDING") return NextResponse.json({ error: "Status pesanan tidak valid." }, { status: 400 });
    await db.update(bookings).set({ status: "CONFIRMED" }).where(eq(bookings.id, bookingId));
    if (item && activeNow) await db.update(equipment).set({ status: "RENTED" }).where(eq(equipment.id, item.id));
  } else if (action === "reject") {
    if (!isOwner && !isAdmin) return NextResponse.json({ error: "Hanya pemilik alat yang dapat menolak." }, { status: 403 });
    if (booking.status !== "PENDING") return NextResponse.json({ error: "Status pesanan tidak valid." }, { status: 400 });
    await db.update(bookings).set({ status: "REJECTED" }).where(eq(bookings.id, bookingId));
  } else if (action === "cancel") {
    if (!isRenter && !isAdmin) return NextResponse.json({ error: "Hanya penyewa yang dapat membatalkan." }, { status: 403 });
    if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") {
      return NextResponse.json({ error: "Pesanan sudah tidak dapat dibatalkan." }, { status: 400 });
    }
    await db.update(bookings).set({ status: "CANCELLED" }).where(eq(bookings.id, bookingId));
    if (item) await db.update(equipment).set({ status: "AVAILABLE" }).where(eq(equipment.id, item.id));
  } else if (action === "complete") {
    if (!isOwner && !isAdmin) return NextResponse.json({ error: "Hanya pemilik alat yang dapat menyelesaikan sewa." }, { status: 403 });
    if (booking.status !== "CONFIRMED") {
      return NextResponse.json({ error: "Pesanan harus dibayar sebelum diselesaikan." }, { status: 400 });
    }
    await db.update(bookings).set({ status: "COMPLETED" }).where(eq(bookings.id, bookingId));
    if (item) await db.update(equipment).set({ status: "AVAILABLE" }).where(eq(equipment.id, item.id));
  } else {
    return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
