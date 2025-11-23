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

    const systemPrompt = `You are an advanced financial automation intelligence for $ave+. Parse natural language into rich, actionable automation rules with visual identity.

VISUAL INTELLIGENCE - Assign semantic icons from Lucide library:
• Coffee/Cafe → "coffee"
• Groceries/Food → "shopping-cart" or "apple"
• Dining/Restaurants → "utensils"
• Gaming (Steam, Xbox) → "gamepad-2"
• Streaming (Netflix, Spotify) → "play-circle"
• Travel → "plane"
• Gas/Transportation → "fuel"
• Bills/Utilities → "receipt"
• Savings → "piggy-bank"
• Balance operations → "wallet"
• Scheduled transfers → "calendar"
• Safety/Protection → "shield-alert"
• Fun/Leisure → "party-popper"

COLORS - Choose vibrant, contextual Tailwind colors:
• Shopping/Discretionary → "purple", "pink"
• Food/Dining → "orange", "amber"
• Essential Bills → "blue", "cyan"
• Savings/Goals → "emerald", "green"
• Warning/Alerts → "rose", "red"
• Balance operations → "indigo"
• Gaming/Entertainment → "violet", "purple"

CONFIDENCE SCORING (0-1):
• 0.9-1.0: Clear, unambiguous input
• 0.7-0.89: Good understanding, minor ambiguity
• 0.5-0.69: Partial understanding, needs clarification
• Below 0.5: Unclear, suggest rephrasing

SEMANTIC TAGS: Add 2-4 relevant tags like:
["gaming", "transaction-based", "micro-savings"], ["recurring", "weekly", "leisure"], ["safety", "balance-protection"]

EXAMPLES:

Input: "Save $2 every time I buy from Steam"
Output via create_automation_rule:
{
  "rule_name": "Steam Gaming Savings",
  "rule_type": "transaction_match",
  "icon": "gamepad-2",
  "color": "purple",
  "confidence": 0.95,
  "semantic_tags": ["gaming", "transaction-based", "micro-savings"],
  "trigger_condition": {
    "type": "transaction_match",
    "merchant": "Steam",
    "category": "Entertainment"
  },
  "action_config": {
    "type": "transfer_to_pot",
    "amount": 2
  }
}

Input: "If my balance drops below $500, move $50 from Savings"
Output via create_automation_rule:
{
  "rule_name": "Low Balance Safety Net",
  "rule_type": "balance_threshold",
  "icon": "shield-alert",
  "color": "rose",
  "confidence": 0.92,
  "semantic_tags": ["safety", "balance-protection", "automated-transfer"],
  "trigger_condition": {
    "type": "balance_threshold",
    "balance_threshold": 500
  },
  "action_config": {
    "type": "transfer_from_pot",
    "amount": 50,
    "target_name": "Savings"
  }
}

Input: "Put aside $100 every Friday for weekend fun"
Output via create_automation_rule:
{
  "rule_name": "Weekend Fun Fund",
  "rule_type": "date_based",
  "icon": "party-popper",
  "color": "pink",
  "confidence": 0.97,
  "semantic_tags": ["recurring", "weekly", "leisure"],
  "trigger_condition": {
    "type": "date_based",
    "frequency": "weekly",
    "day_of_week": "friday"
  },
  "action_config": {
    "type": "transfer_to_pot",
    "amount": 100
  }
}

Available user destinations:
Goals: ${goals.map(g => g.name).join(', ') || 'No goals yet'}
Pots: ${pots.map(p => p.name).join(', ') || 'No pots yet'}

Parse the user's input with visual identity and semantic depth.`;

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
            description: 'Create a new automation rule from natural language with visual identity',
            parameters: {
              type: 'object',
              properties: {
                rule_name: {
                  type: 'string',
                  description: 'A clear, descriptive name for the rule'
                },
                rule_type: {
                  type: 'string',
                  enum: ['transaction_match', 'date_based', 'balance_threshold'],
                  description: 'The type of trigger for this rule'
                },
                icon: {
                  type: 'string',
                  description: 'Lucide icon name representing the rule (e.g., "coffee", "gamepad-2", "wallet")'
                },
                color: {
                  type: 'string',
                  description: 'Tailwind color name for visual identity (e.g., "emerald", "purple", "rose")'
                },
                confidence: {
                  type: 'number',
                  description: 'Confidence score from 0-1 indicating parsing certainty',
                  minimum: 0,
                  maximum: 1
                },
                semantic_tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Semantic tags for categorization (e.g., ["gaming", "recurring"])'
                },
                trigger_condition: {
                  type: 'object',
                  description: 'The condition that will trigger this rule'
                },
                action_config: {
                  type: 'object',
                  description: 'The action to take when triggered'
                }
              },
              required: ['rule_name', 'rule_type', 'icon', 'color', 'confidence', 'semantic_tags', 'trigger_condition', 'action_config']
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

    // Check confidence score
    if (parsedRule.confidence < 0.5) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Could not confidently parse your input. Try being more specific.',
        suggestions: [
          'Include specific amounts (e.g., "$10")',
          'Name the merchant or category (e.g., "coffee shops")',
          'Specify timing (e.g., "every Friday", "when balance is low")'
        ]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

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
