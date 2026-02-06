import { BottomNav } from "@/components/BottomNav";
import { FloatingAssistantButton } from "@/components/FloatingAssistantButton";
import { RewardCard } from "@/components/RewardCard";
import { RedemptionDialog } from "@/components/RedemptionDialog";
import { Button } from "@/components/ui/button";
import { Smartphone, ShoppingBag, Banknote, Heart, Gift, Coins, Loader2, History } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const rewards = [
  {
    icon: Smartphone,
    title: "KES 100 Airtime",
    description: "Top up Safaricom, Airtel or Telkom",
    points: 100,
    amount: 100,
    category: "airtime" as const,
    available: true,
  },
  {
    icon: Smartphone,
    title: "KES 500 Airtime",
    description: "Larger airtime credit for all networks",
    points: 480,
    amount: 500,
    category: "airtime" as const,
    available: true,
  },
  {
    icon: ShoppingBag,
    title: "KES 1,000 Naivas Voucher",
    description: "Shop at any Naivas supermarket",
    points: 950,
    amount: 1000,
    category: "voucher" as const,
    available: true,
  },
  {
    icon: ShoppingBag,
    title: "KES 2,500 Carrefour Voucher",
    description: "Premium shopping at Carrefour Kenya",
    points: 2400,
    amount: 2500,
    category: "voucher" as const,
    available: true,
  },
  {
    icon: Banknote,
    title: "KES 500 M-Pesa",
    description: "Direct transfer to your M-Pesa",
    points: 550,
    amount: 500,
    category: "cash" as const,
    available: true,
  },
  {
    icon: Banknote,
    title: "KES 2,000 M-Pesa",
    description: "Larger M-Pesa withdrawal",
    points: 2100,
    amount: 2000,
    category: "cash" as const,
    available: true,
  },
  {
    icon: Banknote,
    title: "KES 5,000 Bank Transfer",
    description: "Direct to your bank account",
    points: 5200,
    amount: 5000,
    category: "cash" as const,
    available: false,
  },
  {
    icon: Heart,
    title: "Plant a Tree in Karura",
    description: "Support reforestation in Karura Forest",
    points: 300,
    amount: 300,
    category: "donation" as const,
    available: true,
  },
  {
    icon: Heart,
    title: "Clean Mombasa Beach",
    description: "Support coastal cleanup initiatives",
    points: 500,
    amount: 500,
    category: "donation" as const,
    available: true,
  },
];

interface SelectedReward {
  title: string;
  category: string;
  points: number;
  amount: number;
}

export const RewardsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedReward, setSelectedReward] = useState<SelectedReward | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [loadingPoints, setLoadingPoints] = useState(true);

  const categories = [
    { key: "All", label: t.all },
    { key: "Airtime", label: t.airtime },
    { key: "Vouchers", label: t.vouchers },
    { key: "Cash", label: t.cash },
    { key: "Donate", label: t.donate },
  ];

  useEffect(() => {
    const fetchPoints = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("user_points")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching points:", error);
        toast.error("Failed to load points balance");
      }
      
      setUserPoints(data?.balance ?? 0);
      setLoadingPoints(false);
    };

    fetchPoints();
  }, [user]);

  const filteredRewards = rewards.filter((r) => {
    if (activeCategory === "All") return true;
    const categoryMap: Record<string, string> = {
      Airtime: "airtime",
      Vouchers: "voucher",
      Cash: "cash",
      Donate: "donation",
    };
    return r.category === categoryMap[activeCategory];
  });

  const handleRedemptionSuccess = () => {
    // Refresh points after successful redemption
    if (user) {
      supabase
        .from("user_points")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          setUserPoints(data?.balance ?? 0);
        });
    }
  };

  const handleRedeem = (reward: typeof rewards[0]) => {
    setSelectedReward({
      title: reward.title,
      category: reward.category,
      points: reward.points,
      amount: reward.amount,
    });
    setDialogOpen(true);
  };

  const displayPoints = userPoints ?? 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-hero px-6 pb-8 pt-8 text-primary-foreground">
        <h1 className="text-2xl font-bold">{t.rewards}</h1>
        <p className="text-sm opacity-80">{t.exchangePoints}</p>

        {/* Points balance */}
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-80">{t.availablePoints}</p>
              {loadingPoints ? (
                <Loader2 className="h-6 w-6 animate-spin mt-1" />
              ) : (
                <>
                  <p className="text-2xl font-bold">{displayPoints.toLocaleString()}</p>
                  <p className="text-xs opacity-60">≈ KES {displayPoints.toLocaleString()}</p>
                </>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/10"
            onClick={() => navigate("/redemption-history")}
            title={t.redemptionHistory}
          >
            <History className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto px-4 py-4 no-scrollbar -mt-4">
        {categories.map((category) => (
          <Button
            key={category.key}
            variant={activeCategory === category.key ? "default" : "glass"}
            size="sm"
            onClick={() => setActiveCategory(category.key)}
            className="shrink-0"
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Rewards grid */}
      <main className="px-4">
        <div className="space-y-4">
          {filteredRewards.map((reward, index) => (
            <RewardCard
              key={index}
              icon={reward.icon}
              title={reward.title}
              description={reward.description}
              points={reward.points}
              category={reward.category}
              available={reward.available && displayPoints >= reward.points}
              onRedeem={() => handleRedeem(reward)}
            />
          ))}
        </div>
      </main>

      {/* Redemption Dialog */}
      <RedemptionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        reward={selectedReward}
        onSuccess={handleRedemptionSuccess}
      />

      <FloatingAssistantButton />
      <BottomNav />
    </div>
  );
};

export default RewardsPage;
