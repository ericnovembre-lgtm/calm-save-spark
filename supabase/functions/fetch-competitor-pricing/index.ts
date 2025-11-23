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

    const { category, limit = 10 } = await req.json();

    console.log('Fetching competitor pricing for category:', category);

    // Fetch competitor pricing from database
    const { data: pricing, error: pricingError } = await supabase
      .from('competitor_pricing')
      .select('*')
      .eq('category', category)
      .order('monthly_price', { ascending: true })
      .limit(limit);

    if (pricingError) {
      console.error('Error fetching pricing:', pricingError);
      throw pricingError;
    }

    console.log(`Found ${pricing?.length || 0} competitor offers`);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ offers: pricing }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ offers: pricing }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has opportunities in this category
    const { data: opportunities, error: oppError } = await supabase
      .from('bill_negotiation_opportunities')
      .select('*')
      .eq('user_id', user.id)
      .ilike('category', `%${category}%`);

    if (oppError) {
      console.error('Error fetching opportunities:', oppError);
    }

    // Generate alerts for better deals
    if (opportunities && opportunities.length > 0 && pricing && pricing.length > 0) {
      for (const opp of opportunities) {
        const userPrice = Number(opp.current_amount);
        
        // Find competitor offers that are significantly cheaper
        const betterOffers = pricing.filter(p => {
          const competitorPrice = Number(p.monthly_price);
          const savings = userPrice - competitorPrice;
          return savings > 10; // At least $10/mo savings
        });

        // Create alerts for top 2 better offers
        for (const offer of betterOffers.slice(0, 2)) {
          const competitorPrice = Number(offer.monthly_price);
          const savings = userPrice - competitorPrice;

          // Check if alert already exists
          const { data: existingAlert } = await supabase
            .from('competitor_alerts')
            .select('id')
            .eq('user_id', user.id)
            .eq('opportunity_id', opp.id)
            .eq('competitor_provider', offer.provider)
            .single();

          if (!existingAlert) {
            const { error: alertError } = await supabase
              .from('competitor_alerts')
              .insert({
                user_id: user.id,
                opportunity_id: opp.id,
                competitor_provider: offer.provider,
                competitor_price: competitorPrice,
                user_current_price: userPrice,
                potential_savings: savings,
                alert_type: 'better_deal',
              });

            if (alertError) {
              console.error('Error creating alert:', alertError);
            } else {
              console.log(`Created alert for ${offer.provider} - Save $${savings.toFixed(0)}/mo`);
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ offers: pricing }),
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