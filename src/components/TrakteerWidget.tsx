"use client";

import { useState } from "react";
import { Coffee, Download, QrCode, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { formatRupiah } from "@/lib/utils";

const NOMINALS = [6000, 12000, 24000, 48000, 60000];
const TRAKTEER_URL = "https://trakteer.id/perpus_opera";
const SOURCE_ZIP_URL =
  "https://github.com/guediperpustakaan-cpu/tulartani-agricultural-rental-platform-gdp/archive/refs/heads/main.zip";

export default function TrakteerWidget() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);

  const donateUrl = amount ? `${TRAKTEER_URL}/?amount=${amount}` : TRAKTEER_URL;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Web app ini gratis &amp; bebas iklan. Kopi kecil, server tetap jalan"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-xs font-bold text-white shadow-2xl shadow-amber-500/40 backdrop-blur transition hover:opacity-95 md:text-sm"
        aria-label="Dukung pengembangan"
      >
        <Coffee className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">
          Web app ini gratis &amp; bebas iklan. Kopi kecil, server tetap jalan
        </span>
        <span className="sm:hidden">Dukung kopi kecil, server tetap jalan</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setOpen(false);
                setAmount(null);
              }}
              className="absolute top-4 right-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="flex items-center gap-2 text-lg font-extrabold text-green-950">
              <Coffee className="h-5 w-5 text-amber-600" /> Dukung Pengembangan
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Aplikasi ini <b>gratis &amp; bebas iklan</b>. Dukunganmu (secangkir
              kopi) menjaga server tetap berjalan. 🙏
            </p>

            {!amount ? (
              <>
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Pilih nominal traktiran
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {NOMINALS.map((n) => (
                    <button
                      key={n}
                      onClick={() => setAmount(n)}
                      className="flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-bold text-amber-700 transition hover:bg-amber-100"
                    >
                      {formatRupiah(n)}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-slate-400">
                  Nominal mulai dari Rp6.000 (kelipatan). Atau scroll ke bawah dan
                  pilih jumlah lain saat membuka Trakteer.
                </p>
              </>
            ) : (
              <div className="mt-4 flex flex-col items-center gap-3">
                <div className="rounded-2xl border border-green-900/10 bg-[#f7f8f4] p-3">
                  <QRCodeSVG value={donateUrl} size={160} level="Q" />
                </div>
                <p className="text-center text-sm font-bold text-green-900">
                  Dukungan: {formatRupiah(amount)}
                </p>
                <p className="text-center text-[11px] text-slate-500">
                  Scan dengan kamera ponsel Anda. QR membuka halaman Trakteer.
                </p>
                <a
                  href={donateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-95"
                >
                  Buka di Trakteer <QrCode className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => setAmount(null)}
                  className="text-xs font-semibold text-slate-500 underline hover:text-green-800"
                >
                  Pilih nominal lain
                </button>
              </div>
            )}

            <div className="mt-6 border-t border-green-900/10 pt-4 text-center">
              <p className="text-[11px] text-slate-500">
                Open Source oleh <b>MZF</b> &middot; 2026
              </p>
              <a
                href={SOURCE_ZIP_URL}
                download
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-green-700 bg-green-50 px-4 py-2.5 text-xs font-bold text-green-800 transition hover:bg-green-100"
              >
                <Download className="h-3.5 w-3.5" /> Download Source Code
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
