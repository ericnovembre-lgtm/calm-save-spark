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

    console.log('Analyzing bills for user:', user.id);

    // Find recurring transactions (potential bills)
    const { data: subscriptions } = await supabaseClient
      .from('detected_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_confirmed', true);

    const opportunities = [];

    for (const sub of subscriptions || []) {
      // Categories that typically have negotiation potential
      const negotiableCategories = [
        'utilities', 'cable', 'internet', 'phone', 
        'insurance', 'streaming', 'software'
      ];

      if (!negotiableCategories.includes(sub.category || '')) {
        continue;
      }

      // Estimate potential savings (10-30% depending on category)
      let savingsPercentage = 0.15; // Default 15%
      
      if (sub.category === 'cable' || sub.category === 'internet') {
        savingsPercentage = 0.25; // 25% for telecom
      } else if (sub.category === 'insurance') {
        savingsPercentage = 0.20; // 20% for insurance
      }

      const estimatedSavings = Number(sub.amount) * savingsPercentage;
      const confidenceScore = 0.7 + (Math.random() * 0.2); // 0.7-0.9

      // Check if opportunity already exists
      const { data: existing } = await supabaseClient
        .from('bill_negotiation_opportunities')
        .select('id')
        .eq('user_id', user.id)
        .eq('merchant', sub.merchant)
        .single();

      if (!existing) {
        const { data: opportunity } = await supabaseClient
          .from('bill_negotiation_opportunities')
          .insert({
            user_id: user.id,
            merchant: sub.merchant,
            category: sub.category,
            current_amount: sub.amount,
            estimated_savings: estimatedSavings.toFixed(2),
            confidence_score: confidenceScore.toFixed(2),
            status: 'identified',
            last_charge_date: sub.last_charge_date,
            metadata: {
              frequency: sub.frequency,
              subscription_id: sub.id,
            },
          })
          .select()
          .single();

        if (opportunity) {
          opportunities.push(opportunity);
        }
      }
    }

    console.log(`Found ${opportunities.length} new negotiation opportunities`);

    return new Response(
      JSON.stringify({ 
        success: true,
        opportunities_found: opportunities.length,
        total_potential_savings: opportunities.reduce(
          (sum, o) => sum + Number(o.estimated_savings), 
          0
        ).toFixed(2),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing bills:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});