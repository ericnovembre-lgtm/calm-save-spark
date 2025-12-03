import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userError || !user) throw new Error("Unauthorized");

    const { portfolioData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Calculate current allocation
    const totalValue = portfolioData.totalValue || 0;
    const accounts = portfolioData.accounts || [];
    
    const currentAllocation = accounts.map((acc: any) => ({
      name: acc.account_name,
      type: acc.account_type,
      value: parseFloat(String(acc.total_value)),
      percentage: (parseFloat(String(acc.total_value)) / totalValue) * 100
    }));

    // Define target allocation (60/40 stocks/bonds as example)
    const targetAllocation = {
      'stocks': 60,
      'bonds': 30,
      'crypto': 5,
      'cash': 5
    };

    // Calculate drift
    const currentByType = currentAllocation.reduce((acc: any, item: any) => {
      const type = item.type.includes('401k') || item.type.includes('ira') || item.type === 'stocks' 
        ? 'stocks' 
        : item.type === 'crypto' 
        ? 'crypto' 
        : item.type === 'cash' 
        ? 'cash' 
        : 'bonds';
      acc[type] = (acc[type] || 0) + item.percentage;
      return acc;
    }, {});

    let totalDrift = 0;
    for (const [type, target] of Object.entries(targetAllocation)) {
      const current = currentByType[type] || 0;
      totalDrift += Math.abs(current - target);
    }

    // Build AI prompt for suggestions
    const prompt = `Portfolio Rebalancing Analysis:

Current Allocation:
${JSON.stringify(currentByType, null, 2)}

Target Allocation:
${JSON.stringify(targetAllocation, null, 2)}

Total Portfolio Value: $${totalValue.toFixed(2)}
Current Drift: ${totalDrift.toFixed(2)}%

Generate 3-5 specific rebalancing suggestions to return to target allocation.
For each suggestion, specify:
1. Action: "buy" or "sell"
2. Symbol/Asset Type
3. Amount in dollars
4. Brief reason

Format as JSON array:
[{
  "action": "sell",
  "symbol": "Crypto",
  "amount": 500,
  "reason": "Reduce crypto exposure from 8% to target 5%"
}]`;

    console.log("[Smart Rebalance] Requesting AI suggestions");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro",
        messages: [
          {
            role: "system",
            content: "You are a financial advisor providing portfolio rebalancing suggestions. Always respond with valid JSON array format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content || "[]";
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    // Save to database
    const { data: saved, error: saveError } = await supabase
      .from('rebalancing_suggestions')
      .insert({
        user_id: user.id,
        suggestion_data: {
          suggestions,
          targetAllocation,
          currentAllocation: currentByType,
          currentDrift: totalDrift
        },
        status: 'pending'
      })
      .select()
      .single();

    if (saveError) throw saveError;

    console.log("[Smart Rebalance] Suggestions generated and saved");

    return new Response(
      JSON.stringify({ success: true, suggestions: saved }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("[Smart Rebalance] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});