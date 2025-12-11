/**
 * LangSmith AI Monitoring Client
 * Provides tracing and observability for all AI model calls
 */

const LANGSMITH_API_URL = 'https://api.smith.langchain.com';

export interface TraceMetadata {
  userId?: string;
  conversationId?: string;
  model: string;
  modelName?: string;
  queryType?: string;
  queryLength?: number;
  estimatedCost?: number;
  tags?: string[];
}

export interface TraceRun {
  id: string;
  name: string;
  run_type: 'llm' | 'chain' | 'tool' | 'retriever';
  project_name?: string;
  parent_run_id?: string;
  start_time: string;
  end_time?: string;
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  error?: string;
  extra?: Record<string, any>;
  serialized?: Record<string, any>;
}

interface LangSmithConfig {
  apiKey: string;
  projectName: string;
}

function getConfig(): LangSmithConfig | null {
  const apiKey = Deno.env.get('LANGSMITH_API_KEY');
  const projectName = Deno.env.get('LANGSMITH_PROJECT') || 'save-plus-ai';
  
  if (!apiKey) {
    console.warn('[LangSmith] API key not configured - tracing disabled');
    return null;
  }
  
  return { apiKey, projectName };
}

/**
 * Generate a unique run ID
 */
function generateRunId(): string {
  return crypto.randomUUID();
}

/**
 * Create a trace run in LangSmith
 */
async function createRun(run: TraceRun, config: LangSmithConfig): Promise<void> {
  try {
    const response = await fetch(`${LANGSMITH_API_URL}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
      },
      body: JSON.stringify({
        ...run,
        project_name: config.projectName,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('[LangSmith] Failed to create run:', error);
    }
  } catch (error) {
    console.error('[LangSmith] Error creating run:', error);
  }
}

/**
 * Update a trace run in LangSmith
 */
async function updateRun(
  runId: string, 
  updates: Partial<TraceRun>, 
  config: LangSmithConfig
): Promise<void> {
  try {
    const response = await fetch(`${LANGSMITH_API_URL}/runs/${runId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('[LangSmith] Failed to update run:', error);
    }
  } catch (error) {
    console.error('[LangSmith] Error updating run:', error);
  }
}

/**
 * Trace an AI call with LangSmith
 * Returns the result and trace ID for correlation
 */
export async function traceAICall<T>(
  name: string,
  metadata: TraceMetadata,
  fn: () => Promise<T>,
  parentRunId?: string
): Promise<{ result: T; traceId: string }> {
  const config = getConfig();
  const traceId = generateRunId();
  const startTime = new Date().toISOString();
  
  // If LangSmith is not configured, just run the function
  if (!config) {
    const result = await fn();
    return { result, traceId };
  }
  
  // Create the trace run
  const run: TraceRun = {
    id: traceId,
    name,
    run_type: 'llm',
    project_name: config.projectName,
    parent_run_id: parentRunId,
    start_time: startTime,
    inputs: {
      model: metadata.model,
      modelName: metadata.modelName || metadata.model,
      queryType: metadata.queryType || 'unknown',
      queryLength: metadata.queryLength,
    },
    extra: {
      userId: metadata.userId,
      conversationId: metadata.conversationId,
      estimatedCost: metadata.estimatedCost,
      tags: metadata.tags || [metadata.model, metadata.queryType || 'unknown'],
    },
    serialized: {
      model: metadata.model,
    },
  };
  
  // Create run asynchronously (don't block)
  createRun(run, config);
  
  try {
    const result = await fn();
    
    // Update with success
    const endTime = new Date().toISOString();
    const latencyMs = new Date(endTime).getTime() - new Date(startTime).getTime();
    
    updateRun(traceId, {
      end_time: endTime,
      outputs: {
        success: true,
        latencyMs,
      },
      extra: {
        ...run.extra,
        latencyMs,
      },
    }, config);
    
    console.log(`[LangSmith] Trace ${name} completed in ${latencyMs}ms (ID: ${traceId})`);
    
    return { result, traceId };
  } catch (error) {
    // Update with error
    const endTime = new Date().toISOString();
    const latencyMs = new Date(endTime).getTime() - new Date(startTime).getTime();
    
    updateRun(traceId, {
      end_time: endTime,
      error: error instanceof Error ? error.message : String(error),
      outputs: {
        success: false,
        latencyMs,
      },
    }, config);
    
    console.error(`[LangSmith] Trace ${name} failed after ${latencyMs}ms:`, error);
    
    throw error;
  }
}

/**
 * Trace a streaming AI call
 * Wraps the stream to track completion
 */
export async function traceStreamingCall(
  name: string,
  metadata: TraceMetadata,
  fn: () => Promise<ReadableStream>,
  parentRunId?: string
): Promise<{ stream: ReadableStream; traceId: string }> {
  const config = getConfig();
  const traceId = generateRunId();
  const startTime = new Date().toISOString();
  
  // If LangSmith is not configured, just run the function
  if (!config) {
    const stream = await fn();
    return { stream, traceId };
  }
  
  // Create the trace run
  const run: TraceRun = {
    id: traceId,
    name,
    run_type: 'llm',
    project_name: config.projectName,
    parent_run_id: parentRunId,
    start_time: startTime,
    inputs: {
      model: metadata.model,
      modelName: metadata.modelName || metadata.model,
      queryType: metadata.queryType || 'unknown',
      queryLength: metadata.queryLength,
      streaming: true,
    },
    extra: {
      userId: metadata.userId,
      conversationId: metadata.conversationId,
      estimatedCost: metadata.estimatedCost,
      tags: metadata.tags || [metadata.model, metadata.queryType || 'unknown', 'streaming'],
    },
    serialized: {
      model: metadata.model,
    },
  };
  
  // Create run asynchronously
  createRun(run, config);
  
  let streamStartTime: number | null = null;
  let firstTokenTime: number | null = null;
  let totalChunks = 0;
  
  try {
    const originalStream = await fn();
    streamStartTime = Date.now();
    
    // Wrap stream to track completion
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        // Track first token time
        if (firstTokenTime === null) {
          firstTokenTime = Date.now();
        }
        totalChunks++;
        controller.enqueue(chunk);
      },
      flush() {
        // Stream completed - update trace
        const endTime = new Date().toISOString();
        const totalLatencyMs = streamStartTime ? Date.now() - streamStartTime : 0;
        const ttft = firstTokenTime && streamStartTime 
          ? firstTokenTime - streamStartTime 
          : null;
        
        updateRun(traceId, {
          end_time: endTime,
          outputs: {
            success: true,
            totalLatencyMs,
            timeToFirstToken: ttft,
            totalChunks,
            streaming: true,
          },
          extra: {
            ...run.extra,
            totalLatencyMs,
            timeToFirstToken: ttft,
            totalChunks,
          },
        }, config);
        
        console.log(`[LangSmith] Stream ${name} completed: ${totalLatencyMs}ms total, ${ttft}ms TTFT, ${totalChunks} chunks (ID: ${traceId})`);
      },
    });
    
    const tracedStream = originalStream.pipeThrough(transformStream);
    
    return { stream: tracedStream, traceId };
  } catch (error) {
    // Update with error
    const endTime = new Date().toISOString();
    
    updateRun(traceId, {
      end_time: endTime,
      error: error instanceof Error ? error.message : String(error),
      outputs: {
        success: false,
        streaming: true,
      },
    }, config);
    
    console.error(`[LangSmith] Stream ${name} failed:`, error);
    throw error;
  }
}

