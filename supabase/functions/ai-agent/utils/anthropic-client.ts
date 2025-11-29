import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

interface ClaudeMetrics {
  requestId?: string;
  conversationId?: string;
  userId?: string;
  agentType: string;
  model: string;
  latencyMs: number;
  timeToFirstTokenMs?: number;
  totalStreamTimeMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  status: 'success' | 'error' | 'rate_limited';
  errorType?: string;
  errorMessage?: string;
  rateLimitRemaining?: number;
  rateLimitReset?: string;
  toolsUsed?: string[];
  toolCount?: number;
}

/**
 * Persist Claude API metrics to the database
 */
async function persistMetrics(supabase: SupabaseClient, metrics: ClaudeMetrics): Promise<void> {
  try {
    const { error } = await supabase.from('claude_api_metrics').insert({
      request_id: metrics.requestId,
      conversation_id: metrics.conversationId,
      user_id: metrics.userId,
      agent_type: metrics.agentType,
      model: metrics.model,
      latency_ms: metrics.latencyMs,
      time_to_first_token_ms: metrics.timeToFirstTokenMs,
      total_stream_time_ms: metrics.totalStreamTimeMs,
      input_tokens: metrics.inputTokens,
      output_tokens: metrics.outputTokens,
      total_tokens: metrics.totalTokens,
      status: metrics.status,
      error_type: metrics.errorType,
      error_message: metrics.errorMessage,
      rate_limit_remaining: metrics.rateLimitRemaining,
      rate_limit_reset: metrics.rateLimitReset,
      tools_used: metrics.toolsUsed,
      tool_count: metrics.toolCount || 0,
    });

    if (error) {
      console.error('[Anthropic Metrics] Failed to persist metrics:', error);
    } else {
      console.log('[Anthropic Metrics] Metrics persisted successfully');
    }
  } catch (err) {
    console.error('[Anthropic Metrics] Error persisting metrics:', err);
  }
}

/**
 * Convert OpenAI-style tools to Claude format
 */
function convertToolsToClaude(openAITools: any[]): ToolDefinition[] {
  return openAITools.map(tool => ({
    name: tool.function.name,
    description: tool.function.description,
    input_schema: {
      type: "object",
      properties: tool.function.parameters.properties,
      required: tool.function.parameters.required || []
    }
  }));
}

