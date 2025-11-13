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

    // Sanitize Plaid environment - remove spaces, dashes, and convert to lowercase
    const rawPlaidEnv = Deno.env.get('PLAID_ENV') || 'sandbox';
    const plaidEnv = rawPlaidEnv.toLowerCase().replace(/[\s\-]/g, '').trim();
    
    // Validate environment (must be sandbox, development, or production)
    const validEnvs = ['sandbox', 'development', 'production'];
    const finalPlaidEnv = validEnvs.includes(plaidEnv) ? plaidEnv : 'sandbox';
    
    const plaidClientId = Deno.env.get('PLAID_CLIENT_ID');
    const plaidSecret = Deno.env.get('PLAID_SECRET');

    if (!plaidClientId || !plaidSecret) {
      throw new Error('Plaid credentials not configured');
    }

    console.log('Creating Plaid Link token for user:', user.id, 'using environment:', finalPlaidEnv);

    // Create Plaid link token
    const plaidResponse = await fetch(`https://${finalPlaidEnv}.plaid.com/link/token/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: plaidClientId,
        secret: plaidSecret,
        user: {
          client_user_id: user.id,
        },
        client_name: '$ave+',
        products: ['transactions', 'auth'],
        country_codes: ['US'],
        language: 'en',
      }),
    });

    const plaidData = await plaidResponse.json();

    if (!plaidResponse.ok) {
      console.error('Plaid API error:', plaidData);
      throw new Error(plaidData.error_message || 'Failed to create link token');
    }

    // Store link token temporarily
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 4); // Plaid tokens expire in 4 hours

    await supabaseClient
      .from('plaid_link_tokens')
      .insert({
        user_id: user.id,
        link_token: plaidData.link_token,
        expires_at: expiresAt.toISOString(),
      });

    return new Response(
      JSON.stringify({ 
        link_token: plaidData.link_token,
        expiration: plaidData.expiration,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating Plaid link token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});