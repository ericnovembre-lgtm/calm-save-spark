import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { redisGetJSON, redisSetJSON } from '../_shared/upstash-redis.ts';
import { checkRateLimit, rateLimitExceededResponse, rateLimitHeaders } from '../_shared/redis-rate-limiter.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CLAUDE_OPUS = 'claude-opus-4-5-20251101';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours for better cache hit rates
const REDIS_CACHE_TTL_SECONDS = 30 * 60; // 30 minutes Redis cache

const WIDGET_TYPES = `
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
- net_worth_chart: Net worth mini chart with trend
- net_worth_dashboard: Comprehensive net worth with assets/liabilities breakdown
- debt_tracker: Debt payoff progress
- subscriptions: Recurring payments tracker
- spending_alerts: Budget warning alerts
- daily_briefing: AI daily summary card
- streak_recovery: Streak warning/recovery banner
- nudges: AI recommendations
- income: Monthly income summary with source count
- income_summary: Detailed income breakdown with trends`;

const DASHBOARD_ARCHITECT_PROMPT = `You are the $ave+ Dashboard Architect - an elite AI that designs hyper-personalized financial dashboards.

## Your Capabilities
- Analyze financial health holistically across savings, spending, goals, investments, debts
- Identify immediate concerns, opportunities, and celebrations
- Design visual hierarchy to guide user attention to what matters most
- Generate personalized micro-narratives and insights

## Dashboard Architecture Rules
1. Show 5-8 widgets maximum - quality over quantity
2. Hero section: One dominant widget for the most important insight
3. Featured section: 2-3 widgets for secondary priorities  
4. Grid section: 2-4 compact widgets for monitoring
5. Hidden: Everything else

${WIDGET_TYPES}

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
      "data": {}
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
  "reasoning": "string"
}`;

interface FinancialContext {
  userId: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  profile?: any;
  balances?: any;
  goals?: any[];
  pots?: any[];
  recentTransactions?: any[];
  budgets?: any[];
  streakData?: any;
  creditScore?: any;
  debts?: any[];
  investments?: any[];
  netWorth?: number;
}

async function fetchUserFinancialContext(supabase: any, userId: string): Promise<FinancialContext> {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';

  const [
    profileRes,
    goalsRes,
    potsRes,
    transactionsRes,
    budgetsRes,
    creditRes,
    debtsRes,
    investmentsRes
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('goals').select('*').eq('user_id', userId).eq('is_active', true).limit(10),
    supabase.from('pots').select('*').eq('user_id', userId).eq('is_active', true).limit(10),
    supabase.from('transactions').select('*').eq('user_id', userId).order('transaction_date', { ascending: false }).limit(50),
    supabase.from('user_budgets').select('*, budget_spending(*)').eq('user_id', userId).eq('is_active', true).limit(10),
    supabase.from('credit_scores').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1),
    supabase.from('debts').select('*').eq('user_id', userId).eq('is_active', true),
    supabase.from('investment_holdings').select('*').eq('user_id', userId)
  ]);

  const totalSavings = potsRes.data?.reduce((sum: number, pot: any) => sum + (pot.current_amount || 0), 0) || 0;
  const goalsTotal = goalsRes.data?.reduce((sum: number, g: any) => sum + (g.current_amount || 0), 0) || 0;
  const totalDebt = debtsRes.data?.reduce((sum: number, d: any) => sum + (d.current_balance || 0), 0) || 0;
  const investmentValue = investmentsRes.data?.reduce((sum: number, i: any) => sum + (i.current_value || 0), 0) || 0;
  const netWorth = totalSavings + goalsTotal + investmentValue - totalDebt;

  const goalsProgress = goalsRes.data?.map((g: any) => ({
    name: g.name,
    current: g.current_amount,
    target: g.target_amount,
    progress: g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0
  })) || [];

  const recentSpending = transactionsRes.data?.filter((t: any) => t.amount < 0) || [];
  const totalRecentSpending = Math.abs(recentSpending.reduce((sum: number, t: any) => sum + t.amount, 0));

  return {
    userId,
    timeOfDay,
    profile: profileRes.data,
    balances: { totalSavings, totalRecentSpending, netChange: totalSavings - totalRecentSpending },
    goals: goalsProgress,
    pots: potsRes.data || [],
    recentTransactions: transactionsRes.data?.slice(0, 10) || [],
    budgets: budgetsRes.data || [],
    creditScore: creditRes.data?.[0],
    streakData: { currentStreak: profileRes.data?.current_streak || 0, lastActivity: profileRes.data?.last_activity_date },
    debts: debtsRes.data || [],
    investments: investmentsRes.data || [],
    netWorth
  };
}

