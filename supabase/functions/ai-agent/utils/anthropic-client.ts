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
  userId?: string
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

  console.log(`Calling Anthropic API with model: ${model}`);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }
    if (response.status === 401) {
      throw new Error('ANTHROPIC_AUTH_ERROR');
    }
    const errorText = await response.text();
    console.error('Anthropic API error:', response.status, errorText);
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  // Log tool execution if tools were provided
  if (tools && tools.length > 0 && supabase && conversationId && userId) {
    logToolExecution(response.body!, supabase, conversationId, userId, tools);
  }

  // Transform Anthropic SSE stream to match OpenAI format
  return transformAnthropicStream(response.body!);
}

/**
 * Transform Anthropic's SSE stream format to match OpenAI's format
 * This allows the rest of the system to work with a consistent stream format
 */
function transformAnthropicStream(sourceStream: ReadableStream): ReadableStream {
  const reader = sourceStream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  return new ReadableStream({
    async start(controller) {
      try {
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
                
                // Handle different event types from Anthropic
                if (parsed.type === 'content_block_delta') {
                  const delta = parsed.delta;
                  if (delta.type === 'text_delta' && delta.text) {
                    // Convert to OpenAI-style SSE format
                    const openAIFormat = {
                      choices: [{ delta: { content: delta.text } }]
                    };
                    const sseData = `data: ${JSON.stringify(openAIFormat)}\n\n`;
                    controller.enqueue(new TextEncoder().encode(sseData));
                  }
                } else if (parsed.type === 'content_block_start' && parsed.content_block?.type === 'tool_use') {
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
                  const openAIFormat = {
                    choices: [{ delta: { tool_calls: [{ function: { arguments: parsed.delta.partial_json } }] } }]
                  };
                  const sseData = `data: ${JSON.stringify(openAIFormat)}\n\n`;
                  controller.enqueue(new TextEncoder().encode(sseData));
                } else if (parsed.type === 'message_stop') {
                  const doneChunk = new TextEncoder().encode('data: [DONE]\n\n');
                  controller.enqueue(doneChunk);
                  controller.close();
                  return;
                }
              } catch (e) {
                // Ignore parse errors for partial JSON
                console.warn('Failed to parse SSE data:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Stream transformation error:', error);
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
