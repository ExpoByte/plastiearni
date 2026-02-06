import { Megaphone, Newspaper, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnouncementCardProps {
  title: string;
  content: string;
  category: string;
  isPinned?: boolean;
  publishedAt: string;
  linkUrl?: string | null;
}

const categoryConfig: Record<string, { icon: typeof Megaphone; color: string; label: string }> = {
  announcement: { icon: Megaphone, color: "bg-primary/10 text-primary", label: "Announcement" },
  news: { icon: Newspaper, color: "bg-secondary/50 text-secondary-foreground", label: "News" },
  promotion: { icon: Sparkles, color: "bg-accent/20 text-accent-foreground", label: "Promo" },
};

export const AnnouncementCard = ({
  title,
  content,
  category,
  isPinned,
  publishedAt,
  linkUrl,
}: AnnouncementCardProps) => {
  const config = categoryConfig[category] || categoryConfig.news;
  const Icon = config.icon;

  const formattedDate = new Date(publishedAt).toLocaleDateString("en-KE", {
    month: "short",
    day: "numeric",
  });

  const CardWrapper = linkUrl ? "a" : "div";
  const cardProps = linkUrl ? { href: linkUrl, target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <CardWrapper
      {...cardProps}
      className={cn(
        "block rounded-2xl bg-card p-4 shadow-card transition-all",
        linkUrl && "hover:shadow-elevated cursor-pointer",
        isPinned && "ring-2 ring-primary/30"
      )}
    >
      <div className="flex gap-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", config.color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground line-clamp-1">{title}</h3>
            {isPinned && (
              <span className="shrink-0 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                📌 Pinned
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{content}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
            {linkUrl && (
              <span className="text-xs text-primary flex items-center gap-1">
                Read more <ChevronRight className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};
