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

    console.log('Syncing digital twin for user:', user.id);

    // Fetch comprehensive user data
    const [
      { data: transactions },
      { data: goals },
      { data: budgets },
      { data: patterns },
      { data: automations }
    ] = await Promise.all([
      supabaseClient.from('transactions').select('*').eq('user_id', user.id).limit(200),
      supabaseClient.from('goals').select('*').eq('user_id', user.id),
      supabaseClient.from('user_budgets').select('*').eq('user_id', user.id),
      supabaseClient.from('user_behavior_patterns').select('*').eq('user_id', user.id),
      supabaseClient.from('automation_rules').select('*').eq('user_id', user.id)
    ]);

    // Calculate personality profile
    const personalityProfile = calculatePersonalityProfile(
      transactions || [],
      goals || [],
      budgets || [],
      patterns || [],
      automations || []
    );

    // Calculate risk tolerance
    const riskTolerance = calculateRiskTolerance(transactions || [], goals || []);

    // Calculate savings propensity
    const savingsPropensity = calculateSavingsPropensity(transactions || [], goals || []);

    // Calculate impulse factor
    const impulseFactor = calculateImpulseFactor(transactions || []);

    // Calculate goals alignment
    const goalsAlignment = calculateGoalsAlignment(goals || [], transactions || []);

    // Calculate calibration accuracy
    const calibrationAccuracy = calculateCalibrationAccuracy(patterns || []);

    // Upsert digital twin state
    const { data: twinState, error } = await supabaseClient
      .from('digital_twin_state')
      .upsert({
        user_id: user.id,
        personality_profile: personalityProfile,
        risk_tolerance: riskTolerance,
        savings_propensity: savingsPropensity,
        impulse_factor: impulseFactor,
        financial_goals_alignment: goalsAlignment,
        calibration_accuracy: calibrationAccuracy,
        last_calibrated_at: new Date().toISOString(),
        twin_version: 1
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      twinState,
      summary: {
        riskTolerance: Math.round(riskTolerance * 100),
        savingsPropensity: Math.round(savingsPropensity * 100),
        impulseFactor: Math.round(impulseFactor * 100),
        goalsAlignment: Math.round(goalsAlignment * 100),
        calibrationAccuracy: Math.round(calibrationAccuracy * 100)
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function calculatePersonalityProfile(
  transactions: any[],
  goals: any[],
  budgets: any[],
  patterns: any[],
  automations: any[]
): any {
  return {
    spendingStyle: analyzeSpendingStyle(transactions),
    goalOrientation: goals.length > 0 ? 'goal-driven' : 'flexible',
    planningHorizon: budgets.length > 0 ? 'structured' : 'spontaneous',
    automationPreference: automations.length > 0 ? 'automated' : 'manual',
    dataPoints: transactions.length,
    lastUpdated: new Date().toISOString()
  };
}

function analyzeSpendingStyle(transactions: any[]): string {
  if (transactions.length < 10) return 'insufficient_data';

  const amounts = transactions.map(t => Math.abs(t.amount));
  const avgTransaction = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - avgTransaction, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);

  const coefficientOfVariation = stdDev / avgTransaction;

  if (coefficientOfVariation > 1.5) return 'variable';
  if (coefficientOfVariation < 0.5) return 'consistent';
  return 'moderate';
}

function calculateRiskTolerance(transactions: any[], goals: any[]): number {
  let score = 0.5; // Start neutral

  // Higher number of goals suggests lower risk tolerance (planning-oriented)
  if (goals.length > 3) score -= 0.1;
  if (goals.length === 0) score += 0.1;

  // Large transactions suggest higher risk tolerance
  const largeTransactions = transactions.filter(t => Math.abs(t.amount) > 500);
  const largeTransactionRatio = largeTransactions.length / Math.max(1, transactions.length);
  score += largeTransactionRatio * 0.2;

  // Frequent small transactions suggest lower risk tolerance
  const smallTransactions = transactions.filter(t => Math.abs(t.amount) < 50);
  const smallTransactionRatio = smallTransactions.length / Math.max(1, transactions.length);
  score -= smallTransactionRatio * 0.1;

  return Math.max(0, Math.min(1, score));
}

function calculateSavingsPropensity(transactions: any[], goals: any[]): number {
  let score = 0.5;

  // Goals indicate savings mindset
  if (goals.length > 0) score += 0.2;
  if (goals.length > 3) score += 0.1;

  // Calculate savings rate from transactions
  const income = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const expenses = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);

  if (income > 0) {
    const savingsRate = (income - expenses) / income;
    score += savingsRate * 0.3;
  }

  return Math.max(0, Math.min(1, score));
}

function calculateImpulseFactor(transactions: any[]): number {
  let score = 0.5;

  // Look for rapid succession of transactions (impulse buying)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
  );

  let rapidTransactions = 0;
  for (let i = 1; i < sortedTransactions.length; i++) {
    const timeDiff = new Date(sortedTransactions[i-1].transaction_date).getTime() - 
                     new Date(sortedTransactions[i].transaction_date).getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff < 2 && sortedTransactions[i].amount > 0) {
      rapidTransactions++;
    }
  }

  const rapidRatio = rapidTransactions / Math.max(1, transactions.length);
  score += rapidRatio * 0.4;

  // Large unexpected purchases
  const amounts = transactions.map(t => Math.abs(t.amount));
  const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const outliers = amounts.filter(a => a > avgAmount * 3);
  const outlierRatio = outliers.length / amounts.length;
  score += outlierRatio * 0.2;

  return Math.max(0, Math.min(1, score));
}

function calculateGoalsAlignment(goals: any[], transactions: any[]): number {
  if (goals.length === 0) return 0.5;

  let totalProgress = 0;
  goals.forEach(goal => {
    const progress = goal.current_amount / goal.target_amount;
    totalProgress += Math.min(1, progress);
  });

  const avgProgress = totalProgress / goals.length;
  
  // Bonus for actually contributing (goal transactions)
  const goalContributions = transactions.filter(t => 
    t.category?.toLowerCase().includes('savings') || 
    t.category?.toLowerCase().includes('goal')
  );

  const contributionBonus = Math.min(0.2, goalContributions.length / 100);

  return Math.max(0, Math.min(1, avgProgress + contributionBonus));
}

function calculateCalibrationAccuracy(patterns: any[]): number {
  if (patterns.length === 0) return 0.5;

  const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence_score, 0) / patterns.length;
  const avgSampleSize = patterns.reduce((sum, p) => sum + p.sample_size, 0) / patterns.length;

  // More patterns with higher confidence and larger sample sizes = higher accuracy
  const patternsScore = Math.min(1, patterns.length / 10) * 0.4;
  const confidenceScore = avgConfidence * 0.3;
  const sampleScore = Math.min(1, avgSampleSize / 50) * 0.3;

  return patternsScore + confidenceScore + sampleScore;
}