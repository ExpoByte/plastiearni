import { useState, useEffect } from "react";
import { Wallet, Plus, ArrowDownCircle, Loader2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PoolTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

export const RewardPoolManager = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [transactions, setTransactions] = useState<PoolTransaction[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const [poolRes, txRes] = await Promise.all([
      supabase.from("reward_pool").select("balance").limit(1).single(),
      supabase
        .from("pool_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (poolRes.data) setBalance(poolRes.data.balance);
    if (txRes.data) setTransactions(txRes.data as PoolTransaction[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFund = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!user) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("fund_reward_pool", {
        p_amount: numAmount,
        p_description: description || `Admin deposit`,
        p_admin_id: user.id,
      });

      if (error) throw error;

      toast.success(`KES ${numAmount.toLocaleString()} added to reward pool`);
      setAmount("");
      setDescription("");
      setBalance(data as number);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to fund pool");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="h-8 w-8" />
          <span className="text-lg font-medium opacity-90">Reward Pool Balance</span>
        </div>
        <p className="text-4xl font-bold">
          KES {(balance ?? 0).toLocaleString()}
        </p>
        <p className="text-sm opacity-75 mt-1">
          Available for user reward payouts
        </p>
      </div>

      {/* Add Funds Form */}
      <div className="rounded-2xl bg-card p-6 shadow-card space-y-4">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Add Funds to Pool
        </h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="fund-amount">Amount (KES)</Label>
            <Input
              id="fund-amount"
              type="number"
              placeholder="e.g. 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
            />
          </div>
          <div>
            <Label htmlFor="fund-desc">Description (optional)</Label>
            <Input
              id="fund-desc"
              placeholder="e.g. March reward funding"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button
            onClick={handleFund}
            disabled={submitting || !amount}
            className="w-full gradient-primary"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Add Funds
          </Button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-2xl bg-card p-6 shadow-card space-y-4">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Fund History
        </h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No transactions yet
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      tx.type === "deposit"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    <ArrowDownCircle
                      className={`h-4 w-4 ${tx.type !== "deposit" ? "rotate-180" : ""}`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {tx.description || tx.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-bold text-sm ${
                    tx.type === "deposit" ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {tx.type === "deposit" ? "+" : "-"}KES {tx.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
