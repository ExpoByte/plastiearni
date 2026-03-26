import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Adjustment {
  id: string;
  collection_id: string;
  original_kg: number;
  original_points: number;
  adjusted_kg: number;
  adjusted_points: number;
  delta_kg: number;
  delta_points: number;
  reason: string;
  admin_id: string;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
}

export const AdjustmentsReview = () => {
  const { user } = useAuth();
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchAdjustments = async () => {
    const { data, error } = await supabase
      .from("collection_adjustments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error:", error);
    } else {
      setAdjustments((data as unknown as Adjustment[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdjustments();
  }, []);

  const handleReview = async (adjId: string, newStatus: "approved" | "rejected") => {
    if (!user) return;
    setProcessing(adjId);

    const { error } = await supabase
      .from("collection_adjustments")
      .update({
        status: newStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes[adjId] || null,
      })
      .eq("id", adjId);

    setProcessing(null);
    if (error) {
      console.error("Error:", error);
      toast.error("Failed to update adjustment");
    } else {
      toast.success(`Adjustment ${newStatus}`);
      fetchAdjustments();
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-600",
    approved: "bg-green-500/10 text-green-600",
    rejected: "bg-red-500/10 text-red-600",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const pendingCount = adjustments.filter(a => a.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Adjustments Review</h2>
        {pendingCount > 0 && (
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600">
            {pendingCount} pending
          </span>
        )}
      </div>

      <div className="space-y-3">
        {adjustments.map((adj) => (
          <div key={adj.id} className="rounded-2xl bg-card p-4 shadow-soft border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", statusStyles[adj.status])}>
                {adj.status}
              </span>
              <span className="text-xs text-muted-foreground">{formatDate(adj.created_at)}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground text-[10px]">Original</p>
                <p className="font-semibold">{adj.original_kg} kg</p>
                <p className="text-xs text-muted-foreground">{adj.original_points} pts</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-center">
                <p className="text-muted-foreground text-[10px]">Adjusted</p>
                <p className="font-semibold">{adj.adjusted_kg} kg</p>
                <p className="text-xs text-muted-foreground">{adj.adjusted_points} pts</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-muted-foreground text-[10px]">Delta</p>
                <p className={cn("font-semibold text-sm", adj.delta_points > 0 ? "text-green-600" : "text-red-600")}>
                  {adj.delta_points > 0 ? "+" : ""}{adj.delta_points} pts
                </p>
              </div>
            </div>

            <div className="text-xs"><span className="text-muted-foreground">Reason:</span> {adj.reason}</div>

            {adj.status === "pending" && (
              <div className="space-y-2 pt-2 border-t border-border">
                <Textarea
                  placeholder="Review notes (optional)..."
                  value={reviewNotes[adj.id] || ""}
                  onChange={(e) => setReviewNotes(prev => ({ ...prev, [adj.id]: e.target.value }))}
                  rows={2}
                  className="text-xs"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleReview(adj.id, "approved")}
                    disabled={processing === adj.id}
                  >
                    {processing === adj.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReview(adj.id, "rejected")}
                    disabled={processing === adj.id}
                  >
                    {processing === adj.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {adj.review_notes && adj.status !== "pending" && (
              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                <strong>Review notes:</strong> {adj.review_notes}
              </div>
            )}
          </div>
        ))}

        {adjustments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No adjustments found</div>
        )}
      </div>
    </div>
  );
};
