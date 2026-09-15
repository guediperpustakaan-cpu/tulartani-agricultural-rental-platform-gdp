import { NextResponse } from "next/server";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { bookings, equipment, payments, reviews } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { addDays, toISODate, todayISO } from "@/lib/utils";

export async function GET() {
  const owner = await getCurrentUser();
  if (!owner || owner.role !== "OWNER") {
    return NextResponse.json({ error: "Hanya pemilik alat yang dapat melihat pendapatan." }, { status: 403 });
  }

  const today = todayISO();
  const start14 = addDays(today, -13);

  const completed = await db
    .select({
      id: bookings.id,
      startDate: bookings.startDate,
      endDate: bookings.endDate,
      totalPrice: bookings.totalPrice,
      status: bookings.status,
      equipmentName: equipment.name,
      paymentDate: payments.paymentDate,
      paymentStatus: payments.paymentStatus,
    })
    .from(bookings)
    .innerJoin(equipment, eq(bookings.equipmentId, equipment.id))
    .leftJoin(payments, eq(payments.bookingId, bookings.id))
    .where(and(eq(equipment.ownerId, owner.id), eq(bookings.status, "COMPLETED")))
    .orderBy(desc(bookings.createdAt));

  const paidCompleted = completed.filter((b) => b.paymentStatus === "PAID");

  // daily totals for last 14 days (based on payment date if available else start date)
  const daily: { date: string; total: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = addDays(today, -i);
    const dayTotal = paidCompleted
      .filter((b) => {
        const base = b.paymentDate ? toISODate(new Date(b.paymentDate)) : b.startDate;
        return base === d;
      })
      .reduce((a, b) => a + b.totalPrice, 0);
    daily.push({ date: d, total: dayTotal });
  }

  const totalIncome = paidCompleted.reduce((a, b) => a + b.totalPrice, 0);
  const [orderCounts] = await Promise.all([
    db
      .select({ status: bookings.status, c: count() })
      .from(bookings)
      .innerJoin(equipment, eq(bookings.equipmentId, equipment.id))
      .where(eq(equipment.ownerId, owner.id))
      .groupBy(bookings.status),
  ]);

  const [ratingRows] = await Promise.all([
    db
      .select({ avg: sql<number>`coalesce(avg(${reviews.rating}), 0)` })
      .from(reviews)
      .innerJoin(bookings, eq(reviews.bookingId, bookings.id))
      .innerJoin(equipment, eq(bookings.equipmentId, equipment.id))
      .where(eq(equipment.ownerId, owner.id)),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const r of orderCounts) statusCounts[r.status] = r.c;

  return NextResponse.json({
    totalIncome,
    avgRating: Number(ratingRows[0]?.avg ?? 0),
    statusCounts,
    daily,
    recent: paidCompleted.slice(0, 10),
  });
}
