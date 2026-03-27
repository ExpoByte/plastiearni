import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user from the token
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { transactionCode } = await req.json();
    if (!transactionCode) {
      return new Response(JSON.stringify({ error: "Missing transaction code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the QR transaction
    const { data: txn, error: txnError } = await supabase
      .from("qr_transactions")
      .select("*")
      .eq("transaction_code", transactionCode)
      .single();

    if (txnError || !txn) {
      return new Response(JSON.stringify({ error: "Invalid QR code" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate status
    if (txn.status === "used") {
      return new Response(JSON.stringify({ error: "This QR code has already been used" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiry
    if (new Date(txn.expires_at) < new Date()) {
      // Mark as expired
      await supabase.from("qr_transactions").update({ status: "expired" }).eq("id", txn.id);
      return new Response(JSON.stringify({ error: "This QR code has expired" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Atomically mark as used
    const { data: updated, error: updateError } = await supabase
      .from("qr_transactions")
      .update({
        status: "used",
        used_by: user.id,
        used_at: new Date().toISOString(),
      })
      .eq("id", txn.id)
      .eq("status", "unused") // Prevents race condition
      .select()
      .single();

    if (updateError || !updated) {
      return new Response(JSON.stringify({ error: "QR code already claimed" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Credit points to user
    const { data: existingPoints } = await supabase
      .from("user_points")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (existingPoints) {
      await supabase
        .from("user_points")
        .update({
          balance: existingPoints.balance + txn.points,
          total_earned: existingPoints.total_earned + txn.points,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    } else {
      await supabase.from("user_points").insert({
        user_id: user.id,
        balance: txn.points,
        total_earned: txn.points,
        total_spent: 0,
      });
    }

    // Create a collection record for the user's history
    await supabase.from("collections").insert({
      user_id: user.id,
      weight_kg: txn.weight_kg,
      points_earned: txn.points,
      plastic_type: txn.plastic_type,
      location: txn.location,
      status: "verified",
      notes: `QR scan: ${txn.transaction_code.slice(0, 8)}...`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        points: txn.points,
        weight_kg: txn.weight_kg,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("QR redeem error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
