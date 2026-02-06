import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ArrowLeft,
  Phone,
  Coins,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface Redemption {
  id: string;
  reward_title: string;
  reward_category: string;
  amount_kes: number;
  points_spent: number;
  phone_number: string;
  status: string;
  mpesa_transaction_id: string | null;
  error_message: string | null;
  created_at: string;
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    animate: true,
  },
  success: {
    label: "Completed",
    icon: CheckCircle,
    className: "bg-primary/10 text-primary",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive",
  },
};

export const RedemptionHistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchRedemptions = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("redemptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching redemptions:", error);
      } else {
        setRedemptions(data || []);
      }
      setLoading(false);
    };

    fetchRedemptions();
  }, [user]);

  const filteredRedemptions = redemptions.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const maskPhoneNumber = (phone: string) => {
    if (phone.length < 6) return phone;
    return phone.slice(0, 4) + "****" + phone.slice(-2);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-hero px-6 pb-8 pt-8 text-primary-foreground">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Redemption History</h1>
        </div>
        <p className="text-sm opacity-80">Track your M-Pesa rewards</p>

        {/* Stats summary */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold">{redemptions.length}</p>
            <p className="text-xs opacity-80">Total</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold">
              {redemptions.filter((r) => r.status === "success").length}
            </p>
            <p className="text-xs opacity-80">Completed</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold">
              {redemptions
                .filter((r) => r.status === "success")
                .reduce((sum, r) => sum + r.amount_kes, 0)
                .toLocaleString()}
            </p>
            <p className="text-xs opacity-80">KES Earned</p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto px-4 py-4 no-scrollbar -mt-4">
        {["all", "pending", "processing", "success", "failed"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "glass"}
            size="sm"
            onClick={() => setFilter(status)}
            className="shrink-0 capitalize"
          >
            {status === "all" ? "All" : statusConfig[status as keyof typeof statusConfig]?.label || status}
          </Button>
        ))}
      </div>

      {/* Content */}
      <main className="px-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredRedemptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">No redemptions yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {filter === "all"
                ? "Your M-Pesa transactions will appear here"
                : `No ${filter} transactions`}
            </p>
            <Button className="mt-4" onClick={() => navigate("/rewards")}>
              Browse Rewards
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRedemptions.map((redemption) => {
              const config = statusConfig[redemption.status as keyof typeof statusConfig] || statusConfig.pending;
              const StatusIcon = config.icon;

              return (
                <div
                  key={redemption.id}
                  className="rounded-2xl bg-card p-4 shadow-soft"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {redemption.reward_title}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {maskPhoneNumber(redemption.phone_number)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="h-3.5 w-3.5" />
                          {redemption.points_spent} pts
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(redemption.created_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        KES {redemption.amount_kes.toLocaleString()}
                      </p>
                      <div
                        className={cn(
                          "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                          config.className
                        )}
                      >
                        <StatusIcon
                          className={cn(
                            "h-3 w-3",
                            "animate" in config && config.animate && "animate-spin"
                          )}
                        />
                        {config.label}
                      </div>
                    </div>
                  </div>

                  {/* Error message for failed transactions */}
                  {redemption.status === "failed" && redemption.error_message && (
                    <div className="mt-3 rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
                      {redemption.error_message}
                    </div>
                  )}

                  {/* Transaction ID for successful transactions */}
                  {redemption.status === "success" && redemption.mpesa_transaction_id && (
                    <div className="mt-3 rounded-lg bg-muted p-2 text-xs text-muted-foreground">
                      Transaction ID: {redemption.mpesa_transaction_id}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default RedemptionHistoryPage;
