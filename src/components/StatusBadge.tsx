import { cn } from "@/lib/utils";

export const bookingStatusMeta: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  PENDING: {
    label: "Menunggu Konfirmasi",
    className: "bg-amber-100 text-amber-800 border-amber-300",
    dot: "bg-amber-500",
  },
  CONFIRMED: {
    label: "Menunggu Pembayaran",
    className: "bg-sky-100 text-sky-800 border-sky-300",
    dot: "bg-sky-500",
  },
  PAID: {
    label: "Dibayar / Aktif",
    className: "bg-indigo-100 text-indigo-800 border-indigo-300",
    dot: "bg-indigo-500",
  },
  COMPLETED: {
    label: "Selesai",
    className: "bg-green-100 text-green-800 border-green-300",
    dot: "bg-green-500",
  },
  CANCELLED: {
    label: "Dibatalkan",
    className: "bg-slate-100 text-slate-600 border-slate-300",
    dot: "bg-slate-400",
  },
  REJECTED: {
    label: "Ditolak",
    className: "bg-red-100 text-red-700 border-red-300",
    dot: "bg-red-500",
  },
};

export const equipmentStatusMeta: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: "Tersedia", className: "bg-green-100 text-green-800" },
  MAINTENANCE: { label: "Perawatan", className: "bg-amber-100 text-amber-800" },
  RENTED: { label: "Sedang Disewa", className: "bg-sky-100 text-sky-800" },
};

export default function StatusBadge({
  status,
  type = "booking",
  className,
}: {
  status: string;
  type?: "booking" | "equipment";
  className?: string;
}) {
  const meta =
    type === "equipment"
      ? equipmentStatusMeta[status] ?? { label: status, className: "bg-slate-100 text-slate-600" }
      : bookingStatusMeta[status] ?? {
          label: status,
          className: "bg-slate-100 text-slate-600",
        };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        meta.className,
        className
      )}
    >
      {type === "booking" && status !== "COMPLETED" && status !== "CANCELLED" && (
        <span className={cn("h-1.5 w-1.5 rounded-full", bookingStatusMeta[status]?.dot)} />
      )}
      {meta.label}
    </span>
  );
}
