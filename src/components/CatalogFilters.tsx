"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterParams {
  q: string;
  kategori: string;
  min: string;
  max: string;
  lokasi: string;
  sort: string;
}

export default function CatalogFilters({
  current,
  categories,
}: {
  current: FilterParams;
  categories: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(current.q ?? "");
  const [lokasi, setLokasi] = useState(current.lokasi ?? "");
  const [kategori, setKategori] = useState(current.kategori ?? "");
  const [min, setMin] = useState(current.min ?? "");
  const [max, setMax] = useState(current.max ?? "");
  const [sort, setSort] = useState(current.sort ?? "terbaru");

  const currentRef = useRef(current);
  currentRef.current = current;

  useEffect(() => setQ(current.q ?? ""), [current.q]);
  useEffect(() => setLokasi(current.lokasi ?? ""), [current.lokasi]);
  useEffect(() => setKategori(current.kategori ?? ""), [current.kategori]);
  useEffect(() => {
    setMin(current.min ?? "");
    setMax(current.max ?? "");
  }, [current.min, current.max]);
  useEffect(() => setSort(current.sort ?? "terbaru"), [current.sort]);

  function apply(patch: Record<string, string>) {
    const merged = { ...currentRef.current, ...patch };
    const params = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v.trim()) params.set(k, v.trim());
    });
    const qs = params.toString();
    router.replace(qs ? `/katalog?${qs}` : "/katalog");
  }

  useEffect(() => {
    if (q === currentRef.current.q) return;
    const t = setTimeout(() => apply({ q }), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    if (lokasi === currentRef.current.lokasi) return;
    const t = setTimeout(() => apply({ lokasi }), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lokasi]);

  const inputCls =
    "w-full rounded-xl border border-green-900/10 bg-white px-3 py-2.5 text-sm text-green-950 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/10";
  const labelCls = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500";

  const form = (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Urutkan</label>
        <select className={inputCls} value={sort} onChange={(e) => apply({ sort: e.target.value })}>
          <option value="terbaru">Terbaru</option>
          <option value="termurah">Harga Terendah</option>
          <option value="termahal">Harga Tertinggi</option>
          <option value="rating">Rating Tertinggi</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Kategori</label>
        <select
          className={inputCls}
          value={kategori}
          onChange={(e) => apply({ kategori: e.target.value })}
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls}>Kisaran Harga (Rp/hari)</label>
        <div className="flex items-center gap-2">
          <input
            className={inputCls}
            type="number"
            min={0}
            placeholder="Min"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            onBlur={() => apply({ min })}
          />
          <span className="text-slate-400">–</span>
          <input
            className={inputCls}
            type="number"
            min={0}
            placeholder="Max"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            onBlur={() => apply({ max })}
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>Lokasi</label>
        <input
          className={inputCls}
          placeholder="Sleman, Malang, …"
          value={lokasi}
          onChange={(e) => setLokasi(e.target.value)}
        />
      </div>
      <button
        onClick={() => {
          setQ("");
          setLokasi("");
          setKategori("");
          setMin("");
          setMax("");
          setSort("terbaru");
          router.replace("/katalog");
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
      >
        <RotateCcw className="h-4 w-4" /> Reset Filter
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-green-900/15 bg-white px-4 py-3 text-sm font-bold text-green-900 shadow-sm md:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" /> Filter & Urutkan
        {open ? <X className="h-4 w-4" /> : null}
      </button>
      {open && (
        <div className="mb-4 rounded-2xl border border-green-900/10 bg-white p-4 shadow-sm md:hidden">
          {form}
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={cn("hidden rounded-2xl border border-green-900/10 bg-white p-5 shadow-sm md:block")}>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-green-950">
          <SlidersHorizontal className="h-4 w-4 text-amber-600" /> Filter
        </h3>
        {form}
      </div>
    </>
  );
}
