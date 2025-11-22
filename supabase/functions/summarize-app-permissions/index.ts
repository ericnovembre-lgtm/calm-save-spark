import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

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

    const { appId } = await req.json();

    console.log('Summarizing permissions for app:', appId);

    // Fetch Plaid item
    const { data: plaidItem, error: plaidError } = await supabase
      .from('plaid_items')
      .select('*')
      .eq('id', appId)
      .eq('user_id', user.id)
      .single();

    if (plaidError || !plaidItem) {
      return new Response(
        JSON.stringify({ error: 'App not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default permissions for Plaid connections
    const permissions = [
      'Read-only access to transaction history',
      'Access to account balances',
      'Access to account and routing numbers',
      'Identity verification data',
    ];

    const response = await fetch('https://api.lovable.app/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a privacy analyzer. Summarize app permissions in plain English.

Output ONLY valid JSON:
{
  "summary": "Brief plain-English explanation",
  "risk_level": "high" | "standard" | "limited",
  "concerns": ["concern 1", "concern 2"] (if any)
}`
          },
          {
            role: 'user',
            content: `App: ${plaidItem.institution_name}
Provider: Plaid
Permissions: ${permissions.join(', ')}`
          }
        ],
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse summary from AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({
        ...analysis,
        permissions,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in summarize-app-permissions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
