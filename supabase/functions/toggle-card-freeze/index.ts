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

    const { card_id, freeze } = await req.json();

    if (!card_id) {
      return new Response(
        JSON.stringify({ error: 'card_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user owns the card
    const { data: card } = await supabaseClient
      .from('cards')
      .select('id, user_id, status')
      .eq('id', card_id)
      .eq('user_id', user.id)
      .single();

    if (!card) {
      return new Response(
        JSON.stringify({ error: 'Card not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Toggle freeze status
    const newStatus = freeze ? 'frozen' : 'active';
    const { data: updatedCard, error } = await supabaseClient
      .from('cards')
      .update({
        status: newStatus,
        frozen_at: freeze ? new Date().toISOString() : null,
      })
      .eq('id', card_id)
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        card: updatedCard,
        message: freeze ? 'Card frozen successfully' : 'Card unfrozen successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Toggle card freeze error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
