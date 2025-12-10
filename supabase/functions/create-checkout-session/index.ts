import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import Stripe from "https://esm.sh/stripe@14.25.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { ErrorHandlerOptions, handleError, handleValidationError } from "../_shared/error-handler.ts";
import { enforceRateLimit } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const inputSchema = z.object({
  monthly_usd: z.number()
    .min(0, "Subscription amount cannot be negative")
    .max(20, "Maximum subscription amount is $20")
    .int("Subscription amount must be a whole number"),
  success_url: z.string().url("Success URL must be a valid URL").optional(),
  cancel_url: z.string().url("Cancel URL must be a valid URL").optional(),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let userId: string | undefined;
  const errorOptions = new ErrorHandlerOptions(corsHeaders, 'create-checkout-session');

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

    userId = user.id;
    errorOptions.userId = userId;

    // Check rate limit - 5 checkout attempts per hour
    const rateLimitResponse = await enforceRateLimit(
      supabase,
      user.id,
      {
        functionName: 'create-checkout-session',
        maxCalls: 5,
        windowMinutes: 60,
      },
      corsHeaders
    );
    if (rateLimitResponse) return rateLimitResponse;

    // Validate input
    const body = await req.json();
    const validated = inputSchema.parse(body);

    // For free plan ($0), handle locally without Stripe
    if (validated.monthly_usd === 0) {
      // Update or create subscription
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          subscription_amount: 0,
          status: 'active',
          billing_interval: 'monthly',
        });

      if (subError) throw subError;

      return new Response(
        JSON.stringify({
          success: true,
          url: validated.success_url || '/',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check for Stripe secret key
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('[create-checkout-session] STRIPE_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({
          error: 'Stripe not configured',
          message: 'Please add STRIPE_SECRET_KEY to your project secrets',
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Get or create Stripe customer
    let stripeCustomerId: string;

    // Check if user already has a Stripe customer ID
    const { data: existingSub } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (existingSub?.stripe_customer_id) {
      stripeCustomerId = existingSub.stripe_customer_id;
      console.log(`[create-checkout-session] Using existing Stripe customer: ${stripeCustomerId}`);
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      stripeCustomerId = customer.id;
      console.log(`[create-checkout-session] Created new Stripe customer: ${stripeCustomerId}`);

      // Store customer ID in database
      await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          stripe_customer_id: stripeCustomerId,
          subscription_amount: 0,
          status: 'pending',
          billing_interval: 'monthly',
        });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      client_reference_id: user.id,
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `$ave+ Subscription - $${validated.monthly_usd}/month`,
              description: `Monthly subscription at $${validated.monthly_usd}/month`,
            },
            unit_amount: validated.monthly_usd * 100, // Convert to cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: validated.success_url || `${req.headers.get('origin')}/settings?subscription=success`,
      cancel_url: validated.cancel_url || `${req.headers.get('origin')}/settings?subscription=canceled`,
      metadata: {
        user_id: user.id,
        monthly_usd: validated.monthly_usd.toString(),
      },
    });

    console.log(`[create-checkout-session] Created checkout session: ${session.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        url: session.url,
        session_id: session.id,
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
