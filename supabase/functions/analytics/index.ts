import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for database writes
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body: AnalyticsEvent = await req.json();
    const { event, properties = {}, userId, timestamp } = body;

    // Validate required fields
    if (!event) {
      console.error('[Analytics] Missing event name');
      return new Response(
        JSON.stringify({ error: 'Event name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract route from properties or default to unknown
    const route = properties.route || '/unknown';

    // Insert analytics event into database
    const { error: insertError } = await supabase
      .from('analytics_events')
      .insert({
        event,
        properties,
        user_hashed: userId,
        route,
        timestamp: timestamp || new Date().toISOString(),
      });

    if (insertError) {
      console.error('[Analytics] Database insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to store analytics event' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Analytics] Event stored: ${event} (route: ${route})`);

    return new Response(
      JSON.stringify({ success: true, event }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Analytics] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
