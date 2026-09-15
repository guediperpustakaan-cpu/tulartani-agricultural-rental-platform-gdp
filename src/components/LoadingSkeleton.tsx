export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-green-900/10 bg-white shadow-sm">
      <div className="aspect-[4/3] animate-pulse bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-1/3 animate-pulse rounded-full bg-slate-200" />
        <div className="h-5 w-3/4 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-6 w-2/3 animate-pulse rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl border border-green-900/10 bg-white p-4"
        >
          <div className="h-16 w-20 shrink-0 animate-pulse rounded-xl bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="h-8 w-24 animate-pulse rounded-full bg-slate-200" />
        </div>
      ))}
    </div>
  );
}
