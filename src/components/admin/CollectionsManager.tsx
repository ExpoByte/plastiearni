import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Scale, MapPin, Calendar, User, AlertTriangle, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CollectionWithAdjustment {
  id: string;
  user_id: string;
  original_kg: number;
  original_points: number;
  adjusted_kg: number | null;
  adjusted_points: number | null;
  final_kg: number;
  final_points: number;
  plastic_type: string;
  location: string | null;
  status: string;
  photo_url: string | null;
  created_at: string;
  has_adjustment: boolean;
  adjustment_status: string | null;
  adjustment_reason: string | null;
}

export const CollectionsManager = () => {
  const { user } = useAuth();
  const [collections, setCollections] = useState<CollectionWithAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<CollectionWithAdjustment | null>(null);
  const [adjustedKg, setAdjustedKg] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchCollections = async () => {
    const { data, error } = await supabase.rpc("get_collections_with_adjustments", {
      p_limit: 100,
      p_offset: 0,
    });
    if (error) {
      console.error("Error fetching collections:", error);
      toast.error("Failed to load collections");
    } else {
      setCollections((data as unknown as CollectionWithAdjustment[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const openAdjustDialog = (collection: CollectionWithAdjustment) => {
    setSelectedCollection(collection);
    setAdjustedKg(collection.final_kg.toString());
    setAdjustReason("");
    setAdjustDialogOpen(true);
  };

  const handleSubmitAdjustment = async () => {
    if (!selectedCollection || !user) return;
    const newKg = parseFloat(adjustedKg);
    if (isNaN(newKg) || newKg < 0) {
      toast.error("Enter a valid weight");
      return;
    }
    if (!adjustReason.trim()) {
      toast.error("Reason is required");
      return;
    }

    setSubmitting(true);
    const newPoints = Math.round(newKg * 100);

    const { error } = await supabase.from("collection_adjustments").insert({
      collection_id: selectedCollection.id,
      original_kg: selectedCollection.original_kg,
      original_points: selectedCollection.original_points,
      adjusted_kg: newKg,
      adjusted_points: newPoints,
      reason: adjustReason.trim(),
      admin_id: user.id,
      status: "pending",
    });

    setSubmitting(false);
    if (error) {
      console.error("Error creating adjustment:", error);
      toast.error("Failed to create adjustment");
    } else {
      toast.success("Adjustment submitted for review");
      setAdjustDialogOpen(false);
      fetchCollections();
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "verified": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const adjustmentBadge = (adjStatus: string | null) => {
    if (!adjStatus) return null;
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      approved: "bg-green-500/10 text-green-600 border-green-500/20",
      rejected: "bg-red-500/10 text-red-600 border-red-500/20",
    };
    return (
      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", styles[adjStatus] || "bg-muted")}>
        Adj: {adjStatus}
      </span>
    );
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">
        Collections Ledger ({collections.length})
      </h2>
      <p className="text-xs text-muted-foreground">
        Records are immutable. Use adjustments to correct values — all changes are audited.
      </p>

      <div className="space-y-3">
        {collections.map((c) => (
          <div key={c.id} className="rounded-2xl bg-card p-4 shadow-soft border border-border">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {statusIcon(c.status)}
                <span className="font-semibold text-foreground text-sm">{c.final_kg} kg</span>
                <span className="text-xs text-muted-foreground">({c.plastic_type})</span>
              </div>
              <div className="flex items-center gap-2">
                {c.has_adjustment && adjustmentBadge(c.adjustment_status)}
                <span className="text-xs text-primary font-bold">+{c.final_points} pts</span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(c.created_at)}</span>
              {c.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>}
            </div>

            {c.has_adjustment && (
              <button
                onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
              >
                {expandedId === c.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {expandedId === c.id ? "Hide" : "View"} adjustment details
              </button>
            )}

            {expandedId === c.id && c.has_adjustment && (
              <div className="mt-2 p-3 rounded-xl bg-muted/50 text-xs space-y-1">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Original:</span> {c.original_kg} kg / {c.original_points} pts</div>
                  <div><span className="text-muted-foreground">Adjusted:</span> {c.adjusted_kg} kg / {c.adjusted_points} pts</div>
                </div>
                <div><span className="text-muted-foreground">Reason:</span> {c.adjustment_reason}</div>
              </div>
            )}

            <div className="mt-3 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => openAdjustDialog(c)} className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" /> Submit Adjustment
              </Button>
            </div>
          </div>
        ))}

        {collections.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No collections found</div>
        )}
      </div>

      {/* Adjustment Dialog */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Adjustment</DialogTitle>
          </DialogHeader>
          {selectedCollection && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-muted/50 text-sm space-y-1">
                <p><strong>Original:</strong> {selectedCollection.original_kg} kg / {selectedCollection.original_points} pts</p>
                <p><strong>Current Final:</strong> {selectedCollection.final_kg} kg / {selectedCollection.final_points} pts</p>
              </div>
              <div className="space-y-2">
                <Label>Corrected Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={adjustedKg}
                  onChange={(e) => setAdjustedKg(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  New points: {adjustedKg ? Math.round(parseFloat(adjustedKg) * 100) : 0}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Reason for Adjustment *</Label>
                <Textarea
                  placeholder="Explain why this adjustment is needed..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitAdjustment} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit for Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
