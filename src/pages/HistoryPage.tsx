import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { CollectionCard } from "@/components/CollectionCard";
import { Button } from "@/components/ui/button";
import { Filter, Calendar, TrendingUp, Weight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const allCollections = [
  { date: "Feb 4, 2026", location: "EcoRecycle Westlands, Nairobi", weight: 5.2, points: 520, status: "completed" as const },
  { date: "Feb 1, 2026", location: "PlastiCollect CBD, Nairobi", weight: 3.8, points: 380, status: "verified" as const },
  { date: "Jan 28, 2026", location: "GreenPoint Karen, Nairobi", weight: 7.1, points: 710, status: "completed" as const },
  { date: "Jan 25, 2026", location: "Mama Recyclers Kibera", weight: 2.5, points: 250, status: "completed" as const },
  { date: "Jan 20, 2026", location: "EcoHub Eastleigh, Nairobi", weight: 4.2, points: 420, status: "completed" as const },
  { date: "Jan 15, 2026", location: "Taka Taka Solutions, Industrial Area", weight: 6.0, points: 600, status: "pending" as const },
];

export const HistoryPage = () => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = [t.all, t.completed, t.verified, t.pending];

  const filteredCollections = allCollections.filter((c) => {
    if (activeFilter === t.all) return true;
    if (activeFilter === t.completed) return c.status === "completed";
    if (activeFilter === t.verified) return c.status === "verified";
    if (activeFilter === t.pending) return c.status === "pending";
    return true;
  });

  const totalWeight = allCollections.reduce((sum, c) => sum + c.weight, 0);
  const totalPoints = allCollections.reduce((sum, c) => sum + c.points, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card px-6 pb-6 pt-8 shadow-soft">
        <h1 className="text-2xl font-bold text-foreground">{t.collectionHistory}</h1>
        <p className="text-sm text-muted-foreground">{t.trackImpact}</p>

        {/* Stats summary */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-2xl bg-primary/10 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Weight className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t.totalCollected}</p>
              <p className="text-lg font-bold text-foreground">{totalWeight.toFixed(1)} kg</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-secondary/10 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t.points} (≈ KES)</p>
              <p className="text-lg font-bold text-foreground">{totalPoints.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto px-4 py-4 no-scrollbar">
        {filters.map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter)}
            className="shrink-0"
          >
            {filter}
          </Button>
        ))}
        <Button variant="ghost" size="icon" className="shrink-0 ml-auto">
          <Filter className="h-5 w-5" />
        </Button>
      </div>

      {/* Collections list */}
      <main className="px-4">
        <div className="space-y-3">
          {filteredCollections.map((collection, index) => (
            <CollectionCard key={index} {...collection} />
          ))}
        </div>

        {filteredCollections.length === 0 && (
          <div className="mt-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{t.noCollections}</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default HistoryPage;
