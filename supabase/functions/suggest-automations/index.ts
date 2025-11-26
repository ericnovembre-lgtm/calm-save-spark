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

    // Fetch user's transaction history
    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .limit(100);

    // Fetch existing automation rules
    const { data: existingRules } = await supabaseClient
      .from('automation_rules')
      .select('*')
      .eq('user_id', user.id);

    // Fetch behavioral patterns
    const { data: patterns } = await supabaseClient
      .from('user_behavior_patterns')
      .select('*')
      .eq('user_id', user.id)
      .gte('confidence_score', 0.6);

    const suggestions: any[] = [];

    // Analyze patterns and suggest automations
    if (transactions && transactions.length > 0) {
      // Pattern 1: Recurring payday savings
      const paydayPattern = analyzePaydayPattern(transactions);
      if (paydayPattern.detected && !hasRule(existingRules, 'payday_save')) {
        suggestions.push({
          id: 'payday_save',
          title: 'Payday Auto-Save',
          description: `Save ${paydayPattern.suggestedAmount.toFixed(2)} automatically when your paycheck arrives`,
          confidence: paydayPattern.confidence,
          impact: 'high',
          category: 'savings',
          automationConfig: {
            rule_type: 'income_percentage',
            trigger_condition: { income_detected: true },
            action_config: { percentage: 10, destination: 'savings' }
          }
        });
      }

      // Pattern 2: Round-up savings
      const smallTransactions = transactions.filter(t => t.amount > 0 && t.amount < 50);
      if (smallTransactions.length > 20 && !hasRule(existingRules, 'round_up')) {
        suggestions.push({
          id: 'round_up',
          title: 'Round-Up Savings',
          description: 'Round up every purchase and save the difference',
          confidence: 0.85,
          impact: 'medium',
          category: 'micro-savings',
          automationConfig: {
            rule_type: 'round_up',
            trigger_condition: { on_transaction: true },
            action_config: { round_to: 'dollar', destination: 'savings' }
          }
        });
      }

      // Pattern 3: Weekly savings transfer
      const weeklyPattern = analyzeWeeklyPattern(transactions);
      if (weeklyPattern.detected && !hasRule(existingRules, 'weekly_save')) {
        suggestions.push({
          id: 'weekly_save',
          title: 'Weekly Savings Boost',
          description: `Transfer $${weeklyPattern.suggestedAmount.toFixed(2)} every ${weeklyPattern.dayOfWeek}`,
          confidence: weeklyPattern.confidence,
          impact: 'medium',
          category: 'savings',
          automationConfig: {
            rule_type: 'scheduled',
            frequency: 'weekly',
            action_config: { amount: weeklyPattern.suggestedAmount, day_of_week: weeklyPattern.dayIndex }
          }
        });
      }

      // Pattern 4: Subscription optimizer
      const subscriptionPattern = analyzeSubscriptions(transactions);
      if (subscriptionPattern.detected && !hasRule(existingRules, 'subscription_alert')) {
        suggestions.push({
          id: 'subscription_alert',
          title: 'Subscription Tracker',
          description: `Monitor ${subscriptionPattern.count} recurring subscriptions totaling $${subscriptionPattern.totalMonthly.toFixed(2)}/month`,
          confidence: 0.9,
          impact: 'high',
          category: 'optimization',
          automationConfig: {
            rule_type: 'subscription_monitor',
            trigger_condition: { subscription_detected: true },
            action_config: { alert_on_charge: true }
          }
        });
      }

      // Pattern 5: Low balance protection
      if (!hasRule(existingRules, 'low_balance_alert')) {
        suggestions.push({
          id: 'low_balance_alert',
          title: 'Low Balance Protection',
          description: 'Get notified when your balance drops below a threshold',
          confidence: 0.95,
          impact: 'high',
          category: 'protection',
          automationConfig: {
            rule_type: 'balance_threshold',
            trigger_condition: { balance_below: 100 },
            action_config: { alert: true, auto_transfer: false }
          }
        });
      }
    }

    // Sort by impact and confidence
    suggestions.sort((a: any, b: any) => {
      const impactScore: Record<string, number> = { high: 3, medium: 2, low: 1 };
      return (impactScore[b.impact] * b.confidence) - (impactScore[a.impact] * a.confidence);
    });

    return new Response(JSON.stringify({ suggestions: suggestions.slice(0, 5) }), {
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

function hasRule(rules: any[] | null, ruleType: string): boolean {
  return rules?.some(r => r.metadata?.suggestion_id === ruleType) || false;
}

function analyzePaydayPattern(transactions: any[]): any {
  const incomeTransactions = transactions.filter(t => t.amount < 0 && Math.abs(t.amount) > 500);
  
  if (incomeTransactions.length >= 2) {
    const amounts = incomeTransactions.map(t => Math.abs(t.amount));
    const avgIncome = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    
    return {
      detected: true,
      confidence: 0.8,
      suggestedAmount: avgIncome * 0.1
    };
  }
  
  return { detected: false, confidence: 0, suggestedAmount: 0 };
}

function analyzeWeeklyPattern(transactions: any[]): any {
  const dayOfWeekCounts: { [key: number]: number } = {};
  
  transactions.forEach(t => {
    const day = new Date(t.transaction_date).getDay();
    dayOfWeekCounts[day] = (dayOfWeekCounts[day] || 0) + 1;
  });
  
  const mostCommonDay = Object.entries(dayOfWeekCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (mostCommonDay && mostCommonDay[1] > 10) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      detected: true,
      confidence: 0.7,
      dayIndex: parseInt(mostCommonDay[0]),
      dayOfWeek: dayNames[parseInt(mostCommonDay[0])],
      suggestedAmount: 25
    };
  }
  
  return { detected: false, confidence: 0, suggestedAmount: 0, dayOfWeek: '' };
}

function analyzeSubscriptions(transactions: any[]): any {
  const potentialSubs = transactions.filter(t => {
    const merchant = t.merchant?.toLowerCase() || '';
    return merchant.includes('subscription') || 
           merchant.includes('monthly') ||
           merchant.includes('netflix') ||
           merchant.includes('spotify') ||
           merchant.includes('hulu');
  });
  
  if (potentialSubs.length >= 3) {
    const monthlyTotal = potentialSubs
      .slice(0, 5)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return {
      detected: true,
      count: potentialSubs.length,
      totalMonthly: monthlyTotal,
      confidence: 0.85
    };
  }
  
  return { detected: false, count: 0, totalMonthly: 0 };
}