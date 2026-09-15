import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  HandCoins,
  MapPin,
  ShieldCheck,
  Search,
  Sprout,
  Star,
  Tractor,
  Wallet,
} from "lucide-react";
import { desc, eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { bookings, categories, equipment, reviews, users } from "@/db/schema";
import SearchBar from "@/components/SearchBar";
import EquipmentCard, { type EquipmentCardData } from "@/components/EquipmentCard";
import CategoryIcon from "@/components/CategoryIcon";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

const steps = [
  {
    icon: Search,
    title: "Cari Alat",
    desc: "Temukan traktor, drone, atau mesin giling terdekat dengan filter harga, kategori, dan lokasi.",
  },
  {
    icon: CalendarCheck,
    title: "Pilih Tanggal & Pesan",
    desc: "Tentukan tanggal sewa yang kamu butuhkan, hitung biaya otomatis, lalu kirim permintaan.",
  },
  {
    icon: HandCoins,
    title: "Pemilik Konfirmasi",
    desc: "Pemilik alat menyetujui pesananmu, lalu kamu membayar dengan aman melalui platform.",
  },
  {
    icon: Star,
    title: "Gunakan & Beri Nilai",
    desc: "Gunakan alat untuk panenmu, lalu beri ulasan agar petani lain terbantu.",
  },
];

export default async function HomePage() {
  const [categoryRows, featuredRows, countRows] = await Promise.all([
    db.select().from(categories).orderBy(categories.id),
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
        ownerName: users.name,
      })
      .from(equipment)
      .innerJoin(categories, eq(equipment.categoryId, categories.id))
      .innerJoin(users, eq(equipment.ownerId, users.id))
      .where(and(eq(equipment.isVerified, true), eq(equipment.status, "AVAILABLE")))
      .orderBy(desc(equipment.createdAt))
      .limit(8),
    db
      .select({
        equipmentCount: sql<number>`count(*)::int`,
      })
      .from(equipment),
    db.select({ count: sql<number>`count(*)::int` }).from(users),
  ]);

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

  const featured: EquipmentCardData[] = featuredRows.map((e) => {
    const r = ratingMap.get(e.id);
    return {
      ...e,
      ratingAvg: r ? r.sum / r.count : null,
      reviewCount: r?.count ?? 0,
    };
  });

  const totalEquipment = countRows[0]?.equipmentCount ?? 0;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hero.jpg" alt="Traktor di sawah" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-green-950/85 via-green-950/70 to-green-950/80" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
          <div className="max-w-3xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Sprout className="h-4 w-4" /> Ekonomi Berbagi untuk Pertanian Indonesia
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Sewa Alat Pertanian Modern,{" "}
              <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                Tanpa Harus Membeli
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-green-100/90 sm:text-lg">
              Traktor, drone penyemprot, mesin giling, hingga pompa air — sewa harian dengan harga
              terjangkau dari petani di sekitarmu. Atau sewakan alatmu dan dapatkan penghasilan
              tambahan.
            </p>

            <div className="mt-8 rounded-3xl border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-md sm:p-4">
              <SearchBar big />
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 text-white">
              <Stat value={`${totalEquipment}+`} label="Alat Tersedia" />
              <Stat value="12K+" label="Petani Bergabung" />
              <Stat value="500+" label="Kabupaten Terjangkau" />
            </div>
          </div>
        </div>
      </section>

      {/* KATEGORI */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Kategori</p>
            <h2 className="mt-1 text-2xl font-extrabold text-green-950 sm:text-3xl">
              Jelajahi Kategori Alat
            </h2>
          </div>
          <Link
            href="/katalog"
            className="hidden items-center gap-1 text-sm font-bold text-green-800 hover:text-green-600 sm:flex"
          >
            Lihat Semua <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="no-scrollbar mt-6 flex gap-3 overflow-x-auto pb-2">
          {categoryRows.map((c) => (
            <Link
              key={c.id}
              href={`/katalog?kategori=${c.id}`}
              className="flex w-36 shrink-0 flex-col items-center gap-2 rounded-2xl border border-green-900/10 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-green-600 hover:shadow-md sm:w-40"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-green-200 text-green-800">
                <CategoryIcon icon={c.icon} className="h-7 w-7" />
              </span>
              <span className="text-sm font-bold text-green-950">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CARA KERJA */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Cara Kerja</p>
            <h2 className="mt-1 text-2xl font-extrabold text-green-950 sm:text-3xl">
              Sewa Alat dalam 4 Langkah Mudah
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="relative rounded-2xl border border-green-900/10 bg-[#f7f8f4] p-6 transition hover:shadow-md"
              >
                <span className="absolute right-5 top-4 text-4xl font-extrabold text-green-900/10">
                  {i + 1}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-700 to-green-900 text-white shadow">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-bold text-green-950">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALAT UNGGULAN */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Pilihan Terbaik</p>
            <h2 className="mt-1 text-2xl font-extrabold text-green-950 sm:text-3xl">Alat Unggulan</h2>
          </div>
          <Link
            href="/katalog"
            className="flex items-center gap-1 text-sm font-bold text-green-800 hover:text-green-600"
          >
            Lihat Semua <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8">
          {featured.length === 0 ? (
            <EmptyState
              title="Belum ada alat tersedia"
              description="Alat unggulan akan muncul di sini. Coba cek kembali nanti, atau jelajahi katalog lengkap."
              actionHref="/katalog"
              actionLabel="Buka Katalog"
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featured.map((item) => (
                <EquipmentCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* KENAPA TULARTANI */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="grid gap-6 rounded-3xl bg-gradient-to-br from-green-900 to-green-950 p-8 text-white sm:p-12 lg:grid-cols-3">
          <Feature
            icon={Tractor}
            title="Hemat & Efisien"
            desc="Tidak semua petani perlu membeli alat berat. Sewa hanya saat musim tanam atau panen tiba."
          />
          <Feature
            icon={Wallet}
            title="Penghasilan Tambahan"
            desc="Alat yang menganggur bisa menghasilkan. Tentukan harga sewa sendiri dan kelola jadwalmu."
          />
          <Feature
            icon={ShieldCheck}
            title="Aman & Terpercaya"
            desc="Semua pengguna dan alat diverifikasi admin. Pembayaran dicatat rapi di platform."
          />
        </div>
      </section>

      {/* CTA PEMILIK */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-amber-300/50 bg-gradient-to-r from-amber-50 to-amber-100 p-8 sm:p-12">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-extrabold text-green-950 sm:text-3xl">
                Punya alat yang menganggur di gudang?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-green-900/70 sm:text-base">
                Sewakan traktor atau mesinmu ke ribuan petani di seluruh Indonesia. Kelola pesanan,
                jadwal, dan pendapatan — semua dalam satu dashboard.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/daftar"
                className="rounded-full bg-gradient-to-r from-green-700 to-green-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90"
              >
                Daftar sebagai Pemilik
              </Link>
              <Link
                href="/pemilik"
                className="rounded-full border border-green-900/20 bg-white px-6 py-3 text-sm font-bold text-green-900 transition hover:bg-green-50"
              >
                Lihat Demo Dashboard
              </Link>
            </div>
          </div>
          <MapPin className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 text-green-900/5" />
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-extrabold text-amber-400">{value}</p>
      <p className="text-xs font-medium text-green-100/80 sm:text-sm">{label}</p>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Tractor;
  title: string;
  desc: string;
}) {
  return (
    <div>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-amber-400">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-green-100/80">{desc}</p>
    </div>
  );
}
