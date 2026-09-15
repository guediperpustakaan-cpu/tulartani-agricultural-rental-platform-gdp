"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import RequireRole from "@/components/RequireRole";
import EquipmentForm, { type EquipmentFormValue } from "@/components/EquipmentForm";

export default function EditEquipmentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [initial, setInitial] = useState<EquipmentFormValue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/equipment/${params.id}`).then((r) => r.json()),
    ])
      .then(([catData, eqData]) => {
        setCategories(catData.categories ?? []);
        const e = eqData.equipment;
        if (e) {
          setInitial({
            id: e.id,
            name: e.name,
            description: e.description,
            pricePerDay: e.pricePerDay,
            categoryId: e.categoryId,
            locationName: e.locationName,
            locationLat: e.locationLat ?? "",
            locationLong: e.locationLong ?? "",
            imageUrl: e.imageUrl ?? "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  async function onSubmit(values: EquipmentFormValue) {
    const res = await fetch(`/api/equipment/${params.id}`, {
      method: "PUT",
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
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-amber-600">Edit Alat</p>
        <h1 className="mt-1 text-2xl font-extrabold text-green-950 sm:text-3xl">Perbarui Informasi Alat</h1>

        <div className="mt-8 rounded-3xl border border-green-900/10 bg-white p-6 shadow-sm sm:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-green-700" />
            </div>
          ) : initial ? (
            <EquipmentForm
              initial={initial}
              categories={categories}
              onSubmit={onSubmit}
              submitLabel="Simpan Perubahan"
            />
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">Alat tidak ditemukan.</p>
          )}
        </div>
      </div>
    </RequireRole>
  );
}
