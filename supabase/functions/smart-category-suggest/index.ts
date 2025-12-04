import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Inline adaptive limiter
type AdaptiveStrategy = 'aggressive' | 'moderate' | 'conservative' | 'critical';
type CircuitState = 'closed' | 'open' | 'half-open';

interface QuotaState {
  requestsRemainingRPD: number;
  requestsLimitRPD: number;
  tokensRemainingTPM: number;
  tokensLimitTPM: number;
  circuitState: CircuitState;
  circuitOpenedAt: string | null;
  consecutiveFailures: number;
}

interface GroqQuotaInfo {
  requestsLimitRPD: number;
  requestsRemainingRPD: number;
  requestsResetRPD: string | null;
  tokensLimitTPM: number;
  tokensRemainingTPM: number;
  tokensResetTPM: string | null;
  retryAfter: string | null;
}

const GROQ_LIMITS = {
  REQUESTS_PER_DAY: 14400,
  TOKENS_PER_MINUTE: 6000,
  CIRCUIT_BREAKER_TIMEOUT_MS: 60000,
};

function parseGroqHeaders(headers: Headers): GroqQuotaInfo {
  return {
    requestsLimitRPD: parseInt(headers.get('x-ratelimit-limit-requests') || String(GROQ_LIMITS.REQUESTS_PER_DAY)),
    requestsRemainingRPD: parseInt(headers.get('x-ratelimit-remaining-requests') || String(GROQ_LIMITS.REQUESTS_PER_DAY)),
    requestsResetRPD: headers.get('x-ratelimit-reset-requests'),
    tokensLimitTPM: parseInt(headers.get('x-ratelimit-limit-tokens') || String(GROQ_LIMITS.TOKENS_PER_MINUTE)),
    tokensRemainingTPM: parseInt(headers.get('x-ratelimit-remaining-tokens') || String(GROQ_LIMITS.TOKENS_PER_MINUTE)),
    tokensResetTPM: headers.get('x-ratelimit-reset-tokens'),
    retryAfter: headers.get('retry-after'),
  };
}

function calculateStrategy(state: QuotaState): AdaptiveStrategy {
  const requestsRatio = state.requestsRemainingRPD / state.requestsLimitRPD;
  const tokensRatio = state.tokensRemainingTPM / state.tokensLimitTPM;
  const minRatio = Math.min(requestsRatio, tokensRatio);
  if (minRatio > 0.7) return 'aggressive';
  if (minRatio > 0.3) return 'moderate';
  if (minRatio > 0.1) return 'conservative';
  return 'critical';
}

function getStrategyDelay(strategy: AdaptiveStrategy): number {
  return { aggressive: 0, moderate: 100, conservative: 500, critical: 2000 }[strategy];
}

async function getQuotaState(supabase: any): Promise<QuotaState> {
  const { data } = await supabase.from('groq_quota_state').select('*').limit(1).single();
  if (!data) {
    return {
      requestsRemainingRPD: GROQ_LIMITS.REQUESTS_PER_DAY,
      requestsLimitRPD: GROQ_LIMITS.REQUESTS_PER_DAY,
      tokensRemainingTPM: GROQ_LIMITS.TOKENS_PER_MINUTE,
      tokensLimitTPM: GROQ_LIMITS.TOKENS_PER_MINUTE,
      circuitState: 'closed',
      circuitOpenedAt: null,
      consecutiveFailures: 0,
    };
  }
  return {
    requestsRemainingRPD: data.requests_remaining_rpd,
    requestsLimitRPD: data.requests_limit_rpd,
    tokensRemainingTPM: data.tokens_remaining_tpm,
    tokensLimitTPM: data.tokens_limit_tpm,
    circuitState: data.circuit_state,
    circuitOpenedAt: data.circuit_opened_at,
    consecutiveFailures: data.consecutive_failures,
  };
}

async function updateQuotaState(supabase: any, info: GroqQuotaInfo, latencyMs: number, success: boolean) {
  await supabase.rpc('update_groq_quota_state', {
    p_requests_remaining: info.requestsRemainingRPD,
    p_requests_limit: info.requestsLimitRPD,
    p_requests_reset: info.requestsResetRPD ? new Date(info.requestsResetRPD).toISOString() : null,
    p_tokens_remaining: info.tokensRemainingTPM,
    p_tokens_limit: info.tokensLimitTPM,
    p_tokens_reset: info.tokensResetTPM ? new Date(info.tokensResetTPM).toISOString() : null,
    p_latency_ms: latencyMs,
    p_success: success,
  });
}

async function updateCircuitState(supabase: any, state: CircuitState) {
  await supabase.rpc('update_groq_circuit_state', { p_state: state });
}

