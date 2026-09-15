"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Save } from "lucide-react";
import { useToast } from "@/store/useToast";
import { formatRupiah } from "@/lib/utils";

export interface EquipmentFormValue {
  id?: number;
  name: string;
  description: string;
  pricePerDay: number;
  categoryId: number;
  locationName: string;
  locationLat: string;
  locationLong: string;
  imageUrl: string;
}

const placeholderImages = [
  "https://images.pexels.com/photos/20033899/pexels-photo-20033899.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/34182367/pexels-photo-34182367.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/28240873/pexels-photo-28240873.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/13065278/pexels-photo-13065278.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
];

export default function EquipmentForm({
  initial,
  categories,
  onSubmit,
  submitLabel = "Simpan Alat",
}: {
  initial?: Partial<EquipmentFormValue>;
  categories: { id: number; name: string }[];
  onSubmit: (values: EquipmentFormValue) => Promise<{ ok: boolean; error?: string }>;
  submitLabel?: string;
}) {
  const router = useRouter();
  const toast = useToast((s) => s.push);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<EquipmentFormValue>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    pricePerDay: initial?.pricePerDay ?? 250000,
    categoryId: initial?.categoryId ?? categories[0]?.id ?? 0,
    locationName: initial?.locationName ?? "",
    locationLat: initial?.locationLat ?? "",
    locationLong: initial?.locationLong ?? "",
    imageUrl: initial?.imageUrl ?? "",
  });

  function set<K extends keyof EquipmentFormValue>(k: K, v: EquipmentFormValue[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.description || !form.pricePerDay || !form.categoryId) {
      toast("Lengkapi semua data wajib terlebih dahulu.", "info");
      return;
    }
    setLoading(true);
    const res = await onSubmit(form);
    setLoading(false);
    if (!res.ok) {
      toast(res.error || "Gagal menyimpan alat.", "error");
      return;
    }
    toast(initial?.id ? "Alat berhasil diperbarui! ✅" : "Alat berhasil ditambahkan! 🎉");
    router.push("/pemilik/alat");
    router.refresh();
  }

  const inputCls =
    "w-full rounded-xl border border-green-900/10 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10";
  const labelCls = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500";

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Nama Alat *</label>
            <input
              className={inputCls}
              placeholder="cth. Traktor Kubota L5018"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Deskripsi *</label>
            <textarea
              className={inputCls}
              rows={5}
              placeholder="Jelaskan kondisi alat, kapasitas, dan ketentuan sewa…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Harga Sewa (Rp/hari) *</label>
              <input
                type="number"
                min={10000}
                step={10000}
                className={inputCls}
                value={form.pricePerDay}
                onChange={(e) => set("pricePerDay", Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-slate-400">{formatRupiah(form.pricePerDay)} / hari</p>
            </div>
            <div>
              <label className={labelCls}>Kategori *</label>
              <select
                className={inputCls}
                value={form.categoryId}
                onChange={(e) => set("categoryId", Number(e.target.value))}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Lokasi (nama wilayah) *</label>
            <input
              className={inputCls}
              placeholder="cth. Desa Sumberjo, Sleman, DI Yogyakarta"
              value={form.locationName}
              onChange={(e) => set("locationName", e.target.value)}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Latitude (opsional)</label>
              <input
                className={inputCls}
                placeholder="-7.7956"
                value={form.locationLat}
                onChange={(e) => set("locationLat", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Longitude (opsional)</label>
              <input
                className={inputCls}
                placeholder="110.3695"
                value={form.locationLong}
                onChange={(e) => set("locationLong", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-green-900/10 bg-white p-4">
            <label className={labelCls}>URL Gambar Alat</label>
            <input
              className={inputCls}
              placeholder="https://…"
              value={form.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
            />
            <div className="mt-4 overflow-hidden rounded-xl border border-green-900/10 bg-green-50">
              {form.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.imageUrl} alt="Pratinjau" className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 text-green-700/60">
                  <ImagePlus className="h-8 w-8" />
                  <span className="text-xs font-semibold">Pratinjau gambar</span>
                </div>
              )}
            </div>
            <p className="mt-3 text-xs font-bold text-slate-400">Atau pilih contoh gambar:</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {placeholderImages.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => set("imageUrl", url)}
                  className={`overflow-hidden rounded-lg border-2 transition ${
                    form.imageUrl === url ? "border-green-600" : "border-transparent hover:border-green-300"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Contoh" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-green-700 to-green-900 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
