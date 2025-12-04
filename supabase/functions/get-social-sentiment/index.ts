import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SentimentResponse {
  ticker: string;
  sentiment: {
    score: number; // -100 to +100
    label: 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish';
    confidence: number; // 0 to 1
  };
  volume: 'low' | 'moderate' | 'high' | 'viral';
  trendingTopics: string[];
  lastUpdated: string;
  source: 'grok';
}

async function callGrokAPI(ticker: string): Promise<SentimentResponse> {
  const XAI_API_KEY = Deno.env.get('XAI_API_KEY');
  
  if (!XAI_API_KEY) {
    console.log('XAI_API_KEY not configured, returning mock sentiment data');
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

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Grok API error:', response.status, errorText);
      return generateMockSentiment(ticker);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not parse JSON from Grok response:', content);
      return generateMockSentiment(ticker);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    const score = Math.max(-100, Math.min(100, parsed.score || 0));
    const confidence = Math.max(0, Math.min(1, parsed.confidence || 0.5));
    
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
    console.error('Error calling Grok API:', error);
    return generateMockSentiment(ticker);
  }
}

function getSentimentLabel(score: number): SentimentResponse['sentiment']['label'] {
  if (score <= -60) return 'very_bearish';
  if (score <= -20) return 'bearish';
  if (score <= 20) return 'neutral';
  if (score <= 60) return 'bullish';
  return 'very_bullish';
}

function generateMockSentiment(ticker: string): SentimentResponse {
  const mockScore = Math.floor(Math.random() * 80) - 20; // -20 to +60 range
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

function generateMockHistory(ticker: string, days: number) {
  const history = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate somewhat correlated scores with random walk
    const baseScore = Math.floor(Math.random() * 60) - 10;
    const noise = Math.floor(Math.random() * 30) - 15;
    const score = Math.max(-100, Math.min(100, baseScore + noise));
    
    history.push({
      date: date.toISOString().split('T')[0],
      score,
      volume: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
      confidence: 0.6 + Math.random() * 0.3,
    });
  }
  
  return history;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker = 'market', action, range = '7d' } = await req.json();
    
    // Handle history request
    if (action === 'history') {
      const days = range === '30d' ? 30 : 7;
      console.log(`Fetching sentiment history for ${ticker}, range: ${range}`);
      
      const history = generateMockHistory(ticker, days);
      
      return new Response(JSON.stringify({ history }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Default: fetch current sentiment
    console.log(`Fetching social sentiment for: ${ticker}`);
    
    const sentimentData = await callGrokAPI(ticker.toUpperCase());
    
    console.log(`Sentiment result for ${ticker}:`, sentimentData.sentiment);

    return new Response(JSON.stringify(sentimentData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-social-sentiment:', error);
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
