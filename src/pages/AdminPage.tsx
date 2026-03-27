import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAdminRole } from "@/hooks/useAdminRole";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import { AnnouncementsManager } from "@/components/admin/AnnouncementsManager";
import { UsersManager } from "@/components/admin/UsersManager";
import { PhotosGallery } from "@/components/admin/PhotosGallery";
import { CollectionsManager } from "@/components/admin/CollectionsManager";
import { AdjustmentsReview } from "@/components/admin/AdjustmentsReview";
import { AuditLogViewer } from "@/components/admin/AuditLogViewer";
import { FraudAlerts } from "@/components/admin/FraudAlerts";
import { QRGenerator } from "@/components/admin/QRGenerator";
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

export const AdminPage = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useAdminRole();
  const { t } = useLanguage();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) return;

      const { data, error } = await supabase.rpc("get_admin_stats");

      if (error) {
        console.error("Error fetching admin stats:", error);
      } else if (data && data.length > 0) {
        setStats(data[0]);
      }
      setStatsLoading(false);
    };

    if (!roleLoading && isAdmin) {
      fetchStats();
    }
  }, [isAdmin, roleLoading]);

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">{t.accessDenied}</h1>
        <p className="text-muted-foreground text-center mb-6">{t.noPermission}</p>
        <Button onClick={() => navigate("/")}>{t.backToHome}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="gradient-hero px-6 pb-8 pt-8 text-primary-foreground">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 opacity-80 hover:opacity-100"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{t.back}</span>
        </button>
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">{t.adminDashboard}</h1>
            <p className="text-sm opacity-80">{t.managePlatform}</p>
          </div>
        </div>
      </header>

      <main className="px-4 -mt-4">
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="overflow-x-auto -mx-4 px-4">
            <TabsList className="inline-flex w-auto min-w-full">
              <TabsTrigger value="overview">{t.overview}</TabsTrigger>
              <TabsTrigger value="collections">Ledger</TabsTrigger>
              <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
              <TabsTrigger value="users">{t.users}</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
              <TabsTrigger value="fraud">Alerts</TabsTrigger>
              <TabsTrigger value="announcements">{t.announcements}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <AdminStatsCards stats={stats} />
            )}
          </TabsContent>

          <TabsContent value="collections">
            <CollectionsManager />
          </TabsContent>

          <TabsContent value="adjustments">
            <AdjustmentsReview />
          </TabsContent>

          <TabsContent value="users">
            <UsersManager />
          </TabsContent>

          <TabsContent value="photos">
            <PhotosGallery />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogViewer />
          </TabsContent>

          <TabsContent value="fraud">
            <FraudAlerts />
          </TabsContent>

          <TabsContent value="announcements">
            <AnnouncementsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;
