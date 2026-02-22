import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization")!;

    // Create client with user's token to verify identity
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role using service client
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all users from auth
    const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    if (usersError) throw usersError;

    // Fetch profiles
    const { data: profiles } = await adminClient.from("profiles").select("*");
    const { data: points } = await adminClient.from("user_points").select("*");
    const { data: collections } = await adminClient.from("collections").select("user_id, weight_kg, points_earned, created_at");
    const { data: redemptions } = await adminClient.from("redemptions").select("user_id, points_spent, amount_kes, status, created_at");
    const { data: roles } = await adminClient.from("user_roles").select("user_id, role");

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
    const pointsMap = new Map(points?.map(p => [p.user_id, p]) || []);
    const rolesMap = new Map<string, string[]>();
    roles?.forEach(r => {
      const existing = rolesMap.get(r.user_id) || [];
      existing.push(r.role);
      rolesMap.set(r.user_id, existing);
    });

    // Group activity per user
    const collectionsMap = new Map<string, any[]>();
    collections?.forEach(c => {
      const existing = collectionsMap.get(c.user_id) || [];
      existing.push(c);
      collectionsMap.set(c.user_id, existing);
    });

    const redemptionsMap = new Map<string, any[]>();
    redemptions?.forEach(r => {
      const existing = redemptionsMap.get(r.user_id) || [];
      existing.push(r);
      redemptionsMap.set(r.user_id, existing);
    });

    const enrichedUsers = users.map(u => {
      const profile = profileMap.get(u.id);
      const userPoints = pointsMap.get(u.id);
      const userCollections = collectionsMap.get(u.id) || [];
      const userRedemptions = redemptionsMap.get(u.id) || [];
      const userRoles = rolesMap.get(u.id) || ["user"];

      return {
        id: u.id,
        email: u.email,
        display_name: profile?.display_name || u.user_metadata?.full_name || u.email,
        phone: profile?.phone_number || u.phone,
        avatar_url: profile?.avatar_url || u.user_metadata?.avatar_url,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        roles: userRoles,
        points_balance: userPoints?.balance || 0,
        total_earned: userPoints?.total_earned || 0,
        total_spent: userPoints?.total_spent || 0,
        collections_count: userCollections.length,
        total_kg: userCollections.reduce((sum: number, c: any) => sum + Number(c.weight_kg), 0),
        redemptions_count: userRedemptions.length,
        total_redeemed_kes: userRedemptions
          .filter((r: any) => r.status === "success")
          .reduce((sum: number, r: any) => sum + r.amount_kes, 0),
      };
    });

    return new Response(JSON.stringify(enrichedUsers), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
