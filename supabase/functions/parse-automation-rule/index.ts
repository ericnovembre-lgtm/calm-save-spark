import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { input, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Initialize Supabase client to get user's goals and pots for context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Fetch user's goals and pots
    const [goalsResult, potsResult] = await Promise.all([
      supabaseClient.from('goals').select('id, name').eq('user_id', userId),
      supabaseClient.from('pots').select('id, name').eq('user_id', userId)
    ]);

    const goals = goalsResult.data || [];
    const pots = potsResult.data || [];

    const systemPrompt = `You are a financial automation rule parser for $ave+. Parse natural language into structured automation rules.

Available destinations for transfers:
Goals: ${goals.map(g => g.name).join(', ') || 'No goals yet'}
Pots: ${pots.map(p => p.name).join(', ') || 'No pots yet'}

Parse the user's input and extract:
1. Rule name (short, descriptive)
2. Rule type (transaction_match, scheduled_transfer, balance_threshold, round_up)
3. Trigger conditions
4. Action configuration

Examples:
- "Save $5 every time I buy coffee" → transaction_match with merchant/category coffee, transfer $5
- "Transfer $100 every Friday" → scheduled_transfer with weekly frequency, day friday
- "When balance exceeds $2000, move $500 to savings" → balance_threshold with threshold $2000

Return structured JSON with the rule configuration.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'create_automation_rule',
            description: 'Parse natural language into an automation rule structure',
            parameters: {
              type: 'object',
              properties: {
                rule_name: { 
                  type: 'string',
                  description: 'Short, descriptive name for the rule'
                },
                rule_type: {
                  type: 'string',
                  enum: ['transaction_match', 'scheduled_transfer', 'balance_threshold', 'round_up'],
                  description: 'Type of automation rule'
                },
                trigger_condition: {
                  type: 'object',
                  properties: {
                    type: { 
                      type: 'string',
                      enum: ['transaction_match', 'date_based', 'balance_threshold']
                    },
                    merchant: { type: 'string' },
                    category: { type: 'string' },
                    frequency: {
                      type: 'string',
                      enum: ['daily', 'weekly', 'bi-weekly', 'monthly']
                    },
                    day_of_week: { type: 'string' },
                    balance_threshold: { type: 'number' }
                  }
                },
                action_config: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      enum: ['transfer_to_goal', 'transfer_to_pot', 'round_up']
                    },
                    amount: { type: 'number' },
                    percentage: { type: 'number' },
                    target_name: { type: 'string' }
                  }
                }
              },
              required: ['rule_name', 'rule_type', 'trigger_condition', 'action_config']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'create_automation_rule' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const parsedRule = JSON.parse(toolCall.function.arguments);

    // Match target names to actual IDs
    if (parsedRule.action_config.target_name) {
      const targetName = parsedRule.action_config.target_name.toLowerCase();
      
      if (parsedRule.action_config.type === 'transfer_to_goal') {
        const matchedGoal = goals.find(g => g.name.toLowerCase().includes(targetName));
        if (matchedGoal) {
          parsedRule.action_config.target_id = matchedGoal.id;
        }
      } else if (parsedRule.action_config.type === 'transfer_to_pot') {
        const matchedPot = pots.find(p => p.name.toLowerCase().includes(targetName));
        if (matchedPot) {
          parsedRule.action_config.target_id = matchedPot.id;
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      rule: parsedRule,
      available_goals: goals,
      available_pots: pots
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in parse-automation-rule:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
