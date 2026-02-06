import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { MapPin, Satellite, Map as MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MapView, CollectionPoint } from "@/components/map/MapView";
import { CollectionPointCard } from "@/components/map/CollectionPointCard";
import { PointDetailSheet } from "@/components/map/PointDetailSheet";
import { kenyaCollectionPoints, NAIROBI_CENTER } from "@/data/kenyaCollectionPoints";
import { LatLngExpression } from "leaflet";

export const MapPage = () => {
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null);
  const [showList, setShowList] = useState(true);
  const [useSatellite, setUseSatellite] = useState(false);

  const userLocation: LatLngExpression = [NAIROBI_CENTER.lat, NAIROBI_CENTER.lng];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Map container */}
      <div className="relative h-[50vh]">
        <MapView
          collectionPoints={kenyaCollectionPoints}
          selectedPoint={selectedPoint}
          onSelectPoint={setSelectedPoint}
          userLocation={userLocation}
          useSatellite={useSatellite}
        />

        {/* Map controls */}
        <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="shadow-card"
            onClick={() => setUseSatellite(!useSatellite)}
            title={useSatellite ? "Switch to Map" : "Switch to Satellite"}
          >
            {useSatellite ? <MapIcon className="h-5 w-5" /> : <Satellite className="h-5 w-5" />}
          </Button>
        </div>

        {/* Search bar overlay */}
        <div className="absolute left-4 right-16 top-4 z-[1000]">
          <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card">
            <MapPin className="h-5 w-5 text-primary" />
            <input
              type="text"
              placeholder="Search collection points in Kenya..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        {/* Kenya badge */}
        <div className="absolute left-4 bottom-4 z-[1000]">
          <div className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5 shadow-card text-sm font-medium">
            <span className="text-lg">🇰🇪</span>
            <span className="text-foreground">Kenya</span>
          </div>
        </div>
      </div>

      {/* Collection points list */}
      <div
        className={cn(
          "relative rounded-t-3xl bg-card shadow-elevated transition-transform duration-300 z-10",
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
            <span className="text-sm text-muted-foreground">{kenyaCollectionPoints.length} found</span>
          </div>

          <div className="mt-4 space-y-3 max-h-[40vh] overflow-y-auto">
            {kenyaCollectionPoints.map((point) => (
              <CollectionPointCard
                key={point.id}
                point={point}
                onSelect={setSelectedPoint}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Selected point detail sheet */}
      {selectedPoint && (
        <PointDetailSheet
          point={selectedPoint}
          onClose={() => setSelectedPoint(null)}
        />
      )}

      <BottomNav />
    </div>
  );
};

export default MapPage;
