import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CLAUDE_OPUS = 'claude-opus-4-1-20250805';

const DASHBOARD_ARCHITECT_PROMPT = `You are the $ave+ Dashboard Architect - an elite AI that designs hyper-personalized financial dashboards. Your role is to analyze a user's complete financial state and architect the perfect dashboard experience.

## Your Capabilities
- Analyze financial health holistically across savings, spending, goals, and investments
- Identify immediate concerns, opportunities, and celebrations
- Design visual hierarchy to guide user attention to what matters most
- Generate personalized micro-narratives and insights
- Select mood-appropriate visual themes

## Dashboard Architecture Rules
1. Show 5-8 widgets maximum - quality over quantity
2. Hero section: One dominant widget for the most important insight
3. Featured section: 2-3 widgets for secondary priorities  
4. Grid section: 2-4 compact widgets for monitoring
5. Hidden: Everything else (user can access via menu)

## Widget Types Available
- balance_hero: Large balance display with trend
- goal_progress: Goal tracking with milestones
- spending_breakdown: Category spending chart
- upcoming_bills: Bills due soon
- cashflow_forecast: Income vs expenses projection
- ai_insight: Personalized insight card
- quick_actions: Suggested actions
- savings_streak: Streak and achievements
- budget_status: Budget health meters
- investment_summary: Portfolio overview
- credit_score: Credit monitoring
- net_worth: Net worth tracker

## Visual Moods
- calm: User finances are stable (soft beige, slow animations)
- energetic: Growth phase, positive momentum (vibrant cyan, particles)
- cautionary: Budget concerns or bills due (amber tones, pulse effects)
- celebratory: Milestone achieved or windfall (gold accents, confetti-ready)

## Output Format
Return a JSON object with this exact structure:
{
  "layout": {
    "hero": { "widgetId": "string", "reason": "string" },
    "featured": [{ "widgetId": "string", "size": "large|medium", "reason": "string" }],
    "grid": [{ "widgetId": "string", "reason": "string" }],
    "hidden": ["string"]
  },
  "widgets": {
    "[widgetId]": {
      "type": "metric|chart|list|narrative|action|hybrid",
      "headline": "string",
      "body": "string (optional insight text)",
      "mood": "calm|energetic|cautionary|celebratory",
      "urgencyScore": 0-100,
      "data": {} // widget-specific data
    }
  },
  "theme": {
    "mood": "calm|energetic|cautionary|celebratory",
    "accentColor": "cyan|amber|emerald|rose|violet|gold",
    "backgroundIntensity": 0.3-1.0,
    "animationLevel": "subtle|moderate|prominent"
  },
  "briefing": {
    "greeting": "string",
    "summary": "string (2-3 sentences)",
    "keyInsight": "string",
    "suggestedAction": "string"
  },
  "reasoning": "string (explain your dashboard design choices)"
}

Be creative, insightful, and genuinely helpful. Your dashboard should feel like a personal financial advisor crafted it just for this user.`;

interface FinancialContext {
  userId: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  profile?: any;
  balances?: any;
  goals?: any[];
  pots?: any[];
  recentTransactions?: any[];
  upcomingBills?: any[];
  budgets?: any[];
  streakData?: any;
  creditScore?: any;
  investments?: any;
}

async function fetchUserFinancialContext(supabase: any, userId: string): Promise<FinancialContext> {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';

  // Fetch all financial data in parallel
  const [
    profileRes,
    goalsRes,
    potsRes,
    transactionsRes,
    budgetsRes,
    creditRes
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('goals').select('*').eq('user_id', userId).eq('is_active', true).limit(10),
    supabase.from('pots').select('*').eq('user_id', userId).eq('is_active', true).limit(10),
    supabase.from('transactions').select('*').eq('user_id', userId).order('transaction_date', { ascending: false }).limit(50),
    supabase.from('user_budgets').select('*').eq('user_id', userId).eq('is_active', true).limit(10),
    supabase.from('credit_scores').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1)
  ]);

  // Calculate balances from pots
  const totalSavings = potsRes.data?.reduce((sum: number, pot: any) => sum + (pot.current_amount || 0), 0) || 0;
  const goalsProgress = goalsRes.data?.map((g: any) => ({
    name: g.name,
    current: g.current_amount,
    target: g.target_amount,
    progress: g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0
  })) || [];

  // Recent spending analysis
  const recentSpending = transactionsRes.data?.filter((t: any) => t.amount < 0) || [];
  const totalRecentSpending = Math.abs(recentSpending.reduce((sum: number, t: any) => sum + t.amount, 0));

  return {
    userId,
    timeOfDay,
    profile: profileRes.data,
    balances: {
      totalSavings,
      totalRecentSpending,
      netChange: totalSavings - totalRecentSpending
    },
    goals: goalsProgress,
    pots: potsRes.data || [],
    recentTransactions: transactionsRes.data?.slice(0, 10) || [],
    budgets: budgetsRes.data || [],
    creditScore: creditRes.data?.[0],
    streakData: {
      currentStreak: profileRes.data?.current_streak || 0,
      lastActivity: profileRes.data?.last_activity_date
    }
  };
}

