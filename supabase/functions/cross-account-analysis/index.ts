import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Fetch all connected accounts
    const { data: accounts } = await supabaseClient
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id);

    if (!accounts || accounts.length === 0) {
      return new Response(JSON.stringify({ 
        insights: [],
        message: 'No connected accounts found'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch transactions across all accounts
    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .limit(500);

    // Analyze cross-account patterns
    const insights: any[] = [];

    // 1. Cash Flow Between Accounts
    const flowAnalysis = analyzeAccountFlow(transactions || [], accounts);
    if (flowAnalysis.detected) {
      insights.push(flowAnalysis);
    }

    // 2. Account Utilization
    const utilizationAnalysis = analyzeAccountUtilization(accounts, transactions || []);
    insights.push(...utilizationAnalysis);

    // 3. Redundant Services
    const redundancyAnalysis = detectRedundantServices(transactions || []);
    if (redundancyAnalysis.length > 0) {
      insights.push(...redundancyAnalysis);
    }

    // 4. Optimal Card Usage
    const cardOptimization = analyzeCardUsage(transactions || []);
    if (cardOptimization) {
      insights.push(cardOptimization);
    }

    // 5. Balance Forecast
    const forecast = forecastAccountBalances(accounts, transactions || []);
    insights.push(forecast);

    // 6. Risk Assessment
    const riskAnalysis = assessAccountRisks(accounts, transactions || []);
    if (riskAnalysis.length > 0) {
      insights.push(...riskAnalysis);
    }

    return new Response(JSON.stringify({
      insights,
      summary: {
        totalAccounts: accounts.length,
        totalBalance: accounts.reduce((sum, a) => sum + (a.balance || 0), 0),
        activeAccounts: accounts.filter(a => a.balance > 0).length,
        insightCount: insights.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function analyzeAccountFlow(transactions: any[], accounts: any[]): any {
  const transfers = transactions.filter(t => 
    t.category?.toLowerCase().includes('transfer') ||
    t.merchant?.toLowerCase().includes('transfer')
  );

  if (transfers.length < 5) {
    return { detected: false };
  }

  const flowMap: { [key: string]: number } = {};
  transfers.forEach(t => {
    const key = `${t.account_id}`;
    flowMap[key] = (flowMap[key] || 0) + 1;
  });

  const mostActiveAccount = Object.entries(flowMap)
    .sort(([,a], [,b]) => b - a)[0];

  return {
    detected: true,
    type: 'cash_flow',
    title: 'Cross-Account Money Flow',
    description: `Detected ${transfers.length} transfers between your accounts`,
    insight: 'You frequently move money between accounts',
    recommendation: 'Consider automating regular transfers to save time',
    confidence: 0.85,
    impact: 'medium'
  };
}

function analyzeAccountUtilization(accounts: any[], transactions: any[]): any[] {
  const insights: any[] = [];
  
  accounts.forEach(account => {
    const accountTransactions = transactions.filter(t => t.account_id === account.id);
    const last30DaysTransactions = accountTransactions.filter(t => {
      const date = new Date(t.transaction_date);
      const now = new Date();
      const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    });

    // Low utilization accounts
    if (last30DaysTransactions.length < 3 && account.balance > 100) {
      insights.push({
        type: 'low_utilization',
        title: `Underused Account: ${account.name}`,
        description: `Only ${last30DaysTransactions.length} transactions in the last 30 days`,
        insight: `$${account.balance.toFixed(2)} sitting idle`,
        recommendation: 'Consider moving funds to a high-yield savings account',
        confidence: 0.9,
        impact: 'medium',
        accountId: account.id
      });
    }

    // High balance, low activity (opportunity)
    if (account.balance > 1000 && last30DaysTransactions.length < 5) {
      insights.push({
        type: 'optimization_opportunity',
        title: 'High Balance Opportunity',
        description: `$${account.balance.toFixed(2)} with minimal activity`,
        insight: 'Funds could earn more interest elsewhere',
        recommendation: 'Move to high-yield savings or investment account',
        confidence: 0.85,
        impact: 'high',
        accountId: account.id
      });
    }
  });

  return insights;
}

function detectRedundantServices(transactions: any[]): any[] {
  const insights: any[] = [];
  const merchantCounts: { [key: string]: number } = {};

  transactions.forEach(t => {
    const merchant = t.merchant?.toLowerCase() || '';
    if (merchant) {
      merchantCounts[merchant] = (merchantCounts[merchant] || 0) + 1;
    }
  });

  // Look for streaming services
  const streamingServices = Object.entries(merchantCounts).filter(([merchant]) =>
    merchant.includes('netflix') || 
    merchant.includes('hulu') ||
    merchant.includes('disney') ||
    merchant.includes('prime') ||
    merchant.includes('spotify') ||
    merchant.includes('apple music')
  );

  if (streamingServices.length > 3) {
    insights.push({
      type: 'redundancy',
      title: 'Multiple Streaming Services',
      description: `You have ${streamingServices.length} active streaming subscriptions`,
      insight: 'Consider consolidating to save money',
      recommendation: 'Review which services you actually use regularly',
      confidence: 0.8,
      impact: 'medium'
    });
  }

  return insights;
}

function analyzeCardUsage(transactions: any[]): any | null {
  const cardTransactions = transactions.filter(t => 
    t.account_type === 'credit' || t.merchant
  );

  if (cardTransactions.length < 20) return null;

  const categories: { [key: string]: number } = {};
  cardTransactions.forEach(t => {
    const category = t.category || 'other';
    categories[category] = (categories[category] || 0) + Math.abs(t.amount);
  });

  const topCategory = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)[0];

  return {
    type: 'card_optimization',
    title: 'Optimize Card Usage',
    description: `Your top spending category is ${topCategory[0]}`,
    insight: `$${topCategory[1].toFixed(2)} spent on ${topCategory[0]}`,
    recommendation: 'Use a card with rewards in this category',
    confidence: 0.75,
    impact: 'medium'
  };
}

function forecastAccountBalances(accounts: any[], transactions: any[]): any {
  const last30Days = transactions.filter(t => {
    const date = new Date(t.transaction_date);
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  });

  const avgDailyChange = last30Days.reduce((sum, t) => sum + t.amount, 0) / 30;
  const currentTotalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  
  const forecast30Days = currentTotalBalance + (avgDailyChange * 30);
  const forecast60Days = currentTotalBalance + (avgDailyChange * 60);

  return {
    type: 'forecast',
    title: 'Balance Forecast',
    description: 'Projected account balances based on current trends',
    insight: `Current trend: ${avgDailyChange > 0 ? '+' : ''}$${avgDailyChange.toFixed(2)}/day`,
    recommendation: forecast30Days < currentTotalBalance * 0.8 
      ? 'Spending is exceeding income - review budget'
      : 'On track with current savings pattern',
    confidence: 0.7,
    impact: 'high',
    data: {
      current: currentTotalBalance,
      forecast30Days: Math.round(forecast30Days * 100) / 100,
      forecast60Days: Math.round(forecast60Days * 100) / 100
    }
  };
}

function assessAccountRisks(accounts: any[], transactions: any[]): any[] {
  const insights: any[] = [];

  // Low balance risk
  const lowBalanceAccounts = accounts.filter(a => a.balance < 100 && a.balance > 0);
  if (lowBalanceAccounts.length > 0) {
    insights.push({
      type: 'risk',
      title: 'Low Balance Alert',
      description: `${lowBalanceAccounts.length} account(s) have low balances`,
      insight: 'Risk of overdraft or insufficient funds',
      recommendation: 'Transfer funds or set up low balance alerts',
      confidence: 0.95,
      impact: 'high'
    });
  }

  // No emergency buffer
  const totalLiquid = accounts
    .filter(a => a.account_type === 'checking' || a.account_type === 'savings')
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  const avgMonthlyExpenses = Math.abs(
    transactions
      .filter(t => t.amount > 0)
      .slice(0, 30)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  if (totalLiquid < avgMonthlyExpenses * 3) {
    insights.push({
      type: 'risk',
      title: 'Limited Emergency Fund',
      description: 'Your liquid savings covers less than 3 months of expenses',
      insight: `Current: ${(totalLiquid / avgMonthlyExpenses).toFixed(1)} months`,
      recommendation: 'Build emergency fund to 3-6 months of expenses',
      confidence: 0.9,
      impact: 'critical'
    });
  }

  return insights;
}