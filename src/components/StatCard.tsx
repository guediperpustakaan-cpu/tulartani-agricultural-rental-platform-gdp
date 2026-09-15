import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "green",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  tone?: "green" | "amber" | "sky" | "violet";
}) {
  const tones: Record<string, string> = {
    green: "from-green-700 to-green-900",
    amber: "from-amber-500 to-amber-600",
    sky: "from-sky-500 to-sky-700",
    violet: "from-violet-500 to-violet-700",
  };
  return (
    <div className="rounded-2xl border border-green-900/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white",
            tones[tone]
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-extrabold text-green-950">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
