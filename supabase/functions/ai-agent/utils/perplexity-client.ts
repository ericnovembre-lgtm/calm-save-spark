/**
 * Perplexity AI Client
 * For real-time market data and current information queries
 */

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityRequest {
  model: string;
  messages: PerplexityMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  return_images?: boolean;
  return_related_questions?: boolean;
  search_domain_filter?: string[];
  search_recency_filter?: 'month' | 'week' | 'day' | 'hour';
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export const PERPLEXITY_MODELS = {
  SONAR_SMALL: 'llama-3.1-sonar-small-128k-online',
  SONAR_LARGE: 'llama-3.1-sonar-large-128k-online',
  SONAR_HUGE: 'llama-3.1-sonar-huge-128k-online'
} as const;

/**
 * Stream responses from Perplexity API for real-time market data
 */
export async function streamPerplexityResponse(
  systemPrompt: string,
  conversationHistory: PerplexityMessage[],
  userMessage: string,
  model: string = PERPLEXITY_MODELS.SONAR_SMALL
): Promise<ReadableStream> {
  const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
  
  if (!PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY not configured');
  }

  const messages: PerplexityMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  const requestBody: PerplexityRequest = {
    model,
    messages,
    max_tokens: 2000,
    temperature: 0.2,
    top_p: 0.9,
    return_images: false,
    return_related_questions: false,
    search_recency_filter: 'day', // Most recent data
    frequency_penalty: 1,
    presence_penalty: 0,
    stream: true
  };

  console.log('[Perplexity] Calling API with model:', model);

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Perplexity] API error:', response.status, errorText);
    throw new Error(`Perplexity API error: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('No response body from Perplexity');
  }

  return response.body;
}

/**
 * Non-streaming Perplexity request for simpler use cases
 */
export async function queryPerplexity(
  prompt: string,
  systemPrompt: string = 'You are a helpful financial assistant with access to real-time market data.'
): Promise<string> {
  const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
  
  if (!PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY not configured');
  }

  const requestBody: PerplexityRequest = {
    model: PERPLEXITY_MODELS.SONAR_SMALL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1000,
    temperature: 0.2,
    top_p: 0.9,
    return_images: false,
    return_related_questions: false,
    search_recency_filter: 'day',
    frequency_penalty: 1,
    presence_penalty: 0
  };

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Perplexity] API error:', response.status, errorText);
    throw new Error(`Perplexity API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Get real-time market data for specific symbols
 */
export async function getMarketData(symbols: string[]): Promise<string> {
  const query = `Get the latest price and key statistics for these financial instruments: ${symbols.join(', ')}. Include current price, 24h change, and brief market sentiment.`;
  
  return await queryPerplexity(
    query,
    'You are a financial data specialist. Provide concise, accurate market data from the most recent sources available. Always cite sources and timestamps.'
  );
}

/**
 * Get market news and sentiment
 */
export async function getMarketNews(topic: string): Promise<string> {
  const query = `Get the latest news and market sentiment about: ${topic}. Focus on credible financial sources.`;
  
  return await queryPerplexity(
    query,
    'You are a financial news analyst. Summarize recent relevant news from credible sources. Always include source attribution and publication dates.'
  );
}
