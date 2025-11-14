import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { ErrorHandlerOptions, handleError, handleValidationError } from "../_shared/error-handler.ts";
import { enforceRateLimit, RATE_LIMITS } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const permissionsSchema = z.object({
  read: z.boolean(),
  write: z.boolean(),
  delete: z.boolean().optional(),
}).strict();

const inputSchema = z.object({
  organization_id: z.string().uuid("Invalid organization ID format"),
  key_name: z.string()
    .trim()
    .min(1, "Key name cannot be empty")
    .max(100, "Key name too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Key name can only contain letters, numbers, hyphens and underscores"),
  permissions: permissionsSchema,
  expires_in_days: z.number()
    .int("Expiration must be a whole number")
    .positive("Expiration must be positive")
    .max(365, "Maximum expiration is 365 days")
    .optional(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let userId: string | undefined;
  const errorOptions = new ErrorHandlerOptions(corsHeaders, 'generate-api-key');

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    userId = user.id;
    errorOptions.userId = userId;

    // Check rate limit
    const rateLimitResponse = await enforceRateLimit(
      supabaseClient,
      user.id,
      RATE_LIMITS['generate-api-key'],
      corsHeaders
    );
    if (rateLimitResponse) return rateLimitResponse;

    // Validate input
    const body = await req.json();
    const validated = inputSchema.parse(body);

    // Verify user owns the organization
    const { data: org, error: orgError } = await supabaseClient
      .from('organizations')
      .select('*')
      .eq('id', validated.organization_id)
      .eq('owner_id', user.id)
      .single();

    if (orgError || !org) {
      throw new Error('Organization not found or unauthorized');
    }

    // Check if organization already has maximum number of keys (10)
    const { count: keyCount } = await supabaseClient
      .from('organization_api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', validated.organization_id)
      .is('revoked_at', null);

    if (keyCount && keyCount >= 10) {
      return new Response(
        JSON.stringify({ 
          error: 'Maximum API key limit reached (10 keys per organization).',
          code: 'MAX_KEYS_REACHED'
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check for duplicate key name
    const { data: existingKey } = await supabaseClient
      .from('organization_api_keys')
      .select('id')
      .eq('organization_id', validated.organization_id)
      .eq('key_name', validated.key_name)
      .is('revoked_at', null)
      .maybeSingle();

    if (existingKey) {
      return new Response(
        JSON.stringify({ 
          error: 'An API key with this name already exists.',
          code: 'DUPLICATE_KEY_NAME'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate secure API key
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const apiKey = `sk_${org.slug}_${Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`;

    // Calculate expiration date
    let expiresAt = null;
    if (validated.expires_in_days) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + validated.expires_in_days);
      expiresAt = expDate.toISOString();
    }

    // Store API key
    const { data: keyData, error: keyError } = await supabaseClient
      .from('organization_api_keys')
      .insert({
        organization_id: validated.organization_id,
        key_name: validated.key_name,
        api_key: apiKey,
        permissions: validated.permissions,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (keyError) {
      throw keyError;
    }

    console.log('[API_KEY_CREATED]', {
      timestamp: new Date().toISOString(),
      organization_id: validated.organization_id,
      key_name: validated.key_name,
    });

    return new Response(
      JSON.stringify({
        ...keyData,
        api_key_display: apiKey, // Show once, then hide
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    if ((error as any)?.name === 'ZodError') {
      return handleValidationError(error, errorOptions);
    }
    return handleError(error, errorOptions);
  }
});
