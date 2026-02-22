import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate callback secret token from query parameter
    const url = new URL(req.url);
    const providedSecret = url.searchParams.get("secret");
    const expectedSecret = Deno.env.get("MPESA_CALLBACK_SECRET");

    if (!expectedSecret || providedSecret !== expectedSecret) {
      console.error("Invalid or missing callback secret");
      return new Response(
        JSON.stringify({ ResultCode: 1, ResultDesc: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const result = body.Result;
    if (!result) {
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const conversationId = result.ConversationID;
    const resultCode = result.ResultCode;
    const resultDesc = result.ResultDesc;

    if (!conversationId || typeof resultCode !== "number") {
      console.error("Invalid callback payload structure");
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the redemption - must be in "processing" state to prevent replay
    const { data: redemption, error: findError } = await supabase
      .from("redemptions")
      .select("*")
      .eq("mpesa_transaction_id", conversationId)
      .eq("status", "processing")
      .single();

    if (findError || !redemption) {
      console.error("Redemption not found or already processed for:", conversationId);
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newStatus = resultCode === 0 ? "success" : "failed";
    const updateData: Record<string, unknown> = { status: newStatus };

    if (resultCode !== 0) {
      updateData.error_message = resultDesc;

      // Refund points if payment failed
      const { data: pointsData } = await supabase
        .from("user_points")
        .select("balance, total_spent")
        .eq("user_id", redemption.user_id)
        .single();

      if (pointsData) {
        await supabase
          .from("user_points")
          .update({
            balance: pointsData.balance + redemption.points_spent,
            total_spent: Math.max(0, pointsData.total_spent - redemption.points_spent),
          })
          .eq("user_id", redemption.user_id);
      }
    }

    await supabase
      .from("redemptions")
      .update(updateData)
      .eq("id", redemption.id);

    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Callback processing error:", error);
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
