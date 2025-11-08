import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { organization_id, key_name, permissions, expires_in_days } = await req.json();

    // Verify user owns the organization
    const { data: org, error: orgError } = await supabaseClient
      .from('organizations')
      .select('*')
      .eq('id', organization_id)
      .eq('owner_id', user.id)
      .single();

    if (orgError || !org) {
      return new Response(JSON.stringify({ error: 'Organization not found or unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate secure API key
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const apiKey = `sk_${org.slug}_${Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`;

    // Calculate expiration date
    let expiresAt = null;
    if (expires_in_days) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + expires_in_days);
      expiresAt = expDate.toISOString();
    }

    // Store API key
    const { data: keyData, error: keyError } = await supabaseClient
      .from('organization_api_keys')
      .insert({
        organization_id,
        key_name,
        api_key: apiKey,
        permissions: permissions || { read: true, write: false },
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (keyError) {
      console.error('Error creating API key:', keyError);
      throw keyError;
    }

    console.log('Generated API key for organization:', organization_id);

    return new Response(
      JSON.stringify({
        ...keyData,
        api_key_display: apiKey, // Show once, then hide
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in generate-api-key:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
