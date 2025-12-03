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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { portfolioData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Calculate portfolio metrics
    const totalValue = portfolioData.totalValue || 0;
    const totalGains = portfolioData.totalGains || 0;
    const changePercent = totalValue > 0 ? (totalGains / totalValue) * 100 : 0;

    // Fetch relevant market news
    const accountNames = portfolioData.accounts?.map((a: any) => a.name).filter(Boolean) || [];
    const symbolQuery = accountNames.length > 0 
      ? `symbol.eq.MARKET,symbol.in.(${accountNames.join(',')})` 
      : 'symbol.eq.MARKET';

    const { data: news } = await supabaseClient
      .from('market_news_cache')
      .select('*')
      .or(symbolQuery)
      .order('published_at', { ascending: false })
      .limit(10);

    const newsContext = news?.length 
      ? news.map(n => `- ${n.headline} (${n.source}, ${n.sentiment})`).join('\n')
      : 'No recent market news available.';

    // Build context for AI
    const contextPrompt = `Analyze this investment portfolio:
- Total Value: $${totalValue.toFixed(2)}
- Total Gains/Losses: $${totalGains.toFixed(2)} (${changePercent.toFixed(2)}%)
- Holdings: ${JSON.stringify(portfolioData.accounts || [])}

Recent Market News:
${newsContext}

Provide:
1. A brief summary explaining why the portfolio is moving today - correlate with news when relevant (1-2 sentences)
2. 3-4 key factors affecting the portfolio - reference specific news when applicable
3. One actionable recommendation based on current market conditions

Focus on real market context and be specific about which holdings are driving changes.`;

    console.log("[Portfolio Insights] Requesting AI analysis");

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
            content: "You are a financial analyst providing clear, actionable insights about investment portfolios. Be concise and specific."
          },
          {
            role: "user",
            content: contextPrompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[Portfolio Insights] AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0]?.message?.content || "";

    // Parse the response into structured format
    const lines = analysis.split('\n').filter((l: string) => l.trim());
    const summary = lines[0] || "Portfolio is performing within normal market ranges.";
    
    const factors = lines
      .slice(1)
      .filter((l: string) => l.match(/^[0-9•\-\*]/))
      .map((l: string) => l.replace(/^[0-9•\-\*\.\s]+/, '').trim())
      .slice(0, 4);

    const recommendations = lines
      .find((l: string) => l.toLowerCase().includes('recommend'))
      || "Continue monitoring your portfolio and consider periodic rebalancing.";

    console.log("[Portfolio Insights] Analysis complete");

    return new Response(
      JSON.stringify({
        summary,
        factors,
        recommendations,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("[Portfolio Insights] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        summary: "Unable to analyze portfolio at this time.",
        factors: [],
        recommendations: "Please try again later."
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 // Return 200 with error in body for graceful degradation
      }
    );
  }
});