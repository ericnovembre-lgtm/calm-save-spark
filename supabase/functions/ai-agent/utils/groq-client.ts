/**
 * Groq LPU Client for Ultra-Fast AI Inference
 * Provides sub-100ms response times for speed-critical queries
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const GROQ_MODELS = {
  LLAMA_70B: 'llama-3.3-70b-versatile',      // Best quality, ~200ms
  LLAMA_8B: 'llama-3.1-8b-instant',          // Fastest (~50ms)
  MIXTRAL: 'mixtral-8x7b-32768'              // Good balance
} as const;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GroqOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

/**
 * Non-streaming Groq call for instant responses
 * Target latency: <100ms
 */
export async function callGroq(
  messages: Message[],
  options: GroqOptions = {}
): Promise<string> {
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const startTime = Date.now();
  
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: options.model || GROQ_MODELS.LLAMA_8B,
      messages,
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature ?? 0.3,
      stream: false
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Groq] API Error:', error);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const latency = Date.now() - startTime;
  
  console.log(`[Groq] Response in ${latency}ms (model: ${options.model || GROQ_MODELS.LLAMA_8B})`);
  
  return data.choices[0].message.content;
}

/**
 * Streaming Groq call for real-time responses
 */
export async function streamGroq(
  messages: Message[],
  options: GroqOptions = {}
): Promise<ReadableStream> {
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: options.model || GROQ_MODELS.LLAMA_8B,
      messages,
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature ?? 0.3,
      stream: true
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Groq] Stream Error:', error);
    throw new Error(`Groq API error: ${response.status}`);
  }

  // Transform Groq SSE to OpenAI-compatible format
  const reader = response.body!.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      
      if (done) {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
        return;
      }

      const chunk = decoder.decode(value);
      controller.enqueue(encoder.encode(chunk));
    },
    cancel() {
      reader.cancel();
    }
  });
}

/**
 * Ultra-fast categorization using Groq
 * Optimized for transaction classification
 */
export async function instantCategorize(
  merchantName: string,
  amount: number,
  description: string,
  categories: Array<{ code: string; name: string }>
): Promise<{
  categoryCode: string;
  confidence: number;
  reasoning: string;
  latencyMs: number;
}> {
  const startTime = Date.now();
  
  const systemPrompt = `You are an instant transaction categorizer. Respond with ONLY valid JSON.
Categories: ${categories.map(c => `${c.code}:${c.name}`).join(', ')}`;

  const userPrompt = `Categorize: "${merchantName}" $${amount} ${description || ''}
Return: {"categoryCode":"CODE","confidence":0.95,"reasoning":"brief reason"}`;

  const response = await callGroq([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    model: GROQ_MODELS.LLAMA_8B,
    maxTokens: 150,
    temperature: 0.1
  });

  const latencyMs = Date.now() - startTime;
  
  try {
    const parsed = JSON.parse(response);
    return { ...parsed, latencyMs };
  } catch {
    // Extract JSON from response if wrapped in text
    const jsonMatch = response.match(/\{[^}]+\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { ...parsed, latencyMs };
    }
    throw new Error('Failed to parse Groq response');
  }
}

/**
 * Instant transaction alert analysis
 * Analyzes transaction for anomalies in <80ms
 */
export async function instantAlertAnalysis(
  transaction: {
    merchant: string;
    amount: number;
    category?: string;
    timestamp: string;
  },
  userContext: {
    averageSpend?: number;
    usualCategories?: string[];
    recentAlerts?: number;
  }
): Promise<{
  isAnomaly: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  alertType: string | null;
  message: string;
  latencyMs: number;
}> {
  const startTime = Date.now();
  
  const systemPrompt = `You are a real-time transaction monitor. Analyze for anomalies. ONLY return valid JSON.`;

  const userPrompt = `Transaction: ${transaction.merchant} $${transaction.amount} at ${transaction.timestamp}
User avg spend: $${userContext.averageSpend || 100}
Usual categories: ${userContext.usualCategories?.join(', ') || 'various'}

Return: {"isAnomaly":false,"riskLevel":"low","alertType":null,"message":"Normal transaction"}
Or if anomaly: {"isAnomaly":true,"riskLevel":"high","alertType":"unusual_amount","message":"Spending alert: ..."}`;

  const response = await callGroq([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    model: GROQ_MODELS.LLAMA_8B,
    maxTokens: 200,
    temperature: 0.1
  });

  const latencyMs = Date.now() - startTime;
  
  try {
    const parsed = JSON.parse(response);
    return { ...parsed, latencyMs };
  } catch {
    const jsonMatch = response.match(/\{[^}]+\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { ...parsed, latencyMs };
    }
    return {
      isAnomaly: false,
      riskLevel: 'low',
      alertType: null,
      message: 'Transaction processed',
      latencyMs
    };
  }
}
