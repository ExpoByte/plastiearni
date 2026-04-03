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
    const body = await req.json();
    console.log("STK callback received:", JSON.stringify(body));

    const callback = body?.Body?.stkCallback;
    if (!callback) {
      console.error("Invalid callback body");
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Find the pending deposit
    const { data: deposit, error: findErr } = await supabase
      .from("stk_deposits")
      .select("*")
      .eq("checkout_request_id", CheckoutRequestID)
      .eq("status", "pending")
      .single();

    if (findErr || !deposit) {
      console.error("Deposit not found for", CheckoutRequestID);
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (ResultCode === 0) {
      // Payment successful - extract receipt number
      let receipt = "";
      if (CallbackMetadata?.Item) {
        const receiptItem = CallbackMetadata.Item.find(
          (i: any) => i.Name === "MpesaReceiptNumber"
        );
        if (receiptItem) receipt = receiptItem.Value;
      }

      // Update deposit status
      await supabase
        .from("stk_deposits")
        .update({ status: "success", mpesa_receipt: receipt })
        .eq("id", deposit.id);

      // Credit the reward pool
      await supabase.rpc("fund_reward_pool", {
        p_amount: deposit.amount,
        p_description: `M-Pesa STK deposit (${receipt || CheckoutRequestID})`,
        p_admin_id: deposit.admin_id,
      });

      console.log(`Pool funded: KES ${deposit.amount} via STK push`);
    } else {
      // Payment failed
      await supabase
        .from("stk_deposits")
        .update({ status: "failed", error_message: ResultDesc })
        .eq("id", deposit.id);

      console.log(`STK payment failed: ${ResultDesc}`);
    }

    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("STK callback error:", err);
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
});
