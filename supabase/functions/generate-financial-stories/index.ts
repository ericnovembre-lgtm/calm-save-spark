import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FinancialStory {
  id: string;
  type: 'high_five' | 'nudge' | 'milestone' | 'goal_win' | 'spending_alert' | 'streak';
  title: string;
  headline: string;
  body: string;
  theme: 'emerald' | 'rose' | 'amber' | 'gold' | 'violet' | 'cyan';
  animation: 'confetti' | 'shake' | 'sparkle' | 'trophy' | 'pulse' | 'counter';
  createdAt: string;
  expiresAt: string;
  data: {
    amount?: number;
    percentChange?: number;
    comparison?: string;
    metric?: string;
    goalName?: string;
    merchantName?: string;
  };
  cta?: {
    label: string;
    action: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[Stories] Generating financial stories for user ${user.id}`);
    const stories: FinancialStory[] = [];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    // Fetch user data in parallel
    const [
      transactionsResult,
      goalsResult,
      netWorthResult,
      subscriptionsResult,
      profileResult,
      budgetsResult
    ] = await Promise.all([
      supabaseClient
        .from('transactions')
        .select('amount, merchant, category, transaction_date')
        .eq('user_id', user.id)
        .gte('transaction_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('transaction_date', { ascending: false }),
      supabaseClient
        .from('goals')
        .select('id, name, target_amount, current_amount, icon')
        .eq('user_id', user.id)
        .eq('is_active', true),
      supabaseClient
        .from('net_worth_snapshots')
        .select('net_worth, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabaseClient
        .from('detected_subscriptions')
        .select('merchant, amount, last_charge_date')
        .eq('user_id', user.id)
        .eq('status', 'active'),
      supabaseClient
        .from('profiles')
        .select('current_streak, last_activity_date')
        .eq('id', user.id)
        .single(),
      supabaseClient
        .from('user_budgets')
        .select('id, name, amount, category_code')
        .eq('user_id', user.id)
        .eq('is_active', true)
    ]);

    const transactions = transactionsResult.data || [];
    const goals = goalsResult.data || [];
    const netWorthSnapshots = netWorthResult.data || [];
    const subscriptions = subscriptionsResult.data || [];
    const profile = profileResult.data;
    const budgets = budgetsResult.data || [];

    // 1. HIGH FIVE: Spending below average
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todaySpending = transactions
      .filter(tx => tx.transaction_date?.startsWith(todayStr) && Number(tx.amount) < 0)
      .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);

    const last7DaysSpending = transactions
      .filter(tx => {
        const txDate = new Date(tx.transaction_date);
        return txDate >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && Number(tx.amount) < 0;
      })
      .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);
    
    const avgDailySpending = last7DaysSpending / 7;

    if (todaySpending > 0 && todaySpending < avgDailySpending * 0.7) {
      const savedAmount = avgDailySpending - todaySpending;
      stories.push({
        id: `high_five_${todayStr}`,
        type: 'high_five',
        title: '🙌 High Five!',
        headline: 'Great spending day!',
        body: `You spent $${todaySpending.toFixed(0)} today - that's ${Math.round((1 - todaySpending/avgDailySpending) * 100)}% less than your daily average!`,
        theme: 'emerald',
        animation: 'confetti',
        createdAt: now.toISOString(),
        expiresAt,
        data: {
          amount: todaySpending,
          percentChange: -Math.round((1 - todaySpending/avgDailySpending) * 100),
          comparison: `$${savedAmount.toFixed(0)} saved vs average`
        },
        cta: { label: 'View Spending', action: '/transactions' }
      });
    }

    // 2. THE NUDGE: Subscription review reminder (removed price comparison logic)
    // Note: previous_amount column doesn't exist, so we just remind about subscriptions
    if (subscriptions.length > 0) {
      const topSub = subscriptions.sort((a: any, b: any) => Number(b.amount) - Number(a.amount))[0];
      if (topSub && Number(topSub.amount) > 20) {
        stories.push({
          id: `nudge_${topSub.merchant}_${todayStr}`,
          type: 'nudge',
          title: '📋 Subscription Review',
          headline: `Check ${topSub.merchant}`,
          body: `You're paying $${Number(topSub.amount).toFixed(2)}/month for ${topSub.merchant}. Make sure you're still getting value from it.`,
          theme: 'rose',
          animation: 'shake',
          createdAt: now.toISOString(),
          expiresAt,
          data: {
            amount: Number(topSub.amount),
            merchantName: topSub.merchant
          },
          cta: { label: 'Manage Subscriptions', action: '/subscriptions' }
        });
      }
    }

    // 3. MILESTONE: Net worth crossed round number
    if (netWorthSnapshots.length >= 2) {
      const currentNetWorth = Number(netWorthSnapshots[0]?.net_worth || 0);
      const previousNetWorth = Number(netWorthSnapshots[1]?.net_worth || 0);
      
      const milestones = [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
      for (const milestone of milestones) {
        if (currentNetWorth >= milestone && previousNetWorth < milestone) {
          stories.push({
            id: `milestone_${milestone}`,
            type: 'milestone',
            title: '🏆 Milestone Reached!',
            headline: `$${milestone.toLocaleString()} Net Worth!`,
            body: `Incredible! You've crossed the $${milestone.toLocaleString()} mark. Your wealth-building journey is paying off!`,
            theme: 'gold',
            animation: 'sparkle',
            createdAt: now.toISOString(),
            expiresAt,
            data: {
              amount: currentNetWorth,
              metric: `$${milestone.toLocaleString()}`
            },
            cta: { label: 'See Net Worth', action: '/net-worth' }
          });
          break;
        }
      }
    }

    // 4. GOAL WIN: Goal completed or near completion
    for (const goal of goals) {
      const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
      
      if (progress >= 100) {
        stories.push({
          id: `goal_win_${goal.id}`,
          type: 'goal_win',
          title: '🎯 Goal Achieved!',
          headline: `${goal.name} Complete!`,
          body: `You did it! You've saved $${Number(goal.current_amount).toLocaleString()} for ${goal.name}. Time to celebrate!`,
          theme: 'violet',
          animation: 'trophy',
          createdAt: now.toISOString(),
          expiresAt,
          data: {
            amount: Number(goal.current_amount),
            goalName: goal.name
          },
          cta: { label: 'View Goals', action: '/goals' }
        });
        break;
      } else if (progress >= 95) {
        stories.push({
          id: `goal_almost_${goal.id}`,
          type: 'goal_win',
          title: '🔥 Almost There!',
          headline: `${goal.name} at ${progress.toFixed(0)}%!`,
          body: `Just $${(Number(goal.target_amount) - Number(goal.current_amount)).toFixed(0)} more to reach your ${goal.name} goal!`,
          theme: 'violet',
          animation: 'pulse',
          createdAt: now.toISOString(),
          expiresAt,
          data: {
            amount: Number(goal.current_amount),
            percentChange: progress,
            goalName: goal.name
          },
          cta: { label: 'Add Funds', action: '/goals' }
        });
        break;
      }
    }

    // 5. SPENDING ALERT: Budget category over 90%
    for (const budget of budgets) {
      const categorySpending = transactions
        .filter(tx => tx.category === budget.category_code && Number(tx.amount) < 0)
        .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);
      
      const utilization = (categorySpending / Number(budget.amount)) * 100;
      
      if (utilization >= 90 && utilization < 100) {
        stories.push({
          id: `alert_${budget.id}`,
          type: 'spending_alert',
          title: '📊 Budget Alert',
          headline: `${budget.name} at ${utilization.toFixed(0)}%`,
          body: `You've used ${utilization.toFixed(0)}% of your ${budget.name} budget. Only $${(Number(budget.amount) - categorySpending).toFixed(0)} remaining.`,
          theme: 'amber',
          animation: 'pulse',
          createdAt: now.toISOString(),
          expiresAt,
          data: {
            amount: categorySpending,
            percentChange: utilization
          },
          cta: { label: 'View Budgets', action: '/budgets' }
        });
        break;
      }
    }

    // 6. STREAK: Consecutive days under budget
    if (profile?.current_streak && profile.current_streak >= 3) {
      stories.push({
        id: `streak_${profile.current_streak}`,
        type: 'streak',
        title: '🔥 On Fire!',
        headline: `${profile.current_streak} Day Streak!`,
        body: `You've been under budget for ${profile.current_streak} days in a row. Keep the momentum going!`,
        theme: 'cyan',
        animation: 'counter',
        createdAt: now.toISOString(),
        expiresAt,
        data: {
          metric: `${profile.current_streak} days`
        },
        cta: { label: 'View Progress', action: '/dashboard' }
      });
    }

    // Fallback welcome story for new users with no activity
    if (stories.length === 0) {
      stories.push({
        id: 'welcome_story',
        type: 'high_five',
        title: '👋 Welcome!',
        headline: 'Your journey starts here',
        body: 'Start tracking spending, set a goal, or connect an account to unlock personalized financial stories!',
        theme: 'cyan',
        animation: 'sparkle',
        createdAt: now.toISOString(),
        expiresAt,
        data: {},
        cta: { label: 'Get Started', action: '/onboarding' }
      });
    }

    console.log(`[Stories] Generated ${stories.length} stories for user ${user.id}`);

    return new Response(JSON.stringify({ stories }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Stories] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to generate stories',
      stories: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
