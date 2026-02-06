import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("M-Pesa callback received:", JSON.stringify(body, null, 2));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse M-Pesa B2C callback structure
    const result = body.Result;
    if (!result) {
      console.error("Invalid callback structure - no Result field");
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const conversationId = result.ConversationID;
    const resultCode = result.ResultCode;
    const resultDesc = result.ResultDesc;

    console.log(`Processing callback: ConversationID=${conversationId}, ResultCode=${resultCode}`);

    // Find the redemption by transaction ID
    const { data: redemption, error: findError } = await supabase
      .from("redemptions")
      .select("*")
      .eq("mpesa_transaction_id", conversationId)
      .single();

    if (findError || !redemption) {
      console.error("Redemption not found for ConversationID:", conversationId);
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update redemption status based on result
    const newStatus = resultCode === 0 ? "success" : "failed";
    const updateData: Record<string, unknown> = {
      status: newStatus,
    };

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

    console.log(`Redemption ${redemption.id} updated to status: ${newStatus}`);

    // Return success to M-Pesa
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
