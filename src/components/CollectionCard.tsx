import { Recycle, Calendar, MapPin, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollectionCardProps {
  date: string;
  location: string;
  weight: number;
  points: number;
  status: "pending" | "verified" | "completed";
}

export const CollectionCard = ({
  date,
  location,
  weight,
  points,
  status,
}: CollectionCardProps) => {
  const statusStyles = {
    pending: "bg-eco-sun/20 text-eco-earth",
    verified: "bg-secondary/20 text-secondary",
    completed: "bg-primary/20 text-primary",
  };

  const statusLabels = {
    pending: "Pending",
    verified: "Verified",
    completed: "Completed",
  };

  return (
    <div className="group rounded-2xl bg-card p-4 shadow-soft transition-all duration-300 hover:shadow-card animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
          <Recycle className="h-6 w-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-foreground">{weight} kg Collected</h3>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                statusStyles[status]
              )}
            >
              {statusLabels[status]}
            </span>
          </div>
          
          <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{location}</span>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-primary">+{points} pts</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
};
