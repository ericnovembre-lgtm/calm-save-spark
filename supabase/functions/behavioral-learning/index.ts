import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BehaviorPattern {
  pattern_type: string;
  pattern_data: any;
  confidence_score: number;
  sample_size: number;
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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action } = await req.json();

    if (action === 'analyze') {
      // Analyze user behavior and detect patterns
      const patterns = await analyzeUserBehavior(supabase, user.id);
      
      return new Response(JSON.stringify({ patterns }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'record_event') {
      const { event_type, event_data, prediction_id, was_accurate } = await req.json();
      
      const { error } = await supabase
        .from('learning_events')
        .insert({
          user_id: user.id,
          event_type,
          event_data,
          prediction_id,
          was_accurate,
        });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Behavioral learning error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeUserBehavior(supabase: any, userId: string): Promise<BehaviorPattern[]> {
  const patterns: BehaviorPattern[] = [];

  // 1. Analyze spending time patterns
  const { data: transactions } = await supabase
    .from('transactions')
    .select('created_at, amount')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(500);

  if (transactions && transactions.length > 0) {
    const hourCounts: Record<number, number> = {};
    const dayCounts: Record<number, number> = {};

    transactions.forEach((t: any) => {
      const date = new Date(t.created_at);
      const hour = date.getHours();
      const day = date.getDay();
      
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    const peakDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];

    patterns.push({
      pattern_type: 'spending_time',
      pattern_data: {
        peak_hour: parseInt(peakHour[0]),
        peak_day: parseInt(peakDay[0]),
        hourly_distribution: hourCounts,
        daily_distribution: dayCounts,
      },
      confidence_score: Math.min(transactions.length / 100, 0.95),
      sample_size: transactions.length,
    });
  }

  // 2. Analyze category preferences
  const { data: categoryData } = await supabase
    .from('transactions')
    .select('category, amount')
    .eq('user_id', userId)
    .not('category', 'is', null)
    .limit(500);

  if (categoryData && categoryData.length > 0) {
    const categoryTotals: Record<string, { count: number; total: number }> = {};
    
    categoryData.forEach((t: any) => {
      if (!categoryTotals[t.category]) {
        categoryTotals[t.category] = { count: 0, total: 0 };
      }
      categoryTotals[t.category].count++;
      categoryTotals[t.category].total += Math.abs(t.amount);
    });

    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5);

    patterns.push({
      pattern_type: 'category_preference',
      pattern_data: {
        top_categories: topCategories.map(([cat, data]) => ({
          category: cat,
          count: data.count,
          total: data.total,
        })),
      },
      confidence_score: Math.min(categoryData.length / 100, 0.95),
      sample_size: categoryData.length,
    });
  }

  // 3. Analyze savings behavior
  const { data: savingsTransactions } = await supabase
    .from('transactions')
    .select('created_at, amount, description')
    .eq('user_id', userId)
    .gt('amount', 0)
    .ilike('description', '%savings%')
    .limit(100);

  if (savingsTransactions && savingsTransactions.length > 5) {
    const amounts = savingsTransactions.map((t: any) => t.amount);
    const avgAmount = amounts.reduce((a: number, b: number) => a + b, 0) / amounts.length;

    patterns.push({
      pattern_type: 'savings_behavior',
      pattern_data: {
        frequency: savingsTransactions.length,
        average_amount: avgAmount,
        typical_range: {
          min: Math.min(...amounts),
          max: Math.max(...amounts),
        },
      },
      confidence_score: Math.min(savingsTransactions.length / 20, 0.9),
      sample_size: savingsTransactions.length,
    });
  }

  // Store patterns in database
  for (const pattern of patterns) {
    await supabase
      .from('user_behavior_patterns')
      .upsert({
        user_id: userId,
        pattern_type: pattern.pattern_type,
        pattern_data: pattern.pattern_data,
        confidence_score: pattern.confidence_score,
        sample_size: pattern.sample_size,
        last_updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,pattern_type',
      });
  }

  return patterns;
}