import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HeroContext {
  type: 'bills_due' | 'savings_high' | 'overspending' | 'goal_near' | 'default';
  urgency: 'critical' | 'warning' | 'info';
  data: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Fetch all relevant data in parallel
    const [bills, budgets, goals, transactions] = await Promise.all([
      supabaseClient
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true }),
      
      supabaseClient
        .from('user_budgets')
        .select('*, budget_spending(*)')
        .eq('user_id', user.id)
        .eq('is_active', true),
      
      supabaseClient
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('target_amount', { ascending: false }),
      
      supabaseClient
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })
        .limit(30)
    ]);

    // Priority 1: Bills due in 3 days or less (CRITICAL)
    if (bills.data && bills.data.length > 0) {
      const urgentBills = bills.data.filter(bill => {
        const daysUntilDue = Math.ceil((new Date(bill.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilDue <= 3;
      });

      if (urgentBills.length > 0) {
        const totalAmount = urgentBills.reduce((sum, bill) => sum + Number(bill.amount), 0);
        return new Response(
          JSON.stringify({
            type: 'bills_due',
            urgency: urgentBills.some(b => Math.ceil((new Date(b.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 1) ? 'critical' : 'warning',
            data: {
              bills: urgentBills.map(bill => ({
                id: bill.id,
                name: bill.bill_name,
                amount: Number(bill.amount),
                dueDate: bill.due_date,
                daysUntilDue: Math.ceil((new Date(bill.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              })),
              totalAmount
            }
          } as HeroContext),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Priority 2: Budget overspending (WARNING/CRITICAL)
    if (budgets.data && budgets.data.length > 0) {
      for (const budget of budgets.data) {
        const spending = budget.budget_spending?.[0];
        if (spending) {
          const percentageUsed = (Number(spending.spent_amount) / Number(budget.amount)) * 100;
          
          if (percentageUsed >= 90) {
            // Get top spending categories
            const topCategories = [
              { name: budget.budget_category?.name || 'General', amount: Number(spending.spent_amount), percentage: percentageUsed }
            ];

            return new Response(
              JSON.stringify({
                type: 'overspending',
                urgency: percentageUsed >= 100 ? 'critical' : 'warning',
                data: {
                  budget: {
                    name: budget.budget_category?.name || 'Monthly Budget',
                    spent: Number(spending.spent_amount),
                    limit: Number(budget.amount),
                    percentageUsed
                  },
                  topCategories
                }
              } as HeroContext),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }
    }

    // Priority 3: Goal near completion (>=90%) (INFO)
    if (goals.data && goals.data.length > 0) {
      for (const goal of goals.data) {
        const percentageComplete = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
        
        if (percentageComplete >= 90 && percentageComplete < 100) {
          return new Response(
            JSON.stringify({
              type: 'goal_near',
              urgency: 'info',
              data: {
                goal: {
                  id: goal.id,
                  name: goal.goal_name,
                  current: Number(goal.current_amount),
                  target: Number(goal.target_amount),
                  percentageComplete,
                  remainingAmount: Number(goal.target_amount) - Number(goal.current_amount),
                  icon: goal.icon
                },
                suggestedNextGoal: goals.data.length > 1 ? {
                  name: goals.data[1].goal_name,
                  suggestedTarget: Number(goals.data[1].target_amount)
                } : undefined
              }
            } as HeroContext),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Priority 4: Savings high (net worth up 20%+) (INFO)
    if (transactions.data && transactions.data.length > 0) {
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const monthlyTransactions = transactions.data.filter(
        tx => new Date(tx.transaction_date) >= thisMonth
      );

      if (monthlyTransactions.length > 0) {
        const monthlyChange = monthlyTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
        const avgBalance = transactions.data.reduce((sum, tx) => sum + Number(tx.amount), 0) / transactions.data.length;
        const percentageChange = (monthlyChange / Math.abs(avgBalance || 1)) * 100;

        if (percentageChange >= 20) {
          return new Response(
            JSON.stringify({
              type: 'savings_high',
              urgency: 'info',
              data: {
                netWorthIncrease: monthlyChange,
                percentageChange,
                opportunities: [
                  {
                    id: '1',
                    title: 'High-Yield Savings Account',
                    description: 'Earn 4.5% APY on your savings',
                    potentialReturn: '+$' + (monthlyChange * 0.045).toFixed(2) + '/mo'
                  },
                  {
                    id: '2',
                    title: 'Index Fund Investment',
                    description: 'Diversified portfolio with low fees',
                    potentialReturn: '~8-10% annual return'
                  }
                ]
              }
            } as HeroContext),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Default: Motivational hero
    return new Response(
      JSON.stringify({
        type: 'default',
        urgency: 'info',
        data: {}
      } as HeroContext),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-hero-context:', error);
    return new Response(
      JSON.stringify({ 
        type: 'default',
        urgency: 'info',
        data: {},
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
