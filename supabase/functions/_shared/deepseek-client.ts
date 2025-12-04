/**
 * Deepseek V3 Client
 * Cost-effective mathematical reasoning and financial calculations
 * Uses deepseek-reasoner for chain-of-thought reasoning
 */

export const DEEPSEEK_MODELS = {
  CHAT: 'deepseek-chat',
  REASONER: 'deepseek-reasoner', // Best for math/financial reasoning
} as const;

export type DeepseekModel = typeof DEEPSEEK_MODELS[keyof typeof DEEPSEEK_MODELS];

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface DeepseekOptions {
  model?: DeepseekModel;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

interface DeepseekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      reasoning_content?: string; // Chain-of-thought for deepseek-reasoner
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    reasoning_tokens?: number; // Tokens used for reasoning
  };
}

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * Stream responses from Deepseek API
 */
export async function streamDeepseek(
  messages: Message[],
  options: DeepseekOptions = {}
): Promise<ReadableStream> {
  const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY not configured');
  }

  const {
    model = DEEPSEEK_MODELS.REASONER,
    maxTokens = 4096,
    temperature = 0.1, // Low temp for mathematical precision
  } = options;

  console.log('[Deepseek] Streaming request:', { model, maxTokens, temperature });

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Deepseek] API error:', response.status, errorText);
    throw new Error(`Deepseek API error: ${response.status} - ${errorText}`);
  }

  // Transform the Deepseek SSE stream to OpenAI-compatible format
  return transformDeepseekStream(response.body!);
}

/**
 * Non-streaming Deepseek call for structured responses
 */
export async function callDeepseek(
  messages: Message[],
  options: DeepseekOptions = {}
): Promise<DeepseekResponse> {
  const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY not configured');
  }

  const {
    model = DEEPSEEK_MODELS.REASONER,
    maxTokens = 4096,
    temperature = 0.1,
  } = options;

  console.log('[Deepseek] Non-streaming request:', { model, maxTokens });

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Deepseek] API error:', response.status, errorText);
    throw new Error(`Deepseek API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // Log reasoning tokens if available
  if (data.usage?.reasoning_tokens) {
    console.log('[Deepseek] Reasoning tokens used:', data.usage.reasoning_tokens);
  }

  return data;
}

/**
 * Transform Deepseek SSE stream to OpenAI-compatible format
 */
function transformDeepseekStream(inputStream: ReadableStream<Uint8Array>): ReadableStream {
  const reader = inputStream.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  return new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        
        if (done) {
          // Send final [DONE] message
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;
          
          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonStr = trimmedLine.slice(6);
              if (jsonStr === '[DONE]') continue;
              
              const data = JSON.parse(jsonStr);
              const delta = data.choices?.[0]?.delta;
              
              if (delta) {
                // Transform to OpenAI format
                const openAIChunk = {
                  id: data.id,
                  object: 'chat.completion.chunk',
                  created: data.created,
                  model: data.model,
                  choices: [{
                    index: 0,
                    delta: {
                      role: delta.role,
                      content: delta.content || '',
                      // Include reasoning content if present
                      ...(delta.reasoning_content && { reasoning_content: delta.reasoning_content })
                    },
                    finish_reason: data.choices?.[0]?.finish_reason || null
                  }]
                };
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(openAIChunk)}\n\n`));
              }
            } catch (e) {
              // Skip malformed JSON
              console.warn('[Deepseek] Failed to parse chunk:', trimmedLine);
            }
          }
        }
      } catch (error) {
        console.error('[Deepseek] Stream error:', error);
        controller.error(error);
      }
    },
    cancel() {
      reader.cancel();
    }
  });
}

/**
 * Build a financial reasoning prompt optimized for Deepseek Reasoner
 */
export function buildFinancialReasoningPrompt(
  task: string,
  data: Record<string, any>
): string {
  return `You are a financial mathematics expert. Use step-by-step reasoning to solve this problem precisely.

## Task
${task}

## Input Data
${JSON.stringify(data, null, 2)}

## Instructions
1. Analyze the input data carefully
2. Break down the problem into clear mathematical steps
3. Show all calculations with explanations
4. Provide a structured JSON result at the end

Think through this methodically, showing your reasoning at each step.`;
}

/**
 * Cost estimation for Deepseek (very cost-effective)
 * Pricing: ~$0.14/M input tokens, ~$0.28/M output tokens
 */
export function estimateDeepseekCost(
  inputTokens: number,
  outputTokens: number,
  reasoningTokens: number = 0
): number {
  const inputCost = (inputTokens / 1_000_000) * 0.14;
  const outputCost = (outputTokens / 1_000_000) * 0.28;
  const reasoningCost = (reasoningTokens / 1_000_000) * 0.28; // Same as output
  return inputCost + outputCost + reasoningCost;
}
