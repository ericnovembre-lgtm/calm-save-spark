import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    const { question, conversationHistory } = await req.json();

    console.log('Settings concierge question:', question);

    // Gather context about user's settings and account state
    const [profileRes, prefsRes, automationsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('user_preferences').select('*').eq('user_id', user.id).single(),
      supabase.from('automation_rules').select('*').eq('user_id', user.id).eq('is_active', true),
    ]);

    const context = {
      email_verified: profileRes.data?.email_verified || false,
      pending_automations: automationsRes.data?.length || 0,
      theme: prefsRes.data?.theme || 'system',
      notifications_enabled: prefsRes.data?.push_notifications_enabled || false,
    };

    const messages = [
      {
        role: 'system',
        content: `You are a helpful settings assistant for $ave+. Answer questions about settings, account restrictions, and configuration.

Current user context:
- Email verified: ${context.email_verified}
- Pending automations: ${context.pending_automations}
- Theme: ${context.theme}
- Notifications: ${context.notifications_enabled ? 'enabled' : 'disabled'}

Common restrictions:
- Email changes require no pending transfers
- Account deletion requires all goals to be withdrawn
- MFA cannot be disabled if security score < 50

Be concise and helpful. Provide actionable next steps when possible.`
      },
      ...(conversationHistory || []),
      {
        role: 'user',
        content: question
      }
    ];

    const response = await fetch('https://api.lovable.app/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro',
        messages,
        stream: true,
      }),
    });

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in settings-concierge:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
