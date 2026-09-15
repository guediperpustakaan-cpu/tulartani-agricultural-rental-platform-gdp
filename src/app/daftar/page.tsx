"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Sprout, UserPlus } from "lucide-react";
import { useAuth, type SessionUser } from "@/store/useAuth";
import { useToast } from "@/store/useToast";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuth((s) => s.setUser);
  const toast = useToast((s) => s.push);
  const [role, setRole] = useState<"RENTER" | "OWNER">("RENTER");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Gagal mendaftar.", "error");
        return;
      }
      setUser(data.user as SessionUser);
      toast("Akun berhasil dibuat. Selamat datang di TularTani! 🎉");
      router.push(role === "OWNER" ? "/pemilik" : "/katalog");
      router.refresh();
    } catch {
      toast("Terjadi kesalahan jaringan.", "error");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-green-900/10 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10";
  const labelCls = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-12">
      <div className="rounded-3xl border border-green-900/10 bg-white p-8 shadow-xl">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-700 to-green-900 text-white shadow">
            <Sprout className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-green-950">Daftar Gratis</h1>
          <p className="mt-1 text-sm text-slate-500">Bergabung dengan ribuan petani Indonesia</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-green-50 p-1.5">
          <RoleButton active={role === "RENTER"} onClick={() => setRole("RENTER")} title="🧑‍🌾 Penyewa" desc="Sewa alat" />
          <RoleButton active={role === "OWNER"} onClick={() => setRole("OWNER")} title="🚜 Pemilik" desc="Sewakan alat" />
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className={labelCls}>Nama Lengkap</label>
            <input required className={inputCls} placeholder="cth. Andi Pratama" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" required className={inputCls} placeholder="nama@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>No. HP</label>
              <input className={inputCls} placeholder="08xx-xxxx-xxxx" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Kata Sandi (min. 6 karakter)</label>
            <input type="password" required minLength={6} className={inputCls} placeholder="••••••••" value={form.password} onChange={(e) => set("password", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Alamat / Lokasi</label>
            <input className={inputCls} placeholder="cth. Desa Sumberjo, Sleman, DIY" value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-green-700 to-green-900 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
            Buat Akun
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/masuk" className="font-bold text-green-700 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

function RoleButton({
  active,
  onClick,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl px-4 py-3 text-left transition",
        active ? "bg-white shadow" : "hover:bg-green-100/60"
      )}
    >
      <p className={cn("text-sm font-extrabold", active ? "text-green-900" : "text-green-800/70")}>{title}</p>
      <p className="text-[11px] text-slate-400">{desc}</p>
    </button>
  );
}
