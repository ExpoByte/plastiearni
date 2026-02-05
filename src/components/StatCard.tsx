import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  variant?: "primary" | "secondary" | "accent";
  className?: string;
}

export const StatCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  variant = "primary",
  className,
}: StatCardProps) => {
  const variants = {
    primary: "gradient-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    accent: "gradient-accent text-primary-foreground",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-5 shadow-card transition-all duration-300 hover:shadow-elevated hover:scale-[1.02]",
        variants[variant],
        className
      )}
    >
      <div className="relative z-10">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium opacity-90">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
        {subtext && <p className="mt-1 text-xs opacity-75">{subtext}</p>}
      </div>
      {/* Decorative element */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
    </div>
  );
};
