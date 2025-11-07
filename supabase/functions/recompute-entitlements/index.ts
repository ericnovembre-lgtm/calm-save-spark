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

    const { userId, monthlyUsd } = await req.json();

    console.log('Recomputing entitlements:', { userId, monthlyUsd });

    // Validate input
    if (!userId || monthlyUsd === undefined) {
      throw new Error('Missing required parameters: userId and monthlyUsd');
    }

    // Only allow users to recompute their own entitlements (or admins)
    if (user.id !== userId) {
      // Check if user is admin
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!roles) {
        throw new Error('Forbidden: Can only recompute own entitlements');
      }
    }

    // Get current subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('subscription_amount')
      .eq('user_id', userId)
      .single();

    if (subError) {
      console.error('Error fetching subscription:', subError);
      throw new Error('Failed to fetch subscription');
    }

    const amount = monthlyUsd ?? subscription?.subscription_amount ?? 0;

    // Compute features using database function
    const { data: computedFeatures, error: computeError } = await supabase
      .rpc('compute_user_features', { sub_amount: amount });

    if (computeError) {
      console.error('Error computing features:', computeError);
      throw new Error('Failed to compute features');
    }

    // Update feature_access table
    const { error: updateError } = await supabase
      .from('feature_access')
      .upsert({
        user_id: userId,
        features: computedFeatures,
        computed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      console.error('Error updating feature access:', updateError);
      throw new Error('Failed to update feature access');
    }

    console.log('Entitlements recomputed successfully:', {
      userId,
      amount,
      features: computedFeatures,
    });

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        amount,
        features: computedFeatures,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in recompute-entitlements:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const statusCode = errorMessage === 'Unauthorized' ? 401 : errorMessage === 'Forbidden: Can only recompute own entitlements' ? 403 : 500;
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
