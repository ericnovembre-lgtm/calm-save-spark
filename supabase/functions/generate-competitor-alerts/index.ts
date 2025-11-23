import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting competitor alert generation...');

    // Get all active bill negotiation opportunities
    const { data: opportunities, error: oppError } = await supabase
      .from('bill_negotiation_opportunities')
      .select('*')
      .in('status', ['identified', 'pending']);

    if (oppError) {
      console.error('Error fetching opportunities:', oppError);
      throw oppError;
    }

    console.log(`Found ${opportunities?.length || 0} active opportunities`);

    let alertsCreated = 0;
    const categories = ['internet', 'mobile', 'utilities', 'streaming', 'insurance'];

    for (const category of categories) {
      // Get competitor pricing for this category
      const { data: pricing, error: pricingError } = await supabase
        .from('competitor_pricing')
        .select('*')
        .eq('category', category)
        .order('monthly_price', { ascending: true });

      if (pricingError) {
        console.error(`Error fetching pricing for ${category}:`, pricingError);
        continue;
      }

      // Match opportunities with competitor offers
      const categoryOpportunities = opportunities?.filter(opp => 
        opp.category?.toLowerCase().includes(category)
      ) || [];

      for (const opp of categoryOpportunities) {
        const userPrice = Number(opp.current_amount);

        // Find better deals
        const betterOffers = pricing?.filter(p => {
          const competitorPrice = Number(p.monthly_price);
          const savings = userPrice - competitorPrice;
          return savings > 10; // At least $10/mo savings
        }) || [];

        // Create alerts for top offers
        for (const offer of betterOffers.slice(0, 2)) {
          const competitorPrice = Number(offer.monthly_price);
          const savings = userPrice - competitorPrice;

          // Check if alert already exists (within last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const { data: existingAlert } = await supabase
            .from('competitor_alerts')
            .select('id')
            .eq('user_id', opp.user_id)
            .eq('opportunity_id', opp.id)
            .eq('competitor_provider', offer.provider)
            .gte('created_at', thirtyDaysAgo.toISOString())
            .single();

          if (!existingAlert) {
            // Determine alert type
            let alertType = 'better_deal';
            
            // Check if this is a price drop (compare with previous pricing)
            const { data: previousPricing } = await supabase
              .from('competitor_pricing')
              .select('monthly_price')
              .eq('provider', offer.provider)
              .eq('plan_name', offer.plan_name)
              .lt('last_updated', offer.last_updated)
              .order('last_updated', { ascending: false })
              .limit(1)
              .single();

            if (previousPricing) {
              const previousPrice = Number(previousPricing.monthly_price);
              const currentPrice = Number(offer.monthly_price);
              if (currentPrice < previousPrice * 0.85) {
                alertType = 'price_drop';
              }
            }

            const { error: alertError } = await supabase
              .from('competitor_alerts')
              .insert({
                user_id: opp.user_id,
                opportunity_id: opp.id,
                competitor_provider: offer.provider,
                competitor_price: competitorPrice,
                user_current_price: userPrice,
                potential_savings: savings,
                alert_type: alertType,
              });

            if (alertError) {
              console.error('Error creating alert:', alertError);
            } else {
              alertsCreated++;
              console.log(`Alert created: ${offer.provider} - Save $${savings.toFixed(0)}/mo (${alertType})`);
            }
          }
        }
      }
    }

    console.log(`Completed: ${alertsCreated} new alerts created`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        alertsCreated,
        opportunitiesProcessed: opportunities?.length || 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});