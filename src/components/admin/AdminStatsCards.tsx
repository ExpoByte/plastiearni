import { Users, Coins, Package, Banknote, Scale, Bell } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminStats {
  total_users: number;
  total_points_balance: number;
  total_points_earned: number;
  total_collections: number;
  total_kg_collected: number;
  total_redemptions: number;
  successful_redemptions: number;
  active_announcements: number;
}

interface AdminStatsCardsProps {
  stats: AdminStats | null;
}

export const AdminStatsCards = ({ stats }: AdminStatsCardsProps) => {
  const { t } = useLanguage();

  const statCards = [
    { icon: Users, label: t.totalUsers, value: stats?.total_users ?? 0, color: "bg-blue-500/10 text-blue-500" },
    { icon: Coins, label: t.pointsInCirculation, value: stats?.total_points_balance?.toLocaleString() ?? "0", color: "bg-yellow-500/10 text-yellow-500" },
    { icon: Scale, label: t.plasticCollected, value: `${Number(stats?.total_kg_collected ?? 0).toFixed(1)} kg`, color: "bg-green-500/10 text-green-500" },
    { icon: Package, label: t.collections, value: stats?.total_collections ?? 0, color: "bg-purple-500/10 text-purple-500" },
    { icon: Banknote, label: t.redemptions, value: `${stats?.successful_redemptions ?? 0}/${stats?.total_redemptions ?? 0}`, color: "bg-emerald-500/10 text-emerald-500" },
    { icon: Bell, label: t.activeAnnouncements, value: stats?.active_announcements ?? 0, color: "bg-orange-500/10 text-orange-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {statCards.map((stat, index) => (
        <div key={index} className="rounded-2xl bg-card p-4 shadow-card">
          <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
            <stat.icon className="h-5 w-5" />
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};
