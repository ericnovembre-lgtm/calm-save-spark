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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name');

    if (!profiles) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date();
    weekEnd.setHours(23, 59, 59, 999);

    let processedCount = 0;

    for (const profile of profiles) {
      try {
        // Get user's transactions for the week
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount, category')
          .eq('user_id', profile.id)
          .gte('transaction_date', weekStart.toISOString())
          .lte('transaction_date', weekEnd.toISOString());

        // Get user's goals progress
        const { data: goals } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', profile.id);

        // Get user's budgets
        const { data: budgets } = await supabase
          .from('user_budgets')
          .select('*')
          .eq('user_id', profile.id)
          .eq('is_active', true);

        // Calculate metrics
        const totalSpent = transactions?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;
        const totalSaved = goals?.reduce((sum, g) => sum + g.current_amount, 0) || 0;

        // Simple budget adherence score (0-100)
        let budgetAdherenceScore = 100;
        if (budgets && budgets.length > 0) {
          const overages = budgets.filter(b => {
            const spent = transactions?.filter(t => t.category === b.category_limits).length || 0;
            return spent > b.total_limit;
          });
          budgetAdherenceScore = Math.max(0, 100 - (overages.length / budgets.length) * 100);
        }

        // Find top spending category
        const categoryTotals: Record<string, number> = {};
        transactions?.forEach(t => {
          if (t.category) {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
          }
        });
        const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

        // Use Lovable AI to generate insights
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
        
        let aiInsights = null;
        if (LOVABLE_API_KEY) {
          const context = {
            totalSpent,
            totalSaved,
            budgetAdherenceScore,
            topCategory,
            transactionCount: transactions?.length || 0,
            goalsCount: goals?.length || 0,
            budgetsCount: budgets?.length || 0
          };

          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                {
                  role: 'system',
                  content: 'You are a financial insights generator. Provide 3-5 concise, actionable insights based on weekly financial data. Return as JSON array of strings.'
                },
                {
                  role: 'user',
                  content: `Generate insights for this week's data: ${JSON.stringify(context)}`
                }
              ],
              response_format: { type: 'json_object' }
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            aiInsights = JSON.parse(aiData.choices[0].message.content);
          }
        }

        // Store weekly insights
        await supabase
          .from('weekly_insights')
          .upsert({
            user_id: profile.id,
            week_start: weekStart.toISOString().split('T')[0],
            week_end: weekEnd.toISOString().split('T')[0],
            total_saved: totalSaved,
            total_spent: totalSpent,
            budget_adherence_score: Math.round(budgetAdherenceScore),
            top_category: topCategory,
            insights: aiInsights || {
              summary: [
                `You spent $${totalSpent.toFixed(2)} this week`,
                `Your budget adherence score is ${budgetAdherenceScore.toFixed(0)}%`,
                topCategory !== 'None' ? `Most spending in: ${topCategory}` : 'No major category spending'
              ]
            }
          }, {
            onConflict: 'user_id,week_start'
          });

        processedCount++;
      } catch (userError) {
        console.error(`Error processing user ${profile.id}:`, userError);
      }
    }

    return new Response(
      JSON.stringify({ 
        processed: processedCount,
        total: profiles.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating weekly insights:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
