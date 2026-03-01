import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, prompt, contextData, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Handle structured market stats request
    if (action === "market_stats") {
      return await handleMarketStats(LOVABLE_API_KEY);
    }

    // Default: freeform insights
    const systemPrompt = `You are a real estate market analyst specializing in the Kenyan property market. 
Provide accurate, up-to-date insights based on current market conditions.
Format your response in plain text only. Do NOT use any markdown formatting such as #, *, **, or bullet symbols like - or •.
Use numbered lists (1. 2. 3.) for lists and simple line breaks for sections.
Be specific with locations, price ranges (in KES), and percentages where applicable.
Current date: ${new Date().toLocaleDateString('en-KE', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}.`;

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
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service requires payment." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const insights = data.choices?.[0]?.message?.content || "Unable to generate insights at this time.";

    return new Response(
      JSON.stringify({ insights, context, timestamp: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Market AI insights error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleMarketStats(apiKey: string) {
  const systemPrompt = `You are a real estate market data analyst for the Kenyan property market. 
Provide realistic, current market statistics. Use actual market knowledge for Kenya.
Current date: ${new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;

  const userPrompt = `Provide current Kenyan real estate market overview statistics and regional price trends for major Nairobi neighborhoods. Include realistic figures based on current market conditions.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "provide_market_stats",
            description: "Return current Kenyan real estate market overview stats and regional price trends.",
            parameters: {
              type: "object",
              properties: {
                marketActivity: {
                  type: "object",
                  properties: {
                    value: { type: "string", description: "Percentage change e.g. '+18%' or '-5%'" },
                    subtitle: { type: "string", description: "Comparison period e.g. 'vs last quarter'" },
                    trend: { type: "string", enum: ["up", "down"] }
                  },
                  required: ["value", "subtitle", "trend"],
                  additionalProperties: false
                },
                averageSaleTime: {
                  type: "object",
                  properties: {
                    value: { type: "string", description: "Number of days e.g. '45 days'" },
                    subtitle: { type: "string", description: "Change from previous period e.g. '-8 days from last year'" },
                    trend: { type: "string", enum: ["up", "down"] }
                  },
                  required: ["value", "subtitle", "trend"],
                  additionalProperties: false
                },
                pricePerSqFt: {
                  type: "object",
                  properties: {
                    value: { type: "string", description: "Price in KSh e.g. 'KSh 8,500'" },
                    subtitle: { type: "string", description: "Year-over-year change e.g. '+12% YoY'" },
                    trend: { type: "string", enum: ["up", "down"] }
                  },
                  required: ["value", "subtitle", "trend"],
                  additionalProperties: false
                },
                propertiesListed: {
                  type: "object",
                  properties: {
                    value: { type: "string", description: "Number of active listings e.g. '2,847'" },
                    subtitle: { type: "string", description: "Description e.g. 'Active listings'" }
                  },
                  required: ["value", "subtitle"],
                  additionalProperties: false
                },
                regionalTrends: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      location: { type: "string", description: "Neighborhood name" },
                      priceChange: { type: "string", description: "Percentage change e.g. '+12.5%'" },
                      averagePrice: { type: "string", description: "Average price in KSh e.g. 'KSh 8,500,000'" },
                      trend: { type: "string", enum: ["up", "down"] },
                      period: { type: "string", description: "Time period e.g. 'Last 12 months'" }
                    },
                    required: ["location", "priceChange", "averagePrice", "trend", "period"],
                    additionalProperties: false
                  },
                  description: "At least 5 major Nairobi neighborhoods with price trends"
                }
              },
              required: ["marketActivity", "averageSaleTime", "pricePerSqFt", "propertiesListed", "regionalTrends"],
              additionalProperties: false
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "provide_market_stats" } },
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI gateway error for market_stats:", response.status, errorText);
    
    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI service requires payment." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  
  // Extract tool call arguments
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.function.name !== "provide_market_stats") {
    throw new Error("AI did not return structured market stats");
  }

  const stats = JSON.parse(toolCall.function.arguments);

  return new Response(
    JSON.stringify({ stats, timestamp: new Date().toISOString() }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
