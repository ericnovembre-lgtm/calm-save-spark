import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnomalyFactor {
  type: string;
  deviation: number;
  description: string;
}

interface DetectedAnomaly {
  anomaly_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  factors: AnomalyFactor[];
  affected_entity_type?: string;
  affected_entity_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      // Return empty anomalies for unauthenticated requests instead of 401
      // This prevents errors during initial load before auth is ready
      console.log('[multi-factor-anomaly] No authenticated user, returning empty anomalies');
      return new Response(JSON.stringify({ anomalies: [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Detect anomalies across multiple factors
    const anomalies = await detectMultiFactorAnomalies(supabase, user.id);

    // Store detected anomalies
    for (const anomaly of anomalies) {
      await supabase.from('financial_anomalies').insert({
        user_id: user.id,
        ...anomaly,
      });
    }

    return new Response(JSON.stringify({ anomalies }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Anomaly detection error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function detectMultiFactorAnomalies(
  supabase: any,
  userId: string
): Promise<DetectedAnomaly[]> {
  const anomalies: DetectedAnomaly[] = [];

  // Get recent transactions (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', thirtyDaysAgo.toISOString())
    .order('date', { ascending: false });

  if (!recentTransactions || recentTransactions.length === 0) {
    return anomalies;
  }

  // Get historical baseline (90 days before that)
  const oneHundredTwentyDaysAgo = new Date();
  oneHundredTwentyDaysAgo.setDate(oneHundredTwentyDaysAgo.getDate() - 120);

  const { data: historicalTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', oneHundredTwentyDaysAgo.toISOString())
    .lt('date', thirtyDaysAgo.toISOString());

  if (!historicalTransactions || historicalTransactions.length < 10) {
    return anomalies; // Not enough data
  }

  // Calculate baseline statistics
  const historicalAmounts = historicalTransactions.map((t: any) => Math.abs(t.amount));
  const avgAmount = historicalAmounts.reduce((a: number, b: number) => a + b, 0) / historicalAmounts.length;
  const variance =
    historicalAmounts.reduce((sum: number, val: number) => sum + Math.pow(val - avgAmount, 2), 0) /
    historicalAmounts.length;
  const stdDev = Math.sqrt(variance);

  // 1. Amount Deviation Detection
  for (const transaction of recentTransactions) {
    const amount = Math.abs(transaction.amount);
    const zScore = (amount - avgAmount) / stdDev;

    if (Math.abs(zScore) > 3) {
      // 3 sigma rule
      const factors: AnomalyFactor[] = [
        {
          type: 'amount_deviation',
          deviation: zScore,
          description: `Amount is ${zScore.toFixed(1)}σ from baseline`,
        },
      ];

      anomalies.push({
        anomaly_type: 'unusual_amount',
        severity: Math.abs(zScore) > 4 ? 'high' : 'medium',
        factors,
        affected_entity_type: 'transaction',
        affected_entity_id: transaction.id,
      });
    }
  }

  // 2. Time Pattern Detection
  const historicalHourCounts: Record<number, number> = {};
  historicalTransactions.forEach((t: any) => {
    const hour = new Date(t.created_at).getHours();
    historicalHourCounts[hour] = (historicalHourCounts[hour] || 0) + 1;
  });

  for (const transaction of recentTransactions) {
    const hour = new Date(transaction.created_at).getHours();
    const historicalCount = historicalHourCounts[hour] || 0;
    const totalHistorical = Object.values(historicalHourCounts).reduce((a, b) => a + b, 0);
    const expectedFreq = historicalCount / totalHistorical;

    if (expectedFreq < 0.02 && historicalCount > 5) {
      // Rare time
      const factors: AnomalyFactor[] = [
        {
          type: 'time_deviation',
          deviation: 1 - expectedFreq,
          description: `Transaction at unusual time (${hour}:00)`,
        },
      ];

      anomalies.push({
        anomaly_type: 'unusual_time',
        severity: 'low',
        factors,
        affected_entity_type: 'transaction',
        affected_entity_id: transaction.id,
      });
    }
  }

  // 3. Merchant Frequency Detection
  const merchantCounts: Record<string, number> = {};
  historicalTransactions.forEach((t: any) => {
    if (t.merchant_name) {
      merchantCounts[t.merchant_name] = (merchantCounts[t.merchant_name] || 0) + 1;
    }
  });

  for (const transaction of recentTransactions) {
    if (transaction.merchant_name && !merchantCounts[transaction.merchant_name]) {
      const factors: AnomalyFactor[] = [
        {
          type: 'merchant_deviation',
          deviation: 1,
          description: `New merchant: ${transaction.merchant_name}`,
        },
      ];

      anomalies.push({
        anomaly_type: 'new_merchant',
        severity: 'low',
        factors,
        affected_entity_type: 'transaction',
        affected_entity_id: transaction.id,
      });
    }
  }

  // 4. Category Shift Detection
  const categoryCounts: Record<string, number> = {};
  historicalTransactions.forEach((t: any) => {
    if (t.category) {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    }
  });

  const recentCategoryCounts: Record<string, number> = {};
  recentTransactions.forEach((t: any) => {
    if (t.category) {
      recentCategoryCounts[t.category] = (recentCategoryCounts[t.category] || 0) + 1;
    }
  });

  for (const [category, recentCount] of Object.entries(recentCategoryCounts)) {
    const historicalCount = categoryCounts[category] || 0;
    const historicalTotal = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
    const recentTotal = Object.values(recentCategoryCounts).reduce((a, b) => a + b, 0);

    const historicalFreq = historicalCount / historicalTotal;
    const recentFreq = recentCount / recentTotal;
    const freqChange = recentFreq - historicalFreq;

    if (Math.abs(freqChange) > 0.2 && recentCount > 3) {
      // 20% shift
      const factors: AnomalyFactor[] = [
        {
          type: 'category_shift',
          deviation: freqChange,
          description: `${category} spending ${freqChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(freqChange * 100).toFixed(0)}%`,
        },
      ];

      anomalies.push({
        anomaly_type: 'category_shift',
        severity: Math.abs(freqChange) > 0.4 ? 'high' : 'medium',
        factors,
      });
    }
  }

  return anomalies;
}