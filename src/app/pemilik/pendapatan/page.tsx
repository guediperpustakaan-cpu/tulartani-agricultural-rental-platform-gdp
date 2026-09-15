"use client";

import { useEffect, useState } from "react";
import { Banknote, CalendarCheck, CheckCircle2, Star, TrendingUp } from "lucide-react";
import RequireRole from "@/components/RequireRole";
import StatCard from "@/components/StatCard";
import { ListRowSkeleton } from "@/components/LoadingSkeleton";
import { formatDate, formatRupiah } from "@/lib/utils";

interface Earnings {
  totalIncome: number;
  avgRating: number;
  statusCounts: Record<string, number>;
  daily: { date: string; total: number }[];
  recent: {
    id: number;
    equipmentName: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
  }[];
}

export default function EarningsPage() {
  const [data, setData] = useState<Earnings | null>(null);

  useEffect(() => {
    fetch("/api/owner/earnings")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const maxDaily = Math.max(...(data?.daily.map((d) => d.total) ?? [0]), 1);

  return (
    <RequireRole role="OWNER">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Laporan Keuangan</p>
        <h1 className="mt-1 text-2xl font-extrabold text-green-950 sm:text-3xl">Dashboard Pendapatan</h1>
        <p className="mt-1 text-sm text-slate-500">Pendapatan dari sewa yang telah selesai & dibayar.</p>

        {data === null ? (
          <div className="mt-8">
            <ListRowSkeleton count={3} />
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Banknote} label="Total Pendapatan" value={formatRupiah(data.totalIncome)} tone="green" />
              <StatCard icon={CheckCircle2} label="Sewa Selesai" value={data.statusCounts.COMPLETED ?? 0} tone="amber" />
              <StatCard icon={CalendarCheck} label="Sedang Berjalan" value={data.statusCounts.CONFIRMED ?? 0} tone="sky" />
              <StatCard icon={Star} label="Rating Rata-rata" value={data.avgRating ? data.avgRating.toFixed(1) : "—"} tone="violet" />
            </div>

            {/* Chart */}
            <div className="mt-8 rounded-3xl border border-green-900/10 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-green-950">
                <TrendingUp className="h-5 w-5 text-amber-600" /> Pendapatan 14 Hari Terakhir
              </h2>
              <div className="mt-6 flex h-48 items-end gap-1.5 sm:gap-2">
                {data.daily.map((d) => (
                  <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end self-stretch">
                    <div className="relative flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-green-800 to-green-500 transition-all group-hover:from-amber-600 group-hover:to-amber-400"
                        style={{ height: `${Math.max((d.total / maxDaily) * 100, d.total > 0 ? 6 : 2)}%` }}
                        title={`${formatRupiah(d.total)}`}
                      />
                    </div>
                    <span className="mt-1.5 hidden text-[9px] font-semibold text-slate-400 sm:block">
                      {d.date.slice(8)}/{d.date.slice(5)}
                    </span>
                    <span className="mt-1.5 text-[9px] font-semibold text-slate-400 sm:hidden">
                      {d.date.slice(8)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-400">
                <span>{formatDate(data.daily[0]?.date)}</span>
                <span>Hari ini</span>
              </div>
            </div>

            {/* Recent completed */}
            <div className="mt-8 rounded-3xl border border-green-900/10 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-green-950">Transaksi Selesai Terbaru</h2>
              {data.recent.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                  Belum ada transaksi selesai. Pendapatan akan muncul setelah penyewa menyelesaikan sewanya.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-green-900/10 text-xs font-bold uppercase tracking-wide text-slate-400">
                        <th className="pb-3">Alat</th>
                        <th className="pb-3">Periode</th>
                        <th className="pb-3 text-right">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent.map((r) => (
                        <tr key={r.id} className="border-b border-green-900/5 last:border-0">
                          <td className="py-3 font-bold text-green-950">{r.equipmentName}</td>
                          <td className="py-3 text-slate-600">
                            {formatDate(r.startDate)} – {formatDate(r.endDate)}
                          </td>
                          <td className="py-3 text-right font-extrabold text-green-800">
                            {formatRupiah(r.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </RequireRole>
  );
}
