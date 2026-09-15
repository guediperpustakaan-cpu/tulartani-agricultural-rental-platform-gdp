"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Star,
  Wallet,
  X,
} from "lucide-react";
import RequireRole from "@/components/RequireRole";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { ListRowSkeleton } from "@/components/LoadingSkeleton";
import { useToast } from "@/store/useToast";
import { formatDate, formatRupiah, cn } from "@/lib/utils";

interface BookingRow {
  id: number;
  equipmentId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  equipmentName: string;
  equipmentImage: string | null;
  pricePerDay: number;
  locationName: string;
  paymentStatus: string | null;
  paymentDate: string | null;
}

const timelineSteps = [
  { label: "Menunggu Konfirmasi", desc: "Pemilik akan menyetujui pesananmu" },
  { label: "Menunggu Pembayaran", desc: "Lakukan pembayaran untuk mengunci jadwal" },
  { label: "Sedang Digunakan", desc: "Alat siap digunakan sesuai jadwal" },
  { label: "Selesai", desc: "Sewa selesai, beri ulasan ya!" },
];

function stepFor(b: BookingRow): number {
  if (b.status === "PENDING") return 0;
  if (b.status === "CONFIRMED" && b.paymentStatus !== "PAID") return 1;
  if (b.status === "CONFIRMED") return 2;
  if (b.status === "COMPLETED") return 3;
  return -1;
}

