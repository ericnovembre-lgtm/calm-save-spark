import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get pending queue entries (unprocessed in last 5 minutes)
    const { data: queueEntries, error: queueError } = await supabase
      .from('recurring_detection_queue')
      .select('user_id')
      .is('processed_at', null)
      .lt('triggered_at', new Date(Date.now() - 5000).toISOString()) // Debounce: 5 seconds old
      .limit(10);

    if (queueError) throw queueError;

    const results = [];

    for (const entry of queueEntries || []) {
      // Call detect-recurring for this user
      const { data, error } = await supabase.functions.invoke('detect-recurring', {
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: { user_id: entry.user_id }
      });

      if (error) {
        console.error(`Error detecting recurring for user ${entry.user_id}:`, error);
        continue;
      }

      // Mark as processed
      await supabase
        .from('recurring_detection_queue')
        .update({ processed_at: new Date().toISOString() })
        .eq('user_id', entry.user_id);

      results.push({
        user_id: entry.user_id,
        detected: data?.detected || 0,
      });
    }

    return new Response(
      JSON.stringify({
        processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in on-transaction-sync:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});