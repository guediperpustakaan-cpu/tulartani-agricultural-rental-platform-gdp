import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  ChevronRight,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { bookings, categories, equipment, reviews, users } from "@/db/schema";
import BookingWidget from "./BookingWidget";
import StatusBadge from "@/components/StatusBadge";
import RatingStars from "@/components/RatingStars";
import EmptyState from "@/components/EmptyState";
import { formatDate, formatRupiah, todayISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const equipmentId = Number(id);
  if (Number.isNaN(equipmentId)) notFound();

  const [item] = await db
    .select({
      id: equipment.id,
      name: equipment.name,
      description: equipment.description,
      pricePerDay: equipment.pricePerDay,
      locationLat: equipment.locationLat,
      locationLong: equipment.locationLong,
      locationName: equipment.locationName,
      status: equipment.status,
      imageUrl: equipment.imageUrl,
      isVerified: equipment.isVerified,
      createdAt: equipment.createdAt,
      categoryName: categories.name,
      ownerId: users.id,
      ownerName: users.name,
      ownerPhone: users.phone,
      ownerAddress: users.address,
      ownerVerified: users.is_verified,
    })
    .from(equipment)
    .innerJoin(categories, eq(equipment.categoryId, categories.id))
    .innerJoin(users, eq(equipment.ownerId, users.id))
    .where(eq(equipment.id, equipmentId))
    .limit(1);

  if (!item) notFound();

  const today = todayISO();

  const [conflicts, reviewRows] = await Promise.all([
    db
      .select({ startDate: bookings.startDate, endDate: bookings.endDate })
      .from(bookings)
      .where(
        and(
          eq(bookings.equipmentId, equipmentId),
          gte(bookings.endDate, today),
          sql`${bookings.status} IN ('PENDING', 'CONFIRMED')`
        )
      ),
    db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        renterName: users.name,
      })
      .from(reviews)
      .innerJoin(bookings, eq(reviews.bookingId, bookings.id))
      .innerJoin(users, eq(reviews.renterId, users.id))
      .where(eq(bookings.equipmentId, equipmentId))
      .orderBy(desc(reviews.createdAt)),
  ]);

  const disabledDates = new Set<string>();
  for (const c of conflicts) {
    let d = new Date(c.startDate + "T00:00:00");
    const end = new Date(c.endDate + "T00:00:00");
    while (d <= end) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      disabledDates.add(`${y}-${m}-${day}`);
      d.setDate(d.getDate() + 1);
    }
  }

  const avgRating =
    reviewRows.length > 0
      ? reviewRows.reduce((a, r) => a + r.rating, 0) / reviewRows.length
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-green-700">Beranda</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/katalog" className="hover:text-green-700">Katalog</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-green-900">{item.name}</span>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div>
          {/* Image */}
          <div className="relative overflow-hidden rounded-3xl border border-green-900/10 bg-green-100">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt={item.name} className="aspect-[16/9] w-full object-cover" />
            ) : (
              <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-green-200 to-green-300 text-green-700">
                Alat Pertanian
              </div>
            )}
            <div className="absolute left-4 top-4 flex gap-2">
              <StatusBadge status={item.status} type="equipment" className="bg-white/95 backdrop-blur" />
            </div>
          </div>

          {/* Title */}
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
                {item.categoryName}
              </span>
              <h1 className="mt-2 text-2xl font-extrabold text-green-950 sm:text-3xl">{item.name}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-green-700" /> {item.locationName || "Lokasi tidak disebutkan"}
                </span>
                {item.locationLat && item.locationLong && (
                  <span className="text-xs text-slate-400">
                    ({item.locationLat}, {item.locationLong})
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Rating</p>
              <div className="mt-1 flex items-center gap-2">
                <RatingStars rating={avgRating} />
                <span className="text-sm font-bold text-green-900">
                  {avgRating ? avgRating.toFixed(1) : "Baru"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                {reviewRows.length} ulasan
              </p>
            </div>
          </div>

          {/* Specs */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Spec label="Kategori" value={item.categoryName} />
            <Spec label="Harga / hari" value={formatRupiah(item.pricePerDay)} />
            <Spec label="Status" value={item.status === "AVAILABLE" ? "Tersedia" : item.status === "RENTED" ? "Sedang disewa" : "Perawatan"} />
            <Spec label="Diverifikasi" value={item.isVerified ? "Ya" : "Belum"} />
          </div>

          {/* Description */}
          <div className="mt-6 rounded-3xl border border-green-900/10 bg-white p-6">
            <h2 className="text-lg font-extrabold text-green-950">Deskripsi Alat</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {item.description}
            </p>
          </div>

          {/* Owner */}
          <div className="mt-6 rounded-3xl border border-green-900/10 bg-white p-6">
            <h2 className="text-lg font-extrabold text-green-950">Pemilik Alat</h2>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-700 to-green-900 text-xl font-extrabold text-white">
                {item.ownerName.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-bold text-green-950">
                  {item.ownerName}
                  {item.ownerVerified && (
                    <BadgeCheck className="h-4 w-4 text-sky-500" />
                  )}
                </p>
                <p className="text-sm text-slate-500">{item.ownerAddress || "Alamat belum diisi"}</p>
              </div>
              {item.ownerPhone && (
                <a
                  href={`tel:${item.ownerPhone}`}
                  className="flex items-center gap-2 rounded-full border border-green-700 px-4 py-2 text-sm font-bold text-green-800 transition hover:bg-green-50"
                >
                  <Phone className="h-4 w-4" /> {item.ownerPhone}
                </a>
              )}
            </div>
            <p className="mt-4 flex items-start gap-2 rounded-2xl bg-green-50 p-3 text-xs leading-relaxed text-green-900/80">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
              {item.ownerVerified
                ? "Identitas pemilik telah diverifikasi oleh tim TularTani."
                : "Identitas pemilik belum diverifikasi. Pastikan berkomunikasi dengan baik."}
            </p>
          </div>

          {/* Reviews */}
          <div className="mt-6">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-green-950">
              <MessageSquare className="h-5 w-5 text-amber-600" /> Ulasan Penyewa ({reviewRows.length})
            </h2>
            <div className="mt-4 space-y-4">
              {reviewRows.length === 0 ? (
                <EmptyState
                  title="Belum ada ulasan"
                  description="Jadilah yang pertama memberi ulasan untuk alat ini setelah menyewa."
                />
              ) : (
                reviewRows.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-green-900/10 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-800">
                          <UserRound className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-green-950">{r.renterName}</p>
                          <p className="text-xs text-slate-400">{formatDate(r.createdAt)}</p>
                        </div>
                      </div>
                      <RatingStars rating={r.rating} />
                    </div>
                    {r.comment && (
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{r.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Booking column */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <BookingWidget
            equipmentId={item.id}
            equipmentName={item.name}
            pricePerDay={item.pricePerDay}
            status={item.status}
            disabledDates={[...disabledDates]}
          />
          <div className="mt-4 rounded-2xl border border-green-900/10 bg-white p-4 text-xs leading-relaxed text-slate-500">
            <p className="mb-1 font-bold text-green-900">Syarat & Ketentuan Sewa</p>
            • Penyewa wajib memiliki identitas yang valid.
            <br />• Kerusakan alat akibat kelalaian menjadi tanggung jawab penyewa.
            <br />• Pembatalan dapat dilakukan sebelum pemilik mengonfirmasi pesanan.
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-green-900/10 bg-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-green-950">{value}</p>
    </div>
  );
}
