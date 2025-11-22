import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsData {
  successRate: number;
  totalSavings: number;
  topRules: Array<{
    automation_rule_id: string;
    rule_name: string;
    execution_count: number;
  }>;
  dailyTrend: Array<{
    date: string;
    count: number;
    amount: number;
  }>;
  averageTransfer: number;
  totalExecutions: number;
  failureRate: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Success rate
    const { data: successData } = await supabaseClient.rpc('calculate_success_rate', {
      p_user_id: user.id,
    }).single();

    // Total savings
    const { data: savingsData } = await supabaseClient
      .from('automation_execution_log')
      .select('amount_transferred')
      .eq('user_id', user.id)
      .eq('status', 'success');

    const totalSavings = savingsData?.reduce((sum, log) => sum + (log.amount_transferred || 0), 0) || 0;

    // Top rules
    const { data: topRulesData } = await supabaseClient
      .from('automation_execution_log')
      .select('automation_rule_id, metadata')
      .eq('user_id', user.id)
      .order('executed_at', { ascending: false });

    const ruleMap = new Map<string, { rule_name: string; count: number }>();
    topRulesData?.forEach((log) => {
      const ruleId = log.automation_rule_id;
      const ruleName = (log.metadata as any)?.rule_name || 'Unknown Rule';
      
      if (ruleMap.has(ruleId)) {
        ruleMap.get(ruleId)!.count++;
      } else {
        ruleMap.set(ruleId, { rule_name: ruleName, count: 1 });
      }
    });

    const topRules = Array.from(ruleMap.entries())
      .map(([id, data]) => ({
        automation_rule_id: id,
        rule_name: data.rule_name,
        execution_count: data.count,
      }))
      .sort((a, b) => b.execution_count - a.execution_count)
      .slice(0, 5);

    // Daily trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: trendData } = await supabaseClient
      .from('automation_execution_log')
      .select('executed_at, amount_transferred')
      .eq('user_id', user.id)
      .gte('executed_at', thirtyDaysAgo.toISOString());

    const dailyMap = new Map<string, { count: number; amount: number }>();
    trendData?.forEach((log) => {
      const date = new Date(log.executed_at!).toISOString().split('T')[0];
      if (dailyMap.has(date)) {
        const existing = dailyMap.get(date)!;
        dailyMap.set(date, {
          count: existing.count + 1,
          amount: existing.amount + (log.amount_transferred || 0),
        });
      } else {
        dailyMap.set(date, {
          count: 1,
          amount: log.amount_transferred || 0,
        });
      }
    });

    const dailyTrend = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Total executions
    const { count: totalExecutions } = await supabaseClient
      .from('automation_execution_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Success count
    const { count: successCount } = await supabaseClient
      .from('automation_execution_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'success');

    const successRate = totalExecutions ? ((successCount || 0) / totalExecutions) * 100 : 0;
    const failureRate = totalExecutions ? 100 - successRate : 0;
    const averageTransfer = successCount ? totalSavings / successCount : 0;

    const analytics: AnalyticsData = {
      successRate,
      totalSavings,
      topRules,
      dailyTrend,
      averageTransfer,
      totalExecutions: totalExecutions || 0,
      failureRate,
    };

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
