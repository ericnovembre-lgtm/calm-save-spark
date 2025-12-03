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
    if (userError || !user) throw new Error('Unauthorized');

    const { input, context } = await req.json();
    if (!input || input.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: 'Input too short. Please provide more details.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build system prompt with category intelligence
    const systemPrompt = `You are a budget extraction specialist. Convert natural language into structured budget data.

Category Intelligence:
- Map spending contexts to standard categories (Groceries, Dining, Travel, Entertainment, Bills, Shopping, Health, Transportation, etc.)
- Assign appropriate Lucide icons:
  * shopping-cart: Groceries, Shopping
  * utensils: Dining, Restaurants
  * plane: Travel, Vacation
  * music: Entertainment
  * home: Bills, Rent, Utilities
  * car: Transportation, Gas
  * heart-pulse: Health, Fitness
  * briefcase: Work, Business
  * gift: Gifts
  * coffee: Coffee, Cafes
- Choose vibrant Tailwind colors (HSL format):
  * emerald-500: Savings, Groceries
  * rose-500: Entertainment, Fun
  * blue-500: Bills, Essential
  * amber-500: Dining, Food
  * purple-500: Travel
  * teal-500: Health
  * orange-500: Shopping

Timeframe Detection:
- "weekly", "every week", "per week" → weekly
- "monthly", "per month", "each month" → monthly (default)
- "yearly", "annually", "per year" → yearly

Auto-Renew Detection:
- Phrases like "every month", "recurring", "ongoing" → autoRenew: true
- One-time phrases like "this month", "once" → autoRenew: false

Examples:
"$400 groceries" → {amount: 400, category: "Groceries", icon: "shopping-cart", color: "hsl(142 76% 36%)"}
"Tokyo trip $2000" → {amount: 2000, category: "Travel", icon: "plane", color: "hsl(262 83% 58%)"}
"Weekly coffee $30" → {amount: 30, timeframe: "weekly", category: "Dining", icon: "coffee", color: "hsl(32 95% 44%)"}
"Set aside $150 for dining out" → {amount: 150, category: "Dining", icon: "utensils", color: "hsl(32 95% 44%)"}

${context?.existingBudgets?.length > 0 ? `Existing user categories: ${context.existingBudgets.join(', ')}` : ''}
${context?.recentCategories?.length > 0 ? `Recent usage: ${context.recentCategories.join(', ')}` : ''}`;

    // Define tool for budget extraction
    const tools = [
      {
        type: 'function',
        function: {
          name: 'create_budget',
          description: 'Extract budget parameters from natural language input',
          parameters: {
            type: 'object',
            properties: {
              amount: {
                type: 'number',
                description: 'Budget amount in dollars'
              },
              category: {
                type: 'string',
                description: 'Budget category name (e.g., Groceries, Dining, Travel)'
              },
              timeframe: {
                type: 'string',
                enum: ['weekly', 'monthly', 'yearly'],
                description: 'Budget period'
              },
              icon: {
                type: 'string',
                description: 'Lucide icon name (e.g., shopping-cart, utensils, plane)'
              },
              color: {
                type: 'string',
                description: 'Tailwind color in HSL format (e.g., hsl(142 76% 36%))'
              },
              notes: {
                type: 'string',
                description: 'Additional notes or context'
              },
              autoRenew: {
                type: 'boolean',
                description: 'Whether budget should auto-renew'
              }
            },
            required: ['amount', 'category', 'timeframe', 'icon', 'color', 'autoRenew']
          }
        }
      }
    ];

    // Call Lovable AI Gateway with Gemini
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input }
        ],
        tools,
        tool_choice: { type: 'function', function: { name: 'create_budget' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      if (response.status === 402) {
        throw new Error('PAYMENT_REQUIRED');
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.statusText}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      return new Response(
        JSON.stringify({ 
          error: 'Could not parse budget from input. Please be more specific (e.g., "$400 for groceries").' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const budgetData = JSON.parse(toolCall.function.arguments);
    
    // Calculate confidence based on input clarity
    const confidence = input.match(/\$?\d+/) && input.length > 10 ? 0.9 : 0.7;

    // Log the NL creation
    await supabaseClient.from('budget_nl_creation_log').insert({
      user_id: user.id,
      raw_input: input,
      parsed_budget: budgetData,
      confidence,
      was_created: false // Will be updated when budget is actually created
    });

    return new Response(
      JSON.stringify({ 
        budget: budgetData,
        confidence,
        source: 'gemini-3-pro'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in parse-budget-nl:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage === 'RATE_LIMIT_EXCEEDED') {
      return new Response(
        JSON.stringify({ error: 'AI is busy. Please try again in a moment.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (errorMessage === 'PAYMENT_REQUIRED') {
      return new Response(
        JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
