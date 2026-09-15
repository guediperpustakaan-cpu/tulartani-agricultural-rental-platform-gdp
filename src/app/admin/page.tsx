"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Loader2,
  Package,
  Settings,
  Star,
  Users,
} from "lucide-react";
import RequireRole from "@/components/RequireRole";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { ListRowSkeleton } from "@/components/LoadingSkeleton";
import { useToast } from "@/store/useToast";
import { formatDate, formatDateTime, formatRupiah, cn } from "@/lib/utils";

interface AdminData {
  stats: {
    users: number;
    equipment: number;
    bookings: number;
    reviews: number;
    categories: number;
    volume: number;
  };
  unverifiedUsers: any[];
  unverifiedEquipment: any[];
  recentBookings: any[];
  bookingStatusCounts: { status: string; c: number }[];
}

type Tab = "ikhtisar" | "users" | "equipment" | "transaksi";

export default function AdminDashboard() {
  const toast = useToast((s) => s.push);
  const [data, setData] = useState<AdminData | null>(null);
  const [tab, setTab] = useState<Tab>("ikhtisar");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) return;
      setData(await res.json());
    } catch {
      setData(null);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function verifyUser(id: number, verified: boolean) {
    setBusy(`u-${id}`);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_verified: verified }),
    });
    const d = await res.json();
    if (!res.ok) {
      toast(d.error || "Gagal memperbarui pengguna.", "error");
    } else {
      toast(verified ? "Pengguna berhasil diverifikasi. ✅" : "Verifikasi pengguna dicabut.");
      await load();
    }
    setBusy(null);
  }

  async function verifyEquipment(id: number, verified: boolean) {
    setBusy(`e-${id}`);
    const res = await fetch(`/api/admin/equipment/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_verified: verified }),
    });
    const d = await res.json();
    if (!res.ok) {
      toast(d.error || "Gagal memperbarui alat.", "error");
    } else {
      toast(verified ? "Alat berhasil diverifikasi dan tampil di katalog. ✅" : "Verifikasi alat dicabut.");
      await load();
    }
    setBusy(null);
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "ikhtisar", label: "Ikhtisar" },
    { id: "users", label: "Verifikasi Pengguna", count: data?.unverifiedUsers.length },
    { id: "equipment", label: "Verifikasi Alat", count: data?.unverifiedEquipment.length },
    { id: "transaksi", label: "Transaksi" },
  ];

  return (
    <RequireRole role="ADMIN">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Dashboard Admin</p>
            <h1 className="mt-1 text-2xl font-extrabold text-green-950 sm:text-3xl">Panel Kontrol Platform</h1>
            <p className="mt-1 text-sm text-slate-500">Pantau transaksi dan verifikasi pengguna & alat.</p>
          </div>
          <Link
            href="/admin/kategori"
            className="flex items-center gap-2 rounded-full border border-green-900/20 bg-white px-5 py-2.5 text-sm font-bold text-green-900 shadow-sm hover:bg-green-50"
          >
            <Settings className="h-4 w-4" /> Kelola Kategori
          </Link>
        </div>

        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition",
                tab === t.id
                  ? "bg-green-900 text-white shadow"
                  : "border border-green-900/15 bg-white text-green-900 hover:bg-green-50"
              )}
            >
              {t.label}
              {typeof t.count === "number" && t.count > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {data === null ? (
          <div className="mt-8">
            <ListRowSkeleton count={4} />
          </div>
        ) : (
          <>
            {tab === "ikhtisar" && (
              <div className="mt-8">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
                  <StatCard icon={Users} label="Pengguna" value={data.stats.users} tone="green" />
                  <StatCard icon={Package} label="Alat" value={data.stats.equipment} tone="amber" />
                  <StatCard icon={Banknote} label="Volume Transaksi" value={formatRupiah(data.stats.volume)} tone="sky" />
                  <StatCard icon={Star} label="Ulasan" value={data.stats.reviews} tone="violet" />
                  <StatCard icon={BadgeCheck} label="Pesanan" value={data.stats.bookings} tone="amber" />
                  <StatCard icon={Settings} label="Kategori" value={data.stats.categories} tone="green" />
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-3xl border border-green-900/10 bg-white p-6">
                    <h2 className="text-lg font-extrabold text-green-950">Antrean Verifikasi</h2>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
                        <span className="font-semibold text-amber-800">Pengguna belum diverifikasi</span>
                        <span className="text-xl font-extrabold text-amber-700">{data.unverifiedUsers.length}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-sky-50 px-4 py-3">
                        <span className="font-semibold text-sky-800">Alat menunggu verifikasi</span>
                        <span className="text-xl font-extrabold text-sky-700">{data.unverifiedEquipment.length}</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-green-900/10 bg-white p-6">
                    <h2 className="text-lg font-extrabold text-green-950">Status Pesanan</h2>
                    <div className="mt-4 space-y-2">
                      {["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED"].map((s) => {
                        const c = data.bookingStatusCounts.find((x) => x.status === s)?.c ?? 0;
                        return (
                          <div key={s} className="flex items-center justify-between">
                            <StatusBadge status={s} />
                            <span className="text-sm font-extrabold text-green-900">{c}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "users" && (
              <div className="mt-8">
                {data.unverifiedUsers.length === 0 ? (
                  <p className="rounded-2xl border border-green-900/10 bg-white p-8 text-center text-sm text-slate-500">
                    🎉 Semua pengguna sudah terverifikasi.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.unverifiedUsers.map((u) => (
                      <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-green-900/10 bg-white p-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 font-extrabold text-green-800">
                            {u.name.charAt(0)}
                          </span>
                          <div>
                            <p className="font-bold text-green-950">
                              {u.name}
                              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                                {u.role === "OWNER" ? "PEMILIK" : u.role === "ADMIN" ? "ADMIN" : "PENYEWA"}
                              </span>
                            </p>
                            <p className="text-xs text-slate-500">
                              {u.email} • {u.phone || "-"} • Daftar {formatDate(u.createdAt)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => verifyUser(u.id, true)}
                          disabled={busy === `u-${u.id}`}
                          className="flex items-center gap-1.5 rounded-full bg-green-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-green-800 disabled:opacity-60"
                        >
                          {busy === `u-${u.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                          Verifikasi
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "equipment" && (
              <div className="mt-8">
                {data.unverifiedEquipment.length === 0 ? (
                  <p className="rounded-2xl border border-green-900/10 bg-white p-8 text-center text-sm text-slate-500">
                    🎉 Semua alat sudah terverifikasi.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.unverifiedEquipment.map((e) => (
                      <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-green-900/10 bg-white p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 overflow-hidden rounded-lg bg-green-100">
                            {e.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={e.imageUrl} alt={e.name} className="h-full w-full object-cover" />
                            ) : null}
                          </div>
                          <div>
                            <Link href={`/alat/${e.id}`} className="font-bold text-green-950 hover:text-green-700">
                              {e.name}
                            </Link>
                            <p className="text-xs text-slate-500">
                              {e.categoryName} • {e.ownerName} • {formatRupiah(e.pricePerDay)}/hari
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => verifyEquipment(e.id, true)}
                          disabled={busy === `e-${e.id}`}
                          className="flex items-center gap-1.5 rounded-full bg-green-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-green-800 disabled:opacity-60"
                        >
                          {busy === `e-${e.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                          Verifikasi
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "transaksi" && (
              <div className="mt-8 overflow-hidden rounded-3xl border border-green-900/10 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-green-900/10 bg-[#f7f8f4] text-xs font-bold uppercase tracking-wide text-slate-400">
                        <th className="px-5 py-4">ID</th>
                        <th className="px-5 py-4">Alat</th>
                        <th className="px-5 py-4">Penyewa</th>
                        <th className="px-5 py-4">Periode</th>
                        <th className="px-5 py-4 text-right">Total</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Dibuat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentBookings.map((b) => (
                        <tr key={b.id} className="border-b border-green-900/5 last:border-0">
                          <td className="px-5 py-3 font-bold text-slate-500">#{b.id}</td>
                          <td className="px-5 py-3 font-bold text-green-950">{b.equipmentName}</td>
                          <td className="px-5 py-3">{b.renterName}</td>
                          <td className="px-5 py-3 text-xs text-slate-500">
                            {formatDate(b.startDate)} – {formatDate(b.endDate)}
                          </td>
                          <td className="px-5 py-3 text-right font-extrabold text-green-800">
                            {formatRupiah(b.totalPrice)}
                          </td>
                          <td className="px-5 py-3">
                            <StatusBadge status={b.paymentStatus === "PAID" && b.status === "CONFIRMED" ? "PAID" : b.status} />
                          </td>
                          <td className="px-5 py-3 text-xs text-slate-500">{formatDateTime(b.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </RequireRole>
  );
}
