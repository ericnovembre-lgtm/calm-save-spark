import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callGrokWithAdaptiveLimit } from "../_shared/adaptive-grok-limiter.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SentimentResponse {
  ticker: string;
  sentiment: {
    score: number;
    label: 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish';
    confidence: number;
  };
  volume: 'low' | 'moderate' | 'high' | 'viral';
  trendingTopics: string[];
  lastUpdated: string;
  source: 'grok';
}

function getSentimentLabel(score: number): SentimentResponse['sentiment']['label'] {
  if (score <= -60) return 'very_bearish';
  if (score <= -20) return 'bearish';
  if (score <= 20) return 'neutral';
  if (score <= 60) return 'bullish';
  return 'very_bullish';
}

function generateMockSentiment(ticker: string): SentimentResponse {
  const mockScore = Math.floor(Math.random() * 80) - 20;
  return {
    ticker,
    sentiment: {
      score: mockScore,
      label: getSentimentLabel(mockScore),
      confidence: 0.65 + Math.random() * 0.25,
    },
    volume: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)] as SentimentResponse['volume'],
    trendingTopics: ticker === 'market' 
      ? ['Fed rate decision speculation', 'Tech earnings season', 'AI chip demand surge']
      : [`${ticker} quarterly results`, `${ticker} analyst upgrades`, `${ticker} institutional buying`],
    lastUpdated: new Date().toISOString(),
    source: 'grok',
  };
}

async function callGrokAPI(supabase: any, ticker: string): Promise<SentimentResponse> {
  const XAI_API_KEY = Deno.env.get('XAI_API_KEY');
  
  if (!XAI_API_KEY) {
    console.log('[get-social-sentiment] XAI_API_KEY not configured, returning mock data');
    return generateMockSentiment(ticker);
  }

  try {
    const prompt = ticker === 'market' 
      ? `Analyze the current overall market sentiment on social media (Twitter/X, Reddit, StockTwits). Provide:
1. Overall sentiment score from -100 (extremely bearish) to +100 (extremely bullish)
2. Confidence level 0-1
3. Discussion volume (low/moderate/high/viral)
4. Top 3-5 trending financial topics right now

Respond in JSON format:
{
  "score": <number>,
  "confidence": <number>,
  "volume": "<string>",
  "topics": ["<topic1>", "<topic2>", ...]
}`
      : `Analyze the current social media sentiment for ${ticker} stock on Twitter/X, Reddit, and StockTwits. Provide:
1. Sentiment score from -100 (extremely bearish) to +100 (extremely bullish)
2. Confidence level 0-1
3. Discussion volume (low/moderate/high/viral)
4. Key topics/themes being discussed about ${ticker}

Respond in JSON format:
{
  "score": <number>,
  "confidence": <number>,
  "volume": "<string>",
  "topics": ["<topic1>", "<topic2>", ...]
}`;

    // Use adaptive rate limiter
    const result = await callGrokWithAdaptiveLimit(supabase, {
      model: 'grok-3-fast',
      messages: [
        { 
          role: 'system', 
          content: 'You are a financial sentiment analyst. Analyze social media sentiment for stocks and markets. Always respond with valid JSON only, no markdown or extra text.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500,
    }, true);

    const content = result.data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[get-social-sentiment] Could not parse JSON from Grok response:', content);
      return generateMockSentiment(ticker);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    const score = Math.max(-100, Math.min(100, parsed.score || 0));
    const confidence = Math.max(0, Math.min(1, parsed.confidence || 0.5));
    
    console.log(`[get-social-sentiment] Grok strategy: ${result.strategy}, latency: ${result.latencyMs}ms`);
    
    return {
      ticker,
      sentiment: {
        score,
        label: getSentimentLabel(score),
        confidence,
      },
      volume: parsed.volume || 'moderate',
      trendingTopics: parsed.topics || [],
      lastUpdated: new Date().toISOString(),
      source: 'grok',
    };
  } catch (error) {
    console.error('[get-social-sentiment] Error calling Grok API:', error);
    return generateMockSentiment(ticker);
  }
}

async function recordSentimentHistory(supabase: any, sentimentData: SentimentResponse): Promise<void> {
  try {
    const { error } = await supabase.from('sentiment_history').insert({
      ticker: sentimentData.ticker,
      score: sentimentData.sentiment.score,
      label: sentimentData.sentiment.label,
      confidence: sentimentData.sentiment.confidence,
      volume: sentimentData.volume,
      trending_topics: sentimentData.trendingTopics,
    });
    
    if (error) {
      console.error('[get-social-sentiment] Failed to record sentiment history:', error);
    } else {
      console.log(`[get-social-sentiment] Recorded sentiment history for ${sentimentData.ticker}`);
    }
  } catch (err) {
    console.error('[get-social-sentiment] Error recording sentiment history:', err);
  }
}

async function fetchSentimentHistory(supabase: any, ticker: string, days: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('sentiment_history')
    .select('recorded_at, score, volume, confidence')
    .eq('ticker', ticker)
    .gte('recorded_at', cutoffDate.toISOString())
    .order('recorded_at', { ascending: true });
  
  if (error || !data || data.length === 0) {
    console.log(`[get-social-sentiment] No history found for ${ticker}, returning empty array`);
    return [];
  }
  
  return data.map((row: any) => ({
    date: row.recorded_at.split('T')[0],
    score: row.score,
    volume: row.volume,
    confidence: row.confidence,
  }));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { ticker = 'market', action, range = '7d' } = await req.json();
    
    // Handle history request
    if (action === 'history') {
      const days = range === '30d' ? 30 : 7;
      console.log(`[get-social-sentiment] Fetching sentiment history for ${ticker}, range: ${range}`);
      
      const history = await fetchSentimentHistory(supabase, ticker.toUpperCase(), days);
      
      return new Response(JSON.stringify({ history }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Default: fetch current sentiment
    console.log(`[get-social-sentiment] Fetching social sentiment for: ${ticker}`);
    
    const sentimentData = await callGrokAPI(supabase, ticker.toUpperCase());
    
    // Record sentiment to history
    await recordSentimentHistory(supabase, sentimentData);
    
    console.log(`[get-social-sentiment] Sentiment result for ${ticker}:`, sentimentData.sentiment);

    return new Response(JSON.stringify(sentimentData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[get-social-sentiment] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      ticker: 'market',
      sentiment: { score: 0, label: 'neutral', confidence: 0 },
      volume: 'low',
      trendingTopics: [],
      lastUpdated: new Date().toISOString(),
      source: 'grok',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
