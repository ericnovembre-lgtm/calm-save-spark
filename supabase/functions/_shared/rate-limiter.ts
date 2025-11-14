/**
 * Rate limiting utility for edge functions
 * Uses database-backed tracking to enforce limits across function invocations
 */

type SupabaseClient = any;

export interface RateLimitConfig {
  functionName: string;
  maxCalls: number;
  windowMinutes: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Predefined rate limits for different function types
 */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'ai-coach': {
    functionName: 'ai-coach',
    maxCalls: 50, // 50 AI calls per hour
    windowMinutes: 60,
  },
  'generate-api-key': {
    functionName: 'generate-api-key',
    maxCalls: 10, // 10 API keys per hour
    windowMinutes: 60,
  },
  'process-automation': {
    functionName: 'process-automation',
    maxCalls: 100, // 100 automation runs per hour
    windowMinutes: 60,
  },
};

/**
 * Checks if user has exceeded rate limit for a function
 * @returns RateLimitResult with allowed status and metadata
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const windowStart = new Date();
  windowStart.setMinutes(windowStart.getMinutes() - config.windowMinutes);

  try {
    // Get current call count within window
    const { data: existingRecord, error: fetchError } = await supabase
      .from('edge_function_rate_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('function_name', config.functionName)
      .gte('window_start', windowStart.toISOString())
      .order('window_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('[RATE_LIMIT_CHECK_ERROR]', {
        function: config.functionName,
        error: fetchError,
      });
      // Allow request on error to prevent blocking users
      return {
        allowed: true,
        remaining: config.maxCalls,
        resetAt: new Date(Date.now() + config.windowMinutes * 60000),
      };
    }

    // If no record or window expired, create new window
    if (!existingRecord || new Date(existingRecord.window_start) < windowStart) {
      const { error: insertError } = await supabase
        .from('edge_function_rate_limits')
        .insert({
          user_id: userId,
          function_name: config.functionName,
          call_count: 1,
          window_start: new Date().toISOString(),
        });

      if (insertError) {
        console.error('[RATE_LIMIT_INSERT_ERROR]', insertError);
      }

      return {
        allowed: true,
        remaining: config.maxCalls - 1,
        resetAt: new Date(Date.now() + config.windowMinutes * 60000),
      };
    }

    // Check if limit exceeded
    if (existingRecord.call_count >= config.maxCalls) {
      const resetAt = new Date(existingRecord.window_start);
      resetAt.setMinutes(resetAt.getMinutes() + config.windowMinutes);

      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Increment call count
    const { error: updateError } = await supabase
      .from('edge_function_rate_limits')
      .update({
        call_count: existingRecord.call_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingRecord.id);

    if (updateError) {
      console.error('[RATE_LIMIT_UPDATE_ERROR]', updateError);
    }

    const resetAt = new Date(existingRecord.window_start);
    resetAt.setMinutes(resetAt.getMinutes() + config.windowMinutes);

    return {
      allowed: true,
      remaining: config.maxCalls - existingRecord.call_count - 1,
      resetAt,
    };
  } catch (error) {
    console.error('[RATE_LIMIT_ERROR]', {
      function: config.functionName,
      error,
    });
    // Allow request on error
    return {
      allowed: true,
      remaining: config.maxCalls,
      resetAt: new Date(Date.now() + config.windowMinutes * 60000),
    };
  }
}

/**
 * Enforces rate limit and returns error response if exceeded
 */
export async function enforceRateLimit(
  supabase: SupabaseClient,
  userId: string,
  config: RateLimitConfig,
  corsHeaders: Record<string, string>
): Promise<Response | null> {
  const result = await checkRateLimit(supabase, userId, config);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt.getTime() - Date.now()) / 1000);

    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded. Please try again later.',
        retry_after: retryAfter,
        reset_at: result.resetAt.toISOString(),
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxCalls.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetAt.toISOString(),
        },
      }
    );
  }

  // Return null if allowed (function can proceed)
  return null;
}
