import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// M-Pesa Daraja sandbox base URL
const MPESA_API_URL = "https://sandbox.safaricom.co.ke";

// Server-side reward tiers - single source of truth
const REWARD_TIERS = [
  { title: "KES 100 Airtime", points: 100, amount: 100, category: "airtime" },
  { title: "KES 500 Airtime", points: 480, amount: 500, category: "airtime" },
  { title: "KES 1,000 Naivas Voucher", points: 950, amount: 1000, category: "voucher" },
  { title: "KES 2,500 Carrefour Voucher", points: 2400, amount: 2500, category: "voucher" },
  { title: "KES 500 M-Pesa", points: 550, amount: 500, category: "cash" },
  { title: "KES 2,000 M-Pesa", points: 2100, amount: 2000, category: "cash" },
  { title: "Plant a Tree in Karura", points: 300, amount: 300, category: "donation" },
  { title: "Clean Mombasa Beach", points: 500, amount: 500, category: "donation" },
];

interface RedeemRequest {
  phoneNumber: string;
  amount: number;
  rewardTitle: string;
  rewardCategory: string;
  pointsSpent: number;
}

async function getAccessToken(): Promise<string> {
  const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
  const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");

  if (!consumerKey || !consumerSecret) {
    throw new Error("M-Pesa credentials not configured");
  }

  const credentials = btoa(`${consumerKey}:${consumerSecret}`);

  const response = await fetch(
    `${MPESA_API_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get M-Pesa access token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function initiateB2CPayment(
  accessToken: string,
  phoneNumber: string,
  amount: number
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  const shortcode = Deno.env.get("MPESA_SHORTCODE");

  if (!shortcode) {
    throw new Error("M-Pesa shortcode not configured");
  }

  // Format phone number
  let formattedPhone = phoneNumber.replace(/\s/g, "");
  if (formattedPhone.startsWith("+")) {
    formattedPhone = formattedPhone.substring(1);
  }
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "254" + formattedPhone.substring(1);
  }
  if (!formattedPhone.startsWith("254")) {
    formattedPhone = "254" + formattedPhone;
  }

  const callbackSecret = Deno.env.get("MPESA_CALLBACK_SECRET") || "";
  const callbackUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/mpesa-callback?secret=${encodeURIComponent(callbackSecret)}`;

  const payload = {
    InitiatorName: "testapi",
    SecurityCredential: Deno.env.get("MPESA_PASSKEY") || "",
    CommandID: "BusinessPayment",
    Amount: amount,
    PartyA: shortcode,
    PartyB: formattedPhone,
    Remarks: "Taka Points Redemption",
    QueueTimeOutURL: callbackUrl,
    ResultURL: callbackUrl,
    Occassion: "TakaReward",
  };

  const response = await fetch(`${MPESA_API_URL}/mpesa/b2c/v1/paymentrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || data.errorCode) {
    return {
      success: false,
      error: data.errorMessage || data.ResultDesc || "B2C payment failed",
    };
  }

  return {
    success: true,
    transactionId: data.ConversationID || data.OriginatorConversationID,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    const body: RedeemRequest = await req.json();
    const { phoneNumber, amount, rewardTitle, rewardCategory, pointsSpent } = body;

    if (!phoneNumber || !amount || !rewardTitle || !pointsSpent) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate phone number format (Kenyan)
    const cleanPhone = phoneNumber.replace(/\s/g, "");
    const phoneRegex = /^(?:\+254|254|0)?[17]\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SERVER-SIDE REWARD TIER VALIDATION
    const matchedTier = REWARD_TIERS.find(
      (t) => t.title === rewardTitle && t.points === pointsSpent && t.amount === amount && t.category === rewardCategory
    );

    if (!matchedTier) {
      return new Response(
        JSON.stringify({ error: "Invalid reward tier. The requested reward does not match any available tier." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use server-validated values from here on
    const validatedAmount = matchedTier.amount;
    const validatedPoints = matchedTier.points;

    // Check user points balance
    const { data: pointsData, error: pointsError } = await supabase
      .from("user_points")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (pointsError && pointsError.code !== "PGRST116") {
      return new Response(
        JSON.stringify({ error: "Failed to check points balance" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currentBalance = pointsData?.balance || 0;
    if (currentBalance < validatedPoints) {
      return new Response(
        JSON.stringify({ error: "Insufficient points balance" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create pending redemption record
    const { data: redemption, error: insertError } = await supabase
      .from("redemptions")
      .insert({
        user_id: user.id,
        phone_number: cleanPhone,
        amount_kes: validatedAmount,
        points_spent: validatedPoints,
        reward_title: matchedTier.title,
        reward_category: matchedTier.category,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to create redemption record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get M-Pesa access token and initiate payment
    try {
      const accessToken = await getAccessToken();
      const paymentResult = await initiateB2CPayment(accessToken, cleanPhone, validatedAmount);

      if (paymentResult.success) {
        await supabase
          .from("redemptions")
          .update({
            status: "processing",
            mpesa_transaction_id: paymentResult.transactionId,
          })
          .eq("id", redemption.id);

        // Deduct points
        await supabase
          .from("user_points")
          .update({
            balance: currentBalance - validatedPoints,
            total_spent: (pointsData?.balance || 0) + validatedPoints,
          })
          .eq("user_id", user.id);

        return new Response(
          JSON.stringify({
            success: true,
            message: "Redemption initiated successfully",
            transactionId: paymentResult.transactionId,
            redemptionId: redemption.id,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        await supabase
          .from("redemptions")
          .update({ status: "failed", error_message: paymentResult.error })
          .eq("id", redemption.id);

        return new Response(
          JSON.stringify({ success: false, error: paymentResult.error || "M-Pesa payment failed" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (mpesaError) {
      await supabase
        .from("redemptions")
        .update({
          status: "failed",
          error_message: mpesaError instanceof Error ? mpesaError.message : "M-Pesa error",
        })
        .eq("id", redemption.id);

      return new Response(
        JSON.stringify({ success: false, error: "M-Pesa service error. Please try again later." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