export async function streamAnthropicResponse(
  systemPrompt: string,
  conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  userMessage: string,
  model: string = 'claude-sonnet-4-5',
  tools?: any[],
  supabase?: SupabaseClient,
  conversationId?: string,
  userId?: string,
  agentType: string = 'unknown'
): Promise<ReadableStream> {
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  // Filter out system messages - Claude uses a separate system parameter
  const messages = conversationHistory
    .filter(msg => msg.role !== 'system')
    .concat({ role: 'user' as const, content: userMessage });

  // Build request body
  const requestBody: any = {
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages,
    stream: true
  };

  // Add tools if provided
  if (tools && tools.length > 0) {
    requestBody.tools = convertToolsToClaude(tools);
  }

  // ===== REQUEST-LEVEL LOGGING =====
  const requestStartTime = Date.now();
  console.log('[Anthropic] ===== New Request =====');
  console.log('[Anthropic] Timestamp:', new Date().toISOString());
  console.log('[Anthropic] Model:', model);
  console.log('[Anthropic] Agent Type:', agentType);
  console.log('[Anthropic] Messages:', messages.length);
  console.log('[Anthropic] System prompt length:', systemPrompt.length, 'chars');
  console.log('[Anthropic] Tools:', tools ? tools.map(t => t.function?.name).join(', ') : 'none');
  console.log('[Anthropic] Conversation ID:', conversationId || 'none');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(requestBody),
  });

  // ===== RESPONSE-LEVEL LOGGING =====
  const requestEndTime = Date.now();
  const requestLatency = requestEndTime - requestStartTime;
  const rateLimitRemaining = response.headers.get('anthropic-ratelimit-requests-remaining');
  const rateLimitReset = response.headers.get('anthropic-ratelimit-requests-reset');
  const requestId = response.headers.get('request-id');
  
  console.log('[Anthropic] Response status:', response.status);
  console.log('[Anthropic] Request duration:', requestLatency, 'ms');
  console.log('[Anthropic] Rate limit remaining:', rateLimitRemaining);
  console.log('[Anthropic] Rate limit reset:', rateLimitReset);
  console.log('[Anthropic] Request ID:', requestId);

  if (!response.ok) {
    const errorBody = await response.text();
    
    // ===== ERROR CLASSIFICATION LOGGING =====
    console.error('[Anthropic Error] ===== API Error =====');
    console.error('[Anthropic Error] Status:', response.status);
    console.error('[Anthropic Error] Status Text:', response.statusText);
    console.error('[Anthropic Error] Body:', errorBody);
    console.error('[Anthropic Error] Model:', model);
    console.error('[Anthropic Error] Request ID:', requestId);
    console.error('[Anthropic Error] Request duration:', requestLatency, 'ms');
    
    // Persist error metrics
    if (supabase) {
      const errorType = response.status === 429 ? 'rate_limit' : 
                        response.status === 401 ? 'auth_error' : 
                        response.status >= 500 ? 'server_error' : 'request_error';
      
      await persistMetrics(supabase, {
        requestId: requestId || undefined,
        conversationId,
        userId,
        agentType,
        model,
        latencyMs: requestLatency,
        status: response.status === 429 ? 'rate_limited' : 'error',
        errorType,
        errorMessage: errorBody.slice(0, 500),
        rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining) : undefined,
        rateLimitReset: rateLimitReset || undefined,
      });
    }
    
    if (response.status === 429) {
      console.error('[Anthropic Error] Type: RATE_LIMIT - Too many requests');
      throw new Error('RATE_LIMIT_EXCEEDED');
    }
    if (response.status === 401) {
      console.error('[Anthropic Error] Type: AUTH_ERROR - Invalid API key');
      throw new Error('ANTHROPIC_AUTH_ERROR');
    }
    if (response.status === 400) {
      console.error('[Anthropic Error] Type: INVALID_REQUEST - Bad request parameters');
    }
    if (response.status >= 500) {
      console.error('[Anthropic Error] Type: SERVER_ERROR - Anthropic service issue');
    }
    
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  // Log tool execution if tools were provided
  if (tools && tools.length > 0 && supabase && conversationId && userId) {
    logToolExecution(response.body!, supabase, conversationId, userId, tools);
  }

  // Transform Anthropic SSE stream to match OpenAI format with metrics tracking
  return transformAnthropicStream(response.body!, {
    supabase,
    requestId: requestId || undefined,
    conversationId,
    userId,
    agentType,
    model,
    requestStartTime,
    rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining) : undefined,
    rateLimitReset: rateLimitReset || undefined,
    toolNames: tools?.map(t => t.function?.name).filter(Boolean) || [],
  });
}

/**
 * Transform Anthropic's SSE stream format to match OpenAI's format
 * This allows the rest of the system to work with a consistent stream format
 */
