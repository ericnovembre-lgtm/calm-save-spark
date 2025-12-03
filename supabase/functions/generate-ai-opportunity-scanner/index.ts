import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIOpportunity {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: 'success' | 'warning' | 'destructive' | 'default';
  savings?: number;
  urgency: 'high' | 'medium' | 'low';
  action: {
    type: 'navigate' | 'transfer' | 'external';
    to?: string;
    params?: Record<string, any>;
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

    // Fetch comprehensive financial snapshot
    const [
      { data: accounts },
      { data: goals },
      { data: budgets },
      { data: bills },
      { data: pots },
      { data: investments },
      { data: recentTransactions },
      { data: debts }
    ] = await Promise.all([
      supabase.from('connected_accounts').select('*').eq('user_id', user.id),
      supabase.from('goals').select('*').eq('user_id', user.id).eq('is_active', true),
      supabase.from('user_budgets').select('*, budget_spending(*)').eq('user_id', user.id).eq('is_active', true),
      supabase.from('detected_subscriptions').select('*').eq('user_id', user.id)
        .neq('status', 'paused')
        .gte('next_expected_date', new Date().toISOString())
        .lte('next_expected_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('next_expected_date', { ascending: true }),
      supabase.from('pots').select('*').eq('user_id', user.id).eq('is_active', true),
      supabase.from('investment_accounts').select('*').eq('user_id', user.id),
      supabase.from('transactions').select('*').eq('user_id', user.id)
        .order('transaction_date', { ascending: false }).limit(100),
      supabase.from('debts').select('*').eq('user_id', user.id).eq('is_active', true)
    ]);

    // Calculate key metrics
    const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;
    const totalDebt = debts?.reduce((sum, d) => sum + Number(d.current_balance || 0), 0) || 0;
    const netWorth = totalBalance - totalDebt;

    const weeklySpending = recentTransactions
      ?.filter(t => {
        const daysSince = (Date.now() - new Date(t.transaction_date).getTime()) / (1000 * 60 * 60 * 24);
        return t.transaction_type === 'debit' && daysSince <= 7;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const monthlySpending = recentTransactions
      ?.filter(t => {
        const daysSince = (Date.now() - new Date(t.transaction_date).getTime()) / (1000 * 60 * 60 * 24);
        return t.transaction_type === 'debit' && daysSince <= 30;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const avgMonthlySpending = monthlySpending || 1000;
    const emergencyFundTarget = avgMonthlySpending * 3;

    // Near-complete goals
    const nearCompleteGoals = goals?.filter(g => {
      const progress = (Number(g.current_amount) / Number(g.target_amount)) * 100;
      return progress >= 85 && progress < 100;
    }).sort((a, b) => {
      const progressA = (Number(a.current_amount) / Number(a.target_amount)) * 100;
      const progressB = (Number(b.current_amount) / Number(b.target_amount)) * 100;
      return progressB - progressA;
    }) || [];

    // Overspent budgets
    const overspentBudgets = budgets?.filter(b => {
      const spent = b.budget_spending?.reduce((sum: number, s: any) => sum + Number(s.spent_amount || 0), 0) || 0;
      const utilization = (spent / Number(b.total_limit)) * 100;
      return utilization > 90;
    }) || [];

    // Urgent bills
    const urgentBills = bills?.filter(bill => {
      const daysUntilDue = (new Date(bill.next_expected_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntilDue <= 2;
    }) || [];

    // Investment opportunities
    const totalInvestmentValue = investments?.reduce((sum, inv) => sum + Number(inv.total_value || 0), 0) || 0;
    const investmentAllocation = totalBalance > 0 ? (totalInvestmentValue / totalBalance) * 100 : 0;

    // Excess cash (balance exceeding 1 month expenses + emergency fund)
    const essentialCash = avgMonthlySpending + emergencyFundTarget;
    const excessCash = Math.max(0, totalBalance - essentialCash);

    // Use Lovable AI for intelligent opportunity detection
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are $ave+'s AI Financial Opportunity Scanner. Analyze the user's complete financial snapshot and identify 3-4 HIGH-IMPACT, CONTEXT-AWARE actions they should take NOW.

**CRITICAL RULES:**
1. Prioritize actions that save/earn the MOST money (e.g., moving $500 to high-yield > setting up $10 auto-save)
2. Detect opportunities humans miss (e.g., excess cash sitting idle, near-complete goals just $50 away)
3. Flag urgent financial risks (bills due soon, budgets 95% spent, overdraft risk)
4. Suggest investment rebalancing if portfolio is under/over-allocated
5. ALWAYS include specific dollar amounts in labels (e.g., "Invest excess $400" not "Invest extra cash")
6. Each action MUST have a clear "why" in the description
7. Assign urgency: HIGH (immediate financial risk/opportunity), MEDIUM (within 7 days), LOW (nice-to-have)

**OUTPUT FORMAT (JSON):**
Return ONLY valid JSON matching this structure (no markdown, no code blocks):
{
  "actions": [
    {
      "id": "unique-action-id-in-kebab-case",
      "label": "Short action label with $ amount (max 40 chars)",
      "description": "Why this matters - 1 specific sentence with numbers",
      "icon": "lucide-icon-name",
      "color": "success|warning|destructive|default",
      "savings": 400,
      "urgency": "high|medium|low",
      "action": {
        "type": "navigate|transfer|external",
        "to": "/path-or-url",
        "params": {}
      }
    }
  ]
}

**VALID ICON NAMES:** trending-up, trending-down, shield, target, alert-circle, zap, piggy-bank, credit-card, dollar-sign, arrow-right, plus-circle

**Example Output:**
{
  "actions": [
    {
      "id": "invest-excess-cash",
      "label": "Invest excess $850 (4.5% APY)",
      "description": "You have $1,850 but only need $1,000 for bills—move $850 to high-yield savings to earn $38/year.",
      "icon": "trending-up",
      "color": "success",
      "savings": 850,
      "urgency": "medium",
      "action": {"type": "navigate", "to": "/savings", "params": {}}
    }
  ]
}`;

    const userPrompt = `Analyze this financial snapshot and generate 3-4 HIGH-IMPACT opportunity actions:

**NET WORTH:**
- Total balance: $${totalBalance.toFixed(2)}
- Total debt: $${totalDebt.toFixed(2)}
- Net worth: $${netWorth.toFixed(2)}

**CASH FLOW:**
- Weekly spending: $${weeklySpending.toFixed(2)}
- Monthly spending: $${monthlySpending.toFixed(2)}
- Emergency fund target (3mo): $${emergencyFundTarget.toFixed(2)}
- Excess cash (beyond emergency + 1mo): $${excessCash.toFixed(2)}

**GOALS:**
- Near-complete goals (>85%): ${nearCompleteGoals.length}
${nearCompleteGoals.slice(0, 2).map(g => {
  const progress = (Number(g.current_amount) / Number(g.target_amount)) * 100;
  const remaining = Number(g.target_amount) - Number(g.current_amount);
  return `  - "${g.name}": ${progress.toFixed(0)}% complete, $${remaining.toFixed(0)} remaining`;
}).join('\n')}

**BUDGETS:**
- Overspent budgets (>90%): ${overspentBudgets.length}
${overspentBudgets.map(b => {
  const spent = b.budget_spending?.reduce((sum: number, s: any) => sum + Number(s.spent_amount || 0), 0) || 0;
  const utilization = (spent / Number(b.total_limit)) * 100;
  return `  - "${b.name}": ${utilization.toFixed(0)}% spent ($${spent.toFixed(0)}/$${b.total_limit})`;
}).join('\n')}

**BILLS:**
- Urgent bills (due ≤48h): ${urgentBills.length}
${urgentBills.map(bill => {
  const daysUntilDue = Math.ceil((new Date(bill.next_expected_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return `  - "${bill.merchant}": $${bill.average_charge} due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`;
}).join('\n')}

**INVESTMENTS:**
- Total investment value: $${totalInvestmentValue.toFixed(2)}
- Investment allocation: ${investmentAllocation.toFixed(0)}% of total balance
- Recommendation: ${investmentAllocation < 20 ? 'UNDERINVESTED (consider allocating more)' : investmentAllocation > 80 ? 'OVERINVESTED (consider rebalancing)' : 'HEALTHY'}

**DEBT:**
- Total debt: $${totalDebt.toFixed(2)}
- Debt-to-income ratio: ${totalDebt > 0 && monthlySpending > 0 ? ((totalDebt / (monthlySpending * 12)) * 100).toFixed(0) : 0}%

Generate 3-4 actions NOW (return ONLY valid JSON):`;

    console.log('Calling AI for opportunity detection...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.7
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices[0].message.content;
    
    console.log('AI Response:', responseText);
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('AI returned invalid JSON');
    }

    const actions: AIOpportunity[] = parsedResponse.actions || [];

    // Validate and sanitize actions
    const validActions = actions
      .filter(action => 
        action.id && 
        action.label && 
        action.description && 
        action.urgency &&
        ['high', 'medium', 'low'].includes(action.urgency)
      )
      .slice(0, 4);

    return new Response(
      JSON.stringify({
        actions: validActions,
        metadata: {
          totalBalance,
          netWorth,
          excessCash,
          urgentBillsCount: urgentBills.length,
          nearCompleteGoalsCount: nearCompleteGoals.length,
          generatedAt: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-ai-opportunity-scanner:', error);
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
