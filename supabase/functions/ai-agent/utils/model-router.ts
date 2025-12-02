/**
 * Intelligent Model Router
 * Routes queries to optimal AI model based on classification
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { classifyQuery, applyClassificationOverrides, logClassification, ModelRoute } from "./query-classifier.ts";
import { streamAIResponse } from "./ai-client.ts";
import { streamPerplexityResponse } from "./perplexity-client.ts";
import { CLAUDE_MAIN_BRAIN, CLAUDE_35_SONNET } from "./ai-client.ts";

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
    forceModel
  } = options;

  // Classify the query
  let classification = classifyQuery(userMessage, conversationHistory);
  
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
    case 'perplexity':
      return await routeToPerplexity(systemPrompt, conversationHistory, userMessage);
    
    case 'gemini-flash':
      return await routeToGeminiFlash(systemPrompt, conversationHistory, userMessage, tools, supabase, conversationId, userId);
    
    case 'claude-sonnet':
      return await routeToClaude(systemPrompt, conversationHistory, userMessage, tools, supabase, conversationId, userId);
    
    default:
      // Fallback to Gemini Flash
      console.warn('[Model Router] Unknown model, defaulting to Gemini Flash');
      return await routeToGeminiFlash(systemPrompt, conversationHistory, userMessage, tools, supabase, conversationId, userId);
  }
}

/**
 * Route to Perplexity for real-time market data
 */
async function routeToPerplexity(
  systemPrompt: string,
  conversationHistory: Message[],
  userMessage: string
): Promise<ReadableStream> {
  console.log('[Model Router] → Perplexity (Real-time Market Data)');
  
  const enhancedSystemPrompt = `${systemPrompt}

**IMPORTANT:** You have access to real-time market data and current information. 
Always cite your sources and include timestamps for data accuracy.
Focus on providing up-to-date financial market information.`;

  return await streamPerplexityResponse(
    enhancedSystemPrompt,
    conversationHistory,
    userMessage,
    'llama-3.1-sonar-small-128k-online'
  );
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
  userId?: string
): Promise<ReadableStream> {
  console.log('[Model Router] → Gemini 2.5 Flash (Fast & Efficient)');
  
  return await streamAIResponse(
    systemPrompt,
    conversationHistory,
    userMessage,
    'google/gemini-2.5-flash', // Fast and cost-effective
    tools,
    supabase,
    conversationId,
    userId
  );
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
  userId?: string
): Promise<ReadableStream> {
  console.log('[Model Router] → Claude Sonnet 4.5 (Advanced Reasoning)');
  
  const enhancedSystemPrompt = `${systemPrompt}

**ADVANCED REASONING MODE:** You are using Claude Sonnet 4.5 for complex financial analysis.
Provide deep, strategic insights with multi-step reasoning and comprehensive recommendations.`;

  return await streamAIResponse(
    enhancedSystemPrompt,
    conversationHistory,
    userMessage,
    CLAUDE_MAIN_BRAIN, // Claude Sonnet 4.5
    tools,
    supabase,
    conversationId,
    userId
  );
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
    perplexity: 0.30
  };

  // With routing
  const routedCost = 
    (queriesProcessed * averageComplexityDistribution.simple / 100 * COSTS.gemini) +
    (queriesProcessed * averageComplexityDistribution.complex / 100 * COSTS.claude) +
    (queriesProcessed * averageComplexityDistribution.marketData / 100 * COSTS.perplexity);

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
