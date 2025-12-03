/**
 * Intelligent Model Router
 * Routes queries to optimal AI model based on classification
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { classifyQuery, applyClassificationOverrides, logClassification, ModelRoute } from "./query-classifier.ts";
import { streamAIResponse } from "./ai-client.ts";
import { streamPerplexityResponse } from "./perplexity-client.ts";
import { streamOpenAI, GPT5_MODEL, DOCUMENT_ANALYSIS_SYSTEM_PROMPT } from "./openai-client.ts";
import { CLAUDE_MAIN_BRAIN, CLAUDE_35_SONNET } from "./ai-client.ts";
import { streamGroq, GROQ_MODELS } from "./groq-client.ts";
import { injectModelMetadata } from "./stream-enhancer.ts";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RouterOptions {
  systemPrompt: string;
  conversationHistory: Message[];
  userMessage: string;
  tools?: any[];
  supabase?: SupabaseClient;
  conversationId?: string;
  userId?: string;
  userTier?: 'free' | 'pro' | 'premium';
  forceModel?: ModelRoute;
  hasAttachment?: boolean;
}

/**
 * Main routing function - intelligently selects and calls the optimal model
 */
export async function routeToOptimalModel(options: RouterOptions): Promise<ReadableStream> {
  const {
    systemPrompt,
    conversationHistory,
    userMessage,
    tools,
    supabase,
    conversationId,
    userId,
    userTier = 'pro',
    forceModel,
    hasAttachment = false
  } = options;

  // Classify the query
  let classification = classifyQuery(userMessage, conversationHistory, hasAttachment);
  
  // Apply overrides based on user tier and other factors
  classification = applyClassificationOverrides(classification, {
    forceModel,
    userTier,
    previousErrors: [] // Could track errors in conversation metadata
  });

  // Log for analytics
  if (userId) {
    await logClassification(classification, userMessage, userId, conversationId);
  }

  console.log('[Model Router] Classification:', {
    type: classification.type,
    model: classification.model,
    confidence: classification.confidence,
    estimatedCost: classification.estimatedCost,
    reasoning: classification.reasoning
  });

  // Route to appropriate model
  switch (classification.model) {
    case 'groq-instant':
      return await routeToGroq(systemPrompt, conversationHistory, userMessage, supabase, conversationId, userId, classification.type);
    
    case 'perplexity':
      return await routeToPerplexity(systemPrompt, conversationHistory, userMessage, supabase, conversationId, userId, classification.type);
    
    case 'gemini-flash':
      return await routeToGeminiFlash(systemPrompt, conversationHistory, userMessage, tools, supabase, conversationId, userId, classification.type);
    
    case 'claude-sonnet':
      return await routeToClaude(systemPrompt, conversationHistory, userMessage, tools, supabase, conversationId, userId, classification.type);
    
    case 'gpt-5':
      return await routeToGPT5(systemPrompt, conversationHistory, userMessage, tools, supabase, conversationId, userId, classification.type);
    
    default:
      // Fallback to Gemini Flash
      console.warn('[Model Router] Unknown model, defaulting to Gemini Flash');
      return await routeToGeminiFlash(systemPrompt, conversationHistory, userMessage, tools, supabase, conversationId, userId, classification.type);
  }
}

/**
 * Route to Groq LPU for ultra-fast inference (<100ms)
 */
