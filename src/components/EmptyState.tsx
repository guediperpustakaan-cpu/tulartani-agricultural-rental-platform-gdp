import Link from "next/link";
import { Inbox } from "lucide-react";

export default function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-green-900/20 bg-white px-6 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
        <Inbox className="h-8 w-8" />
      </span>
      <h3 className="mt-4 text-lg font-bold text-green-950">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-5 rounded-full bg-gradient-to-r from-green-700 to-green-900 px-6 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
