import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FinancialContext {
  totalBalance: number;
  savingsGoalProgress: number;
  upcomingBills: Array<{ name: string; amount: number; dueDate: string }>;
  recentSpending: number;
  budgetStatus: Array<{ category: string; spent: number; limit: number }>;
  streak: number;
  netWorthChange: number;
}

interface InsightResult {
  message: string;
  type: 'tip' | 'alert' | 'celebration' | 'nudge';
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
}

async function fetchUserFinancialContext(supabase: any, userId: string): Promise<FinancialContext> {
  // Fetch connected accounts for balance
  const { data: accounts } = await supabase
    .from('connected_accounts')
    .select('balance, account_type')
    .eq('user_id', userId);
  
  const totalBalance = accounts?.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0) || 0;

  // Fetch goals progress
  const { data: goals } = await supabase
    .from('goals')
    .select('current_amount, target_amount')
    .eq('user_id', userId)
    .eq('is_active', true);
  
  const totalTarget = goals?.reduce((sum: number, g: any) => sum + (g.target_amount || 0), 0) || 1;
  const totalCurrent = goals?.reduce((sum: number, g: any) => sum + (g.current_amount || 0), 0) || 0;
  const savingsGoalProgress = Math.round((totalCurrent / totalTarget) * 100);

  // Fetch upcoming bills (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const { data: bills } = await supabase
    .from('recurring_transactions')
    .select('merchant_name, amount, next_due_date')
    .eq('user_id', userId)
    .eq('is_active', true)
    .lte('next_due_date', nextWeek.toISOString())
    .order('next_due_date', { ascending: true })
    .limit(5);

  const upcomingBills = bills?.map((b: any) => ({
    name: b.merchant_name,
    amount: Math.abs(b.amount),
    dueDate: b.next_due_date
  })) || [];

  // Fetch recent spending (last 7 days)
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .lt('amount', 0)
    .gte('date', lastWeek.toISOString().split('T')[0]);
  
  const recentSpending = transactions?.reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) || 0;

  // Fetch budget status
  const { data: budgets } = await supabase
    .from('user_budgets')
    .select('category, amount')
    .eq('user_id', userId)
    .eq('is_active', true);

  const { data: spending } = await supabase
    .from('budget_spending')
    .select('budget_id, spent_amount')
    .eq('user_id', userId);

  const budgetStatus = budgets?.map((b: any) => {
    const spent = spending?.find((s: any) => s.budget_id === b.id)?.spent_amount || 0;
    return { category: b.category, spent, limit: b.amount };
  }) || [];

  // Fetch streak
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_streak')
    .eq('id', userId)
    .single();

  const streak = profile?.current_streak || 0;

  // Fetch net worth change
  const { data: netWorthHistory } = await supabase
    .from('net_worth_snapshots')
    .select('net_worth')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false })
    .limit(2);

  let netWorthChange = 0;
  if (netWorthHistory && netWorthHistory.length >= 2) {
    const current = netWorthHistory[0].net_worth;
    const previous = netWorthHistory[1].net_worth;
    netWorthChange = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  }

  return {
    totalBalance,
    savingsGoalProgress,
    upcomingBills,
    recentSpending,
    budgetStatus,
    streak,
    netWorthChange
  };
}