async function getCachedLayout(supabase: any, userId: string): Promise<any | null> {
  const { data } = await supabase
    .from('api_response_cache')
    .select('response_data, created_at')
    .eq('cache_key', `dashboard_layout_${userId}`)
    .eq('cache_type', 'dashboard_layout')
    .single();

  if (!data) return null;
  
  const cacheAge = Date.now() - new Date(data.created_at).getTime();
  if (cacheAge > CACHE_TTL_MS) return null;
  
  return data.response_data;
}

async function setCachedLayout(supabase: any, userId: string, layout: any): Promise<void> {
  await supabase.from('api_response_cache').upsert({
    cache_key: `dashboard_layout_${userId}`,
    cache_type: 'dashboard_layout',
    user_id: userId,
    response_data: layout,
    expires_at: new Date(Date.now() + CACHE_TTL_MS).toISOString()
  }, { onConflict: 'cache_key' });
}

function buildUserContextMessage(context: FinancialContext): string {
  return `
## User Financial Context

**Time**: ${context.timeOfDay} (${new Date().toLocaleDateString()})
**User**: ${context.profile?.full_name || 'User'}

### Net Worth: $${context.netWorth?.toFixed(2) || '0.00'}

### Savings: $${context.balances?.totalSavings?.toFixed(2) || '0.00'}
- Recent Spending: $${context.balances?.totalRecentSpending?.toFixed(2) || '0.00'}
- Streak: ${context.streakData?.currentStreak || 0} days

### Goals (${context.goals?.length || 0})
${context.goals?.map(g => `- ${g.name}: ${g.progress.toFixed(0)}% ($${g.current}/$${g.target})`).join('\n') || 'None'}

### Debts (${context.debts?.length || 0})
${context.debts?.map((d: any) => `- ${d.debt_name}: $${d.current_balance} @ ${d.interest_rate}%`).join('\n') || 'None'}

### Investments
Total Value: $${context.investments?.reduce((s: number, i: any) => s + (i.current_value || 0), 0).toFixed(2) || '0.00'}

### Recent Transactions
${context.recentTransactions?.slice(0, 5).map((t: any) => `- ${t.merchant || 'Unknown'}: $${Math.abs(t.amount).toFixed(2)}`).join('\n') || 'None'}

### Credit Score: ${context.creditScore?.score || 'N/A'}

Design the optimal dashboard for this user.`;
}

async function generateDashboardWithClaude(context: FinancialContext): Promise<any> {
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
  if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured');

  const userContextMessage = buildUserContextMessage(context);

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
      messages: [{ role: 'user', content: userContextMessage }]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Claude API error:', response.status, errorText);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse dashboard layout');

  return JSON.parse(jsonMatch[0]);
}

