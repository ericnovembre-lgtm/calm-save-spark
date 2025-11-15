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
    const { budgets, spending, type = "general" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Analyze budget data
    const totalBudget = budgets.reduce((sum: number, b: any) => sum + parseFloat(String(b.total_limit)), 0);
    const totalSpent = Object.values(spending).reduce((sum: number, s: any) => sum + ((s as any)?.spent_amount || 0), 0);
    const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Build context-aware system prompt
    let systemPrompt = `You are a professional financial advisor specializing in personal budgeting. 
Current budget situation:
- Total monthly budget: $${totalBudget.toFixed(2)}
- Total spent: $${totalSpent.toFixed(2)}
- Budget utilization: ${utilization.toFixed(1)}%
- Number of active budgets: ${budgets.length}

Provide actionable, specific advice. Keep responses concise (2-3 short paragraphs).`;

    let userPrompt = "";
    
    // Type-specific prompts
    if (type === "overspending") {
      userPrompt = "I'm concerned about overspending. What specific actions should I take to get back on track?";
    } else if (type === "savings") {
      userPrompt = "Based on my current spending patterns, what opportunities do you see for saving money?";
    } else if (type === "optimization") {
      userPrompt = "How can I optimize my budget allocation for better financial health?";
    } else {
      userPrompt = "Provide personalized tips to improve my budget management based on my current situation.";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("Failed to get AI response");
    }

    const aiData = await response.json();
    const advice = aiData.choices?.[0]?.message?.content;

    if (!advice) {
      throw new Error("No advice generated");
    }

    return new Response(
      JSON.stringify({ advice, utilization, totalSpent, totalBudget }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in budget-ai-coach:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
