import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import Stripe from "https://esm.sh/stripe@14.25.0";
import { captureEdgeException } from "../_shared/sentry-edge.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Stripe secret key
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('[handle-stripe-webhook] STRIPE_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Stripe not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get webhook secret for signature verification
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('[handle-stripe-webhook] STRIPE_WEBHOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Get the signature from headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('[handle-stripe-webhook] Missing stripe-signature header');
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get raw body for signature verification
    const body = await req.text();

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('[handle-stripe-webhook] Signature verification failed:', err);
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[handle-stripe-webhook] Verified event:', event.type);

    // Handle different Stripe events
    switch (event.type) {
      case 'checkout.session.completed': {
        // Handle successful checkout
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const subscriptionAmount = (session.amount_total || 0) / 100; // Convert cents to dollars

        if (!userId) {
          console.error('[handle-stripe-webhook] Missing client_reference_id in session');
          break;
        }

        const { error: upsertError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            subscription_amount: subscriptionAmount,
            status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            billing_interval: 'monthly',
          });

        if (upsertError) {
          console.error('[handle-stripe-webhook] Error upserting subscription:', upsertError);
        } else {
          console.log('[handle-stripe-webhook] Subscription created for user:', userId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        // Handle subscription updates
        const subscription = event.data.object as Stripe.Subscription;
        
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          console.error('[handle-stripe-webhook] Error updating subscription:', updateError);
        } else {
          console.log('[handle-stripe-webhook] Subscription updated:', subscription.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        // Handle subscription cancellation
        const subscription = event.data.object as Stripe.Subscription;
        
        const { error: deleteError } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('stripe_subscription_id', subscription.id);

        if (deleteError) {
          console.error('[handle-stripe-webhook] Error canceling subscription:', deleteError);
        } else {
          console.log('[handle-stripe-webhook] Subscription canceled:', subscription.id);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        // Handle successful invoice payment (recurring billing)
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        if (subscriptionId) {
          const { error: invoiceError } = await supabase
            .from('user_subscriptions')
            .update({
              status: 'active',
              current_period_end: invoice.period_end 
                ? new Date(invoice.period_end * 1000).toISOString() 
                : null,
            })
            .eq('stripe_subscription_id', subscriptionId);

          if (invoiceError) {
            console.error('[handle-stripe-webhook] Error updating from invoice:', invoiceError);
          } else {
            console.log('[handle-stripe-webhook] Invoice payment succeeded for:', subscriptionId);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        // Handle failed invoice payment
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        if (subscriptionId) {
          const { error: failError } = await supabase
            .from('user_subscriptions')
            .update({
              status: 'past_due',
            })
            .eq('stripe_subscription_id', subscriptionId);

          if (failError) {
            console.error('[handle-stripe-webhook] Error updating failed payment:', failError);
          } else {
            console.log('[handle-stripe-webhook] Invoice payment failed for:', subscriptionId);
          }
        }
        break;
      }

      default:
        console.log('[handle-stripe-webhook] Unhandled event type:', event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[handle-stripe-webhook] Error:', error);
    
    // Capture error in Sentry
    await captureEdgeException(error, {
      transaction: 'handle-stripe-webhook',
      tags: {
        function: 'handle-stripe-webhook',
      },
    });

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
