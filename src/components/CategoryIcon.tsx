import { Cog, Droplets, Plane, Shovel, SprayCan, Sprout, Tractor, Wheat, Zap } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Tractor,
  Plane,
  Cog,
  Droplets,
  Wheat,
  SprayCan,
  Shovel,
  Zap,
  Sprout,
};

export default function CategoryIcon({
  icon,
  className = "h-6 w-6",
}: {
  icon: string;
  className?: string;
}) {
  const Icon = iconMap[icon] ?? Cog;
  return <Icon className={className} />;
}
