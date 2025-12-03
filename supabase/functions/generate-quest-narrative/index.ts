import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questlineId, category, progress, userBehavior } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const completedSteps = progress?.stepsCompleted?.length || 0;
    const totalSteps = progress?.totalSteps || 3;
    const progressPercent = (completedSteps / totalSteps) * 100;

    const systemPrompt = getCategorySystemPrompt(category);
    const userPrompt = `Generate a dynamic narrative for a financial questline.

Category: ${category}
Progress: ${completedSteps}/${totalSteps} steps (${progressPercent.toFixed(0)}%)
Current Step: ${progress?.currentStep || 1}
User Behavior: ${JSON.stringify(userBehavior || {})}

Generate a JSON response with:
- narrative: Epic, personalized 2-3 sentence story (40-60 words)
- encouragement: Motivational phrase tied to their progress
- nextStepHint: Specific actionable tip for the next step
- progressMood: One word (triumphant/steady/struggling)

Keep the tone ${getCategoryTone(category)}. Make it feel personal and engaging.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway Error:', response.status, errorText);
      throw new Error(`AI Gateway failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON response
    let aiResponse;
    try {
      aiResponse = JSON.parse(content);
    } catch {
      // Fallback if AI doesn't return valid JSON
      aiResponse = {
        narrative: content,
        encouragement: "Keep pushing forward!",
        nextStepHint: "Focus on your next milestone.",
        progressMood: "steady"
      };
    }

    return new Response(
      JSON.stringify(aiResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating narrative:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        narrative: "Your financial journey continues. Each step brings you closer to your goals.",
        encouragement: "Stay focused on your mission.",
        nextStepHint: "Complete your next task to advance.",
        progressMood: "steady"
      }),
      { 
        status: 200, // Return 200 with fallback
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function getCategorySystemPrompt(category: string): string {
  const prompts = {
    debt_slay: "You are a battle-hardened financial warrior narrating an epic quest to defeat debt. Use dramatic, heroic language like 'vanquish,' 'conquer,' and 'triumph.' Frame debt as a foe to be slain.",
    home_horizon: "You are a hopeful guide narrating a journey toward homeownership. Use aspirational, dreamy language like 'journey,' 'horizon,' and 'foundation.' Make it feel like building toward a cherished future.",
    savings_sprint: "You are an energetic coach narrating a fast-paced savings challenge. Use dynamic, urgent language like 'momentum,' 'accelerate,' and 'milestone.' Keep the pace exciting.",
    credit_builder: "You are a wise mentor narrating a path to financial trust. Use empowering, steady language like 'strengthen,' 'cultivate,' and 'foundation.' Focus on building credibility.",
  };
  return prompts[category as keyof typeof prompts] || "You are a supportive financial guide creating personalized narratives.";
}

function getCategoryTone(category: string): string {
  const tones = {
    debt_slay: "dramatic and heroic",
    home_horizon: "hopeful and aspirational",
    savings_sprint: "energetic and urgent",
    credit_builder: "wise and empowering",
  };
  return tones[category as keyof typeof tones] || "supportive and encouraging";
}
