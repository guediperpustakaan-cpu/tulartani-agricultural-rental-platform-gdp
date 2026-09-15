import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import RatingStars from "./RatingStars";

export interface EquipmentCardData {
  id: number;
  name: string;
  pricePerDay: number;
  locationName: string | null;
  status: string;
  imageUrl: string | null;
  isVerified: boolean;
  categoryName?: string | null;
  ratingAvg?: number | null;
  reviewCount?: number;
}

export default function EquipmentCard({ item }: { item: EquipmentCardData }) {
  return (
    <Link
      href={`/alat/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-green-900/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-green-100">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-200 to-green-300 text-green-700">
            Alat Pertanian
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge status={item.status} type="equipment" />
        </div>
        {item.isVerified && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-green-900/80 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
            <BadgeCheck className="h-3.5 w-3.5" /> TERVERIFIKASI
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-800">
            {item.categoryName ?? "Alat"}
          </span>
          {item.ratingAvg ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-900">
              <RatingStars rating={item.ratingAvg} size="h-3.5 w-3.5" />
              {item.reviewCount ? `(${item.reviewCount})` : ""}
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 line-clamp-1 text-base font-bold text-green-950 group-hover:text-green-700">
          {item.name}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{item.locationName || "Lokasi tidak disebutkan"}</span>
        </p>
        <div className="mt-3 flex items-end justify-between border-t border-dashed border-green-900/10 pt-3">
          <div>
            <p className="text-[11px] text-slate-400">Harga sewa</p>
            <p className="text-base font-extrabold text-green-800">
              {formatRupiah(item.pricePerDay)}
              <span className="text-xs font-medium text-slate-400"> /hari</span>
            </p>
          </div>
          <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800 transition group-hover:bg-green-700 group-hover:text-white">
            Sewa
          </span>
        </div>
      </div>
    </Link>
  );
}
