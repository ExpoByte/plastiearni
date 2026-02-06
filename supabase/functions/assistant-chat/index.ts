import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are TakaBot, a friendly and helpful AI assistant for TakaPoints - a Kenyan recycling rewards app. You help users understand how to:

1. **Collect & Recycle**: Explain how to collect plastic waste, find collection points, and earn points
2. **Earn Points**: Describe how the points system works (1 kg of plastic ≈ 100 points)
3. **Redeem Rewards**: Guide users on redeeming points for M-Pesa cash, airtime, or vouchers
4. **Use the App**: Navigate the app features including Map, Rewards, History, and Profile

Key information about TakaPoints:
- Users earn points by bringing recyclable plastic to collection points across Kenya
- Points can be redeemed for M-Pesa transfers, mobile airtime (Safaricom, Airtel, Telkom), or supermarket vouchers (Naivas, Carrefour)
- New users get 500 bonus points when they sign up
- The app shows nearby collection points on a map with hours and ratings
- Users can track their environmental impact (kg collected, trees saved)

Communication style:
- Be friendly, concise, and encouraging
- Use simple language accessible to all users
- Occasionally use Swahili greetings (Jambo, Karibu, Asante) for local flavor
- Focus on practical, actionable advice
- If you don't know something specific, suggest checking the app or contacting support

Always encourage sustainable habits and celebrate the user's eco-friendly efforts!`;

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json() as { messages: Message[] };
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get response from assistant" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
