import Link from "next/link";
import { Sprout, Globe, Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 bg-green-950 text-green-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-800 text-white">
              <Sprout className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold text-white">
              Tular<span className="text-amber-500">Tani</span>
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-green-200/80">
            Platform ekonomi berbagi untuk alat pertanian. Sewa traktor, drone, dan mesin modern
            dengan mudah — atau hasilkan penghasilan tambahan dari alat yang menganggur.
          </p>
          <div className="mt-5 flex gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-800/60 text-green-100">
              <Globe className="h-4 w-4" />
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-800/60 text-green-100">
              <Mail className="h-4 w-4" />
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-800/60 text-green-100">
              <MessageCircle className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400">Jelajahi</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/katalog" className="hover:text-white">Katalog Alat</Link></li>
            <li><Link href="/daftar" className="hover:text-white">Daftar sebagai Petani</Link></li>
            <li><Link href="/daftar" className="hover:text-white">Sewakan Alat Anda</Link></li>
            <li><Link href="/admin" className="hover:text-white">Portal Admin</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400">Bantuan</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><span className="cursor-pointer hover:text-white">Cara Kerja</span></li>
            <li><span className="cursor-pointer hover:text-white">Pusat Bantuan</span></li>
            <li><span className="cursor-pointer hover:text-white">Kebijakan Privasi</span></li>
            <li><span className="cursor-pointer hover:text-white">Syarat & Ketentuan</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-green-800/60 py-5 text-center text-xs text-green-300/70">
        © {new Date().getFullYear()} TularTani — Berbagi Alat, Tumbuh Bersama. Dibuat dengan ❤️ untuk
        petani Indonesia.
      </div>
    </footer>
  );
}
