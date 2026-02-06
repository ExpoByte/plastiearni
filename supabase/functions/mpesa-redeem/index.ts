import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// M-Pesa Daraja sandbox base URL
const MPESA_API_URL = "https://sandbox.safaricom.co.ke";

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
    const errorText = await response.text();
    console.error("OAuth error:", errorText);
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

  // Format phone number (remove leading 0 or +254, ensure starts with 254)
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

  const payload = {
    InitiatorName: "testapi",
    SecurityCredential: Deno.env.get("MPESA_PASSKEY") || "",
    CommandID: "BusinessPayment",
    Amount: amount,
    PartyA: shortcode,
    PartyB: formattedPhone,
    Remarks: "Taka Points Redemption",
    QueueTimeOutURL: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mpesa-callback`,
    ResultURL: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mpesa-callback`,
    Occassion: "TakaReward",
  };

  console.log("B2C Request payload:", JSON.stringify(payload, null, 2));

  const response = await fetch(`${MPESA_API_URL}/mpesa/b2c/v1/paymentrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  console.log("B2C Response:", JSON.stringify(data, null, 2));

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
  // Handle CORS preflight
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: RedeemRequest = await req.json();
    const { phoneNumber, amount, rewardTitle, rewardCategory, pointsSpent } = body;

    if (!phoneNumber || !amount || !rewardTitle || !pointsSpent) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check user points balance
    const { data: pointsData, error: pointsError } = await supabase
      .from("user_points")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (pointsError && pointsError.code !== "PGRST116") {
      console.error("Error fetching points:", pointsError);
      return new Response(
        JSON.stringify({ error: "Failed to check points balance" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currentBalance = pointsData?.balance || 0;
    if (currentBalance < pointsSpent) {
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
        phone_number: phoneNumber,
        amount_kes: amount,
        points_spent: pointsSpent,
        reward_title: rewardTitle,
        reward_category: rewardCategory,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating redemption:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create redemption record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get M-Pesa access token and initiate payment
    try {
      const accessToken = await getAccessToken();
      const paymentResult = await initiateB2CPayment(accessToken, phoneNumber, amount);

      if (paymentResult.success) {
        // Update redemption with transaction ID
        await supabase
          .from("redemptions")
          .update({
            status: "processing",
            mpesa_transaction_id: paymentResult.transactionId,
          })
          .eq("id", redemption.id);

        // Deduct points from user balance
        await supabase
          .from("user_points")
          .update({
            balance: currentBalance - pointsSpent,
            total_spent: (pointsData?.balance || 0) + pointsSpent,
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
        // Update redemption as failed
        await supabase
          .from("redemptions")
          .update({
            status: "failed",
            error_message: paymentResult.error,
          })
          .eq("id", redemption.id);

        return new Response(
          JSON.stringify({
            success: false,
            error: paymentResult.error || "M-Pesa payment failed",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (mpesaError) {
      console.error("M-Pesa error:", mpesaError);
      
      // Update redemption as failed
      await supabase
        .from("redemptions")
        .update({
          status: "failed",
          error_message: mpesaError instanceof Error ? mpesaError.message : "M-Pesa error",
        })
        .eq("id", redemption.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: "M-Pesa service error. Please try again later.",
        }),
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
