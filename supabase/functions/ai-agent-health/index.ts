import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * AI Agent Health Check Endpoint
 * Public endpoint (no JWT required) for monitoring Claude API health
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const model = 'claude-sonnet-4-5';
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

  console.log('[Health Check] ===== Claude Health Check Started =====');
  console.log('[Health Check] Timestamp:', new Date().toISOString());

  // Check if API key exists
  if (!ANTHROPIC_API_KEY) {
    console.error('[Health Check] FAILED: API key not configured');
    return new Response(JSON.stringify({
      status: 'unhealthy',
      apiKeyConfigured: false,
      apiKeyValid: false,
      modelResponding: false,
      latencyMs: Date.now() - startTime,
      model,
      error: 'ANTHROPIC_API_KEY not configured',
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  console.log('[Health Check] API key configured:', ANTHROPIC_API_KEY.slice(0, 8) + '...');

  try {
    // Make minimal test request to Claude (non-streaming)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }]
      })
    });

    const latencyMs = Date.now() - startTime;
    console.log('[Health Check] Response received, status:', response.status);
    console.log('[Health Check] Latency:', latencyMs, 'ms');

    // Handle 401 - Invalid API key
    if (response.status === 401) {
      console.error('[Health Check] FAILED: Invalid API key (401)');
      return new Response(JSON.stringify({
        status: 'unhealthy',
        apiKeyConfigured: true,
        apiKeyValid: false,
        modelResponding: false,
        latencyMs,
        model,
        error: 'Invalid API key - authentication failed',
        timestamp: new Date().toISOString()
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle 429 - Rate limited
    if (response.status === 429) {
      const resetHeader = response.headers.get('anthropic-ratelimit-requests-reset');
      console.warn('[Health Check] DEGRADED: Rate limited (429)');
      return new Response(JSON.stringify({
        status: 'degraded',
        apiKeyConfigured: true,
        apiKeyValid: true,
        modelResponding: false,
        latencyMs,
        model,
        error: 'Rate limited - try again later',
        rateLimitReset: resetHeader || undefined,
        timestamp: new Date().toISOString()
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle 500+ - Server errors
    if (response.status >= 500) {
      console.error('[Health Check] FAILED: Server error (500+)');
      return new Response(JSON.stringify({
        status: 'unhealthy',
        apiKeyConfigured: true,
        apiKeyValid: true,
        modelResponding: false,
        latencyMs,
        model,
        error: 'Anthropic service error',
        timestamp: new Date().toISOString()
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle success
    if (response.ok) {
      const responseData = await response.json();
      console.log('[Health Check] SUCCESS: Claude responding correctly');
      console.log('[Health Check] Response ID:', responseData.id);

      return new Response(JSON.stringify({
        status: 'healthy',
        apiKeyConfigured: true,
        apiKeyValid: true,
        modelResponding: true,
        latencyMs,
        model,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Unexpected status
    return new Response(JSON.stringify({
      status: 'unhealthy',
      apiKeyConfigured: true,
      apiKeyValid: true,
      modelResponding: false,
      latencyMs,
      model,
      error: `Unexpected response status: ${response.status}`,
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const latencyMs = Date.now() - startTime;
    console.error('[Health Check] ERROR:', error);

    return new Response(JSON.stringify({
      status: 'unhealthy',
      apiKeyConfigured: true,
      apiKeyValid: false,
      modelResponding: false,
      latencyMs,
      model,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
