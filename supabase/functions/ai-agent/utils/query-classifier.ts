/**
 * Query Classification System
 * Determines the optimal AI model based on query complexity and type
 */

export type QueryType = 'simple' | 'complex' | 'market_data' | 'analytical' | 'document_analysis' | 'speed_critical' | 'mathematical_reasoning' | 'social_sentiment';
export type ModelRoute = 'gemini-flash' | 'claude-sonnet' | 'perplexity' | 'gpt-5' | 'groq-instant' | 'deepseek-reasoner' | 'grok-sentiment';

export interface ClassificationResult {
  type: QueryType;
  model: ModelRoute;
  confidence: number;
  reasoning: string;
  estimatedCost: number; // in credits/tokens
}

// Keywords that indicate mathematical/financial reasoning (route to Deepseek)
const MATHEMATICAL_REASONING_KEYWORDS = [
  // Core math operations
  'calculate', 'compute', 'solve', 'formula', 'equation',
  // Financial calculations
  'compound interest', 'simple interest', 'amortization', 'amortize',
  'npv', 'net present value', 'irr', 'internal rate of return',
  'roi', 'return on investment', 'break-even', 'breakeven',
  'payoff strategy', 'debt payoff', 'payoff order', 'optimal payoff',
  'avalanche method', 'snowball method', 'debt avalanche', 'debt snowball',
  // Simulations & optimization
  'monte carlo', 'simulation', 'probability distribution', 'confidence interval',
  'optimization', 'optimize', 'optimal allocation', 'maximize', 'minimize',
  'sensitivity analysis', 'what-if calculation', 'scenario calculation',
  // Time value of money
  'future value', 'present value', 'time value', 'discount rate',
  'annuity', 'perpetuity', 'cash flow', 'dcf',
  // Statistical
  'standard deviation', 'variance', 'correlation', 'regression',
  'percentile', 'probability', 'expected value', 'risk-adjusted'
];

// Keywords that indicate speed-critical queries (route to Groq)
const SPEED_CRITICAL_KEYWORDS = [
  'categorize', 'classify', 'what category', 'which category',
  'quick', 'instant', 'fast', 'urgent', 'immediately',
  'alert', 'notify', 'warning', 'flag',
  'transaction type', 'spending type', 'expense type'
];

// Transaction-related keywords that benefit from instant processing
const TRANSACTION_ALERT_KEYWORDS = [
  'new transaction', 'just spent', 'just paid', 'just bought',
  'payment alert', 'spending alert', 'charge alert',
  'is this normal', 'unusual', 'suspicious', 'fraud'
];

// Keywords that indicate social sentiment analysis (route to Grok)
const SOCIAL_SENTIMENT_KEYWORDS = [
  'sentiment', 'social media', 'twitter', 'x posts', 'trending',
  'viral', 'buzz', 'hype', 'fomo', 'fud', 'retail sentiment',
  'what are people saying', 'market mood', 'crowd opinion',
  'bullish sentiment', 'bearish sentiment', 'social trends',
  'reddit', 'wallstreetbets', 'wsb', 'meme stock',
  'social analysis', 'public opinion', 'investor sentiment'
];

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
  'analyze', 'strategy', 'recommend', 'plan',
  'should i', 'help me decide', 'compare', 'evaluate',
  'forecast', 'predict', 'scenario', 'what if',
  'deep dive', 'comprehensive', 'detailed analysis',
  'retirement plan', 'tax strategy',
  'investment strategy', 'financial plan'
];

