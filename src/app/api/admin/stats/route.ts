import { NextResponse } from "next/server";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { bookings, categories, equipment, payments, reviews, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Hanya admin yang dapat mengakses data ini." }, { status: 403 });
  }

  const [userCount, equipmentCount, bookingCount, reviewCount, categoryCount, volume] =
    await Promise.all([
      db.select({ c: count() }).from(users),
      db.select({ c: count() }).from(equipment),
      db.select({ c: count() }).from(bookings),
      db.select({ c: count() }).from(reviews),
      db.select({ c: count() }).from(categories),
      db
        .select({ total: sql<number>`coalesce(sum(${payments.amount}), 0)::int` })
        .from(payments)
        .where(eq(payments.paymentStatus, "PAID")),
    ]);

  const [unverifiedUsers, unverifiedEquipment, recentBookings, bookingStatusCounts] =
    await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          phone: users.phone,
          address: users.address,
          is_verified: users.is_verified,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.is_verified, false))
        .orderBy(desc(users.createdAt))
        .limit(20),
      db
        .select({
          id: equipment.id,
          name: equipment.name,
          ownerName: users.name,
          categoryName: categories.name,
          pricePerDay: equipment.pricePerDay,
          is_verified: equipment.isVerified,
          imageUrl: equipment.imageUrl,
          createdAt: equipment.createdAt,
        })
        .from(equipment)
        .innerJoin(users, eq(equipment.ownerId, users.id))
        .innerJoin(categories, eq(equipment.categoryId, categories.id))
        .where(eq(equipment.isVerified, false))
        .orderBy(desc(equipment.createdAt))
        .limit(20),
      db
        .select({
          id: bookings.id,
          startDate: bookings.startDate,
          endDate: bookings.endDate,
          totalPrice: bookings.totalPrice,
          status: bookings.status,
          createdAt: bookings.createdAt,
          equipmentName: equipment.name,
          renterName: users.name,
          paymentStatus: payments.paymentStatus,
        })
        .from(bookings)
        .innerJoin(equipment, eq(bookings.equipmentId, equipment.id))
        .innerJoin(users, eq(bookings.renterId, users.id))
        .leftJoin(payments, eq(payments.bookingId, bookings.id))
        .orderBy(desc(bookings.createdAt))
        .limit(15),
      db
        .select({
          status: bookings.status,
          c: count(),
        })
        .from(bookings)
        .groupBy(bookings.status),
    ]);

  return NextResponse.json({
    stats: {
      users: userCount[0]?.c ?? 0,
      equipment: equipmentCount[0]?.c ?? 0,
      bookings: bookingCount[0]?.c ?? 0,
      reviews: reviewCount[0]?.c ?? 0,
      categories: categoryCount[0]?.c ?? 0,
      volume: Number(volume[0]?.total ?? 0),
    },
    unverifiedUsers,
    unverifiedEquipment,
    recentBookings,
    bookingStatusCounts,
  });
}
