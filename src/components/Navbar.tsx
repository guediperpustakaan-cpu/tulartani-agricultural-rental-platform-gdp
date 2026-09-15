"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Sprout,
  Tractor,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "@/store/useAuth";
import { useToast } from "@/store/useToast";
import { cn } from "@/lib/utils";

const roleLinks: Record<string, { href: string; label: string; icon: typeof UserRound }[]> = {
  RENTER: [{ href: "/renter/pesanan", label: "Pesanan Saya", icon: Tractor }],
  OWNER: [
    { href: "/pemilik", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pemilik/alat", label: "Kelola Alat", icon: Tractor },
    { href: "/pemilik/pesanan", label: "Pesanan Masuk", icon: UserRound },
    { href: "/pemilik/pendapatan", label: "Pendapatan", icon: LayoutDashboard },
  ],
  ADMIN: [
    { href: "/admin", label: "Dashboard Admin", icon: ShieldCheck },
    { href: "/admin/kategori", label: "Kategori", icon: Sprout },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const toast = useToast((s) => s.push);
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = user ? roleLinks[user.role] ?? [] : [];
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    toast("Anda telah keluar. Sampai jumpa!", "info");
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-green-900/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-700 to-green-900 text-white shadow">
            <Sprout className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-green-900">
            Tular<span className="text-amber-600">Tani</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="/" active={pathname === "/"} label="Beranda" />
          <NavLink href="/katalog" active={isActive("/katalog")} label="Katalog Alat" />
          {links.map((l) => (
            <NavLink key={l.href} href={l.href} active={isActive(l.href)} label={l.label} />
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 py-1 pl-1 pr-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-700 text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[120px] truncate text-sm font-semibold text-green-900">
                  {user.name.split(" ")[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/masuk"
                className="rounded-full px-4 py-2 text-sm font-semibold text-green-800 transition hover:bg-green-50"
              >
                Masuk
              </Link>
              <Link
                href="/daftar"
                className="rounded-full bg-gradient-to-r from-green-700 to-green-900 px-4 py-2 text-sm font-semibold text-white shadow transition hover:opacity-90"
              >
                Daftar Gratis
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-green-900 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-green-900/10 bg-white px-4 pb-4 pt-2 md:hidden">
          <MobileLink href="/" label="Beranda" onNavigate={() => setOpen(false)} />
          <MobileLink href="/katalog" label="Katalog Alat" onNavigate={() => setOpen(false)} />
          {links.map((l) => (
            <MobileLink key={l.href} href={l.href} label={l.label} onNavigate={() => setOpen(false)} />
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t border-green-100 pt-3">
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="flex items-center justify-center gap-2 rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600"
              >
                <LogOut className="h-4 w-4" /> Keluar ({user.name.split(" ")[0]})
              </button>
            ) : (
              <>
                <Link
                  href="/masuk"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-green-700 px-4 py-2.5 text-center text-sm font-semibold text-green-800"
                >
                  Masuk
                </Link>
                <Link
                  href="/daftar"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-gradient-to-r from-green-700 to-green-900 px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Daftar Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-3.5 py-2 text-sm font-semibold transition",
        active ? "bg-green-100 text-green-900" : "text-green-800/70 hover:bg-green-50 hover:text-green-900"
      )}
    >
      {label}
    </Link>
  );
}

function MobileLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "block rounded-lg px-3 py-2.5 text-sm font-semibold",
        active ? "bg-green-100 text-green-900" : "text-green-800/80"
      )}
    >
      {label}
    </Link>
  );
}