function transformAnthropicStream(
  sourceStream: ReadableStream,
  options?: {
    supabase?: SupabaseClient;
    requestId?: string;
    conversationId?: string;
    userId?: string;
    agentType?: string;
    model?: string;
    requestStartTime?: number;
    rateLimitRemaining?: number;
    rateLimitReset?: string;
    toolNames?: string[];
  }
): ReadableStream {
  const reader = sourceStream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  
  // ===== PERFORMANCE METRICS TRACKING =====
  const streamStartTime = Date.now();
  let firstTokenTime: number | null = null;
  let chunkCount = 0;
  let totalTokensInput = 0;
  let totalTokensOutput = 0;
  const toolsUsed: string[] = [];

  return new ReadableStream({
    async start(controller) {
      try {
        console.log('[Anthropic Stream] ===== Stream Started =====');
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // Send [DONE] signal in OpenAI format
            const doneChunk = new TextEncoder().encode('data: [DONE]\n\n');
            controller.enqueue(doneChunk);
            controller.close();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim() || line.startsWith(':')) continue;
            
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                const doneChunk = new TextEncoder().encode('data: [DONE]\n\n');
                controller.enqueue(doneChunk);
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                
                // ===== STREAM EVENT LOGGING =====
                if (parsed.type === 'message_start') {
                  console.log('[Anthropic Stream] Message started');
                  console.log('[Anthropic Stream] Model:', parsed.message?.model);
                  if (parsed.message?.usage) {
                    totalTokensInput = parsed.message.usage.input_tokens || 0;
                    console.log('[Anthropic Stream] Input tokens:', totalTokensInput);
                  }
                }
                
                if (parsed.type === 'content_block_start') {
                  console.log('[Anthropic Stream] Content block started, type:', parsed.content_block?.type);
                  if (parsed.index !== undefined) {
                    console.log('[Anthropic Stream] Block index:', parsed.index);
                  }
                }
                
                // Handle different event types from Anthropic
                if (parsed.type === 'content_block_delta') {
                  const delta = parsed.delta;
                  if (delta.type === 'text_delta' && delta.text) {
                    // Track first token timing
                    if (!firstTokenTime) {
                      firstTokenTime = Date.now();
                      console.log('[Anthropic Perf] Time to first token:', firstTokenTime - streamStartTime, 'ms');
                    }
                    
                    chunkCount++;
                    
                    // Convert to OpenAI-style SSE format
                    const openAIFormat = {
                      choices: [{ delta: { content: delta.text } }]
                    };
                    const sseData = `data: ${JSON.stringify(openAIFormat)}\n\n`;
                    controller.enqueue(new TextEncoder().encode(sseData));
                  }
                } else if (parsed.type === 'content_block_start' && parsed.content_block?.type === 'tool_use') {
                  // ===== TOOL CALL LOGGING =====
                  console.log('[Anthropic Tool] Tool call started');
                  console.log('[Anthropic Tool] Tool name:', parsed.content_block.name);
                  console.log('[Anthropic Tool] Tool ID:', parsed.content_block.id);
                  
                  // Track tool usage
                  if (parsed.content_block.name) {
                    toolsUsed.push(parsed.content_block.name);
                  }
                  
                  // Handle tool calls - transform to OpenAI format
                  const toolCall = {
                    id: parsed.content_block.id,
                    type: 'function',
                    function: {
                      name: parsed.content_block.name,
                      arguments: ''
                    }
                  };
                  const openAIFormat = {
                    choices: [{ delta: { tool_calls: [toolCall] } }]
                  };
                  const sseData = `data: ${JSON.stringify(openAIFormat)}\n\n`;
                  controller.enqueue(new TextEncoder().encode(sseData));
                } else if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'input_json_delta') {
                  // Handle tool call arguments streaming
                  const argsPreview = parsed.delta.partial_json?.slice(0, 100) || '';
                  console.log('[Anthropic Tool] Tool arguments chunk:', argsPreview.length, 'chars');
                  
                  const openAIFormat = {
                    choices: [{ delta: { tool_calls: [{ function: { arguments: parsed.delta.partial_json } }] } }]
                  };
                  const sseData = `data: ${JSON.stringify(openAIFormat)}\n\n`;
                  controller.enqueue(new TextEncoder().encode(sseData));
                } else if (parsed.type === 'message_delta') {
                  console.log('[Anthropic Stream] Message delta');
                  if (parsed.delta?.stop_reason) {
                    console.log('[Anthropic Stream] Stop reason:', parsed.delta.stop_reason);
                  }
                  if (parsed.usage?.output_tokens) {
                    totalTokensOutput = parsed.usage.output_tokens;
                    console.log('[Anthropic Stream] Output tokens:', totalTokensOutput);
                  }
                } else if (parsed.type === 'message_stop') {
                  // ===== PERFORMANCE METRICS LOGGING =====
                  const totalTime = Date.now() - streamStartTime;
                  const totalRequestTime = options?.requestStartTime ? Date.now() - options.requestStartTime : totalTime;
                  
                  console.log('[Anthropic Stream] ===== Stream Complete =====');
                  console.log('[Anthropic Perf] Total chunks:', chunkCount);
                  console.log('[Anthropic Perf] Total time:', totalTime, 'ms');
                  console.log('[Anthropic Perf] Input tokens:', totalTokensInput);
                  console.log('[Anthropic Perf] Output tokens:', totalTokensOutput);
                  console.log('[Anthropic Perf] Total tokens:', totalTokensInput + totalTokensOutput);
                  if (chunkCount > 0 && totalTime > 0) {
                    console.log('[Anthropic Perf] Avg ms per chunk:', (totalTime / chunkCount).toFixed(2));
                  }
                  if (totalTokensOutput > 0 && firstTokenTime) {
                    const tokensPerSec = (totalTokensOutput / ((totalTime - (firstTokenTime - streamStartTime)) / 1000)).toFixed(2);
                    console.log('[Anthropic Perf] Tokens per second:', tokensPerSec);
                  }
                  
                  // Persist success metrics
                  if (options?.supabase) {
                    persistMetrics(options.supabase, {
                      requestId: options.requestId,
                      conversationId: options.conversationId,
                      userId: options.userId,
                      agentType: options.agentType || 'unknown',
                      model: options.model || 'claude-sonnet-4-5',
                      latencyMs: totalRequestTime,
                      timeToFirstTokenMs: firstTokenTime ? firstTokenTime - streamStartTime : undefined,
                      totalStreamTimeMs: totalTime,
                      inputTokens: totalTokensInput,
                      outputTokens: totalTokensOutput,
                      totalTokens: totalTokensInput + totalTokensOutput,
                      status: 'success',
                      rateLimitRemaining: options.rateLimitRemaining,
                      rateLimitReset: options.rateLimitReset,
                      toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
                      toolCount: toolsUsed.length,
                    });
                  }
                  
                  const doneChunk = new TextEncoder().encode('data: [DONE]\n\n');
                  controller.enqueue(doneChunk);
                  controller.close();
                  return;
                }
              } catch (e) {
                // Ignore parse errors for partial JSON
                console.warn('[Anthropic Stream] Failed to parse SSE data:', e);
              }
            }
          }
        }
      } catch (error) {
        // ===== STREAM ERROR LOGGING =====
        console.error('[Anthropic Stream Error] ===== Stream Failed =====');
        console.error('[Anthropic Stream Error] Error:', error);
        console.error('[Anthropic Stream Error] Chunks received before error:', chunkCount);
        console.error('[Anthropic Stream Error] Time before error:', Date.now() - streamStartTime, 'ms');
        
        // Persist error metrics
        if (options?.supabase) {
          const totalTime = Date.now() - streamStartTime;
          persistMetrics(options.supabase, {
            requestId: options.requestId,
            conversationId: options.conversationId,
            userId: options.userId,
            agentType: options.agentType || 'unknown',
            model: options.model || 'claude-sonnet-4-5',
            latencyMs: options.requestStartTime ? Date.now() - options.requestStartTime : totalTime,
            timeToFirstTokenMs: firstTokenTime ? firstTokenTime - streamStartTime : undefined,
            totalStreamTimeMs: totalTime,
            inputTokens: totalTokensInput,
            outputTokens: totalTokensOutput,
            totalTokens: totalTokensInput + totalTokensOutput,
            status: 'error',
            errorType: 'stream_error',
            errorMessage: error instanceof Error ? error.message : 'Stream processing error',
          });
        }
        
        controller.error(error);
      }
    }
  });
}

