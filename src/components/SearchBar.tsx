"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar({
  initial = "",
  big = false,
  placeholder = "Cari traktor, drone, mesin giling, atau lokasi…",
}: {
  initial?: string;
  big?: boolean;
  placeholder?: string;
}) {
  const [q, setQ] = useState(initial);
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/katalog?q=${encodeURIComponent(query)}` : "/katalog");
  }

  return (
    <form
      onSubmit={submit}
      className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-700" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-full border border-green-900/10 bg-white pl-12 pr-4 text-green-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-600/10 ${
            big ? "py-4 text-base" : "py-3 text-sm"
          }`}
        />
      </div>
      <button
        type="submit"
        className={`rounded-full bg-gradient-to-r from-amber-500 to-amber-600 font-bold text-white shadow-lg shadow-amber-500/30 transition hover:opacity-90 ${
          big ? "px-8 py-4 text-base" : "px-6 py-3 text-sm"
        }`}
      >
        Cari Alat
      </button>
    </form>
  );
}
