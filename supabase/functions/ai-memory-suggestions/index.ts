import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    console.log('Fetching user financial context...');

    // Get user's recent transactions, goals, and existing memories
    const [transactionsRes, goalsRes, memoriesRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('merchant, amount, category')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('goals')
        .select('name, target_amount, current_amount')
        .eq('user_id', user.id)
        .limit(10),
      supabase
        .from('agent_memory')
        .select('key, value, memory_type')
        .eq('user_id', user.id)
        .eq('agent_type', 'financial_memory')
        .limit(10),
    ]);

    const context = {
      recentTransactions: transactionsRes.data || [],
      goals: goalsRes.data || [],
      existingMemories: memoriesRes.data || [],
    };

    console.log('Generating AI suggestions based on financial history...');

    // Call Lovable AI to generate personalized suggestions
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a financial memory assistant. Generate 5 personalized memory suggestions based on the user\'s financial history. Each suggestion should be actionable and specific. Return ONLY a JSON array of objects with: content (string), category (goal|preference|insight|decision|pattern), importance (0.1-1).'
          },
          {
            role: 'user',
            content: `User's financial context:\n\nRecent transactions: ${JSON.stringify(context.recentTransactions)}\n\nGoals: ${JSON.stringify(context.goals)}\n\nExisting memories: ${JSON.stringify(context.existingMemories)}\n\nGenerate 5 personalized financial memory suggestions.`
          }
        ],
        tools: [
          {
            type: 'function',
            name: 'generate_memory_suggestions',
            description: 'Generate personalized financial memory suggestions',
            parameters: {
              type: 'object',
              properties: {
                suggestions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      content: { type: 'string' },
                      category: { type: 'string', enum: ['goal', 'preference', 'insight', 'decision', 'pattern'] },
                      importance: { type: 'number', minimum: 0.1, maximum: 1 }
                    },
                    required: ['content', 'category', 'importance'],
                    additionalProperties: false
                  },
                  minItems: 5,
                  maxItems: 5
                }
              },
              required: ['suggestions'],
              additionalProperties: false
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_memory_suggestions' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiData));

    // Extract tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const suggestions = JSON.parse(toolCall.function.arguments).suggestions;

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating suggestions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
