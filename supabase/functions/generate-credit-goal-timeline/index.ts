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
    const { currentScore, targetScore, scoreHistory } = await req.json();

    console.log("Generating credit goal timeline:", {
      currentScore,
      targetScore,
      historyLength: scoreHistory?.length || 0,
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Calculate average monthly score change from history
    let averageMonthlyChange = 0;
    if (scoreHistory && scoreHistory.length > 1) {
      const changes = scoreHistory.slice(1).map((entry: any, i: number) => {
        return entry.score - scoreHistory[i].score;
      });
      averageMonthlyChange = changes.reduce((a: number, b: number) => a + b, 0) / changes.length;
    }

    const pointsNeeded = targetScore - currentScore;
    
    // Prepare context for AI
    const prompt = `You are a credit score expert. Analyze this credit goal and provide a realistic timeline and actionable steps.

Current Score: ${currentScore}
Target Score: ${targetScore}
Points Needed: ${pointsNeeded}
Recent Monthly Trend: ${averageMonthlyChange > 0 ? '+' : ''}${averageMonthlyChange.toFixed(1)} points/month
Score History: ${JSON.stringify(scoreHistory?.slice(0, 6) || [])}

Provide:
1. A realistic timeline estimate (e.g., "3-4 months", "6-8 months")
2. 4-6 specific, actionable steps to reach the goal faster

Consider:
- Average monthly improvement trends
- Realistic credit behavior changes
- Common credit score factors (payment history, utilization, credit age, etc.)

Return ONLY a JSON object with this structure:
{
  "estimate": "X-Y months",
  "confidence": "high|medium|low",
  "actionSteps": [
    "Pay all credit card balances before due date",
    "Lower credit utilization below 30%",
    "Avoid new credit inquiries",
    "Become an authorized user on a good credit account"
  ]
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro",
        messages: [
          {
            role: "system",
            content: "You are a credit score expert providing realistic timeline predictions and actionable advice. Always return valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      // Fallback calculation
      const estimatedMonths = Math.max(3, Math.ceil(pointsNeeded / (Math.max(averageMonthlyChange, 5))));
      return new Response(
        JSON.stringify({
          estimate: `${estimatedMonths}-${estimatedMonths + 2} months`,
          confidence: "low",
          actionSteps: [
            "Pay all bills on time every month",
            "Keep credit card utilization below 30%",
            "Don't close old credit card accounts",
            "Dispute any errors on your credit report",
            "Avoid applying for new credit",
          ],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content || "{}";
    
    // Parse JSON from AI response
    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Fallback
      const estimatedMonths = Math.max(3, Math.ceil(pointsNeeded / (Math.max(averageMonthlyChange, 5))));
      result = {
        estimate: `${estimatedMonths}-${estimatedMonths + 2} months`,
        confidence: "medium",
        actionSteps: [
          "Pay all bills on time every month",
          "Keep credit card utilization below 30%",
          "Don't close old credit card accounts",
          "Dispute any errors on your credit report",
          "Avoid applying for new credit",
        ],
      };
    }

    console.log("Timeline generated successfully:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-credit-goal-timeline:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
