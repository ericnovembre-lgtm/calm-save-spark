import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { streamAIResponse, formatContextForAI } from "../utils/ai-client.ts";
import { loadConversation, saveConversation, getAgentSystemPrompt } from "../utils/conversation-manager.ts";

interface HandlerParams {
  supabase: SupabaseClient;
  userId: string;
  message: string;
  conversationId?: string;
  metadata: Record<string, any>;
}

// Custom tools for Digital Twin operations
const DIGITAL_TWIN_TOOLS = [
  {
    type: "function",
    function: {
      name: "run_monte_carlo_simulation",
      description: "Run a Monte Carlo simulation to project financial outcomes with uncertainty ranges",
      parameters: {
        type: "object",
        properties: {
          years: { type: "number", description: "Number of years to project" },
          initial_wealth: { type: "number", description: "Starting net worth" },
          annual_return: { type: "number", description: "Expected annual return rate (0-1)" },
          volatility: { type: "number", description: "Return volatility/standard deviation (0-1)" },
          annual_savings: { type: "number", description: "Annual contribution amount" },
        },
        required: ["years", "initial_wealth", "annual_return", "volatility", "annual_savings"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "analyze_life_event_impact",
      description: "Calculate the financial impact of a life event on retirement timeline",
      parameters: {
        type: "object",
        properties: {
          event_type: { type: "string", description: "Type of life event (job_loss, marriage, child, home_purchase)" },
          event_age: { type: "number", description: "Age when event occurs" },
          financial_impact: { type: "number", description: "One-time financial impact (positive or negative)" },
          ongoing_impact: { type: "number", description: "Annual ongoing impact on savings rate" },
        },
        required: ["event_type", "event_age", "financial_impact"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_market_conditions",
      description: "Get real-time market data and economic context to inform projections",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Market data query (e.g., 'current inflation rate', 'S&P 500 outlook')" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_timeline_comparison",
      description: "Create a side-by-side comparison of two financial scenarios",
      parameters: {
        type: "object",
        properties: {
          scenario_a_name: { type: "string", description: "Name of first scenario" },
          scenario_b_name: { type: "string", description: "Name of second scenario" },
          key_differences: { type: "array", items: { type: "string" }, description: "Key differences between scenarios" },
        },
        required: ["scenario_a_name", "scenario_b_name", "key_differences"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_scenario_from_description",
      description: "Parse a natural language description of a life event and create a visualizable scenario. Use this when the user describes a 'what if' scenario in plain language.",
      parameters: {
        type: "object",
        properties: {
          description: { type: "string", description: "Natural language description of the life event (e.g., 'buy a $400k house in 2 years')" },
          should_visualize: { type: "boolean", description: "Whether to trigger visualization on the timeline" },
        },
        required: ["description", "should_visualize"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remember_user_preference",
      description: "Store an important user preference or financial pattern for future context",
      parameters: {
        type: "object",
        properties: {
          preference: { type: "string", description: "The preference or pattern to remember" },
          category: { type: "string", enum: ["risk_tolerance", "goals", "timeline", "lifestyle"], description: "Category of preference" },
        },
        required: ["preference", "category"],
      },
    },
  },
];

async function retrieveMemoryContext(supabase: SupabaseClient, userId: string, message: string): Promise<string> {
  try {
    // Query Pinecone for relevant memories via edge function
    const COHERE_API_KEY = Deno.env.get('COHERE_API_KEY');
    const PINECONE_API_KEY = Deno.env.get('PINECONE_API_KEY');
    const PINECONE_INDEX_URL = Deno.env.get('PINECONE_INDEX_URL');

    if (!COHERE_API_KEY || !PINECONE_API_KEY || !PINECONE_INDEX_URL) {
      console.log('Memory integration not configured, skipping context retrieval');
      return '';
    }

    // Generate query embedding
    const embedResponse = await fetch('https://api.cohere.ai/v1/embed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: [message],
        model: 'embed-english-v3.0',
        input_type: 'search_query',
      }),
    });

    if (!embedResponse.ok) {
      console.error('Failed to generate query embedding');
      return '';
    }

    const embedData = await embedResponse.json();
    const queryVector = embedData.embeddings[0];

    // Query Pinecone
    const searchResponse = await fetch(`${PINECONE_INDEX_URL}/query`, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vector: queryVector,
        topK: 3,
        includeMetadata: true,
        namespace: 'digital_twin_memories',
        filter: { user_id: { $eq: userId } },
      }),
    });

    if (!searchResponse.ok) {
      console.error('Pinecone query failed');
      return '';
    }

    const searchData = await searchResponse.json();
    const memories = searchData.matches || [];

    if (memories.length === 0) return '';

    const contextParts = memories
      .filter((m: any) => m.score > 0.7)
      .map((m: any) => `[${m.metadata?.category?.toUpperCase() || 'MEMORY'}] ${m.metadata?.content}`);

    if (contextParts.length === 0) return '';

    return `\n\n**Remembered Context from Previous Sessions:**\n${contextParts.join('\n')}`;
  } catch (error) {
    console.error('Error retrieving memory context:', error);
    return '';
  }
}

async function storeMemory(supabase: SupabaseClient, userId: string, content: string, category: string): Promise<void> {
  try {
    const COHERE_API_KEY = Deno.env.get('COHERE_API_KEY');
    const PINECONE_API_KEY = Deno.env.get('PINECONE_API_KEY');
    const PINECONE_INDEX_URL = Deno.env.get('PINECONE_INDEX_URL');

    if (!COHERE_API_KEY || !PINECONE_API_KEY || !PINECONE_INDEX_URL) {
      return;
    }

    // Generate embedding
    const embedResponse = await fetch('https://api.cohere.ai/v1/embed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: [content],
        model: 'embed-english-v3.0',
        input_type: 'search_document',
      }),
    });

    if (!embedResponse.ok) return;

    const embedData = await embedResponse.json();
    const vector = embedData.embeddings[0];

    const memoryId = `dt_${userId}_${Date.now()}`;

    // Store in Pinecone
    await fetch(`${PINECONE_INDEX_URL}/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vectors: [{
          id: memoryId,
          values: vector,
          metadata: {
            user_id: userId,
            content,
            category,
            importance: 0.7,
            agent_type: 'digital_twin',
            created_at: new Date().toISOString(),
          },
        }],
        namespace: 'digital_twin_memories',
      }),
    });

    // Also store locally
    await supabase.from('agent_memory').insert({
      user_id: userId,
      agent_type: 'digital_twin',
      memory_type: category,
      key: memoryId,
      value: { content },
      confidence_score: 0.7,
    });

    console.log(`Stored Digital Twin memory: ${memoryId}`);
  } catch (error) {
    console.error('Error storing memory:', error);
  }
}

export async function digitalTwinAdvisorHandler(params: HandlerParams): Promise<ReadableStream> {
  const { supabase, userId, message, conversationId, metadata } = params;
  const startTime = Date.now();

  // Load conversation history
  const history = conversationId 
    ? await loadConversation(supabase, conversationId, userId)
    : [];

  // Retrieve relevant memories
  const memoryContext = await retrieveMemoryContext(supabase, userId, message);

  // Build context from Digital Twin profile and scenarios
  const context: Record<string, any> = {};

  // Get Digital Twin profile
  const { data: profile } = await supabase
    .from('digital_twin_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (profile) {
    context.profile = {
      currentAge: profile.current_age,
      retirementAge: profile.retirement_age,
      initialNetWorth: profile.initial_net_worth,
      annualSavings: profile.annual_savings,
      annualReturn: profile.annual_return,
      riskTolerance: profile.risk_tolerance,
    };
  }

  // Get recent scenarios
  const { data: scenarios } = await supabase
    .from('twin_scenarios')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (scenarios && scenarios.length > 0) {
    context.recentScenarios = scenarios.map(s => ({
      type: s.scenario_type,
      successProbability: s.success_probability,
      parameters: s.parameters,
    }));
  }

  // Get Digital Twin state
  const { data: twinState } = await supabase
    .from('digital_twin_state')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (twinState) {
    context.twinMetrics = {
      riskTolerance: twinState.risk_tolerance,
      savingsPropensity: twinState.savings_propensity,
      impulseFactor: twinState.impulse_factor,
      goalsAlignment: twinState.financial_goals_alignment,
    };
  }

  const contextString = formatContextForAI(context);

  // Get system prompt from database
  const systemPrompt = await getAgentSystemPrompt(supabase, 'digital_twin_advisor');

  const enhancedPrompt = `${systemPrompt}

**Digital Twin Context:**
${contextString}
${memoryContext}

You are the Digital Twin Advisor - a strategic AI that helps users explore their financial futures through scenario simulation and Monte Carlo projections. 

Your capabilities:
- Analyze life events and their financial impact
- Run Monte Carlo simulations for probabilistic forecasting
- Compare different financial paths side-by-side
- Incorporate real-time market data for context
- Provide retirement timeline impact calculations
- **CREATE SCENARIOS FROM NATURAL LANGUAGE**: When users describe "what if" scenarios, use the create_scenario_from_description tool to parse and visualize them

IMPORTANT: When users ask questions like "What if I buy a house?" or "What happens if I get a raise?", ALWAYS use the create_scenario_from_description tool to create a visualizable scenario. Set should_visualize to true so the event appears on their timeline.

Respond conversationally but with data-driven insights. When users ask "what if" questions, use the tools to provide concrete projections.`;

  // Use Claude Sonnet 4.5 for complex reasoning
  const aiStream = await streamAIResponse(
    enhancedPrompt, 
    history, 
    message,
    'claude/claude-sonnet-4-5',
    DIGITAL_TWIN_TOOLS,
    supabase,
    conversationId,
    userId
  );

  let fullResponse = '';
  let toolCallsDetected: any[] = [];
  
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      const text = new TextDecoder().decode(chunk);
      fullResponse += text;
      
      // Detect tool calls in the stream for scenario creation
      try {
        if (text.includes('create_scenario_from_description')) {
          const toolMatch = text.match(/create_scenario_from_description.*?"description"\s*:\s*"([^"]+)"/);
          if (toolMatch) {
            toolCallsDetected.push({
              tool: 'create_scenario_from_description',
              description: toolMatch[1],
            });
          }
        }
      } catch {}
      
      controller.enqueue(chunk);
    },
    async flush() {
      const responseTime = Date.now() - startTime;
      
      try {
        await saveConversation(
          supabase,
          conversationId,
          userId,
          'digital_twin_advisor',
          message,
          fullResponse,
          metadata
        );

        // Log analytics
        await supabase.from('digital_twin_analytics').insert({
          user_id: userId,
          event_type: 'chat_query',
          model_used: 'claude/claude-sonnet-4-5',
          response_time_ms: responseTime,
          query_text: message.slice(0, 500),
          session_id: conversationId,
          scenario_parameters: toolCallsDetected.length > 0 ? { toolCalls: toolCallsDetected } : null,
        });

        // Store important insights as memories
        if (fullResponse.length > 200 && (
          message.toLowerCase().includes('retirement') ||
          message.toLowerCase().includes('goal') ||
          message.toLowerCase().includes('save')
        )) {
          const insightSummary = `User asked about: ${message.slice(0, 100)}. Key insight provided.`;
          await storeMemory(supabase, userId, insightSummary, 'insight');
        }
      } catch (error) {
        console.error('Error saving Digital Twin conversation:', error);
      }
    },
  });

  return aiStream.pipeThrough(transformStream);
}
