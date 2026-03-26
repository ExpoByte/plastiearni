import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  actor_id: string | null;
  actor_type: string;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const actionColors: Record<string, string> = {
  created: "bg-green-500/10 text-green-600",
  adjustment_created: "bg-yellow-500/10 text-yellow-600",
  adjustment_approved: "bg-green-500/10 text-green-600",
  adjustment_rejected: "bg-red-500/10 text-red-600",
  adjustment_updated: "bg-blue-500/10 text-blue-600",
};

export const AuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) console.error("Error:", error);
      else setLogs((data as unknown as AuditLog[]) || []);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.table_name.toLowerCase().includes(search.toLowerCase()) ||
      l.record_id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Audit Trail</h2>
        <span className="text-xs text-muted-foreground">{logs.length} entries</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by action, table, or record ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 text-sm"
        />
      </div>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {filtered.map((log) => (
          <div key={log.id} className="rounded-xl bg-card p-3 border border-border text-xs space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3 text-muted-foreground" />
                <span className={cn("px-1.5 py-0.5 rounded-full font-semibold", actionColors[log.action] || "bg-muted text-muted-foreground")}>
                  {log.action}
                </span>
                <span className="text-muted-foreground">{log.table_name}</span>
              </div>
              <span className="text-muted-foreground">{formatDate(log.created_at)}</span>
            </div>
            <div className="text-muted-foreground">
              <span className="font-mono text-[10px]">{log.record_id.slice(0, 8)}...</span>
              {" · "}{log.actor_type}
              {log.metadata && (
                <span> · {JSON.stringify(log.metadata).slice(0, 80)}</span>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {search ? "No matching logs" : "No audit logs yet"}
          </div>
        )}
      </div>
    </div>
  );
};
