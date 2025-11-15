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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Not authenticated');
    }
    
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Fetch all relevant user data
    const [creditScores, debts, goals, investments, subscriptions] = await Promise.all([
      supabaseClient.from('credit_scores').select('*').eq('user_id', user.id).order('score_date', { ascending: false }).limit(1),
      supabaseClient.from('debts').select('*').eq('user_id', user.id),
      supabaseClient.from('goals').select('*').eq('user_id', user.id),
      supabaseClient.from('investment_accounts').select('*').eq('user_id', user.id),
      supabaseClient.from('detected_subscriptions').select('*').eq('user_id', user.id).eq('is_confirmed', true),
    ]);

    // Calculate component scores (0-100 each)
    
    // 1. Credit Score Component (25%)
    const latestCredit = creditScores.data?.[0];
    const creditComponent = latestCredit ? Math.round(((latestCredit.score - 300) / 550) * 100) : 50;

    // 2. Debt Component (20%)
    const totalDebt = debts.data?.reduce((sum, d) => sum + parseFloat(String(d.current_balance)), 0) || 0;
    const debtComponent = totalDebt === 0 ? 100 : Math.max(0, 100 - Math.min(100, (totalDebt / 50000) * 100));

    // 3. Savings Component (20%)
    const totalGoalProgress = goals.data?.reduce((sum, g) => {
      const progress = (parseFloat(String(g.current_amount)) / parseFloat(String(g.target_amount))) * 100;
      return sum + Math.min(100, progress);
    }, 0) || 0;
    const savingsComponent = goals.data?.length ? Math.round(totalGoalProgress / goals.data.length) : 50;

    // 4. Goals Component (15%)
    const completedGoals = goals.data?.filter(g => parseFloat(String(g.current_amount)) >= parseFloat(String(g.target_amount))).length || 0;
    const goalsComponent = goals.data?.length ? Math.round((completedGoals / goals.data.length) * 100) : 50;

    // 5. Investment Component (10%)
    const totalInvestmentValue = investments.data?.reduce((sum, inv) => sum + parseFloat(String(inv.total_value)), 0) || 0;
    const totalInvestmentGains = investments.data?.reduce((sum, inv) => sum + parseFloat(String(inv.gains_losses || 0)), 0) || 0;
    const investmentComponent = totalInvestmentValue > 0 
      ? Math.max(0, Math.min(100, 50 + (totalInvestmentGains / totalInvestmentValue) * 100))
      : 50;

    // 6. Emergency Fund Component (10%)
    const monthlyExpenses = (subscriptions.data?.reduce((sum, s) => sum + parseFloat(String(s.amount)), 0) || 0) * 12 / 12;
    const savingsBalance = goals.data?.reduce((sum, g) => sum + parseFloat(String(g.current_amount)), 0) || 0;
    const monthsCovered = monthlyExpenses > 0 ? savingsBalance / monthlyExpenses : 0;
    const emergencyFundComponent = Math.min(100, (monthsCovered / 6) * 100);

    // Calculate weighted overall score
    const overallScore = Math.round(
      creditComponent * 0.25 +
      debtComponent * 0.20 +
      savingsComponent * 0.20 +
      goalsComponent * 0.15 +
      investmentComponent * 0.10 +
      emergencyFundComponent * 0.10
    );

    // Generate personalized recommendations
    const recommendations = [];

    if (creditComponent < 60 && latestCredit) {
      recommendations.push({
        id: 'improve-credit',
        title: 'Improve Your Credit Score',
        description: `Your credit score is ${latestCredit.score}. Focus on paying bills on time and reducing credit utilization below 30%.`,
        priority: 'high',
        impact: 15,
        actionLabel: 'View Credit Details',
        actionLink: '/credit',
      });
    }

    if (debtComponent < 60 && totalDebt > 0) {
      recommendations.push({
        id: 'reduce-debt',
        title: 'Create a Debt Payoff Plan',
        description: `You have $${totalDebt.toFixed(2)} in debt. Consider using the avalanche or snowball method to pay it down faster.`,
        priority: 'high',
        impact: 12,
        actionLabel: 'Manage Debts',
        actionLink: '/debts',
      });
    }

    if (emergencyFundComponent < 40) {
      recommendations.push({
        id: 'emergency-fund',
        title: 'Build Your Emergency Fund',
        description: `You have ${monthsCovered.toFixed(1)} months of expenses saved. Aim for 3-6 months for financial security.`,
        priority: 'high',
        impact: 10,
        actionLabel: 'Set Savings Goal',
        actionLink: '/goals',
      });
    }

    if (savingsComponent > 80) {
      recommendations.push({
        id: 'great-progress',
        title: 'You\'re Doing Great!',
        description: 'Your savings progress is excellent. Keep up the good work and consider increasing your goals.',
        priority: 'low',
        impact: 5,
        actionLabel: 'Review Goals',
        actionLink: '/goals',
      });
    }

    if (subscriptions.data && subscriptions.data.length > 10) {
      const totalSubscriptionCost = subscriptions.data.reduce((sum, s) => sum + parseFloat(String(s.amount)), 0);
      recommendations.push({
        id: 'review-subscriptions',
        title: 'Review Your Subscriptions',
        description: `You have ${subscriptions.data.length} active subscriptions costing $${totalSubscriptionCost.toFixed(2)}/month. Consider canceling unused ones.`,
        priority: 'medium',
        impact: 8,
        actionLabel: 'Manage Subscriptions',
        actionLink: '/subscriptions',
      });
    }

    // Store health score in database
    await supabaseClient
      .from('financial_health_scores')
      .insert({
        user_id: user.id,
        overall_score: overallScore,
        credit_score_component: creditComponent,
        debt_component: debtComponent,
        savings_component: savingsComponent,
        goals_component: goalsComponent,
        investment_component: investmentComponent,
        emergency_fund_component: emergencyFundComponent,
        recommendations: recommendations,
      });

    // Save to history for tracking trends
    try {
      const { error: historyError } = await supabaseClient
        .from('financial_health_history')
        .insert({
          user_id: user.id,
          score: overallScore,
          components: {
            credit: creditComponent,
            debt: debtComponent,
            savings: savingsComponent,
            goals: goalsComponent,
            investment: investmentComponent,
            emergency_fund: emergencyFundComponent,
          },
          recommendations,
        });

      if (historyError) {
        console.error('Error saving to history:', historyError);
      }
    } catch (historyErr) {
      console.error('History save failed:', historyErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        overallScore,
        components: {
          credit: creditComponent,
          debt: debtComponent,
          savings: savingsComponent,
          goals: goalsComponent,
          investment: investmentComponent,
          emergencyFund: emergencyFundComponent,
        },
        recommendations,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Financial Health Calculation Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
