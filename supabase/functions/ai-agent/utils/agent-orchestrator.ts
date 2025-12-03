import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ConsultationRequest {
  requestingAgent: string;
  consultingAgent: string;
  query: string;
  conversationId?: string;
}

interface ConsultationResponse {
  response: string;
  confidence: number;
  recommendedActions?: string[];
}

export async function consultAgent(
  supabase: SupabaseClient,
  request: ConsultationRequest,
  lovableApiKey: string
): Promise<ConsultationResponse> {
  const { requestingAgent, consultingAgent, query, conversationId } = request;

  // Get the consulting agent's system prompt
  const { data: agent, error: agentError } = await supabase
    .from('ai_agents')
    .select('system_prompt, capabilities')
    .eq('agent_type', consultingAgent)
    .eq('is_active', true)
    .single();

  if (agentError || !agent) {
    throw new Error(`Agent ${consultingAgent} not found`);
  }

  // Call AI to get consultation response using Claude
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
  
  let response: Response;
  
  if (ANTHROPIC_API_KEY) {
    // Use Anthropic API directly for Claude
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        system: `${agent.system_prompt}\n\nYou are being consulted by the ${requestingAgent} agent. Provide expert advice within your domain.`,
        messages: [{ role: 'user', content: query }]
      })
    });
  } else {
    // Fallback to Lovable AI Gateway
    console.warn('ANTHROPIC_API_KEY not found, using Lovable AI Gateway fallback');
    response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro',
        messages: [
          {
            role: 'system',
            content: `${agent.system_prompt}\n\nYou are being consulted by the ${requestingAgent} agent. Provide expert advice within your domain.`
          },
          { role: 'user', content: query }
        ],
        max_completion_tokens: 1000
      })
    });
  }

  if (!response.ok) {
    throw new Error('Consultation failed');
  }

  const result = await response.json();
  
  // Parse response based on provider
  let consultationResponse: string;
  if (ANTHROPIC_API_KEY && response.headers.get('content-type')?.includes('application/json')) {
    // Anthropic response format
    const content = result.content;
    if (Array.isArray(content)) {
      consultationResponse = content
        .filter((block: any) => block.type === 'text')
        .map((block: any) => block.text)
        .join('');
    } else {
      consultationResponse = content;
    }
  } else {
    // OpenAI/Lovable AI Gateway format
    consultationResponse = result.choices[0].message.content;
  }

  // Log the consultation
  await supabase.from('agent_consultations').insert({
    requesting_agent: requestingAgent,
    consulting_agent: consultingAgent,
    conversation_id: conversationId,
    query,
    response: consultationResponse
  });

  return {
    response: consultationResponse,
    confidence: 0.85,
    recommendedActions: []
  };
}

export async function shouldConsultAgent(
  message: string,
  currentAgent: string
): Promise<{ shouldConsult: boolean; targetAgent?: string; reason?: string }> {
  // Define consultation triggers
  const consultationRules: Record<string, { keywords: string[]; targetAgent: string }[]> = {
    financial_coach: [
      { keywords: ['tax', 'deduction', '1099', 'w-2', 'filing'], targetAgent: 'tax_assistant' },
      { keywords: ['invest', 'stock', 'crypto', 'portfolio', 'market'], targetAgent: 'investment_research' },
      { keywords: ['debt', 'loan', 'credit card', 'interest'], targetAgent: 'debt_advisor' },
      { keywords: ['house', 'retire', 'college', 'life goal'], targetAgent: 'life_planner' },
    ],
    tax_assistant: [
      { keywords: ['invest', 'capital gains', 'dividend'], targetAgent: 'investment_research' },
      { keywords: ['business expense', 'self-employed'], targetAgent: 'financial_coach' },
    ],
    debt_advisor: [
      { keywords: ['invest', 'savings', 'emergency fund'], targetAgent: 'financial_coach' },
      { keywords: ['consolidate', 'refinance'], targetAgent: 'investment_research' },
    ],
    investment_research: [
      { keywords: ['tax efficient', 'tax loss harvest'], targetAgent: 'tax_assistant' },
      { keywords: ['debt payoff', 'should I invest or pay debt'], targetAgent: 'debt_advisor' },
    ],
    life_planner: [
      { keywords: ['retire', 'retirement savings'], targetAgent: 'investment_research' },
      { keywords: ['afford', 'budget'], targetAgent: 'financial_coach' },
    ],
  };

  const rules = consultationRules[currentAgent] || [];
  const messageLower = message.toLowerCase();

  for (const rule of rules) {
    const hasKeyword = rule.keywords.some(keyword => messageLower.includes(keyword));
    if (hasKeyword) {
      return {
        shouldConsult: true,
        targetAgent: rule.targetAgent,
        reason: `Detected ${rule.keywords.join('/')} topic requiring ${rule.targetAgent} expertise`
      };
    }
  }

  return { shouldConsult: false };
}

export async function orchestrateMultiAgentResponse(
  supabase: SupabaseClient,
  primaryAgent: string,
  userMessage: string,
  conversationId: string | undefined,
  lovableApiKey: string
): Promise<{ shouldHandoff: boolean; consultation?: ConsultationResponse; targetAgent?: string }> {
  // Check if we should consult another agent
  const consultationCheck = await shouldConsultAgent(userMessage, primaryAgent);

  if (!consultationCheck.shouldConsult || !consultationCheck.targetAgent) {
    return { shouldHandoff: false };
  }

  // Perform consultation
  const consultation = await consultAgent(
    supabase,
    {
      requestingAgent: primaryAgent,
      consultingAgent: consultationCheck.targetAgent,
      query: userMessage,
      conversationId
    },
    lovableApiKey
  );

  return {
    shouldHandoff: false,
    consultation,
    targetAgent: consultationCheck.targetAgent
  };
}