async function categorizeWithGroq(
  supabase: any,
  merchantName: string,
  amount: number,
  description: string,
  categories: Array<{ code: string; name: string }>
): Promise<{ categoryCode: string; confidence: number; reasoning: string; latencyMs: number; strategy: AdaptiveStrategy }> {
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not configured');

  const quotaState = await getQuotaState(supabase);
  
  if (quotaState.circuitState === 'open') {
    const openedAt = quotaState.circuitOpenedAt ? new Date(quotaState.circuitOpenedAt).getTime() : 0;
    if (Date.now() - openedAt < GROQ_LIMITS.CIRCUIT_BREAKER_TIMEOUT_MS) {
      throw new Error('CIRCUIT_OPEN: Rate limit protection active');
    }
    await updateCircuitState(supabase, 'half-open');
  }

  const strategy = calculateStrategy(quotaState);
  const delay = getStrategyDelay(strategy);
  
  console.log(`[SmartCategory] Strategy: ${strategy}, Delay: ${delay}ms`);
  
  if (delay > 0) await new Promise(r => setTimeout(r, delay));

  const systemPrompt = `You are an instant transaction categorizer. Respond with ONLY valid JSON, no other text.
Available categories: ${categories.map(c => `${c.code}:${c.name}`).join(', ')}`;

  const userPrompt = `Categorize this transaction:
Merchant: "${merchantName}"
Amount: $${amount}
Description: ${description || 'N/A'}

Return ONLY: {"categoryCode":"CODE","confidence":0.95,"reasoning":"brief reason"}`;

  const startTime = Date.now();
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
      max_tokens: 150,
      temperature: 0.1
    }),
  });

  const latencyMs = Date.now() - startTime;
  const quotaInfo = parseGroqHeaders(response.headers);

  if (!response.ok) {
    await updateQuotaState(supabase, quotaInfo, latencyMs, false);
    if (response.status === 429) {
      await updateCircuitState(supabase, 'open');
      throw new Error('RATE_LIMITED: Groq API rate limit hit');
    }
    throw new Error(`Groq API error: ${response.status}`);
  }

  await updateQuotaState(supabase, quotaInfo, latencyMs, true);
  
  if (quotaState.circuitState !== 'closed') {
    await updateCircuitState(supabase, 'closed');
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  console.log(`[SmartCategory] Groq categorization in ${latencyMs}ms, strategy: ${strategy}`);
  
  try {
    const parsed = JSON.parse(content);
    return { ...parsed, latencyMs, strategy };
  } catch {
    const jsonMatch = content.match(/\{[^}]+\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { ...parsed, latencyMs, strategy };
    }
    throw new Error('Failed to parse Groq response');
  }
}

async function categorizeWithGemini(
  merchantName: string,
  amount: number,
  description: string,
  categories: Array<{ code: string; name: string }>
): Promise<{ categoryCode: string; confidence: number; reasoning: string }> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

  const systemPrompt = `You are a financial categorization expert. Based on merchant name, amount, and description, suggest the most appropriate budget category.

Available categories:
${categories.map(c => `- ${c.code}: ${c.name}`).join('\n')}

Return only a JSON object with: categoryCode, confidence (0-1), reasoning`;

  const userPrompt = `Categorize this transaction:
Merchant: ${merchantName}
Amount: $${amount}
Description: ${description || 'N/A'}`;

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
      response_format: { type: 'json_object' }
    }),
  });

  if (!aiResponse.ok) throw new Error(`AI Gateway error: ${aiResponse.statusText}`);

  const aiData = await aiResponse.json();
  return JSON.parse(aiData.choices[0].message.content);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { merchantName, amount, description } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error('Invalid user token');

    // Check cache first
    const { data: cachedSuggestion } = await supabase
      .from('category_suggestions')
      .select('*')
      .eq('user_id', user.id)
      .ilike('merchant_name', `%${merchantName}%`)
      .order('times_used', { ascending: false })
      .limit(1)
      .single();

    if (cachedSuggestion && cachedSuggestion.confidence_score > 0.7) {
      await supabase.from('category_suggestions')
        .update({ times_used: cachedSuggestion.times_used + 1 })
        .eq('id', cachedSuggestion.id);

      return new Response(
        JSON.stringify({
          categoryCode: cachedSuggestion.suggested_category_code,
          confidence: cachedSuggestion.confidence_score,
          source: 'cache',
          latencyMs: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: userCategories } = await supabase
      .from('budget_categories')
      .select('code, name')
      .or(`is_custom.eq.false,user_id.eq.${user.id}`)
      .order('is_custom', { ascending: true });

    const categories = userCategories || [];
    let suggestion: { categoryCode: string; confidence: number; reasoning: string; latencyMs?: number; strategy?: AdaptiveStrategy };
    let source = 'groq';

    try {
      suggestion = await categorizeWithGroq(supabase, merchantName, amount, description, categories);
      console.log(`[SmartCategory] Groq: ${suggestion.latencyMs}ms, strategy: ${suggestion.strategy}`);
    } catch (groqError) {
      console.error('[SmartCategory] Groq failed, using Gemini:', groqError);
      suggestion = await categorizeWithGemini(merchantName, amount, description, categories);
      source = 'gemini';
    }

    await supabase.from('category_suggestions').insert({
      user_id: user.id,
      merchant_name: merchantName,
      amount_range: amount < 50 ? 'low' : amount < 200 ? 'medium' : 'high',
      suggested_category_code: suggestion.categoryCode,
      confidence_score: suggestion.confidence,
      times_used: 1
    });

    await supabase.from('ai_model_routing_analytics').insert({
      user_id: user.id,
      query_type: 'speed_critical',
      model_used: source === 'groq' ? 'groq-instant' : 'gemini-flash',
      response_time_ms: suggestion.latencyMs || null,
      confidence_score: suggestion.confidence,
      query_length: merchantName.length + (description?.length || 0)
    });

    return new Response(
      JSON.stringify({
        categoryCode: suggestion.categoryCode,
        confidence: suggestion.confidence,
        reasoning: suggestion.reasoning,
        source,
        latencyMs: suggestion.latencyMs,
        strategy: suggestion.strategy
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in smart-category-suggest:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