function generateProactiveInsights(context: FinancialContext): InsightResult[] {
  const insights: InsightResult[] = [];

  // Bill reminders (high priority)
  if (context.upcomingBills.length > 0) {
    const nextBill = context.upcomingBills[0];
    const dueDate = new Date(nextBill.dueDate);
    const daysUntil = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 2) {
      insights.push({
        message: `${nextBill.name} payment of $${nextBill.amount.toFixed(2)} is due ${daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : 'in ' + daysUntil + ' days'}. Make sure you're covered!`,
        type: 'alert',
        priority: 'high',
        actionUrl: '/bills',
        actionLabel: 'View Bills'
      });
    }
  }

  // Budget warnings
  const overBudget = context.budgetStatus.filter(b => b.spent > b.limit * 0.9);
  if (overBudget.length > 0) {
    const worst = overBudget.sort((a, b) => (b.spent / b.limit) - (a.spent / a.limit))[0];
    const percent = Math.round((worst.spent / worst.limit) * 100);
    
    insights.push({
      message: `Your ${worst.category} budget is at ${percent}% ($${worst.spent.toFixed(0)} of $${worst.limit.toFixed(0)}). Consider slowing down spending in this category.`,
      type: 'alert',
      priority: percent >= 100 ? 'high' : 'medium',
      actionUrl: '/budgets',
      actionLabel: 'View Budget'
    });
  }

  // Celebration for goal progress
  if (context.savingsGoalProgress >= 75 && context.savingsGoalProgress < 100) {
    insights.push({
      message: `You're ${context.savingsGoalProgress}% of the way to your savings goals! Keep up the great momentum.`,
      type: 'celebration',
      priority: 'medium',
      actionUrl: '/goals',
      actionLabel: 'View Goals'
    });
  }

  // Streak celebration
  if (context.streak > 0 && context.streak % 7 === 0) {
    const weeks = Math.floor(context.streak / 7);
    insights.push({
      message: `Amazing! You've maintained a ${context.streak}-day savings streak. That's ${weeks} week${weeks >= 2 ? 's' : ''} of consistent progress!`,
      type: 'celebration',
      priority: 'low'
    });
  }

  // Net worth growth tip
  if (context.netWorthChange > 0) {
    insights.push({
      message: `Your net worth grew ${context.netWorthChange.toFixed(1)}% recently. Small consistent gains lead to big results!`,
      type: 'tip',
      priority: 'low'
    });
  }

  // Spending nudge
  if (context.recentSpending > context.totalBalance * 0.3) {
    const spendPercent = Math.round((context.recentSpending / context.totalBalance) * 100);
    insights.push({
      message: `You've spent $${context.recentSpending.toFixed(0)} in the past week - that's about ${spendPercent}% of your current balance. Consider reviewing your expenses.`,
      type: 'nudge',
      priority: 'medium',
      actionUrl: '/transactions',
      actionLabel: 'Review Spending'
    });
  }

  // Savings opportunity
  const underBudget = context.budgetStatus.filter(b => b.spent < b.limit * 0.5 && b.limit > 0);
  if (underBudget.length > 0) {
    const best = underBudget[0];
    const savings = best.limit - best.spent;
    
    insights.push({
      message: `You're way under budget on ${best.category}! You could move $${savings.toFixed(0)} to savings this month.`,
      type: 'tip',
      priority: 'low',
      actionUrl: '/savings',
      actionLabel: 'Add to Savings'
    });
  }

  // Sort by priority and return top 3
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  return insights
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 3);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Set up SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial connection message
          controller.enqueue(encoder.encode('data: ' + JSON.stringify({ connected: true }) + '\n\n'));

          // Fetch financial context
          const context = await fetchUserFinancialContext(supabase, user.id);
          
          // Generate insights
          const insights = generateProactiveInsights(context);
          
          // Stream insights with delays for natural pacing
          for (const insight of insights) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay between insights
            
            controller.enqueue(encoder.encode('data: ' + JSON.stringify({ insight }) + '\n\n'));
          }

          // Keep connection alive with heartbeats
          let heartbeatCount = 0;
          const heartbeatInterval = setInterval(async () => {
            heartbeatCount++;
            controller.enqueue(encoder.encode(': heartbeat ' + heartbeatCount + '\n\n'));
            
            // Every 30 seconds, check for new insights
            if (heartbeatCount % 3 === 0) {
              const newContext = await fetchUserFinancialContext(supabase, user.id);
              const newInsights = generateProactiveInsights(newContext);
              
              if (newInsights.length > 0) {
                const randomInsight = newInsights[Math.floor(Math.random() * newInsights.length)];
                controller.enqueue(encoder.encode('data: ' + JSON.stringify({ insight: randomInsight }) + '\n\n'));
              }
            }
            
            // Close after 5 minutes to prevent resource exhaustion
            if (heartbeatCount >= 30) {
              clearInterval(heartbeatInterval);
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            }
          }, 10000); // Heartbeat every 10 seconds

        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(encoder.encode('data: ' + JSON.stringify({ error: 'Stream error' }) + '\n\n'));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('Ambient AI Stream error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
