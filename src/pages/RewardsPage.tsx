import { BottomNav } from "@/components/BottomNav";
import { RewardCard } from "@/components/RewardCard";
import { Button } from "@/components/ui/button";
import { Smartphone, ShoppingBag, Banknote, Heart, Gift, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const categories = ["All", "Airtime", "Vouchers", "Cash", "Donate"];

const rewards = [
  {
    icon: Smartphone,
    title: "₦500 Airtime",
    description: "Top up your phone with airtime credit",
    points: 500,
    category: "airtime" as const,
    available: true,
  },
  {
    icon: Smartphone,
    title: "₦1,000 Airtime",
    description: "Larger airtime credit for all networks",
    points: 950,
    category: "airtime" as const,
    available: true,
  },
  {
    icon: ShoppingBag,
    title: "₦2,000 Shopping Voucher",
    description: "Use at participating supermarkets",
    points: 1800,
    category: "voucher" as const,
    available: true,
  },
  {
    icon: ShoppingBag,
    title: "₦5,000 Shopping Voucher",
    description: "Premium shopping experience",
    points: 4500,
    category: "voucher" as const,
    available: true,
  },
  {
    icon: Banknote,
    title: "₦1,000 Cash",
    description: "Direct bank transfer to your account",
    points: 1200,
    category: "cash" as const,
    available: true,
  },
  {
    icon: Banknote,
    title: "₦5,000 Cash",
    description: "Larger cash withdrawal",
    points: 5500,
    category: "cash" as const,
    available: false,
  },
  {
    icon: Heart,
    title: "Plant a Tree",
    description: "Donate points to plant trees in your community",
    points: 300,
    category: "donation" as const,
    available: true,
  },
  {
    icon: Heart,
    title: "Ocean Cleanup Fund",
    description: "Support ocean plastic removal projects",
    points: 500,
    category: "donation" as const,
    available: true,
  },
];

export const RewardsPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
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
              {...reward}
              available={reward.available && userPoints >= reward.points}
            />
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default RewardsPage;
