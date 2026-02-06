import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";

interface RewardCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  points: number;
  category: "airtime" | "voucher" | "cash" | "donation";
  available?: boolean;
  onRedeem?: () => void;
}

export const RewardCard = ({
  icon: Icon,
  title,
  description,
  points,
  category,
  available = true,
  onRedeem,
}: RewardCardProps) => {
  const categoryColors = {
    airtime: "from-eco-water to-accent",
    voucher: "from-secondary to-eco-water",
    cash: "from-primary to-secondary",
    donation: "from-eco-leaf to-secondary",
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl bg-card p-5 shadow-soft transition-all duration-300 hover:shadow-card animate-fade-in",
        !available && "opacity-60"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-primary-foreground",
            categoryColors[category]
          )}
        >
          <Icon className="h-7 w-7" />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-primary">{points}</span>
              <span className="text-sm text-muted-foreground">pts</span>
            </div>
            <Button
              size="sm"
              variant={available ? "default" : "outline"}
              disabled={!available}
              onClick={onRedeem}
            >
              {available ? "Redeem" : "Locked"}
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative corner */}
      <div
        className={cn(
          "absolute -right-8 -top-8 h-20 w-20 rounded-full opacity-10 bg-gradient-to-br",
          categoryColors[category]
        )}
      />
    </div>
  );
};