async function* streamDashboardWithClaude(context: FinancialContext): AsyncGenerator<{ type: string; content?: string; dashboard?: any; context?: any; meta?: any; cached?: boolean }> {
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
  if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured');

  const userContextMessage = buildUserContextMessage(context);
  const startTime = Date.now();

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
      stream: true,
      system: DASHBOARD_ARCHITECT_PROMPT,
      messages: [{ role: 'user', content: userContextMessage }]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Claude API streaming error:', response.status, errorText);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim();
        if (!jsonStr || jsonStr === '[DONE]') continue;

        try {
          const event = JSON.parse(jsonStr);
          
          if (event.type === 'content_block_delta' && event.delta?.text) {
            const text = event.delta.text;
            fullContent += text;
            
            // Stream text that looks like briefing content (before JSON starts)
            if (!fullContent.includes('{')) {
              yield { type: 'streaming_text', content: text };
            }
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  }

  // Parse final JSON from accumulated content
  const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse dashboard layout from stream');

  const dashboard = JSON.parse(jsonMatch[0]);
  const processingTime = Date.now() - startTime;

  yield {
    type: 'complete',
    dashboard,
    context: {
      timeOfDay: context.timeOfDay,
      totalSavings: context.balances?.totalSavings,
      goalsCount: context.goals?.length,
      streak: context.streakData?.currentStreak,
      netWorth: context.netWorth
    },
    meta: { model: CLAUDE_OPUS, processingTimeMs: processingTime, generatedAt: new Date().toISOString() },
    cached: false
  };
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

    const { forceRefresh, stream } = await req.json().catch(() => ({ forceRefresh: false, stream: false }));

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

    // Rate limiting
    const rateLimitResult = await checkRateLimit(user.id, 'generate-dashboard-layout');
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for user ${user.id}`);
      return rateLimitExceededResponse(rateLimitResult, corsHeaders);
    }

    // Check Redis cache first (faster than DB cache)
    if (!forceRefresh) {
      const redisCacheKey = `dashboard:${user.id}`;
      const redisCached = await redisGetJSON<any>(redisCacheKey);
      if (redisCached) {
        console.log('Returning Redis cached dashboard layout');
        return new Response(JSON.stringify({
          success: true,
          dashboard: redisCached,
          cached: true,
          cacheSource: 'redis',
          meta: { model: CLAUDE_OPUS, processingTimeMs: Date.now() - startTime, generatedAt: new Date().toISOString() }
        }), {
          headers: { ...corsHeaders, ...rateLimitHeaders(rateLimitResult), 'Content-Type': 'application/json' },
        });
      }

      // Fallback to DB cache
      const dbCached = await getCachedLayout(supabase, user.id);
      if (dbCached) {
        console.log('Returning DB cached dashboard layout');
        // Warm Redis cache for next request
        await redisSetJSON(redisCacheKey, dbCached, REDIS_CACHE_TTL_SECONDS);
        return new Response(JSON.stringify({
          success: true,
          dashboard: dbCached,
          cached: true,
          cacheSource: 'database',
          meta: { model: CLAUDE_OPUS, processingTimeMs: Date.now() - startTime, generatedAt: new Date().toISOString() }
        }), {
          headers: { ...corsHeaders, ...rateLimitHeaders(rateLimitResult), 'Content-Type': 'application/json' },
        });
      }
    }

    const context = await fetchUserFinancialContext(supabase, user.id);

    // Streaming response
    if (stream) {
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            let finalDashboard: any = null;
            
            for await (const event of streamDashboardWithClaude(context)) {
              const sseData = `data: ${JSON.stringify(event)}\n\n`;
              controller.enqueue(encoder.encode(sseData));
              
              if (event.type === 'complete') {
                finalDashboard = event.dashboard;
              }
            }

            // Cache the result in both Redis and DB
            if (finalDashboard) {
              const redisCacheKey = `dashboard:${user.id}`;
              await Promise.all([
                redisSetJSON(redisCacheKey, finalDashboard, REDIS_CACHE_TTL_SECONDS),
                setCachedLayout(supabase, user.id, finalDashboard)
              ]);
              
              // Log analytics
              supabase.from('ai_model_routing_analytics').insert({
                user_id: user.id,
                model_used: CLAUDE_OPUS,
                query_type: 'dashboard_architect_stream',
                response_time_ms: Date.now() - startTime,
                estimated_cost: 0.10
              }).then(({ error }) => {
                if (error) console.error('Analytics logging error:', error);
              });
            }

            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            console.error('Streaming error:', error);
            const errorEvent = `data: ${JSON.stringify({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`;
            controller.enqueue(encoder.encode(errorEvent));
            controller.close();
          }
        }
      });

      return new Response(readableStream, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        },
      });
    }

    // Non-streaming fallback
    const dashboardLayout = await generateDashboardWithClaude(context);
    const processingTime = Date.now() - startTime;

    // Cache the result in both Redis and DB
    const redisCacheKey = `dashboard:${user.id}`;
    await Promise.all([
      redisSetJSON(redisCacheKey, dashboardLayout, REDIS_CACHE_TTL_SECONDS),
      setCachedLayout(supabase, user.id, dashboardLayout)
    ]);

    // Log analytics
    supabase.from('ai_model_routing_analytics').insert({
      user_id: user.id,
      model_used: CLAUDE_OPUS,
      query_type: 'dashboard_architect',
      response_time_ms: processingTime,
      estimated_cost: 0.10
    }).then(({ error }) => {
      if (error) console.error('Analytics logging error:', error);
    });

    return new Response(JSON.stringify({
      success: true,
      dashboard: dashboardLayout,
      cached: false,
      context: {
        timeOfDay: context.timeOfDay,
        totalSavings: context.balances?.totalSavings,
        goalsCount: context.goals?.length,
        streak: context.streakData?.currentStreak,
        netWorth: context.netWorth
      },
      meta: { model: CLAUDE_OPUS, processingTimeMs: processingTime, generatedAt: new Date().toISOString() }
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
