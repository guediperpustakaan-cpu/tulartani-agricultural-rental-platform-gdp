"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import RequireRole from "@/components/RequireRole";
import CategoryIcon from "@/components/CategoryIcon";
import { ListRowSkeleton } from "@/components/LoadingSkeleton";
import { useToast } from "@/store/useToast";
import { cn } from "@/lib/utils";

const ICON_OPTIONS = [
  "Tractor",
  "Plane",
  "Cog",
  "Droplets",
  "Wheat",
  "SprayCan",
  "Shovel",
  "Zap",
  "Sprout",
];

interface Category {
  id: number;
  name: string;
  icon: string;
}

export default function AdminCategoriesPage() {
  const toast = useToast((s) => s.push);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Tractor");
  const [editing, setEditing] = useState<Category | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast("Nama kategori wajib diisi.", "info");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, icon }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast(data.error || "Gagal menambah kategori.", "error");
    } else {
      toast(`Kategori "${data.category.name}" berhasil ditambahkan. ✅`);
      setName("");
      await load();
    }
    setBusy(false);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (!editing.name.trim()) {
      toast("Nama kategori wajib diisi.", "info");
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/categories/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editing.name, icon: editing.icon }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast(data.error || "Gagal memperbarui kategori.", "error");
    } else {
      toast("Kategori berhasil diperbarui. ✅");
      setEditing(null);
      await load();
    }
    setBusy(false);
  }

  async function remove(c: Category) {
    if (!window.confirm(`Hapus kategori "${c.name}"? Semua alat di kategori ini akan ikut terhapus.`)) return;
    setBusy(true);
    const res = await fetch(`/api/categories/${c.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast(data.error || "Gagal menghapus kategori.", "error");
    } else {
      toast("Kategori berhasil dihapus.");
      await load();
    }
    setBusy(false);
  }

  const inputCls =
    "w-full rounded-xl border border-green-900/10 px-4 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10";

  return (
    <RequireRole role="ADMIN">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Pengaturan</p>
        <h1 className="mt-1 text-2xl font-extrabold text-green-950 sm:text-3xl">Kelola Kategori Alat</h1>
        <p className="mt-1 text-sm text-slate-500">Tambahkan atau ubah kategori alat yang tampil di katalog.</p>

        <form
          onSubmit={editing ? saveEdit : add}
          className="mt-8 rounded-3xl border border-green-900/10 bg-white p-6 shadow-sm"
        >
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-green-950">
            {editing ? `Edit: ${editing.name}` : "Tambah Kategori Baru"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Nama</label>
              <input
                className={inputCls}
                placeholder="cth. Mesin Tanam"
                value={editing ? editing.name : name}
                onChange={(e) => (editing ? setEditing({ ...editing, name: e.target.value }) : setName(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Ikon</label>
              <select
                className={inputCls}
                value={editing ? editing.icon : icon}
                onChange={(e) => (editing ? setEditing({ ...editing, icon: e.target.value }) : setIcon(e.target.value))}
              >
                {ICON_OPTIONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              {editing && (
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 text-slate-500 transition hover:bg-slate-50"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <button
                type="submit"
                disabled={busy}
                className="flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-green-700 to-green-900 px-5 text-sm font-bold text-white shadow transition hover:opacity-90 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editing ? "Simpan" : "Tambah"}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-6">
          {categories === null ? (
            <ListRowSkeleton count={4} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-2xl border border-green-900/10 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-800">
                      <CategoryIcon icon={c.icon} className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-bold text-green-950">{c.name}</p>
                      <p className="text-xs text-slate-400">Ikon: {c.icon}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing({ ...c })}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-green-300 text-green-700 transition hover:bg-green-50"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(c)}
                      className={cn("flex h-9 w-9 items-center justify-center rounded-full border border-red-200 text-red-600 transition hover:bg-red-50")}
                      aria-label="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RequireRole>
  );
}
