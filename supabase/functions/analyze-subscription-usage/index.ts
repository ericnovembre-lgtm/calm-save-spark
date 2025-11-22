import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting subscription usage analysis...');

    // Get all active subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('detected_subscriptions')
      .select('*')
      .eq('status', 'active');

    if (subsError) throw subsError;

    let updatedCount = 0;
    let zombiesDetected = 0;

    for (const subscription of subscriptions || []) {
      // Look for non-subscription transactions at same merchant in last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: usageTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', subscription.user_id)
        .ilike('merchant', `%${subscription.merchant}%`)
        .neq('category', 'Subscriptions')
        .gte('transaction_date', ninetyDaysAgo.toISOString())
        .order('transaction_date', { ascending: false });

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentUsage = usageTransactions?.filter(t => 
        new Date(t.transaction_date) >= thirtyDaysAgo
      ).length || 0;

      const lastUsageDate = usageTransactions?.[0]?.transaction_date || null;
      const daysSinceLastUsage = lastUsageDate
        ? Math.floor((Date.now() - new Date(lastUsageDate).getTime()) / (1000 * 60 * 60 * 24))
        : 90;

      // Calculate zombie score
      const zombieScore = calculateZombieScore({
        daysSinceLastUsage,
        usageCount: recentUsage,
        subscriptionAmount: Number(subscription.amount),
        confidence: subscription.confidence || 0.5,
      });

      // Update subscription with usage data
      const updates: any = {
        last_usage_date: lastUsageDate,
        usage_count_last_30_days: recentUsage,
        zombie_score: zombieScore,
      };

      // Flag as zombie if score > 70 and not already flagged
      if (zombieScore > 70 && !subscription.zombie_flagged_at) {
        updates.zombie_flagged_at = new Date().toISOString();
        zombiesDetected++;

        // Create nudge for user
        await supabase.from('agent_nudges').insert({
          user_id: subscription.user_id,
          agent_type: 'budget_coach',
          nudge_type: 'zombie_subscription',
          message: `You haven't used ${subscription.merchant} in ${daysSinceLastUsage} days, but you're still paying $${subscription.amount}/${subscription.frequency}. Consider canceling to save money.`,
          priority: Math.min(Math.floor(zombieScore / 10), 10),
          trigger_data: {
            subscription_id: subscription.id,
            zombie_score: zombieScore,
            days_since_usage: daysSinceLastUsage,
          },
        });
      }

      const { error: updateError } = await supabase
        .from('detected_subscriptions')
        .update(updates)
        .eq('id', subscription.id);

      if (updateError) {
        console.error(`Error updating subscription ${subscription.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }

    console.log(`Analysis complete: ${updatedCount} subscriptions analyzed, ${zombiesDetected} new zombies detected`);

    return new Response(
      JSON.stringify({
        success: true,
        subscriptions_analyzed: updatedCount,
        zombies_detected: zombiesDetected,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing subscription usage:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateZombieScore({
  daysSinceLastUsage,
  usageCount,
  subscriptionAmount,
  confidence,
}: {
  daysSinceLastUsage: number;
  usageCount: number;
  subscriptionAmount: number;
  confidence: number;
}): number {
  // Time component (40 points max)
  const timeScore = Math.min((daysSinceLastUsage / 90) * 40, 40);

  // Usage frequency component (30 points max)
  const usageScore = Math.max(30 - (usageCount * 6), 0);

  // Cost impact component (20 points max)
  const costScore = Math.min((subscriptionAmount / 50) * 20, 20);

  // Confidence bonus (10 points max)
  const confidenceBonus = confidence * 10;

  return Math.min(timeScore + usageScore + costScore + confidenceBonus, 100);
}
