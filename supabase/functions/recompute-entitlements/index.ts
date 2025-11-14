import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { ErrorHandlerOptions, handleError, handleValidationError } from "../_shared/error-handler.ts";
import { enforceRateLimit } from "../_shared/rate-limiter.ts";
import { isAdmin } from "../_shared/admin-guard.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const inputSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  monthlyUsd: z.number()
    .min(0, "Subscription amount cannot be negative")
    .max(20, "Maximum subscription amount is $20")
    .optional(),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let requestUserId: string | undefined;
  const errorOptions = new ErrorHandlerOptions(corsHeaders, 'recompute-entitlements');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    requestUserId = user.id;
    errorOptions.userId = requestUserId;

    // Check rate limit - 20 recomputes per hour
    const rateLimitResponse = await enforceRateLimit(
      supabase,
      user.id,
      {
        functionName: 'recompute-entitlements',
        maxCalls: 20,
        windowMinutes: 60,
      },
      corsHeaders
    );
    if (rateLimitResponse) return rateLimitResponse;

    // Validate input
    const body = await req.json();
    const validated = inputSchema.parse(body);

    // Security: Only allow users to recompute their own entitlements (or admins)
    if (user.id !== validated.userId) {
      // Check if user is admin using secure helper function
      const userIsAdmin = await isAdmin(supabase, user.id);

      if (!userIsAdmin) {
        console.warn('[ENTITLEMENTS] Non-admin user attempted to recompute another user\'s entitlements:', {
          requesting_user: user.id,
          target_user: validated.userId,
        });
        throw new Error('Forbidden: Can only recompute own entitlements');
      }

      console.log('[ENTITLEMENTS] Admin user recomputing entitlements for another user:', {
        admin_user: user.id,
        target_user: validated.userId,
      });
    }

    // Get current subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('subscription_amount')
      .eq('user_id', validated.userId)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      throw new Error('Failed to fetch subscription');
    }

    const amount = validated.monthlyUsd ?? subscription?.subscription_amount ?? 0;

    // Validate amount
    if (amount < 0 || amount > 20) {
      throw new Error('Invalid subscription amount');
    }

    // Compute features using database function
    const { data: computedFeatures, error: computeError } = await supabase
      .rpc('compute_user_features', { sub_amount: amount });

    if (computeError) {
      throw new Error('Failed to compute features');
    }

    // Update feature_access table
    const { error: updateError } = await supabase
      .from('feature_access')
      .upsert({
        user_id: validated.userId,
        features: computedFeatures,
        computed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      throw new Error('Failed to update feature access');
    }

    console.log('[ENTITLEMENTS_COMPUTED]', {
      timestamp: new Date().toISOString(),
      target_user_id: validated.userId,
      amount,
    });

    return new Response(
      JSON.stringify({
        success: true,
        userId: validated.userId,
        amount,
        features: computedFeatures,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    if ((error as any)?.name === 'ZodError') {
      return handleValidationError(error, errorOptions);
    }
    return handleError(error, errorOptions);
  }
});
