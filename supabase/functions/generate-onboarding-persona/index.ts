import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let goalType = 'general';
  let userName = 'User';
  let challenges: string[] = [];

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const body = await req.json();
    goalType = body.goalType || goalType;
    userName = body.userName || userName;
    challenges = body.challenges || challenges;

    // Generate persona using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Add timeout with AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    let aiResponse;
    try {
      aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-pro',
          messages: [
            {
              role: 'system',
              content: `You are a savings onboarding specialist for $ave+. Generate a personalized onboarding persona based on user goals and challenges. Return ONLY valid JSON with no markdown formatting.`
            },
            {
              role: 'user',
              content: `User: ${userName || 'User'}
Goal: ${goalType}
Challenges: ${challenges?.join(', ') || 'None specified'}

Generate a persona object with:
1. goalType (string): normalized goal type (home/vacation/emergency/retirement/general)
2. visualTheme (object): primaryIcon (emoji), accentColor (hex)
3. copyVariations (object): 
   - welcomeMessage: personalized greeting
   - automationPitch: why automation helps this goal
   - completionMessage: celebratory message
   - goalSuggestions: array of 3 related micro-goals
4. dynamicQuestions (array): 2-3 follow-up questions specific to this goal

Return pure JSON only.`
            }
          ],
          temperature: 0.7,
          max_completion_tokens: 1000
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
    } catch (err) {
      clearTimeout(timeoutId);
      
      if (err instanceof Error && err.name === 'AbortError') {
        console.error('[Persona] Request timeout');
        return new Response(
          JSON.stringify({
            fallbackPersona: getGoalSpecificFallback(goalType, userName),
            retryable: true,
            error: 'timeout'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw err;
    }

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      const errorText = await aiResponse.text();
      console.error(`[Persona] AI API error: ${status}`, errorText);
      
      // Determine if retryable
      const retryable = status === 429 || status >= 500;
      const errorType = status === 429 ? 'rate_limit' : 
                       status === 402 ? 'payment_required' : 'ai_error';

      return new Response(
        JSON.stringify({
          fallbackPersona: getGoalSpecificFallback(goalType, userName),
          retryable,
          error: errorType
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    let personaText = aiData.choices[0].message.content;

    // Clean markdown formatting if present
    personaText = personaText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const persona = JSON.parse(personaText);

    // Save persona to profile
    await supabaseClient
      .from('profiles')
      .update({ onboarding_persona: persona })
      .eq('id', user.id);

    return new Response(JSON.stringify({ persona }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Persona] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Return fallback persona even on error
    return new Response(
      JSON.stringify({
        fallbackPersona: getGoalSpecificFallback(goalType || 'general', userName || 'User'),
        retryable: false,
        error: errorMessage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Goal-specific fallback function
function getGoalSpecificFallback(goalType: string, userName: string) {
  const fallbacks: Record<string, any> = {
    home: {
      goalType: 'home',
      visualTheme: {
        primaryIcon: '🏠',
        accentColor: '#d6c8a2'
      },
      copyVariations: {
        welcomeMessage: `Great choice, ${userName}! Let's build your home savings plan.`,
        goalAmountQuestion: 'How much do you need for your down payment?',
        automationPitch: 'Automate your savings so you can focus on finding your dream home.',
        completionMessage: '🎉 You\'re on your way to homeownership!',
        goalSuggestions: ['Save 3.5% for FHA down payment', 'Build closing cost fund', 'Track monthly progress']
      },
      dynamicQuestions: []
    },
    vacation: {
      goalType: 'vacation',
      visualTheme: {
        primaryIcon: '✈️',
        accentColor: '#d6c8a2'
      },
      copyVariations: {
        welcomeMessage: `Perfect, ${userName}! Let's make your travel dreams come true.`,
        goalAmountQuestion: 'How much do you want to save for your trip?',
        automationPitch: 'Set automatic savings and watch your travel fund grow effortlessly.',
        completionMessage: '🎉 Your adventure awaits!',
        goalSuggestions: ['Save $200/month', 'Research destinations', 'Track progress weekly']
      },
      dynamicQuestions: []
    },
    emergency: {
      goalType: 'emergency',
      visualTheme: {
        primaryIcon: '🛡️',
        accentColor: '#d6c8a2'
      },
      copyVariations: {
        welcomeMessage: `Smart move, ${userName}! Let's build your financial safety net.`,
        goalAmountQuestion: 'How much do you want in your emergency fund?',
        automationPitch: 'Automate small transfers to build your security fund effortlessly.',
        completionMessage: '🎉 You\'re building financial security!',
        goalSuggestions: ['Aim for 3-6 months expenses', 'Start with $1000', 'Build gradually']
      },
      dynamicQuestions: []
    },
    retirement: {
      goalType: 'retirement',
      visualTheme: {
        primaryIcon: '🏖️',
        accentColor: '#d6c8a2'
      },
      copyVariations: {
        welcomeMessage: `Excellent planning, ${userName}! Let's secure your future.`,
        goalAmountQuestion: 'What\'s your retirement savings target?',
        automationPitch: 'Small, consistent contributions today compound into financial freedom tomorrow.',
        completionMessage: '🎉 Your future self will thank you!',
        goalSuggestions: ['Max IRA contributions', 'Target 15% of income', 'Review annually']
      },
      dynamicQuestions: []
    },
    education: {
      goalType: 'education',
      visualTheme: {
        primaryIcon: '🎓',
        accentColor: '#d6c8a2'
      },
      copyVariations: {
        welcomeMessage: `Great investment, ${userName}! Let's fund your education goals.`,
        goalAmountQuestion: 'How much do you need for education costs?',
        automationPitch: 'Automate savings now to cover tuition and expenses later.',
        completionMessage: '🎉 You\'re investing in knowledge!',
        goalSuggestions: ['Research tuition costs', 'Save $300/month', 'Look for scholarships']
      },
      dynamicQuestions: []
    },
    general: {
      goalType: 'general',
      visualTheme: {
        primaryIcon: '💰',
        accentColor: '#d6c8a2'
      },
      copyVariations: {
        welcomeMessage: `Great choice, ${userName}! Let's build your savings plan.`,
        goalAmountQuestion: 'How much do you want to save?',
        automationPitch: 'Automated savings help you reach your goals faster without thinking about it.',
        completionMessage: '🎉 Your account is all set! Time to start saving.',
        goalSuggestions: ['Start small with $50/month', 'Set up automatic transfers', 'Track your progress weekly']
      },
      dynamicQuestions: []
    }
  };

  return fallbacks[goalType] || fallbacks.general;
}