async function routeToGroq(
  systemPrompt: string,
  conversationHistory: Message[],
  userMessage: string,
  supabase?: SupabaseClient,
  conversationId?: string,
  userId?: string,
  queryType?: string
): Promise<ReadableStream> {
  console.log('[Model Router] → Groq LPU (Ultra-Fast Inference)');
  
  const startTime = Date.now();
  
  try {
    const enhancedSystemPrompt = `${systemPrompt}

**SPEED MODE:** You are using Groq LPU for instant responses.
Be concise and direct. Prioritize speed over verbosity.`;

    const messages: Message[] = [
      { role: 'system', content: enhancedSystemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const stream = await streamGroq(messages, {
      model: GROQ_MODELS.LLAMA_8B,
      maxTokens: 1024,
      temperature: 0.3
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`[Model Router] Groq response started in ${responseTime}ms`);
    
    // Log successful routing with response time
    await logModelUsage(supabase, userId, conversationId, 'groq-instant', 'success', undefined, queryType, userMessage.length, responseTime);
    
    // Inject model metadata
    return injectModelMetadata(stream, {
      model: 'groq-instant',
      modelName: 'Groq LPU',
      queryType: queryType || 'speed_critical'
    });
  } catch (error) {
    console.error('[Model Router] Groq failed, falling back to Gemini Flash:', error);
    
    // Log fallback
    await logModelUsage(
      supabase, 
      userId, 
      conversationId, 
      'groq-instant', 
      'fallback', 
      error instanceof Error ? error.message : String(error),
      queryType,
      userMessage.length
    );
    
    // Fallback to Gemini Flash
    return await routeToGeminiFlash(
      systemPrompt,
      conversationHistory,
      userMessage,
      undefined,
      supabase,
      conversationId,
      userId,
      queryType
    );
  }
}

/**
 * Route to Perplexity for real-time market data
 */
async function routeToPerplexity(
  systemPrompt: string,
  conversationHistory: Message[],
  userMessage: string,
  supabase?: SupabaseClient,
  conversationId?: string,
  userId?: string,
  queryType?: string
): Promise<ReadableStream> {
  console.log('[Model Router] → Perplexity (Real-time Market Data)');
  
  try {
    const enhancedSystemPrompt = `${systemPrompt}

**IMPORTANT:** You have access to real-time market data and current information. 
Always cite your sources and include timestamps for data accuracy.
Focus on providing up-to-date financial market information.`;

    const stream = await streamPerplexityResponse(
      enhancedSystemPrompt,
      conversationHistory,
      userMessage,
      'llama-3.1-sonar-small-128k-online'
    );
    
    // Log successful routing
    await logModelUsage(supabase, userId, conversationId, 'perplexity', 'success', undefined, queryType, userMessage.length);
    
    // Inject model metadata
    return injectModelMetadata(stream, {
      model: 'perplexity',
      modelName: 'Perplexity Sonar',
      queryType: queryType || 'market_data'
    });
  } catch (error) {
    console.error('[Model Router] Perplexity failed, falling back to Gemini Flash:', error);
    
    // Log fallback
    await logModelUsage(
      supabase, 
      userId, 
      conversationId, 
      'perplexity', 
      'fallback', 
      error instanceof Error ? error.message : String(error),
      queryType,
      userMessage.length
    );
    
    // Fallback to Gemini Flash
    return await routeToGeminiFlash(
      systemPrompt + '\n\nNote: Real-time market data unavailable. Provide guidance based on recent knowledge.',
      conversationHistory,
      userMessage,
      undefined, // no tools
      supabase,
      conversationId,
      userId,
      queryType
    );
  }
}

/**
 * Route to Gemini Flash for simple/moderate queries
 */
async function routeToGeminiFlash(
  systemPrompt: string,
  conversationHistory: Message[],
  userMessage: string,
  tools?: any[],
  supabase?: SupabaseClient,
  conversationId?: string,
  userId?: string,
  queryType?: string
): Promise<ReadableStream> {
  console.log('[Model Router] → Gemini 2.5 Flash (Fast & Efficient)');
  
  await logModelUsage(supabase, userId, conversationId, 'gemini-flash', 'success', undefined, queryType, userMessage.length);
  
  const stream = await streamAIResponse(
    systemPrompt,
    conversationHistory,
    userMessage,
    'google/gemini-2.5-flash',
    tools,
    supabase,
    conversationId,
    userId
  );
  
  return injectModelMetadata(stream, {
    model: 'gemini-flash',
    modelName: 'Gemini 2.5 Flash',
    queryType: queryType || 'simple'
  });
}

/**
 * Route to Claude Sonnet for complex financial reasoning
 */
async function routeToClaude(
  systemPrompt: string,
  conversationHistory: Message[],
  userMessage: string,
  tools?: any[],
  supabase?: SupabaseClient,
  conversationId?: string,
  userId?: string,
  queryType?: string
): Promise<ReadableStream> {
  console.log('[Model Router] → Claude Sonnet 4.5 (Advanced Reasoning)');
  
  await logModelUsage(supabase, userId, conversationId, 'claude-sonnet', 'success', undefined, queryType, userMessage.length);
  
  const enhancedSystemPrompt = `${systemPrompt}

**ADVANCED REASONING MODE:** You are using Claude Sonnet 4.5 for complex financial analysis.
Provide deep, strategic insights with multi-step reasoning and comprehensive recommendations.`;

  const stream = await streamAIResponse(
    enhancedSystemPrompt,
    conversationHistory,
    userMessage,
    CLAUDE_MAIN_BRAIN,
    tools,
    supabase,
    conversationId,
    userId
  );
  
  return injectModelMetadata(stream, {
    model: 'claude-sonnet',
    modelName: 'Claude Sonnet 4.5',
    queryType: queryType || 'complex'
  });
}

/**
 * Route to GPT-5 for document analysis and complex financial documents
 */
async function routeToGPT5(
  systemPrompt: string,
  conversationHistory: Message[],
  userMessage: string,
  tools?: any[],
  supabase?: SupabaseClient,
  conversationId?: string,
  userId?: string,
  queryType?: string
): Promise<ReadableStream> {
  console.log('[Model Router] → GPT-5 (Document Analysis Expert)');
  
  try {
    await logModelUsage(supabase, userId, conversationId, 'gpt-5', 'success', undefined, queryType, userMessage.length);
    
    const enhancedSystemPrompt = `${systemPrompt}

${DOCUMENT_ANALYSIS_SYSTEM_PROMPT}

**DOCUMENT ANALYSIS MODE:** You are using GPT-5 for precise document extraction and analysis.
Provide accurate, structured data extraction with confidence scores.
Always cite specific sections of documents when referencing information.`;

    const messages = [
      { role: 'system' as const, content: enhancedSystemPrompt },
      ...conversationHistory,
      { role: 'user' as const, content: userMessage }
    ];

    const stream = await streamOpenAI(messages, {
      model: GPT5_MODEL,
      maxTokens: 4000,
      tools
    });
    
    return injectModelMetadata(stream, {
      model: 'gpt-5',
      modelName: 'GPT-5',
      queryType: queryType || 'document_analysis'
    });
  } catch (error) {
    console.error('[Model Router] GPT-5 failed, falling back to Gemini 2.5 Flash:', error);
    
    // Log fallback
    await logModelUsage(
      supabase, 
      userId, 
      conversationId, 
      'gpt-5', 
      'fallback', 
      error instanceof Error ? error.message : String(error),
      queryType,
      userMessage.length
    );
    
    // Fallback to Gemini 3 Pro
    return await routeToGeminiFlash(
      systemPrompt + '\n\nNote: GPT-5 unavailable. Using Gemini for document analysis.',
      conversationHistory,
      userMessage,
      tools,
      supabase,
      conversationId,
      userId,
      queryType
    );
  }
}

/**
 * Log model usage for analytics
 */
async function logModelUsage(
  supabase: SupabaseClient | undefined,
  userId: string | undefined,
  conversationId: string | undefined,
  model: string,
  status: 'success' | 'fallback' | 'error',
  errorMessage?: string,
  queryType?: string,
  queryLength?: number,
  responseTimeMs?: number
): Promise<void> {
  console.log('[Model Router] Usage:', {
    model,
    status,
    userId,
    conversationId,
    errorMessage,
    timestamp: new Date().toISOString()
  });
  
  // Persist to analytics table
  if (supabase && userId) {
    try {
      const { error } = await supabase.from('ai_model_routing_analytics').insert({
        user_id: userId,
        conversation_id: conversationId,
        query_type: queryType || 'unknown',
        model_used: model,
        was_fallback: status === 'fallback',
        fallback_reason: errorMessage,
        query_length: queryLength,
        confidence_score: status === 'success' ? 0.9 : 0.5,
        response_time_ms: responseTimeMs,
      });
      
      if (error) {
        console.error('[Model Router] Failed to log analytics:', error);
      }
    } catch (err) {
      console.error('[Model Router] Analytics logging error:', err);
    }
  }
}

/**
 * Estimate cost savings from intelligent routing
 */
export function calculateCostSavings(
  queriesProcessed: number,
  averageComplexityDistribution: {
    simple: number; // percentage
    complex: number;
    marketData: number;
    documentAnalysis: number;
    speedCritical: number;
  }
): {
  totalCost: number;
  costWithoutRouting: number;
  savings: number;
  savingsPercentage: number;
} {
  // Cost per query (normalized units)
  const COSTS = {
    gemini: 0.05,
    claude: 0.50,
    perplexity: 0.30,
    gpt5: 0.40,
    groq: 0.01 // Groq is extremely cheap
  };

  // With routing
  const routedCost = 
    (queriesProcessed * averageComplexityDistribution.simple / 100 * COSTS.gemini) +
    (queriesProcessed * averageComplexityDistribution.complex / 100 * COSTS.claude) +
    (queriesProcessed * averageComplexityDistribution.marketData / 100 * COSTS.perplexity) +
    (queriesProcessed * averageComplexityDistribution.documentAnalysis / 100 * COSTS.gpt5) +
    (queriesProcessed * (averageComplexityDistribution.speedCritical || 0) / 100 * COSTS.groq);

  // Without routing (all Claude)
  const allClaudeCost = queriesProcessed * COSTS.claude;

  const savings = allClaudeCost - routedCost;
  const savingsPercentage = (savings / allClaudeCost) * 100;

  return {
    totalCost: routedCost,
    costWithoutRouting: allClaudeCost,
    savings,
    savingsPercentage
  };
}