export default function RenterBookingsPage() {
  const toast = useToast((s) => s.push);
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());
  const [reviewTarget, setReviewTarget] = useState<BookingRow | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings?mine=1");
      if (!res.ok) return;
      const data = await res.json();
      setBookings(data.bookings);
      const done: number[] = [];
      for (const b of data.bookings as BookingRow[]) {
        if (b.status === "COMPLETED") {
          const r = await fetch(`/api/reviews?bookingId=${b.id}`);
          const rd = await r.json();
          if (rd.reviews?.length) done.push(b.id);
        }
      }
      setReviewed(new Set(done));
    } catch {
      setBookings([]);
    }
  }, []);

  useEffect(() => {
    load();
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
        toast(data.error || "Gagal memproses.", "error");
        return;
      }
      toast(successMsg, action === "cancel" ? "info" : "success");
      await load();
    } catch {
      toast("Terjadi kesalahan jaringan.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function pay(id: number) {
    setBusyId(id);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Pembayaran gagal.", "error");
        return;
      }
      toast("Pembayaran berhasil! Alat terkunci untuk jadwalmu. 🎉");
      await load();
    } catch {
      toast("Terjadi kesalahan jaringan.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <RequireRole role="RENTER">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Pesanan Saya</p>
            <h1 className="mt-1 text-2xl font-extrabold text-green-950 sm:text-3xl">Lacak Sewa Alatmu</h1>
          </div>
          <Link
            href="/katalog"
            className="rounded-full bg-gradient-to-r from-green-700 to-green-900 px-5 py-2.5 text-sm font-bold text-white shadow"
          >
            Cari Alat Lagi
          </Link>
        </div>

        <div className="mt-8">
          {bookings === null ? (
            <ListRowSkeleton count={3} />
          ) : bookings.length === 0 ? (
            <EmptyState
              title="Belum ada pesanan"
              description="Yuk cari alat pertanian di katalog dan mulai pesan sewa pertamamu!"
              actionHref="/katalog"
              actionLabel="Jelajahi Katalog"
            />
          ) : (
            <div className="space-y-5">
              {bookings.map((b) => {
                const step = stepFor(b);
                return (
                  <div
                    key={b.id}
                    className="overflow-hidden rounded-3xl border border-green-900/10 bg-white shadow-sm"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-green-900/10 bg-[#f7f8f4] px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-16 overflow-hidden rounded-xl bg-green-100">
                          {b.equipmentImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={b.equipmentImage} alt={b.equipmentName} className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div>
                          <Link href={`/alat/${b.equipmentId}`} className="font-bold text-green-950 hover:text-green-700">
                            {b.equipmentName}
                          </Link>
                          <p className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="h-3 w-3" /> {b.locationName || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          #{b.id}
                        </span>
                        <StatusBadge status={b.paymentStatus === "PAID" && b.status === "CONFIRMED" ? "PAID" : b.status} />
                      </div>
                    </div>

                    {/* Timeline */}
                    {step >= 0 ? (
                      <div className="px-5 pb-4 pt-5">
                        <div className="flex items-center">
                          {timelineSteps.map((s, i) => (
                            <div key={s.label} className="flex flex-1 items-center last:flex-none">
                              <div className="flex flex-col items-center">
                                <span
                                  className={cn(
                                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition",
                                    i < step
                                      ? "bg-green-600 text-white"
                                      : i === step
                                      ? "bg-amber-500 text-white ring-4 ring-amber-100"
                                      : "bg-slate-200 text-slate-500"
                                  )}
                                >
                                  {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                                </span>
                              </div>
                              {i < timelineSteps.length - 1 && (
                                <div
                                  className={cn(
                                    "mx-1 h-0.5 flex-1 rounded",
                                    i < step ? "bg-green-600" : "bg-slate-200"
                                  )}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                          {timelineSteps.map((s, i) => (
                            <div key={s.label}>
                              <p
                                className={cn(
                                  "text-[11px] font-bold",
                                  i === step ? "text-amber-700" : i < step ? "text-green-700" : "text-slate-400"
                                )}
                              >
                                {s.label}
                              </p>
                              <p className="hidden text-[10px] text-slate-400 sm:block">{s.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="px-5 py-4">
                        <p className="text-sm font-semibold text-red-600">
                          {b.status === "REJECTED"
                            ? "Pesanan ditolak oleh pemilik. Cari alat lain yang tersedia."
                            : "Pesanan dibatalkan."}
                        </p>
                      </div>
                    )}

                    {/* Details + actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-green-900/10 px-5 py-4">
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <CalendarDays className="h-4 w-4 text-green-700" />
                          {formatDate(b.startDate)} – {formatDate(b.endDate)}
                        </span>
                        <span className="font-extrabold text-green-900">{formatRupiah(b.totalPrice)}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {b.status === "PENDING" && (
                          <ActionBtn
                            tone="red"
                            loading={busyId === b.id}
                            onClick={() => act(b.id, "cancel", "Pesanan dibatalkan.")}
                            label="Batalkan"
                          />
                        )}
                        {b.status === "CONFIRMED" && b.paymentStatus !== "PAID" && (
                          <>
                            <ActionBtn
                              tone="amber"
                              icon={<Wallet className="h-4 w-4" />}
                              loading={busyId === b.id}
                              onClick={() => pay(b.id)}
                              label="Bayar Sekarang"
                            />
                            <ActionBtn
                              tone="red"
                              loading={busyId === b.id}
                              onClick={() => act(b.id, "cancel", "Pesanan dibatalkan.")}
                              label="Batalkan"
                            />
                          </>
                        )}
                        {b.status === "CONFIRMED" && b.paymentStatus === "PAID" && (
                          <span className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                            <CreditCard className="h-3.5 w-3.5" /> Dibayar {b.paymentDate ? formatDate(b.paymentDate) : ""}
                          </span>
                        )}
                        {b.status === "COMPLETED" &&
                          (reviewed.has(b.id) ? (
                            <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Sudah diulas
                            </span>
                          ) : (
                            <ActionBtn
                              tone="green"
                              icon={<MessageSquare className="h-4 w-4" />}
                              onClick={() => setReviewTarget(b)}
                              label="Beri Ulasan"
                            />
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {reviewTarget && (
        <ReviewModal
          booking={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() => {
            setReviewTarget(null);
            load();
          }}
        />
      )}
    </RequireRole>
  );
}

function ActionBtn({
  label,
  onClick,
  tone,
  icon,
  loading,
}: {
  label: string;
  onClick: () => void;
  tone: "green" | "red" | "amber";
  icon?: React.ReactNode;
  loading?: boolean;
}) {
  const tones = {
    green: "bg-green-700 text-white hover:bg-green-800",
    red: "border border-red-200 text-red-600 hover:bg-red-50",
    amber: "bg-gradient-to-r from-amber-500 to-amber-600 text-white",
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

function ReviewModal({
  booking,
  onClose,
  onSubmitted,
}: {
  booking: BookingRow;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const toast = useToast((s) => s.push);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Gagal mengirim ulasan.", "error");
        return;
      }
      toast("Terima kasih! Ulasanmu sangat membantu petani lain. 🙏");
      onSubmitted();
    } catch {
      toast("Terjadi kesalahan jaringan.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-green-950">Beri Ulasan</h3>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Bagaimana pengalamanmu menyewa <b>{booking.equipmentName}</b>?
        </p>
        <div className="mt-4 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} onClick={() => setRating(i)} aria-label={`Rating ${i}`}>
              <Star
                className={cn(
                  "h-10 w-10 transition",
                  i <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200 hover:fill-amber-200"
                )}
              />
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-sm font-bold text-amber-600">
          {["", "Sangat buruk", "Buruk", "Cukup", "Baik", "Sangat baik"][rating]}
        </p>
        <textarea
          rows={3}
          className="mt-4 w-full rounded-xl border border-green-900/10 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
          placeholder="Ceritakan pengalamanmu (opsional)…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          onClick={submit}
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-green-700 to-green-900 px-6 py-3 text-sm font-extrabold text-white shadow disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Star className="h-4 w-4" />}
          Kirim Ulasan
        </button>
      </div>
    </div>
  );
}