// Keywords indicating document analysis - routes to GPT-5
const DOCUMENT_ANALYSIS_KEYWORDS = [
  // Tax documents
  'tax document', 'w-2', 'w2', '1099', '1040', 'k-1', 'k1',
  '1099-div', '1099-b', '1099-int', '1099-misc', '1099-nec', '1099-r',
  'schedule c', 'schedule d', 'schedule e', 'schedule k-1',
  'tax form', 'tax return', 'irs form',
  // Financial statements
  'bank statement', 'brokerage statement', 'investment statement',
  'portfolio statement', 'account statement', 'financial statement',
  // Investment documents
  'capital gains', 'dividend', 'stock sale', 'securities',
  'cost basis', 'realized gains', 'unrealized gains',
  'trading statement', 'trade confirmation', 'annual report',
  // Receipts and bills
  'receipt', 'invoice', 'bill', 'statement',
  // Identity documents
  'identity document', 'passport', 'driver license', 'drivers license',
  'pay stub', 'paystub', 'kyc',
  // General document actions
  'analyze document', 'extract from', 'read this',
  'uploaded file', 'attached document', 'this image'
];

/**
 * Classify a user query to determine the optimal model
 */
export function classifyQuery(
  query: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
  hasAttachment: boolean = false
): ClassificationResult {
  const lowerQuery = query.toLowerCase();
  const wordCount = query.split(/\s+/).length;
  
  // Check for social sentiment queries (route to Grok for real-time social data)
  const hasSocialSentimentKeywords = SOCIAL_SENTIMENT_KEYWORDS.some(keyword => 
    lowerQuery.includes(keyword)
  );
  
  if (hasSocialSentimentKeywords) {
    return {
      type: 'social_sentiment',
      model: 'grok-sentiment',
      confidence: 0.95,
      reasoning: 'Query requires real-time social sentiment analysis via xAI Grok',
      estimatedCost: 0.15 // Grok pricing
    };
  }
  
  // Check for speed-critical queries (route to Groq for <100ms response)
  const hasSpeedCriticalKeywords = SPEED_CRITICAL_KEYWORDS.some(keyword => 
    lowerQuery.includes(keyword)
  );
  const hasTransactionAlertKeywords = TRANSACTION_ALERT_KEYWORDS.some(keyword => 
    lowerQuery.includes(keyword)
  );
  
  // Short categorization/alert queries go to Groq
  if ((hasSpeedCriticalKeywords || hasTransactionAlertKeywords) && wordCount <= 20) {
    return {
      type: 'speed_critical',
      model: 'groq-instant',
      confidence: 0.95,
      reasoning: 'Speed-critical query requiring sub-100ms response via Groq LPU',
      estimatedCost: 0.01 // Groq is very cheap
    };
  }
  
  // Check for mathematical reasoning queries (route to Deepseek for cost-effective math)
  const hasMathKeywords = MATHEMATICAL_REASONING_KEYWORDS.some(keyword => 
    lowerQuery.includes(keyword)
  );
  
  // Route to Deepseek for mathematical/financial calculations
  if (hasMathKeywords) {
    return {
      type: 'mathematical_reasoning',
      model: 'deepseek-reasoner',
      confidence: 0.95,
      reasoning: 'Mathematical/financial calculation requiring Deepseek Reasoner chain-of-thought',
      estimatedCost: 0.02 // Deepseek is very cost-effective (~95% cheaper than Claude)
    };
  }
  
  // Check for document analysis (highest priority when documents are involved)
  const hasDocumentKeywords = DOCUMENT_ANALYSIS_KEYWORDS.some(keyword => 
    lowerQuery.includes(keyword)
  );
  
  if (hasDocumentKeywords || hasAttachment) {
    return {
      type: 'document_analysis',
      model: 'gpt-5',
      confidence: 0.95,
      reasoning: 'Query involves document analysis requiring GPT-5 vision capabilities',
      estimatedCost: 0.40 // GPT-5 cost per document
    };
  }
  
  // Check for market data queries
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
  if (options.userTier === 'free' && classification.type !== 'market_data' && classification.type !== 'document_analysis') {
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
  
  if (options.previousErrors?.some(err => err.includes('openai') || err.includes('gpt'))) {
    if (classification.model === 'gpt-5') {
      return {
        ...classification,
        model: 'gemini-flash',
        reasoning: 'Fallback to Gemini due to GPT-5 availability issues'
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
