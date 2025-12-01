import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SmartAction {
  id: string;
  label: string;
  icon: string;
  color: 'warning' | 'destructive' | 'success' | 'default';
  savings?: number;
  action: {
    type: 'transfer' | 'navigate' | 'external';
    params?: any;
    to?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Fetch user's financial data in parallel
    const [
      { data: accounts },
      { data: goals },
      { data: budgets },
      { data: subscriptions },
      { data: recentTransactions }
    ] = await Promise.all([
      supabase.from('connected_accounts').select('*').eq('user_id', user.id),
      supabase.from('goals').select('*').eq('user_id', user.id).eq('is_active', true),
      supabase.from('user_budgets').select('*, budget_spending(*)').eq('user_id', user.id).eq('is_active', true),
      supabase.from('detected_subscriptions').select('*').eq('user_id', user.id).neq('status', 'paused'),
      supabase.from('transactions').select('*').eq('user_id', user.id).order('transaction_date', { ascending: false }).limit(30)
    ]);

    const actions: SmartAction[] = [];

    // Calculate total balance
    const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;

    // Action 1: Emergency fund check (if balance < 3 months of average spending)
    const avgMonthlySpending = recentTransactions
      ?.filter(t => t.transaction_type === 'debit')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    
    const emergencyFundTarget = avgMonthlySpending * 3;
    
    if (totalBalance < emergencyFundTarget && totalBalance > 0) {
      const suggestedAmount = Math.min(50, Math.ceil((emergencyFundTarget - totalBalance) / 10) * 10);
      actions.push({
        id: 'boost_emergency',
        label: `Move $${suggestedAmount} to Emergency`,
        icon: 'shield',
        color: 'warning',
        action: { 
          type: 'navigate', 
          to: '/savings',
          params: { suggested: suggestedAmount, reason: 'emergency' }
        }
      });
    }

    // Action 2: Goal near completion (>85% progress)
    const nearCompleteGoal = goals?.find(g => {
      const progress = (Number(g.current_amount) / Number(g.target_amount)) * 100;
      return progress >= 85 && progress < 100;
    });

    if (nearCompleteGoal) {
      const remaining = Number(nearCompleteGoal.target_amount) - Number(nearCompleteGoal.current_amount);
      actions.push({
        id: 'complete_goal',
        label: `Fund ${nearCompleteGoal.name} ($${remaining.toFixed(0)} left)`,
        icon: 'target',
        color: 'success',
        action: { 
          type: 'navigate', 
          to: `/goals?id=${nearCompleteGoal.id}`,
          params: { goalId: nearCompleteGoal.id, amount: remaining }
        }
      });
    }

    // Action 3: Budget overspending (>90% utilization)
    const overspentBudget = budgets?.find(b => {
      const spent = b.budget_spending?.reduce((sum: number, s: any) => sum + Number(s.amount), 0) || 0;
      const utilization = (spent / Number(b.budget_amount)) * 100;
      return utilization > 90;
    });

    if (overspentBudget) {
      const spent = overspentBudget.budget_spending?.reduce((sum: number, s: any) => sum + Number(s.amount), 0) || 0;
      const utilization = ((spent / Number(overspentBudget.budget_amount)) * 100).toFixed(0);
      actions.push({
        id: 'review_budget',
        label: `Review budget (${utilization}% spent)`,
        icon: 'alert-circle',
        color: 'destructive',
        action: { 
          type: 'navigate', 
          to: '/budget'
        }
      });
    }

    // Action 4: Unused subscriptions (not in transactions for 60+ days)
    const unusedSubs = subscriptions?.filter(sub => {
      const lastCharge = recentTransactions?.find(t => 
        t.merchant?.toLowerCase().includes(sub.merchant.toLowerCase())
      );
      if (!lastCharge) return true;
      const daysSince = (Date.now() - new Date(lastCharge.transaction_date).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 60;
    });

    if (unusedSubs && unusedSubs.length > 0) {
      const potentialSavings = unusedSubs.reduce((sum, sub) => sum + Number(sub.average_charge || 0), 0);
      actions.push({
        id: 'cancel_subs',
        label: `Cancel ${unusedSubs.length} unused sub${unusedSubs.length > 1 ? 's' : ''}`,
        icon: 'x-circle',
        color: 'destructive',
        savings: potentialSavings,
        action: { 
          type: 'navigate', 
          to: '/subscriptions'
        }
      });
    }

    // Action 5: Default - Set up new goal
    if (actions.length < 3) {
      actions.push({
        id: 'create_goal',
        label: 'Set up a new savings goal',
        icon: 'plus-circle',
        color: 'default',
        action: { 
          type: 'navigate', 
          to: '/goals?new=true'
        }
      });
    }

    // Return top 4 actions
    return new Response(
      JSON.stringify({
        actions: actions.slice(0, 4),
        metadata: {
          totalBalance,
          emergencyFundTarget,
          goalsNearCompletion: goals?.filter(g => 
            (Number(g.current_amount) / Number(g.target_amount)) * 100 >= 85
          ).length || 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-smart-actions:', error);
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
