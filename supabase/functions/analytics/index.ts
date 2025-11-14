import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema with strict limits to prevent log injection and storage abuse
const analyticsSchema = z.object({
  event: z.string()
    .trim()
    .min(1, "Event name is required")
    .max(100, "Event name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9_\-.:]+$/, "Event name can only contain alphanumeric characters, underscores, hyphens, colons, and dots"),
  
  properties: z.record(z.unknown())
    .optional()
    .refine(
      (props) => {
        if (!props) return true;
        // Max 10 properties
        if (Object.keys(props).length > 10) return false;
        // Max 1KB total size
        const jsonSize = JSON.stringify(props).length;
        return jsonSize <= 1024;
      },
      {
        message: "Properties must contain at most 10 entries and be under 1KB total size"
      }
    )
    .transform((props) => {
      if (!props) return {};
      // Sanitize property keys to prevent injection
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(props)) {
        const sanitizedKey = key.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 50);
        sanitized[sanitizedKey] = value;
      }
      return sanitized;
    }),
  
  userId: z.string()
    .uuid("Invalid user ID format")
    .nullish(),
  
  timestamp: z.string()
    .datetime({ message: "Invalid timestamp format" })
    .optional(),
});

type AnalyticsEvent = z.infer<typeof analyticsSchema>;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for database writes
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate request body
    const body = await req.json();
    const validated = analyticsSchema.parse(body);
    const { event, properties = {}, userId, timestamp } = validated;

    console.log(`[Analytics] Processing event: ${event} (properties: ${Object.keys(properties).length})`);

    // Extract route from properties or default to unknown
    const route = properties.route || '/unknown';

    // Insert analytics event into database
    const { error: insertError } = await supabase
      .from('analytics_events')
      .insert({
        event,
        properties,
        user_hashed: userId,
        route,
        timestamp: timestamp || new Date().toISOString(),
      });

    if (insertError) {
      console.error('[Analytics] Database insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to store analytics event' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Analytics] Event stored: ${event} (route: ${route})`);

    return new Response(
      JSON.stringify({ success: true, event }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Analytics] Unexpected error:', error);
    
    // Handle validation errors specifically
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      console.warn('[Analytics] Validation failed:', validationErrors);
      return new Response(
        JSON.stringify({ 
          error: 'Validation error', 
          details: validationErrors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
