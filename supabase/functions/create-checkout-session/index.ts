import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { monthly_usd, success_url, cancel_url } = await req.json();

    console.log('Creating checkout session:', { 
      userId: user.id, 
      monthly_usd, 
      success_url, 
      cancel_url 
    });

    // Validate input
    if (monthly_usd < 0 || monthly_usd > 15) {
      throw new Error('Invalid subscription amount');
    }

    // For free plan ($0), handle locally without Stripe
    if (monthly_usd === 0) {
      // Update or create subscription
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          subscription_amount: 0,
          status: 'active',
          billing_interval: 'monthly',
        });

      if (subError) throw subError;

      return new Response(
        JSON.stringify({
          success: true,
          url: success_url,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // TODO: Implement Stripe checkout session creation
    // For now, return a placeholder response
    // When Stripe is enabled, uncomment and implement the following:
    /*
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe not configured');
    }

    // Create or retrieve Stripe customer
    // Create Stripe checkout session
    // Return checkout URL
    */

    return new Response(
      JSON.stringify({
        success: true,
        url: success_url, // Temporary: redirect to success immediately
        message: 'Stripe integration pending - subscription updated locally',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-checkout-session:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
