import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Clock, Star, Phone, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

const collectionPoints = [
  {
    id: 1,
    name: "GreenHub Collection Center",
    address: "23 Victoria Island, Lagos",
    distance: "0.8 km",
    rating: 4.8,
    hours: "8:00 AM - 6:00 PM",
    phone: "+234 801 234 5678",
    isOpen: true,
  },
  {
    id: 2,
    name: "EcoPoint Mall Station",
    address: "Ikeja City Mall, Level B1",
    distance: "2.1 km",
    rating: 4.5,
    hours: "9:00 AM - 9:00 PM",
    phone: "+234 802 345 6789",
    isOpen: true,
  },
  {
    id: 3,
    name: "RecycleMax Downtown",
    address: "45 Allen Avenue, Ikeja",
    distance: "3.4 km",
    rating: 4.9,
    hours: "7:00 AM - 5:00 PM",
    phone: "+234 803 456 7890",
    isOpen: false,
  },
  {
    id: 4,
    name: "Community Green Point",
    address: "Lekki Phase 1, Lagos",
    distance: "5.2 km",
    rating: 4.3,
    hours: "8:00 AM - 4:00 PM",
    phone: "+234 804 567 8901",
    isOpen: true,
  },
];

export const MapPage = () => {
  const [selectedPoint, setSelectedPoint] = useState<typeof collectionPoints[0] | null>(null);
  const [showList, setShowList] = useState(true);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Map placeholder */}
      <div className="relative h-[50vh] bg-gradient-to-br from-muted to-muted/50">
        {/* Simulated map with markers */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Grid pattern for map feel */}
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Map markers */}
          <div className="absolute left-1/4 top-1/3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-elevated animate-pulse-soft">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute left-1/2 top-1/2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-card">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute right-1/4 top-1/4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-card">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute right-1/3 bottom-1/3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted-foreground/50 text-muted shadow-card">
              <MapPin className="h-5 w-5" />
            </div>
          </div>

          {/* User location */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute -inset-4 animate-ping rounded-full bg-accent/30" />
              <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-accent shadow-elevated">
                <div className="h-3 w-3 rounded-full bg-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Map controls */}
        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <Button size="icon" variant="secondary" className="shadow-card">
            <Navigation className="h-5 w-5" />
          </Button>
        </div>

        {/* Search bar overlay */}
        <div className="absolute left-4 right-4 top-4">
          <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card">
            <MapPin className="h-5 w-5 text-primary" />
            <input
              type="text"
              placeholder="Search collection points..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Collection points list */}
      <div
        className={cn(
          "relative rounded-t-3xl bg-card shadow-elevated transition-transform duration-300",
          showList ? "-mt-6" : "-mt-48"
        )}
      >
        {/* Drag handle */}
        <button
          onClick={() => setShowList(!showList)}
          className="flex w-full items-center justify-center py-4"
        >
          <div className="h-1 w-12 rounded-full bg-muted" />
        </button>

        <div className="px-4 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Nearby Collection Points</h2>
            <span className="text-sm text-muted-foreground">{collectionPoints.length} found</span>
          </div>

          <div className="mt-4 space-y-3 max-h-[40vh] overflow-y-auto">
            {collectionPoints.map((point) => (
              <button
                key={point.id}
                onClick={() => setSelectedPoint(point)}
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
            ))}
          </div>
        </div>
      </div>

      {/* Selected point detail sheet */}
      {selectedPoint && (
        <div className="fixed inset-x-0 bottom-20 z-50 mx-4 animate-slide-in-bottom">
          <div className="rounded-3xl bg-card p-6 shadow-elevated">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{selectedPoint.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPoint.address}</p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedPoint(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {selectedPoint.hours}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-eco-sun" fill="currentColor" />
                {selectedPoint.rating}
              </span>
            </div>

            <div className="mt-4 flex gap-3">
              <Button className="flex-1" variant="default">
                <Navigation className="h-4 w-4" />
                Get Directions
              </Button>
              <Button variant="outline" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default MapPage;
