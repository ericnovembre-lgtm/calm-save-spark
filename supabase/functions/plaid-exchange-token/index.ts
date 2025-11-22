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

    const { publicToken, userId, metadata } = await req.json();

    const PLAID_CLIENT_ID = Deno.env.get('PLAID_CLIENT_ID');
    const PLAID_SECRET = Deno.env.get('PLAID_SECRET');
    const PLAID_ENV = Deno.env.get('PLAID_ENV') || 'sandbox';

    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      throw new Error('Plaid credentials not configured');
    }

    const plaidUrl = PLAID_ENV === 'production' 
      ? 'https://production.plaid.com'
      : 'https://sandbox.plaid.com';

    // Exchange public token for access token
    const response = await fetch(`${plaidUrl}/item/public_token/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
        'PLAID-SECRET': PLAID_SECRET,
      },
      body: JSON.stringify({
        public_token: publicToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Plaid exchange error:', errorData);
      throw new Error('Failed to exchange Plaid token');
    }

    const data = await response.json();

    // Store access token securely
    const { error: dbError } = await supabaseClient
      .from('plaid_items')
      .insert({
        user_id: userId,
        item_id: data.item_id,
        access_token: data.access_token,
        institution_id: metadata.institution?.institution_id,
        institution_name: metadata.institution?.name,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save Plaid connection');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error exchanging token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