/**
 * Create a parent trace for routing decisions
 */
export async function traceRouting<T>(
  queryType: string,
  selectedModel: string,
  metadata: TraceMetadata,
  fn: () => Promise<T>
): Promise<{ result: T; traceId: string }> {
  const config = getConfig();
  const traceId = generateRunId();
  const startTime = new Date().toISOString();
  
  if (!config) {
    const result = await fn();
    return { result, traceId };
  }
  
  const run: TraceRun = {
    id: traceId,
    name: `route_${queryType}_to_${selectedModel}`,
    run_type: 'chain',
    project_name: config.projectName,
    start_time: startTime,
    inputs: {
      queryType,
      selectedModel,
      queryLength: metadata.queryLength,
    },
    extra: {
      userId: metadata.userId,
      conversationId: metadata.conversationId,
      tags: ['routing', queryType, selectedModel],
    },
  };
  
  createRun(run, config);
  
  try {
    const result = await fn();
    
    const endTime = new Date().toISOString();
    const latencyMs = new Date(endTime).getTime() - new Date(startTime).getTime();
    
    updateRun(traceId, {
      end_time: endTime,
      outputs: {
        success: true,
        latencyMs,
        routedTo: selectedModel,
      },
    }, config);
    
    return { result, traceId };
  } catch (error) {
    const endTime = new Date().toISOString();
    
    updateRun(traceId, {
      end_time: endTime,
      error: error instanceof Error ? error.message : String(error),
      outputs: { success: false },
    }, config);
    
    throw error;
  }
}

/**
 * Log a fallback event
 */
export async function logFallback(
  originalModel: string,
  fallbackModel: string,
  reason: string,
  metadata: TraceMetadata,
  parentRunId?: string
): Promise<void> {
  const config = getConfig();
  if (!config) return;
  
  const traceId = generateRunId();
  const timestamp = new Date().toISOString();
  
  const run: TraceRun = {
    id: traceId,
    name: `fallback_${originalModel}_to_${fallbackModel}`,
    run_type: 'chain',
    project_name: config.projectName,
    parent_run_id: parentRunId,
    start_time: timestamp,
    end_time: timestamp,
    inputs: {
      originalModel,
      fallbackModel,
      reason,
    },
    outputs: {
      success: true,
      type: 'fallback',
    },
    extra: {
      userId: metadata.userId,
      conversationId: metadata.conversationId,
      tags: ['fallback', originalModel, fallbackModel],
    },
  };
  
  await createRun(run, config);
  console.log(`[LangSmith] Logged fallback: ${originalModel} → ${fallbackModel} (${reason})`);
}

/**
 * Get LangSmith dashboard URL for a trace
 */
export function getTraceDashboardUrl(traceId: string): string {
  const projectName = Deno.env.get('LANGSMITH_PROJECT') || 'save-plus-ai';
  return `https://smith.langchain.com/o/default/projects/p/${projectName}?run_ids=${traceId}`;
}
