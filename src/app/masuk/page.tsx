"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogIn, Sprout } from "lucide-react";
import { useAuth, type SessionUser } from "@/store/useAuth";
import { useToast } from "@/store/useToast";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-700" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuth((s) => s.setUser);
  const toast = useToast((s) => s.push);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Gagal masuk.", "error");
        return;
      }
      setUser(data.user as SessionUser);
      toast(`Selamat datang kembali, ${data.user.name.split(" ")[0]}!`);
      const next = searchParams.get("next");
      const target =
        next ||
        (data.user.role === "ADMIN"
          ? "/admin"
          : data.user.role === "OWNER"
          ? "/pemilik"
          : "/renter/pesanan");
      router.push(target);
      router.refresh();
    } catch {
      toast("Terjadi kesalahan jaringan.", "error");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(role: "ADMIN" | "OWNER" | "RENTER") {
    const demos: Record<string, [string, string]> = {
      ADMIN: ["admin@tulartani.id", "password123"],
      OWNER: ["budi@tulartani.id", "password123"],
      RENTER: ["andi@tulartani.id", "password123"],
    };
    const [em, pw] = demos[role];
    setEmail(em);
    setPassword(pw);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-3xl border border-green-900/10 bg-white p-8 shadow-xl">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-700 to-green-900 text-white shadow">
            <Sprout className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-green-950">Masuk ke TularTani</h1>
          <p className="mt-1 text-sm text-slate-500">Lanjutkan perjalanan bertanimu</p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full rounded-xl border border-green-900/10 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-green-900/10 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-green-700 to-green-900 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
            Masuk
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-dashed border-green-900/20 bg-green-50/60 p-4">
          <p className="text-xs font-bold text-green-900">Akun demo (klik untuk mengisi):</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => fillDemo("RENTER")} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-green-800 shadow-sm hover:bg-green-100">
              🧑‍🌾 Penyewa
            </button>
            <button onClick={() => fillDemo("OWNER")} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-green-800 shadow-sm hover:bg-green-100">
              🚜 Pemilik
            </button>
            <button onClick={() => fillDemo("ADMIN")} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-green-800 shadow-sm hover:bg-green-100">
              🛡️ Admin
            </button>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Semua akun demo menggunakan kata sandi: password123</p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link href="/daftar" className="font-bold text-green-700 hover:underline">
            Daftar gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
