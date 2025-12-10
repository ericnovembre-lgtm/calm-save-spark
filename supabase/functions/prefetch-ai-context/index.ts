/**
 * Prefetch AI Context Edge Function
 * Phase 6: Backend Optimization
 * 
 * Pre-computes common AI queries and caches results for instant retrieval
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache TTLs for different contexts (in seconds)
const CONTEXT_TTL: Record<string, number> = {
  'coach': 30 * 60,
  'digital-twin-baseline': 60 * 60,
  'ai-insights': 60 * 60,
  'goal-recommendations': 30 * 60,
  'budget-optimization': 30 * 60,
  'spending-insights': 30 * 60,
  'financial-health': 60 * 60,
  'projections': 6 * 60 * 60,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, userId } = await req.json();

    if (!context || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing context or userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const cacheKey = `prefetch:${context}:${userId}`;
    const ttl = CONTEXT_TTL[context] || 30 * 60;

    // Check cache
    const { data: cached } = await supabase
      .from('api_response_cache')
      .select('response_data, created_at')
      .eq('cache_key', cacheKey)
      .single();

    if (cached) {
      const cacheAge = (Date.now() - new Date(cached.created_at).getTime()) / 1000;
      if (cacheAge < ttl) {
        console.log(`[prefetch-ai-context] Cache HIT for ${context}`);
        return new Response(
          JSON.stringify({
            cacheKey,
            result: cached.response_data,
            fromCache: true,
            cacheAge: Math.round(cacheAge),
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`[prefetch-ai-context] Cache MISS for ${context}, computing...`);

    // Build context data
    const contextData = await buildContextData(supabase, userId, context);

    // Store in cache
    await supabase
      .from('api_response_cache')
      .upsert({
        cache_key: cacheKey,
        cache_type: 'ai_prefetch',
        user_id: userId,
        response_data: contextData,
        expires_at: new Date(Date.now() + ttl * 1000).toISOString(),
      }, { onConflict: 'cache_key' });

    return new Response(
      JSON.stringify({
        cacheKey,
        result: contextData,
        fromCache: false,
        ttl,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[prefetch-ai-context] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buildContextData(
  supabase: any,
  userId: string,
  context: string
): Promise<Record<string, unknown>> {
  const baseContext: Record<string, unknown> = {
    contextType: context,
    generatedAt: new Date().toISOString(),
  };

  switch (context) {
    case 'coach':
    case 'ai-insights': {
      const [goals, budgets, transactions, debts] = await Promise.all([
        supabase.from('goals').select('*').eq('user_id', userId).eq('is_active', true),
        supabase.from('user_budgets').select('*').eq('user_id', userId).eq('is_active', true),
        supabase.from('transactions').select('*').eq('user_id', userId)
          .order('transaction_date', { ascending: false }).limit(100),
        supabase.from('debts').select('*').eq('user_id', userId).eq('is_active', true),
      ]);

      return {
        ...baseContext,
        goalsCount: goals.data?.length || 0,
        goalsProgress: calculateGoalsProgress(goals.data || []),
        budgetsCount: budgets.data?.length || 0,
        recentTransactionsCount: transactions.data?.length || 0,
        totalDebt: (debts.data || []).reduce((sum: number, d: any) => sum + (d.current_balance || 0), 0),
        spendingCategories: categorizeTransactions(transactions.data || []),
      };
    }

    case 'digital-twin-baseline': {
      const [netWorth, goals, investments] = await Promise.all([
        supabase.from('net_worth_snapshots').select('*').eq('user_id', userId)
          .order('snapshot_date', { ascending: false }).limit(12),
        supabase.from('goals').select('*').eq('user_id', userId).eq('is_active', true),
        supabase.from('investments').select('*').eq('user_id', userId),
      ]);

      return {
        ...baseContext,
        netWorthHistory: netWorth.data || [],
        currentNetWorth: netWorth.data?.[0]?.net_worth || 0,
        goalsTotal: (goals.data || []).reduce((sum: number, g: any) => sum + (g.target_amount || 0), 0),
        investmentsTotal: (investments.data || []).reduce((sum: number, i: any) => sum + (i.current_value || 0), 0),
      };
    }

    case 'goal-recommendations': {
      const [goals, transactions] = await Promise.all([
        supabase.from('goals').select('*').eq('user_id', userId),
        supabase.from('transactions').select('amount, category')
          .eq('user_id', userId).gte('transaction_date', getDateNMonthsAgo(3)),
      ]);

      const monthlyIncome = calculateMonthlyIncome(transactions.data || []);
      const monthlyExpenses = calculateMonthlyExpenses(transactions.data || []);

      return {
        ...baseContext,
        activeGoals: (goals.data || []).filter((g: any) => g.is_active)?.length || 0,
        completedGoals: (goals.data || []).filter((g: any) => !g.is_active && g.current_amount >= g.target_amount)?.length || 0,
        estimatedMonthlySavings: monthlyIncome - monthlyExpenses,
        topSpendingCategories: getTopCategories(transactions.data || []),
      };
    }

    case 'budget-optimization':
    case 'spending-insights': {
      const [budgets, transactions] = await Promise.all([
        supabase.from('user_budgets').select('*').eq('user_id', userId).eq('is_active', true),
        supabase.from('transactions').select('*').eq('user_id', userId)
          .gte('transaction_date', getDateNMonthsAgo(1)),
      ]);

      return {
        ...baseContext,
        budgets: (budgets.data || []).map((b: any) => ({
          category: b.category,
          limit: b.amount,
          spent: calculateSpentInCategory(transactions.data || [], b.category),
        })),
        totalBudgeted: (budgets.data || []).reduce((sum: number, b: any) => sum + (b.amount || 0), 0),
        totalSpent: (transactions.data || [])
          .filter((t: any) => t.amount < 0)
          .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0),
      };
    }

    case 'financial-health': {
      const [profile, debts, goals, creditScore] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('debts').select('*').eq('user_id', userId).eq('is_active', true),
        supabase.from('goals').select('*').eq('user_id', userId).eq('is_active', true),
        supabase.from('credit_scores').select('*').eq('user_id', userId)
          .order('created_at', { ascending: false }).limit(1),
      ]);

      return {
        ...baseContext,
        hasProfile: !!profile.data,
        totalDebt: (debts.data || []).reduce((sum: number, d: any) => sum + (d.current_balance || 0), 0),
        debtCount: debts.data?.length || 0,
        activeGoals: goals.data?.length || 0,
        creditScore: creditScore.data?.[0]?.score || null,
      };
    }

    default:
      return baseContext;
  }
}

// Helper functions
function calculateGoalsProgress(goals: Array<{ current_amount: number; target_amount: number }>): number {
  if (goals.length === 0) return 0;
  const totalProgress = goals.reduce((sum, g) => {
    const progress = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
    return sum + Math.min(progress, 100);
  }, 0);
  return Math.round(totalProgress / goals.length);
}

function categorizeTransactions(transactions: Array<{ category?: string; amount: number }>): Record<string, number> {
  return transactions.reduce((acc, t) => {
    const category = t.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + Math.abs(t.amount);
    return acc;
  }, {} as Record<string, number>);
}

function getDateNMonthsAgo(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString().split('T')[0];
}

function calculateMonthlyIncome(transactions: Array<{ amount: number }>): number {
  return transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0) / 3;
}

function calculateMonthlyExpenses(transactions: Array<{ amount: number }>): number {
  return Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)) / 3;
}

function getTopCategories(transactions: Array<{ category?: string; amount: number }>): string[] {
  const categorized = categorizeTransactions(transactions);
  return Object.entries(categorized)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category]) => category);
}

function calculateSpentInCategory(transactions: Array<{ category?: string; amount: number }>, category: string): number {
  return Math.abs(
    transactions
      .filter(t => t.category === category && t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );
}
