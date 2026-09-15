import { and, desc, eq, gte, ilike, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { bookings, categories, equipment, reviews } from "@/db/schema";
import EquipmentCard, { type EquipmentCardData } from "@/components/EquipmentCard";
import CatalogFilters, { type FilterParams } from "@/components/CatalogFilters";
import EmptyState from "@/components/EmptyState";
import { formatRupiah } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const q = get("q");
  const kategori = get("kategori");
  const min = get("min");
  const max = get("max");
  const lokasi = get("lokasi");
  const sort = get("sort") || "terbaru";

  const conditions: SQL[] = [
    eq(equipment.isVerified, true),
    ne(equipment.status, "MAINTENANCE"),
  ];
  if (q) conditions.push(or(ilike(equipment.name, `%${q}%`), ilike(equipment.locationName, `%${q}%`))!);
  if (kategori) conditions.push(eq(equipment.categoryId, Number(kategori)));
  if (min) conditions.push(gte(equipment.pricePerDay, Number(min)));
  if (max) conditions.push(lte(equipment.pricePerDay, Number(max)));
  if (lokasi) conditions.push(ilike(equipment.locationName, `%${lokasi}%`));

  const [rows, categoryRows, ratingRows, activeCount] = await Promise.all([
    db
      .select({
        id: equipment.id,
        name: equipment.name,
        pricePerDay: equipment.pricePerDay,
        locationName: equipment.locationName,
        status: equipment.status,
        imageUrl: equipment.imageUrl,
        isVerified: equipment.isVerified,
        categoryName: categories.name,
      })
      .from(equipment)
      .innerJoin(categories, eq(equipment.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(equipment.createdAt)),
    db.select().from(categories).orderBy(categories.id),
    db
      .select({
        equipmentId: bookings.equipmentId,
        rating: reviews.rating,
      })
      .from(reviews)
      .innerJoin(bookings, eq(reviews.bookingId, bookings.id)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(equipment)
      .where(and(eq(equipment.isVerified, true), ne(equipment.status, "MAINTENANCE"))),
  ]);

  const ratingMap = new Map<number, { sum: number; count: number }>();
  for (const r of ratingRows) {
    const cur = ratingMap.get(r.equipmentId) ?? { sum: 0, count: 0 };
    cur.sum += r.rating;
    cur.count += 1;
    ratingMap.set(r.equipmentId, cur);
  }

  const items: EquipmentCardData[] = rows.map((e) => {
    const r = ratingMap.get(e.id);
    return { ...e, ratingAvg: r ? r.sum / r.count : null, reviewCount: r?.count ?? 0 };
  });

  if (sort === "termurah") items.sort((a, b) => a.pricePerDay - b.pricePerDay);
  if (sort === "termahal") items.sort((a, b) => b.pricePerDay - a.pricePerDay);
  if (sort === "rating") items.sort((a, b) => (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0));

  const filters: FilterParams = { q, kategori, min, max, lokasi, sort };
  const activeFilterCount = [q, kategori, min, max, lokasi].filter(Boolean).length;

  const minPrice = categoryRows.length
    ? Math.min(...rows.map((r) => r.pricePerDay), 0)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl bg-gradient-to-r from-green-900 to-green-950 px-6 py-8 text-white sm:px-10">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Katalog Alat</p>
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
          {q ? `Hasil pencarian: "${q}"` : "Semua Alat Pertanian"}
        </h1>
        <p className="mt-2 text-sm text-green-100/80">
          {activeCount[0]?.count ?? 0} alat tersedia di seluruh Indonesia — mulai dari{" "}
          {formatRupiah(minPrice)}/hari.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <CatalogFilters current={filters} categories={categoryRows} />
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600">
              Menampilkan <span className="font-extrabold text-green-900">{items.length}</span> alat
              {activeFilterCount > 0 && (
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                  {activeFilterCount} filter aktif
                </span>
              )}
            </p>
          </div>

          {items.length === 0 ? (
            <EmptyState
              title="Tidak ada alat yang cocok"
              description="Coba ubah kata kunci atau hapus beberapa filter untuk melihat lebih banyak alat."
              actionHref="/katalog"
              actionLabel="Reset Pencarian"
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <EquipmentCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
