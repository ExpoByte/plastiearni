import { MapPin, Clock, Star, Navigation, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollectionPoint } from "./MapView";

interface PointDetailSheetProps {
  point: CollectionPoint;
  onClose: () => void;
}

export const PointDetailSheet = ({ point, onClose }: PointDetailSheetProps) => {
  const handleGetDirections = () => {
    // Open Google Maps directions in new tab
    const url = `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`;
    window.open(url, "_blank");
  };

  const handleCall = () => {
    window.location.href = `tel:${point.phone}`;
  };

  return (
    <div className="fixed inset-x-0 bottom-20 z-[1000] mx-4 animate-slide-in-bottom">
      <div className="rounded-3xl bg-card p-6 shadow-elevated">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">{point.name}</h3>
              <p className="text-sm text-muted-foreground">{point.address}</p>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {point.hours}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 text-eco-sun" fill="currentColor" />
            {point.rating}
          </span>
        </div>

        <div className="mt-4 flex gap-3">
          <Button className="flex-1" variant="default" onClick={handleGetDirections}>
            <Navigation className="h-4 w-4" />
            Get Directions
          </Button>
          <Button variant="outline" size="icon" onClick={handleCall}>
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
