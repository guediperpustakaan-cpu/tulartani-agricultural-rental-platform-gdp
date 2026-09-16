import "../src/lib/dotenv";
import { createHash, randomBytes } from "crypto";
import { sql } from "drizzle-orm";
import { db } from "../src/db";
import {
  users,
  categories,
  equipment,
  bookings,
  payments,
  reviews,
} from "../src/db/schema";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  return `${salt}:${hash}`;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start + "T00:00:00").getTime();
  const e = new Date(end + "T00:00:00").getTime();
  return Math.round((e - s) / 86400000) + 1;
}

async function main() {
  console.log("🌱 Menyiapkan database TularTani…");

  await db.execute(
    sql`TRUNCATE TABLE reviews, payments, bookings, equipment, categories, users RESTART IDENTITY CASCADE`
  );

  const pw = hashPassword("password123");

  const [admin, budi, sri, ahmad, made, andi, dewi, rudi] = await db
    .insert(users)
    .values([
      { name: "Admin TularTani", email: "admin@tulartani.id", password: pw, phone: "0811-0000-0001", address: "Jakarta Selatan, DKI Jakarta", role: "ADMIN", is_verified: true },
      { name: "Pak Budi Santoso", email: "budi@tulartani.id", password: pw, phone: "0812-3456-7890", address: "Sleman, DI Yogyakarta", role: "OWNER", is_verified: true },
      { name: "Ibu Sri Rahayu", email: "sri@tulartani.id", password: pw, phone: "0813-2345-6789", address: "Bogor, Jawa Barat", role: "OWNER", is_verified: true },
      { name: "Pak Ahmad Fauzi", email: "ahmad@tulartani.id", password: pw, phone: "0815-1111-2222", address: "Karanganyar, Jawa Tengah", role: "OWNER", is_verified: true },
      { name: "Pak Made Wira", email: "made@tulartani.id", password: pw, phone: "0816-3333-4444", address: "Tabanan, Bali", role: "OWNER", is_verified: false },
      { name: "Andi Pratama", email: "andi@tulartani.id", password: pw, phone: "0821-5555-6666", address: "Klaten, Jawa Tengah", role: "RENTER", is_verified: true },
      { name: "Dewi Lestari", email: "dewi@tulartani.id", password: pw, phone: "0822-7777-8888", address: "Sukabumi, Jawa Barat", role: "RENTER", is_verified: true },
      { name: "Rudi Hartono", email: "rudi@tulartani.id", password: pw, phone: "0823-9999-0000", address: "Lumajang, Jawa Timur", role: "RENTER", is_verified: false },
    ])
    .returning();

  const catRows = await db
    .insert(categories)
    .values([
      { name: "Traktor", icon: "Tractor" },
      { name: "Drone Pertanian", icon: "Plane" },
      { name: "Mesin Giling", icon: "Cog" },
      { name: "Pompa Air", icon: "Droplets" },
      { name: "Mesin Pemanen", icon: "Wheat" },
      { name: "Alat Semprot", icon: "SprayCan" },
      { name: "Bajak & Cultivator", icon: "Shovel" },
      { name: "Generator", icon: "Zap" },
    ])
    .returning();

  const cat = (name: string) => catRows.find((c) => c.name === name)!.id;
  const px = (id: number) =>
    `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200`;

  const eqRows = await db
    .insert(equipment)
    .values([
      {
        ownerId: budi.id, categoryId: cat("Traktor"), name: "Traktor Kubota L5018",
        description: "Traktor 4 roda penggerak 4WD, 50 HP. Cocok untuk membajak sawah hingga 2 hektar/hari. Kondisi prima, servis rutin di dealer resmi. Operator dapat disertakan dengan biaya tambahan Rp 150.000/hari.",
        pricePerDay: 750000, locationName: "Sleman, DI Yogyakarta", locationLat: "-7.7161", locationLong: "110.4404",
        status: "AVAILABLE", imageUrl: px(20033899), isVerified: true,
      },
      {
        ownerId: ahmad.id, categoryId: cat("Traktor"), name: "Traktor Tangan Yanmar 6.5 HP",
        description: "Traktor tangan (hand tractor) Yanmar 6.5 HP, ideal untuk lahan sempit dan pengolahan tanah sebelum tanam. Ringan, mudah dioperasikan, dan irit bahan bakar.",
        pricePerDay: 350000, locationName: "Karanganyar, Jawa Tengah", locationLat: "-7.5961", locationLong: "111.0625",
        status: "AVAILABLE", imageUrl: px(34997938), isVerified: true,
      },
      {
        ownerId: sri.id, categoryId: cat("Drone Pertanian"), name: "Drone Penyemprot DJI Agras T30",
        description: "Drone penyemprot kapasitas 30L dengan jangkauan hingga 7 hektar/jam. Dilengkapi RTK untuk akurasi tinggi. Termasuk 2 pasang baterai dan stasiun pengisian.",
        pricePerDay: 1200000, locationName: "Bogor, Jawa Barat", locationLat: "-6.5971", locationLong: "106.8060",
        status: "AVAILABLE", imageUrl: px(34182367), isVerified: true,
      },
      {
        ownerId: made.id, categoryId: cat("Drone Pertanian"), name: "Drone Pemetaan DJI Mavic 3M",
        description: "Drone pemetaan lahan dengan kamera multispektral. Hasilkan peta NDVI untuk memantau kesehatan tanaman. Termasuk kartu memori dan 3 baterai.",
        pricePerDay: 850000, locationName: "Tabanan, Bali", locationLat: "-8.5414", locationLong: "115.1235",
        status: "AVAILABLE", imageUrl: px(34182311), isVerified: false,
      },
      {
        ownerId: budi.id, categoryId: cat("Mesin Giling"), name: "Mesin Giling Padi 2 HP",
        description: "Mesin giling padi kapasitas 200-300 kg/jam. Cocok untuk usaha penggilingan kecil di desa. Mudah dirawat, spare part mudah dicari.",
        pricePerDay: 250000, locationName: "Sleman, DI Yogyakarta", locationLat: "-7.7161", locationLong: "110.4404",
        status: "AVAILABLE", imageUrl: px(5262428), isVerified: true,
      },
      {
        ownerId: ahmad.id, categoryId: cat("Pompa Air"), name: "Pompa Air Diesel 8 PK",
        description: "Pompa air diesel 8 PK dengan debit besar untuk irigasi sawah. Hemat solar, start manual mudah. Termasuk selang 20 meter.",
        pricePerDay: 200000, locationName: "Karanganyar, Jawa Tengah", locationLat: "-7.5961", locationLong: "111.0625",
        status: "RENTED", imageUrl: px(28240873), isVerified: true,
      },
      {
        ownerId: made.id, categoryId: cat("Pompa Air"), name: "Pompa Air Submersible 1.5 KW",
        description: "Pompa celup 1.5 KW untuk irigasi dan kolam. Awet, tahan air, mudah dipasang. Cocok untuk lahan hingga 1 hektar.",
        pricePerDay: 150000, locationName: "Tabanan, Bali", locationLat: "-8.5414", locationLong: "115.1235",
        status: "AVAILABLE", imageUrl: px(36797458), isVerified: false,
      },
      {
        ownerId: sri.id, categoryId: cat("Mesin Pemanen"), name: "Combine Harvester Yanmar YCH6",
        description: "Mesin panen kombinasi Yanmar YCH6. Memotong, merontokkan, dan mengantongi gabah dalam satu proses. Hemat waktu panen hingga 80%.",
        pricePerDay: 1500000, locationName: "Bogor, Jawa Barat", locationLat: "-6.5971", locationLong: "106.8060",
        status: "AVAILABLE", imageUrl: px(13065278), isVerified: true,
      },
      {
        ownerId: budi.id, categoryId: cat("Alat Semprot"), name: "Alat Semprot Elektrik 25L",
        description: "Sprayer elektrik kapasitas 25 liter dengan baterai lithium. Tekanan stabil, pengisian daya cepat. Cocok untuk penyemprotan pestisida dan pupuk cair.",
        pricePerDay: 75000, locationName: "Sleman, DI Yogyakarta", locationLat: "-7.7161", locationLong: "110.4404",
        status: "MAINTENANCE", imageUrl: px(17765487), isVerified: true,
      },
      {
        ownerId: ahmad.id, categoryId: cat("Bajak & Cultivator"), name: "Bajak Singkal 2 Lembar",
        description: "Bajak singkal untuk traktor tangan. Mampu membalik tanah dengan kedalaman 20 cm. Ideal untuk menyiapkan lahan tanam padi.",
        pricePerDay: 100000, locationName: "Karanganyar, Jawa Tengah", locationLat: "-7.5961", locationLong: "111.0625",
        status: "AVAILABLE", imageUrl: px(34632607), isVerified: true,
      },
      {
        ownerId: sri.id, categoryId: cat("Generator"), name: "Generator Listrik 5000 Watt",
        description: "Genset bensin 5000 watt, cocok untuk menggerakkan mesin penggiling atau pompa di lahan tanpa listrik. Suara relatif halus, konsumsi BBM efisien.",
        pricePerDay: 300000, locationName: "Bogor, Jawa Barat", locationLat: "-6.5971", locationLong: "106.8060",
        status: "AVAILABLE", imageUrl: px(17468843), isVerified: true,
      },
      {
        ownerId: made.id, categoryId: cat("Pompa Air"), name: "Paket Sprinkler Irigasi 200m",
        description: "Paket sprinkler irigasi lengkap 200 meter: pipa, sprinkler, dan konektor. Membantu menyiram lahan secara merata dan menghemat air.",
        pricePerDay: 125000, locationName: "Tabanan, Bali", locationLat: "-8.5414", locationLong: "115.1235",
        status: "AVAILABLE", imageUrl: px(27624218), isVerified: false,
      },
    ])
    .returning();

  const eq = (name: string) => eqRows.find((e) => e.name.startsWith(name))!;
  const today = toISODate(new Date());

  // helper: make booking with payment
  async function makeBooking(
    renterId: number,
    equipmentId: number,
    startOffset: number,
    endOffset: number,
    status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REJECTED",
    paid: boolean,
    paymentOffset?: number
  ) {
    const startDate = addDays(today, startOffset);
    const endDate = addDays(today, endOffset);
    const item = eqRows.find((x) => x.id === equipmentId)!;
    const totalPrice = daysBetween(startDate, endDate) * item.pricePerDay;
    const [booking] = await db
      .insert(bookings)
      .values({ renterId, equipmentId, startDate, endDate, totalPrice, status })
      .returning();
    await db.insert(payments).values({
      bookingId: booking.id,
      amount: totalPrice,
      paymentStatus: paid ? "PAID" : "UNPAID",
      paymentDate: paid && paymentOffset !== undefined ? new Date(addDays(today, paymentOffset) + "T09:00:00") : null,
    });
    return booking;
  }

  // Completed (paid + reviewed)
  const b1 = await makeBooking(andi.id, eq("Traktor Kubota").id, -14, -12, "COMPLETED", true, -12);
  const b2 = await makeBooking(dewi.id, eq("Mesin Giling").id, -20, -18, "COMPLETED", true, -18);
  const b3 = await makeBooking(andi.id, eq("Drone Penyemprot").id, -30, -28, "COMPLETED", true, -28);

  // Active (confirmed + paid) -> equipment RENTED (b4 on pompa diesel)
  await makeBooking(andi.id, eq("Pompa Air Diesel").id, -1, 2, "CONFIRMED", true, -1);

  // Confirmed unpaid (menunggu pembayaran)
  await makeBooking(dewi.id, eq("Combine Harvester").id, 3, 5, "CONFIRMED", false);

  // Pending (menunggu konfirmasi)
  await makeBooking(rudi.id, eq("Drone Pemetaan").id, 7, 8, "PENDING", false);
  await makeBooking(andi.id, eq("Pompa Air Submersible").id, 10, 11, "PENDING", false);

  // Rejected / Cancelled
  await makeBooking(dewi.id, eq("Traktor Tangan").id, -5, -3, "REJECTED", false);
  await makeBooking(andi.id, eq("Bajak Singkal").id, -2, -1, "CANCELLED", false);

  await db.insert(reviews).values([
    { bookingId: b1.id, renterId: andi.id, rating: 5, comment: "Traktornya sangat bagus dan bertenaga! Sawah 2 hektar selesai dalam sehari. Pemilik ramah dan mengantar tepat waktu." },
    { bookingId: b2.id, renterId: dewi.id, rating: 4, comment: "Mesin gilingnya bekerja baik, hasil beras bersih. Sedikit berisik tapi masih wajar untuk mesin sebesar ini." },
    { bookingId: b3.id, renterId: andi.id, rating: 5, comment: "Drone penyemprotnya hemat waktu banget! Penyemprotan 5 hektar cuma 2 jam. Pasti sewa lagi musim depan." },
  ]);

  console.log("✅ Database TularTani siap!");
  console.log("   Akun demo (password: password123):");
  console.log("   - admin@tulartani.id (Admin)");
  console.log("   - budi@tulartani.id (Pemilik)");
  console.log("   - andi@tulartani.id (Penyewa)");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Gagal melakukan seed:", err);
  process.exit(1);
});
