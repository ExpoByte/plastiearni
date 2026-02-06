import { BottomNav } from "@/components/BottomNav";
import { RewardCard } from "@/components/RewardCard";
import { RedemptionDialog } from "@/components/RedemptionDialog";
import { Button } from "@/components/ui/button";
import { Smartphone, ShoppingBag, Banknote, Heart, Gift, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const categories = ["All", "Airtime", "Vouchers", "Cash", "Donate"];

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
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedReward, setSelectedReward] = useState<SelectedReward | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const userPoints = 4850;

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

  const handleRedeem = (reward: typeof rewards[0]) => {
    setSelectedReward({
      title: reward.title,
      category: reward.category,
      points: reward.points,
      amount: reward.amount,
    });
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-hero px-6 pb-8 pt-8 text-primary-foreground">
        <h1 className="text-2xl font-bold">Rewards</h1>
        <p className="text-sm opacity-80">Exchange points for amazing rewards</p>

        {/* Points balance */}
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-80">Available Points</p>
              <p className="text-2xl font-bold">{userPoints.toLocaleString()}</p>
              <p className="text-xs opacity-60">≈ KES {userPoints.toLocaleString()}</p>
            </div>
          </div>
          <Gift className="h-8 w-8 opacity-50" />
        </div>
      </header>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto px-4 py-4 no-scrollbar -mt-4">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "glass"}
            size="sm"
            onClick={() => setActiveCategory(category)}
            className="shrink-0"
          >
            {category}
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
              available={reward.available && userPoints >= reward.points}
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
      />

      <BottomNav />
    </div>
  );
};

export default RewardsPage;
