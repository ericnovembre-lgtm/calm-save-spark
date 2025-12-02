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
];

export async function digitalTwinAdvisorHandler(params: HandlerParams): Promise<ReadableStream> {
  const { supabase, userId, message, conversationId, metadata } = params;

  // Load conversation history
  const history = conversationId 
    ? await loadConversation(supabase, conversationId, userId)
    : [];

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

You are the Digital Twin Advisor - a strategic AI that helps users explore their financial futures through scenario simulation and Monte Carlo projections. 

Your capabilities:
- Analyze life events and their financial impact
- Run Monte Carlo simulations for probabilistic forecasting
- Compare different financial paths side-by-side
- Incorporate real-time market data for context
- Provide retirement timeline impact calculations

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
  
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      const text = new TextDecoder().decode(chunk);
      fullResponse += text;
      controller.enqueue(chunk);
    },
    async flush() {
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
      } catch (error) {
        console.error('Error saving Digital Twin conversation:', error);
      }
    },
  });

  return aiStream.pipeThrough(transformStream);
}
