import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MPESA_API_URL = "https://sandbox.safaricom.co.ke";

function formatPhone(phone: string): string {
  let p = phone.replace(/\s/g, "");
  if (p.startsWith("+")) p = p.substring(1);
  if (p.startsWith("0")) p = "254" + p.substring(1);
  if (!p.startsWith("254")) p = "254" + p;
  return p;
}

async function getAccessToken(): Promise<string> {
  const key = Deno.env.get("MPESA_CONSUMER_KEY");
  const secret = Deno.env.get("MPESA_CONSUMER_SECRET");
  if (!key || !secret) throw new Error("M-Pesa credentials not configured");

  const credentials = btoa(`${key}:${secret}`);
  console.log("Requesting M-Pesa access token...");
  console.log("Key length:", key.length, "Secret length:", secret.length);
  
  const res = await fetch(
    `${MPESA_API_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${credentials}` } }
  );
  
  const body = await res.text();
  console.log("Token response status:", res.status, "body:", body);
  
  if (!res.ok) throw new Error(`Failed to get access token: ${res.status} - ${body}`);
  return JSON.parse(body).access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { phoneNumber, amount } = await req.json();
    if (!phoneNumber || !amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid phone or amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formattedPhone = formatPhone(phoneNumber);
    const shortcode = Deno.env.get("MPESA_SHORTCODE") || "174379";
    const passkey = Deno.env.get("MPESA_PASSKEY") || "";

    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14);
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    const callbackUrl = `${supabaseUrl}/functions/v1/mpesa-stk-callback`;

    const accessToken = await getAccessToken();

    const stkRes = await fetch(
      `${MPESA_API_URL}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Math.round(amount),
          PartyA: formattedPhone,
          PartyB: shortcode,
          PhoneNumber: formattedPhone,
          CallBackURL: callbackUrl,
          AccountReference: "PlastiEarn",
          TransactionDesc: "Reward Pool Funding",
        }),
      }
    );

    const stkData = await stkRes.json();

    if (!stkRes.ok || stkData.errorCode) {
      return new Response(
        JSON.stringify({
          error: stkData.errorMessage || stkData.CustomerMessage || "STK push failed",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save pending deposit
    await supabase.from("stk_deposits").insert({
      admin_id: user.id,
      amount: Math.round(amount),
      phone_number: formattedPhone,
      status: "pending",
      checkout_request_id: stkData.CheckoutRequestID,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "STK push sent. Check your phone to complete payment.",
        checkoutRequestId: stkData.CheckoutRequestID,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("STK push error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
