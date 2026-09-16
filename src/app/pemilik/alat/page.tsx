"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Eye, Loader2, Pencil, Plus, Trash2, Wrench } from "lucide-react";
import RequireRole from "@/components/RequireRole";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { ListRowSkeleton } from "@/components/LoadingSkeleton";
import { useAuth } from "@/store/useAuth";
import { useToast } from "@/store/useToast";
import { formatRupiah, cn } from "@/lib/utils";

interface MyEquipment {
  id: number;
  name: string;
  pricePerDay: number;
  locationName: string | null;
  status: string;
  imageUrl: string | null;
  isVerified: boolean;
  categoryName: string | null;
}

export default function MyEquipmentPage() {
  const user = useAuth((s) => s.user);
  const toast = useToast((s) => s.push);
  const [items, setItems] = useState<MyEquipment[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/equipment?owner=${user.id}&semua=1`);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    }
  }, [user]);

  useEffect(() => {
    Promise.resolve().then(() => load()).catch(() => setItems([]));
  }, [load]);

  async function toggleStatus(item: MyEquipment) {
    setBusyId(item.id);
    const next = item.status === "MAINTENANCE" ? "AVAILABLE" : "MAINTENANCE";
    try {
      const res = await fetch(`/api/equipment/${item.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Gagal mengubah status.", "error");
        return;
      }
      toast(
        next === "MAINTENANCE"
          ? "Alat ditandai sedang perawatan."
          : "Alat kembali tersedia untuk disewa."
      );
      await load();
    } catch {
      toast("Terjadi kesalahan jaringan.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: MyEquipment) {
    if (!window.confirm(`Hapus alat "${item.name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/equipment/${item.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Gagal menghapus alat.", "error");
        return;
      }
      toast("Alat berhasil dihapus.");
      await load();
    } catch {
      toast("Terjadi kesalahan jaringan.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <RequireRole role="OWNER">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Manajemen Alat</p>
            <h1 className="mt-1 text-2xl font-extrabold text-green-950 sm:text-3xl">Alat Saya</h1>
          </div>
          <Link
            href="/pemilik/alat/baru"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/30"
          >
            <Plus className="h-4 w-4" /> Tambah Alat
          </Link>
        </div>

        <div className="mt-8">
          {items === null ? (
            <ListRowSkeleton count={4} />
          ) : items.length === 0 ? (
            <EmptyState
              title="Kamu belum punya alat"
              description="Sewakan traktor, drone, atau mesinmu sekarang dan mulai dapatkan penghasilan tambahan."
              actionHref="/pemilik/alat/baru"
              actionLabel="Sewakan Alat Pertama"
            />
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex flex-wrap items-center gap-4 rounded-3xl border border-green-900/10 bg-white p-4 shadow-sm",
                    busyId === item.id && "opacity-70"
                  )}
                >
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-green-100">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/alat/${item.id}`} className="font-bold text-green-950 hover:text-green-700">
                        {item.name}
                      </Link>
                      {item.isVerified ? (
                        <span className="flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700">
                          <BadgeCheck className="h-3 w-3" /> TERVERIFIKASI
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          MENUNGGU VERIFIKASI
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {item.categoryName} • {item.locationName || "-"}
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-green-800">
                      {formatRupiah(item.pricePerDay)}
                      <span className="text-xs font-medium text-slate-400"> /hari</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} type="equipment" />
                    <button
                      onClick={() => toggleStatus(item)}
                      disabled={busyId === item.id}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition",
                        item.status === "MAINTENANCE"
                          ? "border-green-300 text-green-700 hover:bg-green-50"
                          : "border-amber-300 text-amber-700 hover:bg-amber-50"
                      )}
                      title={item.status === "MAINTENANCE" ? "Tandai tersedia" : "Tandai perawatan"}
                    >
                      {busyId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Wrench className="h-3.5 w-3.5" />
                      )}
                      {item.status === "MAINTENANCE" ? "Tersedia" : "Perawatan"}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <IconLink href={`/alat/${item.id}`} icon={<Eye className="h-4 w-4" />} label="Lihat" tone="slate" />
                    <IconLink href={`/pemilik/alat/${item.id}/edit`} icon={<Pencil className="h-4 w-4" />} label="Edit" tone="green" />
                    <button
                      onClick={() => remove(item)}
                      disabled={busyId === item.id}
                      className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      {busyId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RequireRole>
  );
}

function IconLink({
  href,
  icon,
  label,
  tone,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  tone: "green" | "slate";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition",
        tone === "green"
          ? "border-green-300 text-green-700 hover:bg-green-50"
          : "border-slate-300 text-slate-600 hover:bg-slate-50"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
