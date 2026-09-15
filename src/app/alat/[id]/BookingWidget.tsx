"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Info,
  Loader2,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import DateRangePicker, { type DateRange } from "@/components/DateRangePicker";
import { formatDate, formatRupiah, todayISO } from "@/lib/utils";
import { useAuth } from "@/store/useAuth";
import { useToast } from "@/store/useToast";

export default function BookingWidget({
  equipmentId,
  equipmentName,
  pricePerDay,
  status,
  disabledDates,
}: {
  equipmentId: number;
  equipmentName: string;
  pricePerDay: number;
  status: string;
  disabledDates: string[];
}) {
  const user = useAuth((s) => s.user);
  const toast = useToast((s) => s.push);
  const router = useRouter();
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ id: number; total: number } | null>(null);

  const maintenance = status === "MAINTENANCE";

  const days = useMemo(() => {
    if (!range.start || !range.end) return 0;
    const s = new Date(range.start + "T00:00:00").getTime();
    const e = new Date(range.end + "T00:00:00").getTime();
    return Math.round((e - s) / 86400000) + 1;
  }, [range]);

  const total = days * pricePerDay;

  async function book() {
    if (maintenance) return;
    if (!range.start || !range.end) {
      toast("Pilih tanggal mulai dan selesai sewa terlebih dahulu.", "info");
      return;
    }
    if (!user) {
      toast("Silakan masuk terlebih dahulu untuk memesan alat.", "info");
      router.push(`/masuk?next=/alat/${equipmentId}`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId,
          startDate: range.start,
          endDate: range.end,
          totalPrice: total,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Gagal membuat pesanan.", "error");
        return;
      }
      setCreated({ id: data.id, total: data.totalPrice });
      toast("Permintaan sewa berhasil dikirim! Menunggu konfirmasi pemilik.", "success");
    } catch {
      toast("Terjadi kesalahan jaringan. Coba lagi.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <div className="rounded-3xl border border-green-600/20 bg-green-50 p-6 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white">
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <h3 className="mt-4 text-xl font-extrabold text-green-950">Permintaan Sewa Terkirim!</h3>
        <p className="mt-2 text-sm leading-relaxed text-green-900/70">
          Pesanan #{created.id} sebesar <b>{formatRupiah(created.total)}</b> sedang menunggu
          konfirmasi pemilik. Kamu akan mendapat notifikasi setelah disetujui.
        </p>
        <ol className="mx-auto mt-4 max-w-xs space-y-2 text-left text-sm text-green-900/80">
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> Menunggu konfirmasi pemilik</li>
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> Lakukan pembayaran</li>
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> Gunakan alat & beri ulasan</li>
        </ol>
        <Link
          href="/renter/pesanan"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-700 to-green-900 px-6 py-3 text-sm font-bold text-white shadow"
        >
          Lihat Pesanan Saya <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-green-900/10 bg-white p-6 shadow-lg">
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-extrabold text-green-900">
          {formatRupiah(pricePerDay)}
          <span className="text-sm font-medium text-slate-400"> /hari</span>
        </p>
        <span className="flex items-center gap-1 text-xs font-semibold text-green-700">
          <ShieldCheck className="h-4 w-4" /> Aman
        </span>
      </div>

      {maintenance ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <Wrench className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            Alat ini sedang dalam <b>perawatan</b> dan belum bisa disewa. Silakan cek kembali dalam
            beberapa hari.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 rounded-2xl border border-green-900/10 bg-[#f7f8f4] p-4">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              <CalendarDays className="h-4 w-4" /> Pilih Tanggal Sewa
            </p>
            <DateRangePicker disabledDates={disabledDates} value={range} onChange={setRange} />
          </div>

          {range.start && (
            <div className="mt-4 space-y-2 rounded-2xl bg-green-50 p-4 text-sm">
              <Row label="Mulai" value={formatDate(range.start)} />
              <Row label="Selesai" value={range.end ? formatDate(range.end) : "—"} />
              <Row label="Durasi" value={`${days} hari`} />
              <div className="my-1 border-t border-dashed border-green-600/20" />
              <div className="flex items-center justify-between font-extrabold text-green-950">
                <span>Total Sewa</span>
                <span>{formatRupiah(total)}</span>
              </div>
            </div>
          )}

          <button
            onClick={book}
            disabled={submitting || !range.start || !range.end}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-amber-500/30 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CalendarDays className="h-5 w-5" /> Pesan Sekarang
              </>
            )}
          </button>
          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Pemilik akan mengonfirmasi pesananmu. Setelah disetujui, kamu membayar melalui transfer
            bank yang aman.
          </p>
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-green-900/80">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
