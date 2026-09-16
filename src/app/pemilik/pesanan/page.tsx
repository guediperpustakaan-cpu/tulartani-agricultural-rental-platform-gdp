"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, Loader2, Phone, XCircle } from "lucide-react";
import RequireRole from "@/components/RequireRole";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { ListRowSkeleton } from "@/components/LoadingSkeleton";
import { useAuth } from "@/store/useAuth";
import { useToast } from "@/store/useToast";
import { formatDate, formatRupiah, cn } from "@/lib/utils";

interface OrderRow {
  id: number;
  renterName: string;
  renterPhone: string | null;
  equipmentName: string;
  equipmentImage: string | null;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  paymentStatus: string | null;
  createdAt: string;
}

export default function OwnerOrdersPage() {
  const user = useAuth((s) => s.user);
  const toast = useToast((s) => s.push);
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/bookings?owner=${user.id}`);
      const data = await res.json();
      setOrders(data.bookings ?? []);
      } catch {
      setOrders([]);
    }
  }, [user]);

  useEffect(() => {
    Promise.resolve().then(() => load()).catch(() => setOrders([]));
  }, [load]);

  async function act(id: number, action: string, successMsg: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Gagal memproses pesanan.", "error");
        return;
      }
      toast(successMsg, action === "reject" ? "info" : "success");
      await load();
    } catch {
      toast("Terjadi kesalahan jaringan.", "error");
    } finally {
      setBusyId(null);
    }
  }

  const pending = (orders ?? []).filter((o) => o.status === "PENDING");
  const active = (orders ?? []).filter((o) => o.status === "CONFIRMED");
  const rest = (orders ?? []).filter((o) => o.status !== "PENDING" && o.status !== "CONFIRMED");

  return (
    <RequireRole role="OWNER">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Manajemen Pesanan</p>
        <h1 className="mt-1 text-2xl font-extrabold text-green-950 sm:text-3xl">Pesanan Masuk</h1>
        <p className="mt-1 text-sm text-slate-500">
          Konfirmasi atau tolak permintaan sewa dari penyewa.
        </p>

        {orders === null ? (
          <div className="mt-8">
            <ListRowSkeleton count={4} />
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="Belum ada pesanan masuk"
              description="Setelah penyewa memesan alatmu, pesanan akan muncul di sini."
              actionHref="/pemilik/alat/baru"
              actionLabel="Sewakan Alat"
            />
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            <OrderSection title={`Menunggu Konfirmasi (${pending.length})`} accent="border-amber-300 bg-amber-50/60">
              {pending.map((o) => (
                <OrderCard
                  key={o.id}
                  o={o}
                  busy={busyId === o.id}
                  actions={
                    <>
                      <ActionButton
                        tone="green"
                        loading={busyId === o.id}
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        onClick={() => act(o.id, "confirm", "Pesanan dikonfirmasi! Penyewa sekarang dapat membayar.")}
                        label="Terima"
                      />
                      <ActionButton
                        tone="red"
                        loading={busyId === o.id}
                        icon={<XCircle className="h-4 w-4" />}
                        onClick={() => act(o.id, "reject", "Pesanan ditolak.")}
                        label="Tolak"
                      />
                    </>
                  }
                />
              ))}
            </OrderSection>

            <OrderSection title={`Sedang Berjalan (${active.length})`} accent="border-sky-300 bg-sky-50/60">
              {active.map((o) => (
                <OrderCard
                  key={o.id}
                  o={o}
                  busy={busyId === o.id}
                  actions={
                    o.paymentStatus === "PAID" ? (
                      <ActionButton
                        tone="green"
                        loading={busyId === o.id}
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        onClick={() => act(o.id, "complete", "Sewa ditandai selesai. Pendapatan tercatat! 🎉")}
                        label="Tandai Selesai"
                      />
                    ) : (
                      <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
                        Menunggu pembayaran penyewa
                      </span>
                    )
                  }
                />
              ))}
            </OrderSection>

            <OrderSection title={`Riwayat (${rest.length})`} accent="border-green-900/10 bg-white">
              {rest.map((o) => (
                <OrderCard key={o.id} o={o} busy={false} actions={null} />
              ))}
            </OrderSection>
          </div>
        )}
      </div>
    </RequireRole>
  );
}

function OrderSection({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className={cn("mb-3 inline-block rounded-full border px-4 py-1.5 text-sm font-extrabold", accent)}>
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function OrderCard({
  o,
  busy,
  actions,
}: {
  o: OrderRow;
  busy: boolean;
  actions: React.ReactNode | null;
}) {
  return (
    <div className={cn("rounded-3xl border border-green-900/10 bg-white p-5 shadow-sm", busy && "opacity-70")}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-green-100">
            {o.equipmentImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={o.equipmentImage} alt={o.equipmentName} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-green-950">{o.equipmentName}</p>
              <StatusBadge status={o.paymentStatus === "PAID" && o.status === "CONFIRMED" ? "PAID" : o.status} />
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
              🧑‍🌾 {o.renterName}
              {o.renterPhone && (
                <a href={`tel:${o.renterPhone}`} className="ml-2 flex items-center gap-1 text-xs font-bold text-green-700 hover:underline">
                  <Phone className="h-3 w-3" /> {o.renterPhone}
                </a>
              )}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <CalendarDays className="h-3.5 w-3.5" /> {formatDate(o.startDate)} – {formatDate(o.endDate)}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <p className="text-lg font-extrabold text-green-900">{formatRupiah(o.totalPrice)}</p>
          <div className="flex gap-2">{actions}</div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  tone,
  icon,
  loading,
}: {
  label: string;
  onClick: () => void;
  tone: "green" | "red";
  icon?: React.ReactNode;
  loading?: boolean;
}) {
  const tones = {
    green: "bg-green-700 text-white hover:bg-green-800",
    red: "border border-red-200 text-red-600 hover:bg-red-50",
  };
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shadow-sm transition disabled:opacity-60",
        tones[tone]
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {label}
    </button>
  );
}
