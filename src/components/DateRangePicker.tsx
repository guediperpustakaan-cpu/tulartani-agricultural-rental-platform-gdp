"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, toISODate, todayISO } from "@/lib/utils";

export interface DateRange {
  start: string | null;
  end: string | null;
}

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function DateRangePicker({
  disabledDates,
  value,
  onChange,
}: {
  disabledDates: string[];
  value: DateRange;
  onChange: (v: DateRange) => void;
}) {
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const disabledSet = useMemo(() => new Set(disabledDates), [disabledDates]);
  const today = todayISO();

  const days = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const startOffset = first.getDay();
    const total = new Date(view.year, view.month + 1, 0).getDate();
    const cells: (string | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= total; d++) {
      cells.push(toISODate(new Date(view.year, view.month, d)));
    }
    return cells;
  }, [view]);

  function prev() {
    setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 }));
  }
  function next() {
    setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 }));
  }

  function pick(date: string) {
    if (date < today || disabledSet.has(date)) return;
    const { start, end } = value;
    if (!start || (start && end)) {
      onChange({ start: date, end: null });
    } else if (date < start) {
      onChange({ start: date, end: null });
    } else {
      onChange({ start, end: date });
    }
  }

  function isDisabled(date: string) {
    return date < today || disabledSet.has(date);
  }

  function inRange(date: string) {
    const { start, end } = value;
    if (!start) return false;
    if (!end) return date === start;
    return date >= start && date <= end;
  }

  function isEndpoint(date: string) {
    return date === value.start || date === value.end;
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={prev}
          className="rounded-full border border-green-900/10 p-1.5 text-green-800 transition hover:bg-green-50"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-bold text-green-950">
          {MONTHS[view.month]} {view.year}
        </p>
        <button
          type="button"
          onClick={next}
          className="rounded-full border border-green-900/10 p-1.5 text-green-800 transition hover:bg-green-50"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1 text-[10px] font-bold uppercase text-slate-400">
            {w}
          </span>
        ))}
        {days.map((date, i) =>
          date === null ? (
            <span key={`e-${i}`} />
          ) : (
            <button
              key={date}
              type="button"
              disabled={isDisabled(date)}
              onClick={() => pick(date)}
              className={cn(
                "relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition",
                isDisabled(date) && "cursor-not-allowed text-slate-300 line-through",
                !isDisabled(date) && !inRange(date) && "text-green-950 hover:bg-green-100",
                inRange(date) && !isEndpoint(date) && "bg-green-100 text-green-900",
                isEndpoint(date) && "bg-green-700 font-bold text-white shadow"
              )}
            >
              {date.slice(8)}
            </button>
          )
        )}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
        Tanggal yang dicoret sudah dipesan oleh penyewa lain.
      </p>
    </div>
  );
}
