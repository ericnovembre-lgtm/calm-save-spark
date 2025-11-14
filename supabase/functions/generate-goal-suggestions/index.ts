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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Fetch existing goals
    const { data: existingGoals } = await supabaseClient
      .from('goals')
      .select('name, target_amount, current_amount')
      .eq('user_id', user.id);

    // Fetch recent transactions (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('amount, category, date')
      .eq('user_id', user.id)
      .gte('date', threeMonthsAgo.toISOString())
      .order('date', { ascending: false })
      .limit(100);

    // Use Lovable AI to analyze and suggest goals
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const prompt = `Analyze this user's financial situation and suggest 3-5 specific savings goals:

Existing Goals:
${existingGoals?.map(g => `- ${g.name}: $${g.current_amount}/$${g.target_amount}`).join('\n') || 'None'}

Recent Spending Pattern:
${transactions?.slice(0, 20).map(t => `${t.category}: -$${Math.abs(t.amount)}`).join('\n') || 'Limited data'}

Based on their spending patterns and existing goals, suggest NEW goals that would:
1. Fill financial gaps (emergency fund, debt payoff, retirement)
2. Optimize spending in categories where they overspend
3. Be achievable within 3-24 months
4. Not duplicate existing goals

Return ONLY a JSON array with this exact structure:
[
  {
    "name": "Goal name",
    "description": "Why this goal matters for them (2 sentences)",
    "suggestedAmount": 5000,
    "timelineMonths": 12,
    "icon": "shield|plane|home|car|heart|piggy-bank",
    "priority": "high|medium|low",
    "reasoning": "Based on their [specific spending pattern], this would..."
  }
]`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a financial advisor specializing in goal-setting. Return only valid JSON arrays.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const suggestionsText = aiData.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = suggestionsText.match(/\[[\s\S]*\]/);
    const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-goal-suggestions:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});