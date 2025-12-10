import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { captureEdgeException } from "../_shared/sentry-edge.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CoPilotRequest {
  message: string;
  context: {
    currentRoute: string;
    pageTitle: string;
    userMood?: string;
    sessionDuration?: number;
  };
  conversationHistory?: Array<{ role: string; content: string }>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, conversationHistory = [] }: CoPilotRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system prompt
    const systemPrompt = `You are $ave+'s Financial Co-Pilot, an intelligent AI assistant deeply integrated into the application. You have full context awareness of where the user is and what they're doing.

CURRENT CONTEXT:
- Page: ${context.pageTitle} (${context.currentRoute})
- User mood: ${context.userMood || 'neutral'}
- Session duration: ${Math.round((context.sessionDuration || 0) / 60)} minutes

YOUR CAPABILITIES:
1. NAVIGATION: You can navigate users to any page. Use action format: [ACTION:nav_dashboard], [ACTION:nav_goals], etc.
2. THEME: You can change themes. Use: [ACTION:theme_dark] or [ACTION:theme_light]
3. MODALS: You can open modals. Use: [ACTION:modal_transfer], [ACTION:modal_add_goal]
4. SPOTLIGHT: You can highlight UI elements. Use: [SPOTLIGHT:element-id] to highlight elements
5. WIDGETS: You can render inline widgets. Use JSON blocks with widget specifications.

PERSONALITY:
- Contextual: Adapt your responses based on the current page
- Proactive: Offer relevant suggestions based on context
- Concise: Keep responses brief and actionable
- Friendly: Use a warm, supportive tone

WIDGET EXAMPLES:
For stock queries, respond with:
\`\`\`widget
{"type": "stock_ticker", "props": {"symbol": "AAPL", "name": "Apple Inc.", "price": 178.50, "change": 2.35, "changePercent": 1.33}}
\`\`\`

For budget visualization:
\`\`\`widget
{"type": "budget_dial", "props": {"category": "Food", "spent": 450, "budget": 600, "icon": "🍔"}}
\`\`\`

For mini charts:
\`\`\`widget
{"type": "mini_chart", "props": {"data": [{"value": 100}, {"value": 120}, {"value": 95}], "type": "line", "title": "Spending Trend"}}
\`\`\`

CONTEXT-SPECIFIC BEHAVIORS:
- On /dashboard: Focus on financial overview, quick actions, and insights
- On /goals: Help with goal tracking, contributions, and motivation
- On /budget: Assist with budget management and spending analysis
- On /investments: Provide portfolio insights and market context
- On /transactions: Help with categorization and spending patterns
- On /coach: Engage in deeper financial planning discussions

Remember: You are the "Ghost in the Machine" - you can see what the user sees and control the app to help them.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: "user", content: message }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        stream: false,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "I'm here to help!";

    // Parse response for actions and widgets
    const actionMatches = assistantMessage.matchAll(/\[ACTION:(\w+)\]/g);
    const spotlightMatches = assistantMessage.matchAll(/\[SPOTLIGHT:([\w-]+)\]/g);
    const widgetMatch = assistantMessage.match(/```widget\n([\s\S]*?)\n```/);

    const actions: string[] = [];
    const spotlights: string[] = [];
    let widget = null;

    for (const match of actionMatches) {
      actions.push(match[1]);
    }

    for (const match of spotlightMatches) {
      spotlights.push(match[1]);
    }

    if (widgetMatch) {
      try {
        widget = JSON.parse(widgetMatch[1]);
      } catch (e) {
        console.warn("Failed to parse widget:", e);
      }
    }

    // Clean message of action/widget markers for display
    let cleanMessage = assistantMessage
      .replace(/\[ACTION:\w+\]/g, '')
      .replace(/\[SPOTLIGHT:[\w-]+\]/g, '')
      .replace(/```widget\n[\s\S]*?\n```/g, '')
      .trim();

    return new Response(
      JSON.stringify({
        message: cleanMessage,
        actions,
        spotlights,
        widget,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("CoPilot error:", error);
    
    // Capture error in Sentry with context
    await captureEdgeException(error, {
      transaction: 'copilot-respond',
      tags: {
        function: 'copilot-respond',
        method: req.method,
      },
      extra: {
        url: req.url,
        timestamp: new Date().toISOString(),
      },
    });
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        message: "I apologize, I'm having trouble responding right now. Please try again."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
