interface InsightDetection {
  insight_type: string;
  severity: 'info' | 'warning' | 'urgent';
  title: string;
  message: string;
  resolution_action?: string;
  resolution_data?: Record<string, any>;
  related_entity_id?: string;
  related_entity_type?: string;
}

interface HandlerParams {
  supabase: any;
  userId: string;
}

export async function observerAgentHandler(params: HandlerParams): Promise<InsightDetection[]> {
  const { supabase, userId } = params;
  const insights: InsightDetection[] = [];

  // 1. Check for subscription price hikes
  const { data: subscriptions } = await supabase
    .from('detected_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('confirmed', true);

  for (const sub of subscriptions || []) {
    // Compare current amount to last charge if available
    const currentAmount = parseFloat(sub.amount);
    const lastChargeAmount = sub.last_charge_amount ? parseFloat(sub.last_charge_amount) : currentAmount;
    
    if (lastChargeAmount > currentAmount * 1.1) { // 10% increase
      insights.push({
        insight_type: 'subscription_price_hike',
        severity: 'urgent',
        title: `${sub.merchant} Price Increase Detected`,
        message: `Your ${sub.merchant} subscription increased from $${currentAmount.toFixed(2)} to $${lastChargeAmount.toFixed(2)}. This adds $${((lastChargeAmount - currentAmount) * 12).toFixed(2)}/year.`,
        resolution_action: 'cancel_subscription',
        resolution_data: { id: sub.id, merchant: sub.merchant },
        related_entity_id: sub.id,
        related_entity_type: 'subscription'
      });
    }
  }

  // 2. Detect spending spikes (30% above 30-day average)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('transaction_date', thirtyDaysAgo)
    .order('transaction_date', { ascending: false });

  if (recentTransactions && recentTransactions.length > 10) {
    const amounts = recentTransactions
      .filter((t: any) => parseFloat(t.amount) < 0)
      .map((t: any) => Math.abs(parseFloat(t.amount)));
    
    if (amounts.length > 0) {
      const avg = amounts.reduce((a: number, b: number) => a + b, 0) / amounts.length;
      const last7Days = amounts.slice(0, Math.min(7, amounts.length));
      const recentAvg = last7Days.reduce((a: number, b: number) => a + b, 0) / last7Days.length;

      if (recentAvg > avg * 1.3) { // 30% spike
        insights.push({
          insight_type: 'spending_spike',
          severity: 'warning',
          title: 'Unusual Spending Spike Detected',
          message: `Your spending increased by ${Math.round(((recentAvg - avg) / avg) * 100)}% this week ($${recentAvg.toFixed(2)}/day vs $${avg.toFixed(2)}/day average). Consider reviewing recent transactions.`,
          resolution_action: 'review_transactions',
          resolution_data: { category: 'all', period: '7_days' }
        });
      }
    }
  }

  // 3. Check budget overruns
  const { data: budgets } = await supabase
    .from('user_budgets')
    .select(`
      *,
      budget_spending!inner(spent_amount)
    `)
    .eq('user_id', userId);

  for (const budget of budgets || []) {
    const spent = budget.budget_spending?.[0]?.spent_amount || 0;
    const limit = parseFloat(budget.amount);
    const percentage = (spent / limit) * 100;

    if (percentage > 90 && percentage < 100) {
      insights.push({
        insight_type: 'budget_overrun',
        severity: 'warning',
        title: `${budget.category} Budget Alert`,
        message: `You've used ${Math.round(percentage)}% of your ${budget.category} budget ($${spent.toFixed(2)}/$${limit.toFixed(2)}). Consider adjusting your budget or reducing spending.`,
        resolution_action: 'adjust_budget',
        resolution_data: { 
          budget_id: budget.id, 
          category: budget.category,
          current_limit: limit,
          suggested_limit: Math.ceil(spent * 1.2)
        },
        related_entity_id: budget.id,
        related_entity_type: 'budget'
      });
    }
  }

  // 4. Savings opportunities (recurring small charges)
  const smallCharges = recentTransactions?.filter((t: any) => {
    const amount = Math.abs(parseFloat(t.amount));
    return amount < 10 && t.merchant?.toLowerCase().includes('coffee');
  });

  if (smallCharges && smallCharges.length > 10) {
    const total = smallCharges.reduce((sum: number, t: any) => sum + Math.abs(parseFloat(t.amount)), 0);
    insights.push({
      insight_type: 'savings_opportunity',
      severity: 'info',
      title: 'Coffee Spending Opportunity',
      message: `You've spent $${total.toFixed(2)} on coffee this month (${smallCharges.length} purchases). Brewing at home could save $${(total * 0.7).toFixed(2)}/month.`,
      resolution_action: 'create_savings_goal',
      resolution_data: { 
        goal_name: 'Coffee Savings',
        monthly_amount: Math.round(total * 0.7)
      }
    });
  }

  return insights;
}
