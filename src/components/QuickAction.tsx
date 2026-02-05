import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  to: string;
  color?: "primary" | "secondary" | "accent";
}

export const QuickAction = ({
  icon: Icon,
  label,
  to,
  color = "primary",
}: QuickActionProps) => {
  const colorStyles = {
    primary: "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground",
    secondary: "bg-secondary/10 text-secondary hover:bg-secondary hover:text-secondary-foreground",
    accent: "bg-accent/20 text-accent-foreground hover:bg-accent",
  };

  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-card",
        colorStyles[color]
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-current/10">
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-xs font-semibold">{label}</span>
    </Link>
  );
};
