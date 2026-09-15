"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CalendarCheck,
  Plus,
  Star,
  Tractor,
  TrendingUp,
} from "lucide-react";
import RequireRole from "@/components/RequireRole";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { ListRowSkeleton } from "@/components/LoadingSkeleton";
import { useAuth } from "@/store/useAuth";
import { formatDate, formatRupiah } from "@/lib/utils";

export default function OwnerDashboard() {
  const user = useAuth((s) => s.user);
  const [data, setData] = useState<{
    earnings: { totalIncome: number; avgRating: number; statusCounts: Record<string, number>; recent: any[] };
    equipmentCount: number;
    bookings: any[];
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch("/api/owner/earnings").then((r) => r.json()),
      fetch(`/api/equipment?owner=${user.id}&semua=1`).then((r) => r.json()),
      fetch("/api/bookings?owner=1").then((r) => r.json()),
    ])
      .then(([earnings, eq, bk]) => {
        setData({
          earnings: earnings,
          equipmentCount: eq.items?.length ?? 0,
          bookings: bk.bookings ?? [],
        });
      })
      .catch(() => setData(null));
  }, [user]);

  return (
    <RequireRole role="OWNER">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Dashboard Pemilik</p>
            <h1 className="mt-1 text-2xl font-extrabold text-green-950 sm:text-3xl">
              Halo, {user?.name.split(" ")[0]}! 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">Kelola alat dan pantau pendapatanmu di sini.</p>
          </div>
          <Link
            href="/pemilik/alat/baru"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/30"
          >
            <Plus className="h-4 w-4" /> Sewakan Alat Baru
          </Link>
        </div>

        {data === null ? (
          <div className="mt-8">
            <ListRowSkeleton count={4} />
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Banknote} label="Total Pendapatan" value={formatRupiah(data.earnings.totalIncome)} tone="green" sub="dari sewa yang selesai" />
              <StatCard icon={Tractor} label="Alat Terdaftar" value={data.equipmentCount} tone="amber" sub="alat milikmu" />
              <StatCard icon={CalendarCheck} label="Pesanan Masuk" value={data.earnings.statusCounts.PENDING ?? 0} tone="sky" sub="menunggu konfirmasi" />
              <StatCard icon={Star} label="Rating Rata-rata" value={data.earnings.avgRating ? data.earnings.avgRating.toFixed(1) : "—"} tone="violet" sub="dari ulasan penyewa" />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
              <div className="rounded-3xl border border-green-900/10 bg-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-extrabold text-green-950">
                    <TrendingUp className="h-5 w-5 text-amber-600" /> Pesanan Terbaru
                  </h2>
                  <Link href="/pemilik/pesanan" className="flex items-center gap-1 text-sm font-bold text-green-700 hover:underline">
                    Lihat Semua <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="mt-4 space-y-3">
                  {data.bookings.length === 0 ? (
                    <EmptyState
                      title="Belum ada pesanan"
                      description="Pesanan dari penyewa akan muncul di sini."
                      actionHref="/pemilik/alat/baru"
                      actionLabel="Sewakan Alat"
                    />
                  ) : (
                    data.bookings.slice(0, 6).map((b) => (
                      <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-green-900/10 bg-[#f7f8f4] px-4 py-3">
                        <div>
                          <p className="text-sm font-bold text-green-950">{b.equipmentName}</p>
                          <p className="text-xs text-slate-500">
                            {b.renterName} • {formatDate(b.startDate)} – {formatDate(b.endDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-green-800">{formatRupiah(b.totalPrice)}</span>
                          <StatusBadge status={b.paymentStatus === "PAID" && b.status === "CONFIRMED" ? "PAID" : b.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Link href="/pemilik/pendapatan" className="block rounded-3xl bg-gradient-to-br from-green-900 to-green-950 p-6 text-white shadow-lg">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Pendapatan 14 Hari Terakhir</p>
                  <p className="mt-2 text-3xl font-extrabold">{formatRupiah(data.earnings.totalIncome)}</p>
                  <p className="mt-1 text-xs text-green-200/70">Total dari semua sewa yang selesai</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-amber-400">
                    Lihat Grafik <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
                <div className="rounded-3xl border border-green-900/10 bg-white p-6">
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-green-950">Menu Cepat</h3>
                  <div className="mt-3 space-y-2 text-sm font-semibold">
                    <QuickLink href="/pemilik/alat" label="Kelola Alat" />
                    <QuickLink href="/pemilik/pesanan" label="Pesanan Masuk" />
                    <QuickLink href="/pemilik/alat/baru" label="Tambah Alat Baru" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </RequireRole>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-green-800 transition hover:bg-green-50">
      {label} <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
