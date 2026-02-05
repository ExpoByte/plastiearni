import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface BadgeProps {
  icon: LucideIcon;
  label: string;
  unlocked?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Badge = ({ icon: Icon, label, unlocked = true, size = "md" }: BadgeProps) => {
  const sizeStyles = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-20 w-20",
  };

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-9 w-9",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full transition-all duration-300",
          sizeStyles[size],
          unlocked
            ? "gradient-primary text-primary-foreground shadow-card eco-glow"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className={iconSizes[size]} />
        {unlocked && (
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-eco-sun text-xs font-bold text-foreground">
            ✓
          </div>
        )}
      </div>
      <span
        className={cn(
          "text-center text-xs font-medium",
          unlocked ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
};
