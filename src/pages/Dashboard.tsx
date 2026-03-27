import { useState, useEffect } from "react";
import { Coins, Weight, Recycle, TrendingUp, Plus, MapPin, Gift, History, Loader2, QrCode } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { FloatingAssistantButton } from "@/components/FloatingAssistantButton";
import { StatCard } from "@/components/StatCard";
import { ProgressRing } from "@/components/ProgressRing";
import { QuickAction } from "@/components/QuickAction";
import { CollectionCard } from "@/components/CollectionCard";
import { NewsSection } from "@/components/NewsSection";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/ui/button";
import { Leaf, Droplet, TreeDeciduous } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const recentCollections = [
  {
    date: "Feb 4, 2026",
    location: "EcoRecycle Westlands, Nairobi",
    weight: 5.2,
    points: 520,
    status: "completed" as const,
  },
  {
    date: "Feb 1, 2026",
    location: "PlastiCollect CBD, Nairobi",
    weight: 3.8,
    points: 380,
    status: "verified" as const,
  },
];

const badges = [
  { icon: Leaf, label: "Mwanzo", unlocked: true },
  { icon: Recycle, label: "10kg Hero", unlocked: true },
  { icon: Droplet, label: "Bahari Saver", unlocked: true },
  { icon: TreeDeciduous, label: "Miti Friend", unlocked: false },
];

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);
  const [points, setPoints] = useState<{ balance: number; total_earned: number } | null>(null);

  const monthlyGoal = 50; // kg
  const currentProgress = 32.5; // kg - This would come from a collections table in a full implementation
  const progressPercent = (currentProgress / monthlyGoal) * 100;
  const pointsValue = points?.balance ?? 0;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      const [profileRes, pointsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("user_points")
          .select("balance, total_earned")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (pointsRes.data) setPoints(pointsRes.data);
      setLoading(false);
    };

    fetchUserData();

    // Subscribe to realtime updates for user_points
    if (!user) return;

    const channel = supabase
      .channel('dashboard-points')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_points',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Points updated:', payload);
          if (payload.new && typeof payload.new === 'object' && 'balance' in payload.new) {
            setPoints({
              balance: payload.new.balance as number,
              total_earned: (payload.new as { total_earned: number }).total_earned,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-hero px-6 pb-24 pt-8 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">{t.welcome},</p>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin mt-1" />
            ) : (
              <h1 className="text-2xl font-bold">{displayName}</h1>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <span className="text-lg font-bold">{getInitials(displayName)}</span>
          </div>
        </div>

        {/* Points display */}
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
          <div>
            <p className="text-sm opacity-80">{t.totalPoints}</p>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin mt-1" />
            ) : (
              <>
                <p className="text-3xl font-bold">{pointsValue.toLocaleString()}</p>
                <p className="text-xs opacity-60">≈ KES {pointsValue.toLocaleString()}</p>
              </>
            )}
          </div>
          <Button variant="glass" size="sm" onClick={() => navigate("/rewards")}>
            {t.redeem}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative -mt-16 px-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={Weight}
            label={t.totalCollected}
            value="32.5 kg"
            subtext={t.thisMonth}
            variant="primary"
          />
          <StatCard
            icon={TrendingUp}
            label={t.impactScore}
            value="A+"
            subtext={t.topInKenya}
            variant="accent"
          />
        </div>

        {/* Monthly goal progress */}
        <div className="mt-6 rounded-3xl bg-card p-6 shadow-card animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">{t.monthlyGoal}</h2>
              <p className="text-sm text-muted-foreground">
                {currentProgress} / {monthlyGoal} kg
              </p>
            </div>
            <ProgressRing progress={progressPercent} size={100}>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{Math.round(progressPercent)}%</p>
              </div>
            </ProgressRing>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full gradient-primary rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {monthlyGoal - currentProgress} {t.moreToGoal} 🎯
          </p>
        </div>

        {/* Quick actions */}
        <div className="mt-6">
          <h2 className="mb-4 text-lg font-bold text-foreground">{t.quickActions}</h2>
          <div className="grid grid-cols-4 gap-2">
            <QuickAction icon={Plus} label={t.logCollection} to="/log" color="primary" />
            <QuickAction icon={QrCode} label="Scan QR" to="/scan" color="secondary" />
            <QuickAction icon={Gift} label={t.rewards} to="/rewards" color="accent" />
            <QuickAction icon={History} label={t.history} to="/history" color="primary" />
          </div>
        </div>

        {/* News & Announcements */}
        <NewsSection />

        {/* Badges */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">{t.yourBadges}</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              {t.viewAll}
            </Button>
          </div>
          <div className="mt-4 flex justify-between">
            {badges.map((badge, index) => (
              <Badge key={index} icon={badge.icon} label={badge.label} unlocked={badge.unlocked} size="sm" />
            ))}
          </div>
        </div>

        {/* Recent collections */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">{t.recentActivity}</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              {t.seeAll}
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {recentCollections.map((collection, index) => (
              <CollectionCard key={index} {...collection} />
            ))}
          </div>
        </div>
      </main>

      <FloatingAssistantButton />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
