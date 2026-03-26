import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertTriangle, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FraudFlag {
  id: string;
  flag_type: string;
  severity: string;
  description: string;
  related_user_id: string | null;
  related_collection_id: string | null;
  related_adjustment_id: string | null;
  is_resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export const FraudAlerts = () => {
  const { user } = useAuth();
  const [flags, setFlags] = useState<FraudFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  const fetchFlags = async () => {
    const { data, error } = await supabase
      .from("fraud_flags")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error:", error);
    else setFlags((data as unknown as FraudFlag[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const resolveFlag = async (flagId: string) => {
    if (!user) return;
    setResolving(flagId);

    const { error } = await supabase
      .from("fraud_flags")
      .update({
        is_resolved: true,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", flagId);

    setResolving(null);
    if (error) {
      toast.error("Failed to resolve flag");
    } else {
      toast.success("Flag resolved");
      fetchFlags();
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const severityStyles: Record<string, string> = {
    warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    critical: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const unresolvedCount = flags.filter(f => !f.is_resolved).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5" /> Fraud Alerts
        </h2>
        {unresolvedCount > 0 && (
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-500/10 text-red-600">
            {unresolvedCount} unresolved
          </span>
        )}
      </div>

      <div className="space-y-3">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className={cn(
              "rounded-2xl p-4 border space-y-2",
              flag.is_resolved ? "bg-card border-border opacity-60" : "bg-card border-border"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className={cn("h-4 w-4", flag.severity === "critical" ? "text-red-500" : "text-yellow-500")} />
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", severityStyles[flag.severity])}>
                  {flag.severity}
                </span>
                <span className="text-xs text-muted-foreground">{flag.flag_type}</span>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(flag.created_at)}</span>
            </div>

            <p className="text-sm text-foreground">{flag.description}</p>

            {flag.is_resolved ? (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" /> Resolved
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => resolveFlag(flag.id)}
                disabled={resolving === flag.id}
                className="text-xs"
              >
                {resolving === flag.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                Mark as Resolved
              </Button>
            )}
          </div>
        ))}

        {flags.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
            No fraud alerts — all clear!
          </div>
        )}
      </div>
    </div>
  );
};
