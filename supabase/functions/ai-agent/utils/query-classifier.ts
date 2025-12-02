/**
 * Query Classification System
 * Determines the optimal AI model based on query complexity and type
 */

export type QueryType = 'simple' | 'complex' | 'market_data' | 'analytical';
export type ModelRoute = 'gemini-flash' | 'claude-sonnet' | 'perplexity';

export interface ClassificationResult {
  type: QueryType;
  model: ModelRoute;
  confidence: number;
  reasoning: string;
  estimatedCost: number; // in credits/tokens
}

// Keywords that indicate market data queries
const MARKET_DATA_KEYWORDS = [
  'stock', 'market', 'crypto', 'bitcoin', 'eth', 'nasdaq', 'dow jones',
  'spy', 'qqq', 'price', 'ticker', 'trading', 'invest', 'portfolio',
  'cryptocurrency', 'forex', 'commodity', 'gold', 'oil', 'futures',
  'real-time', 'current price', 'market trends', 'stock performance',
  'market news', 'earnings', 'financial news'
];

// Keywords indicating simple queries
const SIMPLE_QUERY_KEYWORDS = [
  'what is', 'define', 'explain simply', 'quick question',
  'how much', 'when', 'where', 'list', 'show me',
  'what are', 'tell me about', 'summary', 'overview'
];

// Keywords indicating complex analysis
const COMPLEX_QUERY_KEYWORDS = [
  'analyze', 'strategy', 'optimize', 'recommend', 'plan',
  'should i', 'help me decide', 'compare', 'evaluate',
  'forecast', 'predict', 'scenario', 'what if',
  'deep dive', 'comprehensive', 'detailed analysis',
  'retirement plan', 'tax strategy', 'debt payoff',
  'investment strategy', 'financial plan'
];

/**
 * Classify a user query to determine the optimal model
 */
export function classifyQuery(
  query: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): ClassificationResult {
  const lowerQuery = query.toLowerCase();
  const wordCount = query.split(/\s+/).length;
  
  // Check for market data queries first (highest priority)
  const hasMarketKeywords = MARKET_DATA_KEYWORDS.some(keyword => 
    lowerQuery.includes(keyword)
  );
  
  if (hasMarketKeywords) {
    return {
      type: 'market_data',
      model: 'perplexity',
      confidence: 0.95,
      reasoning: 'Query contains market data keywords requiring real-time information',
      estimatedCost: 0.3 // Perplexity cost per query
    };
  }
  
  // Check for simple queries
  const hasSimpleKeywords = SIMPLE_QUERY_KEYWORDS.some(keyword =>
    lowerQuery.startsWith(keyword) || lowerQuery.includes(keyword)
  );
  
  const isShortQuery = wordCount <= 15;
  const hasNoComplexKeywords = !COMPLEX_QUERY_KEYWORDS.some(keyword =>
    lowerQuery.includes(keyword)
  );
  
  if (hasSimpleKeywords && isShortQuery && hasNoComplexKeywords) {
    return {
      type: 'simple',
      model: 'gemini-flash',
      confidence: 0.85,
      reasoning: 'Short query with simple keywords, no complex reasoning required',
      estimatedCost: 0.05 // Gemini Flash is cheap
    };
  }
  
  // Check for complex analysis
  const hasComplexKeywords = COMPLEX_QUERY_KEYWORDS.some(keyword =>
    lowerQuery.includes(keyword)
  );
  
  const isLongQuery = wordCount > 20;
  const hasMultipleSentences = query.split(/[.!?]/).length > 2;
  const conversationDepth = conversationHistory.length;
  
  // Complex if:
  // - Has complex keywords
  // - Long query with multiple sentences
  // - Deep conversation requiring context
  if (hasComplexKeywords || isLongQuery || hasMultipleSentences || conversationDepth > 5) {
    return {
      type: 'complex',
      model: 'claude-sonnet',
      confidence: 0.9,
      reasoning: 'Query requires advanced reasoning, financial analysis, or strategic planning',
      estimatedCost: 0.5 // Claude Sonnet is most expensive
    };
  }
  
  // Default to Gemini Flash for moderate queries
  return {
    type: 'analytical',
    model: 'gemini-flash',
    confidence: 0.7,
    reasoning: 'Standard analytical query, balanced approach',
    estimatedCost: 0.05
  };
}

/**
 * Override classification based on user preferences or session context
 */
export function applyClassificationOverrides(
  classification: ClassificationResult,
  options: {
    forceModel?: ModelRoute;
    userTier?: 'free' | 'pro' | 'premium';
    previousErrors?: string[];
  }
): ClassificationResult {
  // Force specific model if requested
  if (options.forceModel) {
    return {
      ...classification,
      model: options.forceModel,
      reasoning: `Forced to ${options.forceModel}: ${classification.reasoning}`
    };
  }
  
  // Downgrade to Gemini if user is on free tier and query isn't critical
  if (options.userTier === 'free' && classification.type !== 'market_data') {
    return {
      ...classification,
      model: 'gemini-flash',
      reasoning: 'Free tier: Using efficient model. Upgrade for advanced reasoning.'
    };
  }
  
  // If previous errors with a model, try fallback
  if (options.previousErrors?.some(err => err.includes('claude'))) {
    if (classification.model === 'claude-sonnet') {
      return {
        ...classification,
        model: 'gemini-flash',
        reasoning: 'Fallback to Gemini due to Claude availability issues'
      };
    }
  }
  
  return classification;
}

/**
 * Log classification for analytics and optimization
 */
export async function logClassification(
  classification: ClassificationResult,
  query: string,
  userId: string,
  conversationId?: string
): Promise<void> {
  // This would log to a tracking table for cost analysis
  console.log('[Query Classification]', {
    type: classification.type,
    model: classification.model,
    confidence: classification.confidence,
    estimatedCost: classification.estimatedCost,
    queryLength: query.length,
    userId,
    conversationId,
    timestamp: new Date().toISOString()
  });
}
