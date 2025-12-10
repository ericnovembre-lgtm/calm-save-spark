import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { financialCoachHandler } from "./handlers/financial-coach.ts";
import { onboardingGuideHandler } from "./handlers/onboarding-guide.ts";
import { taxAssistantHandler } from "./handlers/tax-assistant.ts";
import { investmentResearchHandler } from "./handlers/investment-research.ts";
import { debtAdvisorHandler } from "./handlers/debt-advisor.ts";
import { lifePlannerHandler } from "./handlers/life-planner.ts";
import { helpAgentHandler } from "./handlers/help-agent.ts";
import { digitalTwinAdvisorHandler } from "./handlers/digital-twin-advisor.ts";
import { checkAnthropicHealth } from "./utils/anthropic-client.ts";
import { captureEdgeException } from "../_shared/sentry-edge.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentRequest {
  agent_type: string;
  message: string;
  conversation_id?: string;
  metadata?: Record<string, any>;
}

const AGENT_HANDLERS = {
  financial_coach: financialCoachHandler,
  onboarding_guide: onboardingGuideHandler,
  tax_assistant: taxAssistantHandler,
  investment_research: investmentResearchHandler,
  debt_advisor: debtAdvisorHandler,
  life_planner: lifePlannerHandler,
  help_agent: helpAgentHandler,
  digital_twin_advisor: digitalTwinAdvisorHandler,
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle health check endpoint (no auth required)
  const url = new URL(req.url);
  if (url.searchParams.get('health') === 'claude') {
    try {
      const healthResult = await checkAnthropicHealth();
      const statusCode = healthResult.status === 'healthy' ? 200 : 
                        healthResult.status === 'degraded' ? 429 : 503;
      
      return new Response(JSON.stringify(healthResult, null, 2), {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Health check error:', error);
      return new Response(
        JSON.stringify({ 
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Health check failed',
          timestamp: new Date().toISOString()
        }, null, 2),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const { agent_type, message, conversation_id, metadata }: AgentRequest = await req.json();

    if (!agent_type || !message) {
      throw new Error('Missing required fields: agent_type and message');
    }

    // Get agent handler
    const handler = AGENT_HANDLERS[agent_type as keyof typeof AGENT_HANDLERS];
    if (!handler) {
      throw new Error(`Unknown agent type: ${agent_type}`);
    }

    // Execute agent handler with streaming response
    const stream = await handler({
      supabase: supabaseClient,
      userId: user.id,
      message,
      conversationId: conversation_id,
      metadata: metadata || {},
    });

    // Return streaming response
    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in ai-agent function:', error);
    
    // Capture error in Sentry with context
    await captureEdgeException(error, {
      transaction: 'ai-agent',
      tags: {
        function: 'ai-agent',
        method: req.method,
      },
      extra: {
        url: req.url,
        timestamp: new Date().toISOString(),
      },
    });
    
    // Log error details for debugging
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Handle specific error cases
    if (errorMessage === 'RATE_LIMIT_EXCEEDED' || errorMessage.includes('rate limit')) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    if (errorMessage === 'PAYMENT_REQUIRED' || errorMessage.includes('credits')) {
      return new Response(
        JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
        {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    if (errorMessage === 'Unauthorized') {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Generic error response
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
