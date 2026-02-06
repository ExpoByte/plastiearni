import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AnnouncementCard } from "./AnnouncementCard";
import { Button } from "@/components/ui/button";
import { Loader2, Bell } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  published_at: string;
  link_url: string | null;
}

export const NewsSection = () => {
  const { language } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const t = {
    title: language === "sw" ? "Habari & Matangazo" : "News & Updates",
    viewAll: language === "sw" ? "Ona Zote" : "View All",
    showLess: language === "sw" ? "Punguza" : "Show Less",
    noNews: language === "sw" ? "Hakuna habari kwa sasa" : "No news at the moment",
  };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .order("is_pinned", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching announcements:", error);
      } else {
        setAnnouncements(data || []);
      }
      setLoading(false);
    };

    fetchAnnouncements();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("announcements-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "announcements",
        },
        () => {
          // Refetch on any change
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const displayedAnnouncements = showAll ? announcements : announcements.slice(0, 2);

  if (loading) {
    return (
      <div className="mt-6">
        <h2 className="mb-4 text-lg font-bold text-foreground flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          {t.title}
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="mt-6">
        <h2 className="mb-4 text-lg font-bold text-foreground flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          {t.title}
        </h2>
        <div className="rounded-2xl bg-card p-6 text-center text-muted-foreground">
          {t.noNews}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          {t.title}
        </h2>
        {announcements.length > 2 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? t.showLess : t.viewAll}
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {displayedAnnouncements.map((announcement) => (
          <AnnouncementCard
            key={announcement.id}
            title={announcement.title}
            content={announcement.content}
            category={announcement.category}
            isPinned={announcement.is_pinned}
            publishedAt={announcement.published_at}
            linkUrl={announcement.link_url}
          />
        ))}
      </div>
    </div>
  );
};
