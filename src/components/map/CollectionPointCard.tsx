import { MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { CollectionPoint } from "./MapView";

interface CollectionPointCardProps {
  point: CollectionPoint;
  onSelect: (point: CollectionPoint) => void;
}

export const CollectionPointCard = ({ point, onSelect }: CollectionPointCardProps) => {
  return (
    <button
      onClick={() => onSelect(point)}
      className="w-full rounded-2xl bg-background p-4 text-left shadow-soft transition-all hover:shadow-card"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            point.isOpen
              ? "gradient-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <MapPin className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground truncate">{point.name}</h3>
            <span className="text-sm font-medium text-primary">{point.distance}</span>
          </div>
          <p className="text-sm text-muted-foreground truncate">{point.address}</p>
          <div className="mt-2 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Star className="h-3 w-3 text-eco-sun" fill="currentColor" />
              {point.rating}
            </span>
            <span
              className={cn(
                "font-medium",
                point.isOpen ? "text-primary" : "text-destructive"
              )}
            >
              {point.isOpen ? "Open" : "Closed"}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};
