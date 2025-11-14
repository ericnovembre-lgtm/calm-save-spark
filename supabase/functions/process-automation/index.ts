import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { ErrorHandlerOptions, handleError, handleValidationError } from "../_shared/error-handler.ts";
import { enforceRateLimit, RATE_LIMITS } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const inputSchema = z.object({
  ruleId: z.string().uuid("Invalid rule ID format"),
  transactionAmount: z.number()
    .positive("Transaction amount must be positive")
    .max(1000000, "Transaction amount too large")
    .refine((val) => !isNaN(val), "Transaction amount must be a valid number"),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let userId: string | undefined;
  const errorOptions = new ErrorHandlerOptions(corsHeaders, 'process-automation');

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    userId = user.id;
    errorOptions.userId = userId;

    // Check rate limit
    const rateLimitResponse = await enforceRateLimit(
      supabaseClient,
      user.id,
      RATE_LIMITS['process-automation'],
      corsHeaders
    );
    if (rateLimitResponse) return rateLimitResponse;

    // Validate input
    const body = await req.json();
    const validated = inputSchema.parse(body);

    // Fetch the automation rule (with user verification)
    const { data: rule, error: ruleError } = await supabaseClient
      .from('automation_rules')
      .select('*')
      .eq('id', validated.ruleId)
      .eq('user_id', user.id) // Security: ensure rule belongs to user
      .single();

    if (ruleError || !rule) {
      throw new Error('Rule not found or inactive');
    }

    if (!rule.is_active) {
      throw new Error('Rule not found or inactive');
    }

    let amountToSave = 0;

    // Process based on rule type
    switch (rule.rule_type) {
      case 'round_up':
        // Round up to nearest dollar
        amountToSave = Math.ceil(validated.transactionAmount) - validated.transactionAmount;
        break;
      
      case 'percentage_save':
        // Save a percentage of transaction
        const percentage = rule.action_config?.percentage || 10;
        if (percentage < 0 || percentage > 100) {
          throw new Error('Invalid percentage configuration');
        }
        amountToSave = (validated.transactionAmount * percentage) / 100;
        break;
      
      case 'scheduled_transfer':
        // Fixed amount transfer
        amountToSave = rule.action_config?.amount || 0;
        if (amountToSave <= 0) {
          throw new Error('Invalid transfer amount configuration');
        }
        break;
      
      default:
        throw new Error('Unknown rule type');
    }

    // Validate calculated amount
    if (amountToSave <= 0 || amountToSave > validated.transactionAmount) {
      throw new Error('Invalid calculated savings amount');
    }

    // Apply the automation (update goal or pot)
    const targetType = rule.action_config?.target_type;
    const targetId = rule.action_config?.target_id;

    if (!targetType || !targetId) {
      throw new Error('Invalid rule configuration');
    }

    if (targetType === 'goal') {
      const { error } = await supabaseClient
        .from('goals')
        .update({ 
          current_amount: supabaseClient.rpc('increment', { amount: amountToSave }) 
        })
        .eq('id', targetId)
        .eq('user_id', user.id);

      if (error) throw error;
    } else if (targetType === 'pot') {
      const { error } = await supabaseClient
        .from('pots')
        .update({ 
          current_amount: supabaseClient.rpc('increment', { amount: amountToSave }) 
        })
        .eq('id', targetId)
        .eq('user_id', user.id);

      if (error) throw error;
    } else {
      throw new Error('Invalid target type');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        amount_saved: amountToSave,
        rule_type: rule.rule_type
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    if ((error as any)?.name === 'ZodError') {
      return handleValidationError(error, errorOptions);
    }
    return handleError(error, errorOptions);
  }
});