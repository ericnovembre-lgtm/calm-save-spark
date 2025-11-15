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
    const { lifePlanId, eventType, estimatedCost } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: `Generate for a ${eventType} event with $${estimatedCost} budget: 1) 3 cost categories with amounts, 2) 10 checklist tasks with priorities. Return JSON with {costs: [{category, amount}], checklist: [{task, priority}]}`
        }],
        stream: false
      })
    });

    const aiData = await aiResponse.json();
    const suggestions = JSON.parse(aiData.choices[0].message.content);

    // Create costs
    for (const cost of suggestions.costs) {
      await supabase.from('life_event_costs').insert({
        life_plan_id: lifePlanId,
        cost_name: cost.category,
        cost_category: cost.category,
        cost_type: 'one_time',
        estimated_amount: cost.amount
      });
    }

    // Create checklist
    for (const item of suggestions.checklist) {
      await supabase.from('life_event_checklists').insert({
        life_plan_id: lifePlanId,
        title: item.task,
        priority: item.priority,
        item_type: 'task'
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Life plan generation error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
