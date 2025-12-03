import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating spending persona for user:', user.id);

    // Fetch user data for analysis
    const [goalsRes, transactionsRes, budgetsRes] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', user.id).limit(10),
      supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(50),
      supabase.from('user_budgets').select('*').eq('user_id', user.id),
    ]);

    const contextData = {
      goals_count: goalsRes.data?.length || 0,
      total_saved: goalsRes.data?.reduce((sum, g) => sum + (g.current_amount || 0), 0) || 0,
      avg_transaction: transactionsRes.data?.length 
        ? transactionsRes.data.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactionsRes.data.length 
        : 0,
      budgets_active: budgetsRes.data?.length || 0,
    };

    const response = await fetch('https://api.lovable.app/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro',
        messages: [
          {
            role: 'system',
            content: `You are a financial personality analyzer. Based on user data, generate a spending persona.

Output ONLY valid JSON:
{
  "type": "Conservative Saver" | "Growth Investor" | "Debt Crusher" | "Side Hustler" | "Family Planner",
  "description": "2-3 sentence description",
  "optimizations": {
    "show_savings": boolean,
    "show_investments": boolean,
    "show_debt": boolean,
    "show_crypto": boolean,
    "priority_view": "goals" | "budgets" | "investments" | "debt"
  }
}`
          },
          {
            role: 'user',
            content: `Analyze: ${JSON.stringify(contextData)}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable API error:', response.status, errorText);
      throw new Error(`AI service error: ${response.status} - ${errorText.slice(0, 200)}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid AI response structure:', data);
      throw new Error('Invalid response from AI service');
    }

    const aiResponse = data.choices[0].message.content;
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse persona from AI response');
    }

    const persona = JSON.parse(jsonMatch[0]);

    // Save to database
    await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        spending_persona: persona,
      }, { onConflict: 'user_id' });

    return new Response(
      JSON.stringify({ persona }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-spending-persona:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