async function generateDashboardWithClaude(context: FinancialContext): Promise<any> {
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const userContextMessage = `
## User Financial Context

**Time**: ${context.timeOfDay} (${new Date().toLocaleDateString()})
**User**: ${context.profile?.full_name || 'User'}

### Savings Overview
- Total Savings: $${context.balances?.totalSavings?.toFixed(2) || '0.00'}
- Recent Spending (last 50 txns): $${context.balances?.totalRecentSpending?.toFixed(2) || '0.00'}
- Current Streak: ${context.streakData?.currentStreak || 0} days

### Goals (${context.goals?.length || 0} active)
${context.goals?.map(g => `- ${g.name}: ${g.progress.toFixed(0)}% ($${g.current}/$${g.target})`).join('\n') || 'No active goals'}

### Savings Pots (${context.pots?.length || 0})
${context.pots?.map((p: any) => `- ${p.name}: $${p.current_amount?.toFixed(2) || '0.00'}`).join('\n') || 'No pots'}

### Recent Transactions
${context.recentTransactions?.slice(0, 5).map((t: any) => `- ${t.merchant || 'Unknown'}: $${Math.abs(t.amount).toFixed(2)} (${t.category || 'uncategorized'})`).join('\n') || 'No recent transactions'}

### Budgets
${context.budgets?.map((b: any) => `- ${b.category}: $${b.spent_amount || 0}/$${b.budget_amount}`).join('\n') || 'No budgets set'}

### Credit Score
${context.creditScore ? `Score: ${context.creditScore.score} (${context.creditScore.rating || 'N/A'})` : 'Not available'}

---

Based on this financial context, design the optimal personalized dashboard for this user right now. Consider what they most need to see, any urgent matters, opportunities for growth, and reasons to celebrate.
`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_OPUS,
      max_tokens: 4096,
      system: DASHBOARD_ARCHITECT_PROMPT,
      messages: [
        { role: 'user', content: userContextMessage }
      ]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Claude API error:', response.status, errorText);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text || '';

  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('No JSON found in Claude response:', content);
    throw new Error('Failed to parse dashboard layout from Claude');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('JSON parse error:', e, jsonMatch[0]);
    throw new Error('Invalid JSON in Claude response');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const startTime = Date.now();

    // Fetch user's financial context
    const context = await fetchUserFinancialContext(supabase, user.id);

    // Generate dashboard layout with Claude Opus
    const dashboardLayout = await generateDashboardWithClaude(context);

    const processingTime = Date.now() - startTime;

    // Log analytics
    try {
      await supabase.from('ai_model_routing_analytics').insert({
        user_id: user.id,
        model_used: CLAUDE_OPUS,
        query_type: 'dashboard_architect',
        response_time_ms: processingTime,
        estimated_cost: 0.10, // Opus is expensive
        confidence_score: 0.95
      });
    } catch (logError) {
      console.error('Analytics logging error:', logError);
    }

    return new Response(JSON.stringify({
      success: true,
      dashboard: dashboardLayout,
      context: {
        timeOfDay: context.timeOfDay,
        totalSavings: context.balances?.totalSavings,
        goalsCount: context.goals?.length,
        streak: context.streakData?.currentStreak
      },
      meta: {
        model: CLAUDE_OPUS,
        processingTimeMs: processingTime,
        generatedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Dashboard generation error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
