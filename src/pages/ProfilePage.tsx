import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/ui/button";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
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
  Loader2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const allBadges = [
  { icon: Leaf, label: "Mwanzo", unlocked: true },
  { icon: Recycle, label: "10kg Hero", unlocked: true },
  { icon: Droplet, label: "Bahari Saver", unlocked: true },
  { icon: TreeDeciduous, label: "Miti Friend", unlocked: false },
  { icon: Award, label: "Champion", unlocked: false },
];

interface Profile {
  display_name: string | null;
  phone_number: string | null;
  created_at: string;
}

export const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminRole();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const [profileResult, pointsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, phone_number, created_at")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("user_points")
          .select("balance")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (profileResult.data) {
        setProfile(profileResult.data);
      }
      if (pointsResult.data) {
        setUserPoints(pointsResult.data.balance);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    setSigningOut(true);
    const { error } = await signOut();
    if (error) {
      toast.error("Failed to sign out");
      setSigningOut(false);
    } else {
      navigate("/auth");
    }
  };

  const handleMenuClick = (action: string) => {
    switch (action) {
      case "edit":
        setEditProfileOpen(true);
        break;
      case "settings":
        setSettingsOpen(true);
        break;
      case "notifications":
        toast.info("Notifications coming soon!");
        break;
      case "help":
        toast.info("Help & Support coming soon!");
        break;
      case "invite":
        toast.info("Invite Friends coming soon!");
        break;
      case "admin":
        navigate("/admin");
        break;
    }
  };

  const menuItems = [
    { icon: User, label: t.editProfile, action: "edit" },
    { icon: Bell, label: t.notifications, action: "notifications" },
    { icon: Settings, label: t.settings, action: "settings" },
    { icon: HelpCircle, label: t.helpSupport, action: "help" },
    { icon: Share2, label: t.inviteFriends, action: "invite" },
    ...(isAdmin ? [{ icon: Shield, label: t.adminDashboard, action: "admin" }] : []),
  ];

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "2025";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-hero px-6 pb-20 pt-8 text-primary-foreground">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t.profile}</h1>
          <Button variant="glass" size="icon" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Profile card */}
      <div className="relative -mt-16 px-4">
        <div className="rounded-3xl bg-card p-6 shadow-card text-center">
          {/* Avatar */}
          <div className="mx-auto -mt-16 mb-4 flex h-24 w-24 items-center justify-center rounded-full gradient-primary text-3xl font-bold text-primary-foreground shadow-elevated ring-4 ring-card">
            {initials}
          </div>

          <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
          <p className="text-sm text-muted-foreground">{t.ecoWarriorSince} {joinDate}</p>
          <p className="text-xs text-muted-foreground mt-1">📍 Nairobi, Kenya</p>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-primary/10 p-3">
              <p className="text-2xl font-bold text-primary">32.5</p>
              <p className="text-xs text-muted-foreground">{t.kgCollected}</p>
            </div>
            <div className="rounded-2xl bg-secondary/10 p-3">
              <p className="text-2xl font-bold text-secondary">{userPoints.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{t.points}</p>
              <p className="text-[10px] text-muted-foreground">≈ KES {userPoints.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-accent/20 p-3">
              <p className="text-2xl font-bold text-accent-foreground">3</p>
              <p className="text-xs text-muted-foreground">{t.badges}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges section */}
      <div className="mt-6 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">{t.achievements}</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            {t.viewAll}
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
              key={item.action}
              onClick={() => handleMenuClick(item.action)}
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
        <Button
          variant="outline"
          className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <LogOut className="h-5 w-5" />
              {t.logOut}
            </>
          )}
        </Button>
      </div>

      {/* Dialogs */}
      <EditProfileDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
