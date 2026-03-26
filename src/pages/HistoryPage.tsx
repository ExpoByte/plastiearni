import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Filter, Calendar, TrendingUp, Weight, Loader2, AlertTriangle, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, Recycle, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface CollectionRecord {
  id: string;
  weight_kg: number;
  points_earned: number;
  plastic_type: string;
  location: string | null;
  status: string;
  created_at: string;
}

interface AdjustmentRecord {
  id: string;
  collection_id: string;
  original_kg: number;
  original_points: number;
  adjusted_kg: number;
  adjusted_points: number;
  delta_kg: number;
  delta_points: number;
  reason: string;
  status: string;
  created_at: string;
}

export const HistoryPage = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All");
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [adjustments, setAdjustments] = useState<Record<string, AdjustmentRecord>>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const [colRes, adjRes] = await Promise.all([
        supabase.from("collections").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("collection_adjustments").select("*").order("created_at", { ascending: false }),
      ]);

      if (colRes.data) setCollections(colRes.data as unknown as CollectionRecord[]);

      if (adjRes.data) {
        const adjMap: Record<string, AdjustmentRecord> = {};
        (adjRes.data as unknown as AdjustmentRecord[]).forEach((a) => {
          if (!adjMap[a.collection_id]) adjMap[a.collection_id] = a;
        });
        setAdjustments(adjMap);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const filters = [t.all, t.completed, t.verified, t.pending];

  const filteredCollections = collections.filter((c) => {
    if (activeFilter === t.all) return true;
    if (activeFilter === t.completed) return c.status === "completed";
    if (activeFilter === t.verified) return c.status === "verified";
    if (activeFilter === t.pending) return c.status === "pending";
    return true;
  });

  const totalWeight = collections.reduce((sum, c) => {
    const adj = adjustments[c.id];
    return sum + (adj?.status === "approved" ? adj.adjusted_kg : c.weight_kg);
  }, 0);

  const totalPoints = collections.reduce((sum, c) => {
    const adj = adjustments[c.id];
    return sum + (adj?.status === "approved" ? adj.adjusted_points : c.points_earned);
  }, 0);

  const statusIcon = (status: string) => {
    switch (status) {
      case "verified": case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const adjStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-600",
      approved: "bg-green-500/10 text-green-600",
      rejected: "bg-red-500/10 text-red-600",
    };
    return (
      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", styles[status])}>
        {status === "pending" ? "⏳ Adjustment Pending" : status === "approved" ? "✅ Adjusted" : "❌ Adjustment Rejected"}
      </span>
    );
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card px-6 pb-6 pt-8 shadow-soft">
        <h1 className="text-2xl font-bold text-foreground">{t.collectionHistory}</h1>
        <p className="text-sm text-muted-foreground">{t.trackImpact}</p>

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
      </div>

      <main className="px-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCollections.map((c) => {
              const adj = adjustments[c.id];
              const finalKg = adj?.status === "approved" ? adj.adjusted_kg : c.weight_kg;
              const finalPts = adj?.status === "approved" ? adj.adjusted_points : c.points_earned;

              return (
                <div key={c.id} className="rounded-2xl bg-card p-4 shadow-soft animate-fade-in">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
                      <Recycle className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground">{finalKg} kg</h3>
                          {adj && adjStatusBadge(adj.status)}
                        </div>
                        <div className="flex items-center gap-1">
                          {statusIcon(c.status)}
                          <span className="text-xs text-muted-foreground capitalize">{c.status}</span>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(c.created_at)}</span>
                        </div>
                        {c.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{c.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">+{finalPts} pts</span>
                        {adj && (
                          <button
                            onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            {expandedId === c.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            Details
                          </button>
                        )}
                      </div>

                      {expandedId === c.id && adj && (
                        <div className="mt-3 p-3 rounded-xl bg-muted/50 text-xs space-y-2 border border-border">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="font-semibold">Adjustment Details</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-muted-foreground">Original:</span>
                              <p className="font-medium">{adj.original_kg} kg / {adj.original_points} pts</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Adjusted:</span>
                              <p className="font-medium">{adj.adjusted_kg} kg / {adj.adjusted_points} pts</p>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Reason:</span>
                            <p className="font-medium">{adj.reason}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredCollections.length === 0 && (
              <div className="mt-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">{t.noCollections}</p>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default HistoryPage;
