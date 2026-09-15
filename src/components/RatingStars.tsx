import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RatingStars({
  rating,
  size = "h-4 w-4",
  className,
}: {
  rating: number;
  size?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            size,
            i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"
          )}
        />
      ))}
    </span>
  );
}
