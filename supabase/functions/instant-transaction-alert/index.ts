import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface TransactionAlert {
  isAnomaly: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  alertType: string | null;
  message: string;
  category?: string;
  latencyMs: number;
}

async function analyzeWithGroq(
  transaction: {
    merchant: string;
    amount: number;
    category?: string;
    timestamp: string;
  },
  userContext: {
    averageSpend: number;
    monthlyBudget: number;
    usualCategories: string[];
    recentTransactionCount: number;
  }
): Promise<TransactionAlert> {
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
  
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const startTime = Date.now();
  
  const systemPrompt = `You are a real-time transaction monitor. Analyze transactions for anomalies and generate instant alerts. Respond with ONLY valid JSON.

Detect:
- Unusual amounts (much higher than user average)
- Suspicious merchants (unusual patterns)
- Budget warnings (approaching limits)
- Duplicate charges (same merchant/amount recently)
- Time anomalies (unusual purchase time)`;

  const userPrompt = `Analyze this transaction:
Merchant: ${transaction.merchant}
Amount: $${transaction.amount}
Category: ${transaction.category || 'Unknown'}
Time: ${transaction.timestamp}

User Profile:
- Average spend: $${userContext.averageSpend}
- Monthly budget: $${userContext.monthlyBudget}
- Usual categories: ${userContext.usualCategories.join(', ')}
- Recent transactions: ${userContext.recentTransactionCount}

Return ONLY: {"isAnomaly":false,"riskLevel":"low","alertType":null,"message":"Normal transaction","category":"suggested_category"}
Or if anomaly: {"isAnomaly":true,"riskLevel":"high","alertType":"unusual_amount","message":"⚠️ Alert: This $${transaction.amount} charge is 3x your average spend","category":"suggested_category"}`;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 300,
      temperature: 0.1
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Groq] API Error:', error);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const latencyMs = Date.now() - startTime;
  const content = data.choices[0].message.content;
  
  console.log(`[Groq] Transaction analysis in ${latencyMs}ms`);
  
  try {
    const parsed = JSON.parse(content);
    return { ...parsed, latencyMs };
  } catch {
    const jsonMatch = content.match(/\{[^}]+\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { ...parsed, latencyMs };
    }
    return {
      isAnomaly: false,
      riskLevel: 'low',
      alertType: null,
      message: 'Transaction processed',
      latencyMs
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transaction, userId } = await req.json();
    
    if (!transaction || !userId) {
      throw new Error('Missing transaction or userId');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    // Get user context for analysis
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get recent transactions for context
    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select('amount, category, merchant')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo.toISOString())
      .order('date', { ascending: false })
      .limit(100);

    // Calculate user context
    const amounts = recentTransactions?.map(t => Math.abs(t.amount)) || [];
    const averageSpend = amounts.length > 0 
      ? amounts.reduce((a, b) => a + b, 0) / amounts.length 
      : 50;
    
    const usualCategories = [...new Set(recentTransactions?.map(t => t.category).filter(Boolean) || [])];
    
    // Get monthly budget
    const { data: budgets } = await supabase
      .from('user_budgets')
      .select('amount')
      .eq('user_id', userId)
      .eq('is_active', true);
    
    const monthlyBudget = budgets?.reduce((sum, b) => sum + (b.amount || 0), 0) || 2000;

    const userContext = {
      averageSpend: Math.round(averageSpend * 100) / 100,
      monthlyBudget,
      usualCategories: usualCategories.slice(0, 5),
      recentTransactionCount: recentTransactions?.length || 0
    };

    // Analyze with Groq
    const alert = await analyzeWithGroq(transaction, userContext);

    // Log to analytics
    await supabase.from('ai_model_routing_analytics').insert({
      user_id: userId,
      query_type: 'speed_critical',
      model_used: 'groq-instant',
      response_time_ms: alert.latencyMs,
      confidence_score: alert.isAnomaly ? 0.95 : 0.8,
      query_length: JSON.stringify(transaction).length
    });

    // If anomaly detected, create a notification
    if (alert.isAnomaly) {
      await supabase.from('notifications').insert({
        user_id: userId,
        title: `Transaction Alert: ${transaction.merchant}`,
        body: alert.message,
        type: 'transaction_alert',
        priority: alert.riskLevel === 'high' ? 'high' : 'medium',
        metadata: {
          transactionAmount: transaction.amount,
          merchant: transaction.merchant,
          alertType: alert.alertType,
          riskLevel: alert.riskLevel
        }
      });
    }

    return new Response(
      JSON.stringify({
        ...alert,
        userContext: {
          averageSpend: userContext.averageSpend,
          monthlyBudget: userContext.monthlyBudget
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in instant-transaction-alert:', error);
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