async function logToolExecution(
  stream: ReadableStream,
  supabase: SupabaseClient,
  conversationId: string,
  userId: string,
  availableTools: any[]
): Promise<void> {
  const startTime = Date.now();
  
  try {
    await supabase.from('tool_execution_logs').insert({
      conversation_id: conversationId,
      tool_name: 'anthropic_ui_tools_available',
      input_params: { tools: availableTools.map(t => t.function?.name) },
      execution_time_ms: Date.now() - startTime,
      success: true
    });
  } catch (error) {
    console.error('Error logging tool execution:', error);
  }
}

/**
 * Health check for Anthropic Claude API
 * Tests API key validity and Claude model responsiveness
 */
export async function checkAnthropicHealth(): Promise<{
  status: 'healthy' | 'unhealthy' | 'degraded';
  apiKeyConfigured: boolean;
  apiKeyValid: boolean;
  modelResponding: boolean;
  latencyMs: number;
  model: string;
  error?: string;
  rateLimitReset?: string;
  timestamp: string;
}> {
  const startTime = Date.now();
  const model = 'claude-sonnet-4-5';
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
  
  console.log('[Anthropic Health] ===== Health Check Started =====');
  console.log('[Anthropic Health] Timestamp:', new Date().toISOString());
  
  // Check if API key exists
  if (!ANTHROPIC_API_KEY) {
    console.error('[Anthropic Health] FAILED: API key not configured');
    return {
      status: 'unhealthy',
      apiKeyConfigured: false,
      apiKeyValid: false,
      modelResponding: false,
      latencyMs: Date.now() - startTime,
      model,
      error: 'ANTHROPIC_API_KEY not configured',
      timestamp: new Date().toISOString()
    };
  }
  
  console.log('[Anthropic Health] API key configured:', ANTHROPIC_API_KEY.slice(0, 8) + '...');
  
  try {
    // Make minimal test request to Claude (non-streaming for simplicity)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }]
      })
    });
    
    const latencyMs = Date.now() - startTime;
    console.log('[Anthropic Health] Response received, status:', response.status);
    console.log('[Anthropic Health] Latency:', latencyMs, 'ms');
    
    // Handle 401 - Invalid API key
    if (response.status === 401) {
      console.error('[Anthropic Health] FAILED: Invalid API key (401)');
      return {
        status: 'unhealthy',
        apiKeyConfigured: true,
        apiKeyValid: false,
        modelResponding: false,
        latencyMs,
        model,
        error: 'Invalid API key - authentication failed',
        timestamp: new Date().toISOString()
      };
    }
    
    // Handle 429 - Rate limited
    if (response.status === 429) {
      const resetHeader = response.headers.get('anthropic-ratelimit-requests-reset');
      console.warn('[Anthropic Health] DEGRADED: Rate limited (429)');
      console.warn('[Anthropic Health] Reset time:', resetHeader);
      return {
        status: 'degraded',
        apiKeyConfigured: true,
        apiKeyValid: true,
        modelResponding: false,
        latencyMs,
        model,
        error: 'Rate limited - try again later',
        rateLimitReset: resetHeader || undefined,
        timestamp: new Date().toISOString()
      };
    }
    
    // Handle 400 - Bad request
    if (response.status === 400) {
      const errorBody = await response.text();
      console.error('[Anthropic Health] FAILED: Bad request (400)');
      console.error('[Anthropic Health] Error body:', errorBody);
      return {
        status: 'unhealthy',
        apiKeyConfigured: true,
        apiKeyValid: true,
        modelResponding: false,
        latencyMs,
        model,
        error: 'Bad request - API configuration issue',
        timestamp: new Date().toISOString()
      };
    }
    
    // Handle 500+ - Server errors
    if (response.status >= 500) {
      const errorBody = await response.text();
      console.error('[Anthropic Health] FAILED: Server error (500+)');
      console.error('[Anthropic Health] Error body:', errorBody);
      return {
        status: 'unhealthy',
        apiKeyConfigured: true,
        apiKeyValid: true,
        modelResponding: false,
        latencyMs,
        model,
        error: 'Anthropic service error',
        timestamp: new Date().toISOString()
      };
    }
    
    // Handle success
    if (response.ok) {
      const responseData = await response.json();
      console.log('[Anthropic Health] SUCCESS: Claude responding correctly');
      console.log('[Anthropic Health] Response ID:', responseData.id);
      console.log('[Anthropic Health] Usage:', responseData.usage);
      
      return {
        status: 'healthy',
        apiKeyConfigured: true,
        apiKeyValid: true,
        modelResponding: true,
        latencyMs,
        model,
        timestamp: new Date().toISOString()
      };
    }
    
    // Unexpected status
    console.error('[Anthropic Health] FAILED: Unexpected status', response.status);
    return {
      status: 'unhealthy',
      apiKeyConfigured: true,
      apiKeyValid: true,
      modelResponding: false,
      latencyMs,
      model,
      error: `Unexpected response status: ${response.status}`,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    console.error('[Anthropic Health] FAILED: Network or request error');
    console.error('[Anthropic Health] Error:', error);
    
    return {
      status: 'unhealthy',
      apiKeyConfigured: true,
      apiKeyValid: true,
      modelResponding: false,
      latencyMs,
      model,
      error: error instanceof Error ? error.message : 'Network error',
      timestamp: new Date().toISOString()
    };
  }
}
