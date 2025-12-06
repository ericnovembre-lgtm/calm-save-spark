/**
 * Lovable AI Fallback Pattern - Shared Utility
 * Provides resilient AI responses by falling back to Lovable AI (Gemini) when Claude fails
 */

interface FallbackResult<T> {
  result: T;
  model: 'claude' | 'gemini';
  usedFallback: boolean;
  error?: string;
}

interface FallbackOptions {
  logPrefix?: string;
  maxRetries?: number;
}

/**
 * Check if an error should trigger a fallback to Lovable AI
 */
export function shouldFallback(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('anthropic') ||
      message.includes('claude') ||
      message.includes('rate_limit') ||
      message.includes('payment_required') ||
      message.includes('credits') ||
      message.includes('401') ||
      message.includes('402') ||
      message.includes('429') ||
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('api error') ||
      message.includes('not configured')
    );
  }
  return true; // Default to fallback for unknown errors
}

/**
 * Call Lovable AI (Gemini) with standard configuration
 */
export async function callLovableAI(
  messages: Array<{ role: string; content: string }>,
  options?: {
    model?: string;
    maxTokens?: number;
    stream?: boolean;
    temperature?: number;
  }
): Promise<Response> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options?.model || "google/gemini-2.5-flash",
      messages,
      stream: options?.stream ?? false,
      max_tokens: options?.maxTokens || 2048,
      ...(options?.temperature !== undefined && { temperature: options.temperature }),
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("RATE_LIMIT_EXCEEDED");
    }
    if (response.status === 402) {
      throw new Error("PAYMENT_REQUIRED");
    }
    const errorText = await response.text();
    throw new Error(`Lovable AI error: ${response.status} - ${errorText}`);
  }

  return response;
}

/**
 * Create a streaming response from Lovable AI
 */
export async function streamLovableAI(
  systemPrompt: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userMessage: string,
  options?: {
    model?: string;
    maxTokens?: number;
  }
): Promise<ReadableStream> {
  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const response = await callLovableAI(messages, {
    ...options,
    stream: true,
  });

  return response.body!;
}

/**
 * Execute a function with automatic fallback to Lovable AI on failure
 */
export async function withLovableFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn: () => Promise<T>,
  options?: FallbackOptions
): Promise<FallbackResult<T>> {
  const prefix = options?.logPrefix || '[LovableFallback]';
  
  try {
    const result = await primaryFn();
    return {
      result,
      model: 'claude',
      usedFallback: false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`${prefix} Primary AI failed: ${errorMessage}`);
    
    if (shouldFallback(error)) {
      console.log(`${prefix} Falling back to Lovable AI (Gemini)...`);
      try {
        const result = await fallbackFn();
        console.log(`${prefix} Fallback successful`);
        return {
          result,
          model: 'gemini',
          usedFallback: true,
          error: errorMessage,
        };
      } catch (fallbackError) {
        const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        console.error(`${prefix} Fallback also failed: ${fallbackMessage}`);
        throw fallbackError;
      }
    }
    
    throw error;
  }
}

/**
 * Streaming version: Execute a streaming function with automatic fallback
 */
export async function withStreamingFallback(
  primaryFn: () => Promise<ReadableStream>,
  fallbackFn: () => Promise<ReadableStream>,
  options?: FallbackOptions
): Promise<{ stream: ReadableStream; model: 'claude' | 'gemini'; usedFallback: boolean }> {
  const prefix = options?.logPrefix || '[LovableFallback]';
  
  try {
    const stream = await primaryFn();
    return {
      stream,
      model: 'claude',
      usedFallback: false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`${prefix} Primary streaming AI failed: ${errorMessage}`);
    
    if (shouldFallback(error)) {
      console.log(`${prefix} Falling back to Lovable AI streaming...`);
      try {
        const stream = await fallbackFn();
        console.log(`${prefix} Streaming fallback successful`);
        return {
          stream,
          model: 'gemini',
          usedFallback: true,
        };
      } catch (fallbackError) {
        const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        console.error(`${prefix} Streaming fallback also failed: ${fallbackMessage}`);
        throw fallbackError;
      }
    }
    
    throw error;
  }
}

/**
 * Check if Claude API is available (for health checks)
 */
export async function isClaudeAvailable(): Promise<boolean> {
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
  if (!ANTHROPIC_API_KEY) {
    return false;
  }
  
  try {
    // Simple ping to check API availability
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }],
      }),
    });
    
    // 200 = success, 429 = rate limited but API is available
    return response.status === 200 || response.status === 429;
  } catch {
    return false;
  }
}
