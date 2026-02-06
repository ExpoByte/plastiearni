import { Home, History, Gift, MapPin, User } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export const BottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t.home, path: "/" },
    { icon: History, label: t.history, path: "/history" },
    { icon: MapPin, label: t.map, path: "/map" },
    { icon: Gift, label: t.rewards, path: "/rewards" },
    { icon: User, label: t.profile, path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 px-2 pb-2 pt-2 animate-slide-in-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-4 py-2 transition-all duration-300",
                isActive
                  ? "gradient-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "animate-scale-in")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
