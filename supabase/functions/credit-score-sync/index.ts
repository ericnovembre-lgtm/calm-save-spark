import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get previous score
    const { data: previousScores } = await supabaseClient
      .from('credit_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('score_date', { ascending: false })
      .limit(1);

    const previousScore = previousScores?.[0];

    // TODO: Integrate with Experian API or Credit Karma API
    // For now, simulate credit score update
    const baseScore = previousScore?.score || 680;
    const change = Math.floor(Math.random() * 21) - 10; // -10 to +10 change
    const newScore = Math.max(300, Math.min(850, baseScore + change));

    const factors = [
      { factor: 'Payment History', impact: 'positive', weight: 35 },
      { factor: 'Credit Utilization', impact: newScore < 700 ? 'negative' : 'positive', weight: 30 },
      { factor: 'Length of Credit History', impact: 'neutral', weight: 15 },
      { factor: 'Credit Mix', impact: 'positive', weight: 10 },
      { factor: 'New Credit', impact: 'neutral', weight: 10 }
    ];

    const { error } = await supabaseClient
      .from('credit_scores')
      .insert({
        user_id: user.id,
        score: newScore,
        provider: 'Simulated Provider',
        score_date: new Date().toISOString(),
        change_from_previous: previousScore ? newScore - previousScore.score : 0,
        factors
      });

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Credit score updated',
        score: newScore,
        change: previousScore ? newScore - previousScore.score : 0,
        previous_score: previousScore?.score || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Credit Score Sync Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
