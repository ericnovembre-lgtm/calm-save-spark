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

    const { goalType, userName, challenges } = await req.json();

    // Generate persona using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
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
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      
      // Fallback persona
      const fallbackPersona = {
        goalType: goalType || 'general',
        visualTheme: {
          primaryIcon: '🎯',
          accentColor: '#d6c8a2'
        },
        copyVariations: {
          welcomeMessage: `Great choice, ${userName}! Let's build your savings plan.`,
          automationPitch: 'Automated savings help you reach your goals faster without thinking about it.',
          completionMessage: '🎉 Your account is all set! Time to start saving.',
          goalSuggestions: ['Start small with $50/month', 'Set up automatic transfers', 'Track your progress weekly']
        },
        dynamicQuestions: []
      };

      return new Response(JSON.stringify({ persona: fallbackPersona }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
    console.error('Error generating persona:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
