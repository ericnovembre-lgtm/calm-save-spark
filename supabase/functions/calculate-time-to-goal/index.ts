import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Suggestion {
  id: string;
  action: string;
  savings: number;
  timeReduction: string;
  newProjection: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goalId, userId } = await req.json();
    
    if (!goalId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Goal ID and user ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get goal details
    const { data: goal, error: goalError } = await supabaseClient
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single();

    if (goalError || !goal) {
      throw new Error('Goal not found');
    }

    const remaining = goal.target_amount - (goal.current_amount || 0);
    
    // Get recent spending patterns
    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('amount, category, merchant')
      .eq('user_id', userId)
      .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: false })
      .limit(500);

    // Analyze spending by category
    const spendingByCategory: Record<string, { total: number; count: number }> = {};
    
    (transactions || []).forEach(t => {
      const category = t.category || 'Other';
      if (!spendingByCategory[category]) {
        spendingByCategory[category] = { total: 0, count: 0 };
      }
      spendingByCategory[category].total += Math.abs(t.amount);
      spendingByCategory[category].count += 1;
    });

    // Use AI for intelligent suggestions
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const spendingSummary = Object.entries(spendingByCategory)
      .map(([cat, data]) => `${cat}: $${data.total.toFixed(2)} (${data.count} transactions)`)
      .join('\n');

    const prompt = `Analyze this user's spending and suggest 3 realistic, actionable savings strategies to help them reach their goal faster.

Goal: $${remaining.toFixed(2)} remaining to save
Deadline: ${goal.deadline || 'No deadline set'}

Recent spending (last 90 days):
${spendingSummary}

Focus on the top spending categories. Make suggestions practical and specific with monthly savings amounts.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_savings_suggestions',
              description: 'Generate 3 savings suggestions to help reach a financial goal faster',
              parameters: {
                type: 'object',
                properties: {
                  suggestions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', description: 'Unique identifier' },
                        action: { type: 'string', description: 'Specific action to take' },
                        savings: { type: 'number', description: 'Monthly savings amount' },
                        category: { type: 'string', description: 'Spending category' },
                        difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] }
                      },
                      required: ['id', 'action', 'savings', 'category', 'difficulty']
                    },
                    minItems: 3,
                    maxItems: 3
                  }
                },
                required: ['suggestions']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_savings_suggestions' } }
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI service error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response structure:', JSON.stringify(aiData, null, 2));
    
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || !toolCall.function?.arguments) {
      console.error('No tool call in response:', aiData);
      throw new Error('AI did not return structured suggestions');
    }
    
    const parsed = JSON.parse(toolCall.function.arguments);
    const aiSuggestions = parsed.suggestions || [];

    // Calculate projections
    const currentMonthlyContribution = calculateMonthlyContribution(goal, transactions || []);
    const currentProjection = calculateProjection(remaining, currentMonthlyContribution);

    const suggestions: Suggestion[] = aiSuggestions.map((s: any) => {
      const monthlySavings = s.savings || 0;
      const newMonthlyContribution = currentMonthlyContribution + monthlySavings;
      const newProjection = calculateProjection(remaining, newMonthlyContribution);
      const daysSaved = Math.round((currentProjection.getTime() - newProjection.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: s.id || s.category,
        action: s.action,
        savings: monthlySavings,
        timeReduction: daysSaved > 0 ? `${daysSaved} days` : '0 days',
        newProjection: newProjection.toISOString().split('T')[0],
        difficulty: s.difficulty || 'medium',
        category: s.category || 'Other'
      };
    });

    console.log('Generated time-to-goal suggestions for goal:', goalId);
    return new Response(
      JSON.stringify({
        currentProjection: currentProjection.toISOString().split('T')[0],
        currentMonthlyContribution: currentMonthlyContribution.toFixed(2),
        remaining: remaining.toFixed(2),
        suggestions
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error calculating time-to-goal:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateMonthlyContribution(goal: any, transactions: any[]): number {
  const contributions = transactions
    .filter(t => t.amount > 0) // Assuming positive amounts are income/contributions
    .slice(0, 30); // Last 30 transactions as proxy for monthly
  
  if (contributions.length === 0) return 100; // Default assumption
  
  const total = contributions.reduce((sum, t) => sum + t.amount, 0);
  return total / contributions.length * 30; // Extrapolate to monthly
}

function calculateProjection(remaining: number, monthlyContribution: number): Date {
  if (monthlyContribution <= 0) {
    // No contribution, estimate 1 year
    const future = new Date();
    future.setMonth(future.getMonth() + 12);
    return future;
  }
  
  const monthsNeeded = Math.ceil(remaining / monthlyContribution);
  const projection = new Date();
  projection.setMonth(projection.getMonth() + monthsNeeded);
  return projection;
}
