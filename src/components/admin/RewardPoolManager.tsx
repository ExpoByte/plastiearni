import { useState, useEffect } from "react";
import { Wallet, Plus, ArrowDownCircle, Loader2, History, Smartphone, CheckCircle, XCircle, Clock } from "lucide-react";
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

interface StkDeposit {
  id: string;
  amount: number;
  phone_number: string;
  status: string;
  mpesa_receipt: string | null;
  error_message: string | null;
  created_at: string;
}

export const RewardPoolManager = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [transactions, setTransactions] = useState<PoolTransaction[]>([]);
  const [deposits, setDeposits] = useState<StkDeposit[]>([]);
  const [mode, setMode] = useState<"mpesa" | "manual">("mpesa");

  const fetchData = async () => {
    setLoading(true);
    const [poolRes, txRes, depRes] = await Promise.all([
      supabase.from("reward_pool").select("balance").limit(1).single(),
      supabase
        .from("pool_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("stk_deposits")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    if (poolRes.data) setBalance(poolRes.data.balance);
    if (txRes.data) setTransactions(txRes.data as PoolTransaction[]);
    if (depRes.data) setDeposits(depRes.data as StkDeposit[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Poll for STK deposit status updates
    const interval = setInterval(async () => {
      const hasPending = deposits.some((d) => d.status === "pending");
      if (hasPending) {
        await fetchData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [deposits.length]);

  const handleStkPush = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!phone) {
      toast.error("Enter your M-Pesa phone number");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mpesa-stk-push`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ phoneNumber: phone, amount: numAmount }),
        }
      );

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "STK push failed");
      }

      toast.success("Check your phone to complete the M-Pesa payment");
      setAmount("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualFund = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0 || !user) {
      toast.error("Enter a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("fund_reward_pool", {
        p_amount: numAmount,
        p_description: "Manual admin deposit",
        p_admin_id: user.id,
      });
      if (error) throw error;
      toast.success(`KES ${numAmount.toLocaleString()} added`);
      setAmount("");
      setBalance(data as number);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed");
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
        <p className="text-4xl font-bold">KES {(balance ?? 0).toLocaleString()}</p>
        <p className="text-sm opacity-75 mt-1">Available for user reward payouts</p>
      </div>

      {/* Add Funds */}
      <div className="rounded-2xl bg-card p-6 shadow-card space-y-4">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Add Funds to Pool
        </h3>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={mode === "mpesa" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("mpesa")}
            className={mode === "mpesa" ? "gradient-primary" : ""}
          >
            <Smartphone className="h-4 w-4 mr-1" />
            M-Pesa
          </Button>
          <Button
            variant={mode === "manual" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("manual")}
          >
            Manual
          </Button>
        </div>

        <div className="space-y-3">
          {mode === "mpesa" && (
            <div>
              <Label htmlFor="stk-phone">M-Pesa Phone Number</Label>
              <Input
                id="stk-phone"
                placeholder="e.g. 0712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          )}
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
          <Button
            onClick={mode === "mpesa" ? handleStkPush : handleManualFund}
            disabled={submitting || !amount || (mode === "mpesa" && !phone)}
            className="w-full gradient-primary"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : mode === "mpesa" ? (
              <Smartphone className="h-4 w-4 mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {mode === "mpesa" ? "Pay via M-Pesa" : "Add Funds Manually"}
          </Button>
        </div>
      </div>

      {/* Pending STK Deposits */}
      {deposits.length > 0 && (
        <div className="rounded-2xl bg-card p-6 shadow-card space-y-4">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            M-Pesa Deposits
          </h3>
          <div className="space-y-3">
            {deposits.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    d.status === "success" ? "bg-emerald-500/10 text-emerald-500" :
                    d.status === "failed" ? "bg-red-500/10 text-red-500" :
                    "bg-yellow-500/10 text-yellow-500"
                  }`}>
                    {d.status === "success" ? <CheckCircle className="h-4 w-4" /> :
                     d.status === "failed" ? <XCircle className="h-4 w-4" /> :
                     <Clock className="h-4 w-4 animate-pulse" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      KES {d.amount.toLocaleString()} → {d.phone_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {d.mpesa_receipt && `Receipt: ${d.mpesa_receipt} · `}
                      {d.error_message && `${d.error_message} · `}
                      {new Date(d.created_at).toLocaleDateString("en-KE", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  d.status === "success" ? "bg-emerald-500/10 text-emerald-600" :
                  d.status === "failed" ? "bg-red-500/10 text-red-600" :
                  "bg-yellow-500/10 text-yellow-600"
                }`}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="rounded-2xl bg-card p-6 shadow-card space-y-4">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Fund History
        </h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    tx.type === "deposit" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                  }`}>
                    <ArrowDownCircle className={`h-4 w-4 ${tx.type !== "deposit" ? "rotate-180" : ""}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.description || tx.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString("en-KE", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${tx.type === "deposit" ? "text-emerald-500" : "text-red-500"}`}>
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
