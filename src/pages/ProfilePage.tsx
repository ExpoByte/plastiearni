import { BottomNav } from "@/components/BottomNav";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Leaf,
  Recycle,
  Droplet,
  TreeDeciduous,
  Award,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: User, label: "Edit Profile", path: "/profile/edit" },
  { icon: Bell, label: "Notifications", path: "/profile/notifications" },
  { icon: Settings, label: "Settings", path: "/profile/settings" },
  { icon: HelpCircle, label: "Help & Support", path: "/profile/help" },
  { icon: Share2, label: "Invite Friends", path: "/profile/invite" },
];

const allBadges = [
  { icon: Leaf, label: "Mwanzo", unlocked: true },
  { icon: Recycle, label: "10kg Hero", unlocked: true },
  { icon: Droplet, label: "Bahari Saver", unlocked: true },
  { icon: TreeDeciduous, label: "Miti Friend", unlocked: false },
  { icon: Award, label: "Champion", unlocked: false },
];

export const ProfilePage = () => {
  const totalPoints = 4850;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-hero px-6 pb-20 pt-8 text-primary-foreground">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button variant="glass" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Profile card */}
      <div className="relative -mt-16 px-4">
        <div className="rounded-3xl bg-card p-6 shadow-card text-center">
          {/* Avatar */}
          <div className="mx-auto -mt-16 mb-4 flex h-24 w-24 items-center justify-center rounded-full gradient-primary text-3xl font-bold text-primary-foreground shadow-elevated ring-4 ring-card">
            WM
          </div>

          <h2 className="text-xl font-bold text-foreground">Wanjiku Mwangi</h2>
          <p className="text-sm text-muted-foreground">Eco Warrior since January 2025</p>
          <p className="text-xs text-muted-foreground mt-1">📍 Nairobi, Kenya</p>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-primary/10 p-3">
              <p className="text-2xl font-bold text-primary">32.5</p>
              <p className="text-xs text-muted-foreground">kg collected</p>
            </div>
            <div className="rounded-2xl bg-secondary/10 p-3">
              <p className="text-2xl font-bold text-secondary">{totalPoints.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">points</p>
              <p className="text-[10px] text-muted-foreground">≈ KES {totalPoints.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-accent/20 p-3">
              <p className="text-2xl font-bold text-accent-foreground">3</p>
              <p className="text-xs text-muted-foreground">badges</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges section */}
      <div className="mt-6 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Achievements</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            View All
          </Button>
        </div>
        <div className="mt-4 flex justify-between rounded-2xl bg-card p-4 shadow-soft">
          {allBadges.map((badge, index) => (
            <Badge key={index} icon={badge.icon} label={badge.label} unlocked={badge.unlocked} size="sm" />
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="mt-6 px-4">
        <div className="rounded-2xl bg-card shadow-soft overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.path}
              className={cn(
                "flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/50",
                index !== menuItems.length - 1 && "border-b border-border"
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <span className="flex-1 font-medium text-foreground">{item.label}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Logout button */}
      <div className="mt-6 px-4">
        <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10">
          <LogOut className="h-5 w-5" />
          Log Out
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
