/**
 * xAI Grok Client
 * Real-time market sentiment analysis and social financial trends
 * API endpoint: https://api.x.ai/v1/chat/completions (OpenAI-compatible)
 */

const XAI_API_URL = "https://api.x.ai/v1/chat/completions";

export const GROK_MODELS = {
  GROK_3_FAST: "grok-3-fast",      // Fast filtering and quick responses
  GROK_3_MINI: "grok-3-mini",      // Balanced reasoning
  GROK_4: "grok-4"                  // Latest and most capable
} as const;

export type GrokModel = typeof GROK_MODELS[keyof typeof GROK_MODELS];

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GrokOptions {
  model?: GrokModel;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

interface SentimentResult {
  ticker: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number; // -100 to 100
  confidence: number; // 0 to 1
  summary: string;
  trending_topics: string[];
  volume_indicator: 'low' | 'moderate' | 'high' | 'viral';
}

/**
 * Stream response from Grok API
 */
export async function streamGrok(
  messages: Message[],
  options: GrokOptions = {}
): Promise<ReadableStream> {
  const apiKey = Deno.env.get("XAI_API_KEY");
  
  if (!apiKey) {
    throw new Error("XAI_API_KEY is not configured");
  }

  const {
    model = GROK_MODELS.GROK_3_FAST,
    maxTokens = 2048,
    temperature = 0.7,
    stream = true
  } = options;

  console.log(`[Grok Client] Streaming with model: ${model}`);

  const response = await fetch(XAI_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      stream
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Grok Client] API error: ${response.status}`, errorText);
    throw new Error(`Grok API error: ${response.status} - ${errorText}`);
  }

  if (!response.body) {
    throw new Error("No response body from Grok API");
  }

  // Transform xAI stream to standard format
  return transformGrokStream(response.body);
}

/**
 * Transform Grok SSE stream to standard format
 */
function transformGrokStream(inputStream: ReadableStream): ReadableStream {
  const reader = inputStream.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        
        if (done) {
          controller.close();
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              continue;
            }
            try {
              const parsed = JSON.parse(data);
              // Transform to standard OpenAI format if needed
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(parsed)}\n\n`));
            } catch {
              // Pass through if already valid
              controller.enqueue(encoder.encode(line + '\n'));
            }
          }
        }
      } catch (error) {
        console.error('[Grok Client] Stream error:', error);
        controller.error(error);
      }
    },
    cancel() {
      reader.cancel();
    }
  });
}

/**
 * Non-streaming call to Grok API
 */
export async function callGrok(
  messages: Message[],
  options: GrokOptions = {}
): Promise<string> {
  const apiKey = Deno.env.get("XAI_API_KEY");
  
  if (!apiKey) {
    throw new Error("XAI_API_KEY is not configured");
  }

  const {
    model = GROK_MODELS.GROK_3_FAST,
    maxTokens = 2048,
    temperature = 0.7
  } = options;

  const response = await fetch(XAI_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Grok API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Analyze social sentiment for a ticker or topic
 */
export async function analyzeSocialSentiment(
  ticker: string,
  context?: string
): Promise<SentimentResult> {
  const systemPrompt = `You are a financial sentiment analyst with access to real-time social media data and market discussions. Analyze the current social sentiment for the given ticker or topic.

Return your analysis as JSON with this exact structure:
{
  "ticker": "string",
  "sentiment": "bullish" | "bearish" | "neutral",
  "score": number (-100 to 100, where -100 is extremely bearish, 100 is extremely bullish),
  "confidence": number (0 to 1),
  "summary": "string (brief summary of sentiment drivers)",
  "trending_topics": ["array of related trending topics"],
  "volume_indicator": "low" | "moderate" | "high" | "viral"
}`;

  const userPrompt = `Analyze the current social media sentiment for: ${ticker}${context ? `\n\nAdditional context: ${context}` : ''}

Consider:
- Recent social media discussions and posts
- Trending hashtags and topics
- Retail investor sentiment
- News catalysts affecting sentiment
- Volume of discussions (low/moderate/high/viral)

Return ONLY valid JSON.`;

  const response = await callGrok([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    model: GROK_MODELS.GROK_3_MINI,
    temperature: 0.3
  });

  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as SentimentResult;
    }
    throw new Error('No JSON found in response');
  } catch (error) {
    console.error('[Grok Client] Failed to parse sentiment:', error);
    // Return neutral fallback
    return {
      ticker,
      sentiment: 'neutral',
      score: 0,
      confidence: 0.5,
      summary: 'Unable to analyze sentiment at this time.',
      trending_topics: [],
      volume_indicator: 'moderate'
    };
  }
}

/**
 * Detect trending financial topics
 */
export async function detectTrendingTopics(
  category: 'stocks' | 'crypto' | 'economy' | 'all' = 'all'
): Promise<{ topics: string[]; summary: string }> {
  const systemPrompt = `You are a financial trend analyst. Identify the most discussed financial topics on social media right now.

Return as JSON:
{
  "topics": ["array of trending topics with brief context"],
  "summary": "brief overview of current market sentiment themes"
}`;

  const userPrompt = `What are the top trending financial topics on social media right now?
Category focus: ${category}

Consider:
- Hot stock discussions
- Crypto movements
- Economic news driving conversation
- Retail investor focus areas
- Viral financial content

Return ONLY valid JSON.`;

  const response = await callGrok([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    model: GROK_MODELS.GROK_3_FAST,
    temperature: 0.5
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON found');
  } catch {
    return {
      topics: [],
      summary: 'Unable to detect trending topics at this time.'
    };
  }
}

/**
 * Generate investment sentiment score for multiple tickers
 */
export async function batchSentimentScore(
  tickers: string[]
): Promise<Array<{ ticker: string; score: number; sentiment: string }>> {
  if (tickers.length === 0) return [];

  const systemPrompt = `You are a sentiment scoring system. Rate social media sentiment for each ticker.

Return as JSON array:
[
  { "ticker": "SYMBOL", "score": number (-100 to 100), "sentiment": "bullish|bearish|neutral" }
]`;

  const response = await callGrok([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Score sentiment for: ${tickers.join(', ')}\n\nReturn ONLY valid JSON array.` }
  ], {
    model: GROK_MODELS.GROK_3_FAST,
    temperature: 0.3
  });

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON array found');
  } catch {
    return tickers.map(ticker => ({
      ticker,
      score: 0,
      sentiment: 'neutral'
    }));
  }
}
