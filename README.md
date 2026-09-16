# TularTani

Platform **ekonomi berbagi alat pertanian** untuk petani Indonesia. Sewa traktor, drone, mesin giling, pompa air, dan alat modern lainnya dengan mudah — atau hasilkan penghasilan tambahan dari alat yang sedang tidak terpakai.

> **Open Source oleh MZF — 2026**

---

## ✨ Fitur

- **Akun peran ganda**: Petani/Penyewa, Pemilik Alat, dan Admin.
- **Katalog alat** dengan filter (kata kunci, kategori, rentang harga, lokasi) dan pengurutan (terbaru, harga, rating).
- **Pemesanan sewa** dengan *date picker* real-time, menonaktifkan tanggal yang sudah dibooking.
- **Alur pesanan**: `PENDING → CONFIRMED → PAID → COMPLETED`, beserta `REJECTED` / `CANCELLED`.
- **Pembayaran** melalui transfer bank (status `UNPAID` / `PAID`).
- **Ulasan & rating** penyewa setelah penyewaan selesai.
- **Dashboard pemilik**: kelola alat, konfirmasi/penolakan pesanan, laporan pendapatan.
- **Dashboard admin**: verifikasi akun & alat, kelola kategori, statistik.
- **Autentikasi berbasis cookie** (SHA-256 + salt) dengan session cookie.
- **Gratis & bebas iklan**, dapatkan QR code dukungan kopi kecil di pojok kanan bawah. 😄

---

## 🛠️ Tech Stack

| Layer        | Teknologi |
|--------------|-----------|
| Framework    | [Next.js 16 (App Router, Turbopack)](https://nextjs.org) |
| Database     | PostgreSQL (Neon) |
| ORM          | Drizzle ORM + Drizzle Kit |
| Auth         | Cookie-based session + `crypto` (SHA-256) |
| State        | Zustand (persist auth) |
| UI           | React 19, Tailwind CSS 4, Lucide React |
| QR Code      | `qrcode.react` |
| Deploy       | Vercel |

---

## 🚀 Instalasi

```bash
# 1. Clone & masuk ke folder
git clone https://github.com/guediperpustakaan-cpu/tulartani-agricultural-rental-platform-gdp.git
cd tulartani-agricultural-rental-platform-gdp

# 2. Install dependensi
npm install

# 3. Buat file env (salin dari template)
cp .env.example .env.local
# → isi DATABASE_URL dengan connection string Neon Anda
```

---

## 🗄️ Database (Neon)

Aplikasi memakai PostgreSQL di **Neon**. Schema didefinisikan di [`src/db/schema.ts`](src/db/schema.ts):

| Tabel        | Kolom kunci | Keterangan |
|--------------|-------------|------------|
| `users`      | `id`        | role enum `OWNER/RENTER/ADMIN`, `is_verified` |
| `categories` | `id`        | nama + icon |
| `equipment`  | `id`        | pemilik, kategori, harga/hari, status `AVAILABLE/MAINTENANCE/RENTED`, verifikasi |
| `bookings`   | `id`        | renter, equipment, rentang tanggal, total, status `PENDING/CONFIRMED/COMPLETED/CANCELLED/REJECTED` |
| `payments`   | `id`        | booking, amount, status `UNPAID/PAID` |
| `reviews`    | `id`        | booking, renter, rating 1–5 |

### 1. Konfigurasi koneksi
Salin `.env.example` ke `.env.local` dan isi URL Neon (contoh):

```
DATABASE_URL=postgresql://neondb_owner:npg_xxxx@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. Terapkan skema ke Neon
```bash
npm run db:push      # langsung-sync schema.ts ke DB (dev-friendly)
# atau, pakai migrasi versi (direkomendasikan produksi):
npm run db:migrate   # menerapkan file migrasi di ./drizzle
```

### 3. Isi data contoh
```bash
npm run db:seed
```
Seed melakukan `TRUNCATE ... RESTART IDENTITY CASCADE` lalu mengisi: **8 pengguna** (admin, 4 pemilik, 3 penyewa), **8 kategori**, **12 alat**, **9 booking** (semua status), **9 pembayaran**, **3 ulasan**.

**Akun demo** (password: `password123`):

| Email                 | Peran  |
|-----------------------|--------|
| admin@tulartani.id    | Admin  |
| budi@tulartani.id     | Pemilik |
| andi@tulartani.id     | Penyewa |

Verifikasi cepat koneksi:
```bash
npx tsx -e "import { db } from './src/db'; import { sql } from 'drizzle-orm'; console.log(await db.execute(sql\`SELECT count(*) FROM users\`))"
```

---

## 💻 Pengembangan

```bash
npm run dev        # http://localhost:3000
npm run lint       # ESLint (bersih, 0 error & 0 warning)
npm run typecheck  # tsc --noEmit
npm run build      # produksi
```

---

## ☁️ Deploy ke Vercel

Aplikasi siap deploy ke Vercel. Pastikan variabel berikut tersedia sebagai **Environment Variable** di dashboard Vercel (scope: **Build & Production**):

| Variabel     | Nilai | Keterangan |
|--------------|-------|------------|
| `DATABASE_URL` | URL koneksi Neon Anda | **Wajib** — dibaca `src/db/index.ts` pada waktu build & runtime. Tanpa variabel ini, build akan gagal dengan `DATABASE_URL is required`. |

> `.env.local` hanya untuk **lokal** (otomatis dibaca Next.js dev server) dan **tidak** di-commit (tersimpan di `.gitignore`).

### Skrip khusus Vercel
Di `package.json` tersedia skrip `vercel-build`:

```json
"vercel-build": "npm run db:migrate && npm run build"
```

Vercel memakai `vercel-build` (jika ada) alih-alih `build`, sehingga **migrasi otomatis diterapkan** sebelum build pada setiap deploy. Karena migrasi `0000_init.sql` sudah pernah diaplikasikan ke Neon, langkah tersebut berjalan cepat (no-op).

### Langkah deploy
1. Push kode ke GitHub (`main`).
2. Di Vercel → *New Project* → pilih repo ini.
3. Di **Settings → Environment Variables**, tambahkan `DATABASE_URL` (Build & Production).
4. Deploy.

---

## ☕ Dukung Pengembangan

Aplikasi ini **gratis & bebas iklan**. Di pojok kanan bawah ada widget kopi kecil 🫖. Klik → pilih nominal (Rp6.000 dan kelipatannya) → scan **QR Code** langsung di browser untuk membuka [Trakteer perpus_opera](https://trakteer.id/perpus_opera). Tidak perlu pindah halaman.

---

## 📦 Unduh Source Code

- **Di web**: klik tombol **Download Source Code** pada widget dukungan (pojok kanan bawah).
- **Git**: `https://github.com/guediperpustakaan-cpu/tulartani-agricultural-rental-platform-gdp`
- **ZIP langsung**: [Download main branch (zip)](https://github.com/guediperpustakaan-cpu/tulartani-agricultural-rental-platform-gdp/archive/refs/heads/main.zip)

---

## 📄 Lisensi

**Open Source oleh MZF — 2026**

Kode sumber tersedia di bawah lisensi MIT. Boleh dipakai, dimodifikasi, dan dikontribusikan kembali untuk keperluan edukasi dan pengembangan pertanian berkelanjutan. 🙏
