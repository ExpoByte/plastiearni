import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, User, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EnrichedUser {
  id: string;
  email: string;
  display_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
  points_balance: number;
  total_earned: number;
  total_spent: number;
  collections_count: number;
  total_kg: number;
  redemptions_count: number;
  total_redeemed_kes: number;
}

export const UsersManager = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<EnrichedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.functions.invoke("admin-users");
      if (error) {
        setError(error.message);
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u =>
    (u.display_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (u.email?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Failed to load users: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">{t.totalUsers}: {users.length}</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.id} className="rounded-2xl bg-card shadow-soft overflow-hidden">
            <button
              onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{user.display_name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {user.roles.includes("admin") && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary">Admin</span>
                )}
                {expandedUser === user.id ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {expandedUser === user.id && (
              <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem label="Joined" value={formatDate(user.created_at)} />
                  <InfoItem label="Last Sign In" value={formatDate(user.last_sign_in_at)} />
                  <InfoItem label="Phone" value={user.phone || "Not set"} />
                  <InfoItem label="Roles" value={user.roles.join(", ")} />
                </div>

                <div className="mt-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Activity</p>
                  <div className="grid grid-cols-3 gap-2">
                    <StatBox label="Points" value={user.points_balance.toLocaleString()} color="text-primary" />
                    <StatBox label="Total Earned" value={user.total_earned.toLocaleString()} color="text-primary" />
                    <StatBox label="Total Spent" value={user.total_spent.toLocaleString()} color="text-primary" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <StatBox label="Collections" value={String(user.collections_count)} color="text-secondary" />
                    <StatBox label="Kg Collected" value={user.total_kg.toFixed(1)} color="text-secondary" />
                    <StatBox label="Redemptions" value={String(user.redemptions_count)} color="text-accent-foreground" />
                  </div>
                  {user.total_redeemed_kes > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Total Redeemed: KES {user.total_redeemed_kes.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No users found</p>
        )}
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className="text-sm text-foreground">{value}</p>
  </div>
);

const StatBox = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="rounded-xl bg-muted/50 p-2 text-center">
    <p className={cn("text-lg font-bold", color)}>{value}</p>
    <p className="text-[10px] text-muted-foreground">{label}</p>
  </div>
);
