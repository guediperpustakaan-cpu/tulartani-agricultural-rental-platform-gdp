"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import RequireRole from "@/components/RequireRole";
import EquipmentForm, { type EquipmentFormValue } from "@/components/EquipmentForm";

export default function NewEquipmentPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  async function onSubmit(values: EquipmentFormValue) {
    const res = await fetch("/api/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error };
    router.refresh();
    return { ok: true };
  }

  return (
    <RequireRole role="OWNER">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link href="/pemilik/alat" className="flex items-center gap-1 text-sm font-bold text-green-700 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Alat Saya
        </Link>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-amber-600">Alat Baru</p>
        <h1 className="mt-1 text-2xl font-extrabold text-green-950 sm:text-3xl">Sewakan Alat Baru</h1>
        <p className="mt-1 text-sm text-slate-500">
          Lengkapi informasi alat. Setelah dikirim, tim admin akan memverifikasi agar alat tampil di katalog.
        </p>
        <div className="mt-8 rounded-3xl border border-green-900/10 bg-white p-6 shadow-sm sm:p-8">
          <EquipmentForm categories={categories} onSubmit={onSubmit} submitLabel="Kirim untuk Verifikasi" />
        </div>
      </div>
    </RequireRole>
  );
}
