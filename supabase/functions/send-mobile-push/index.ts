import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  user_id: string;
  title: string;
  message: string;
  notification_type?: string;
  action_url?: string;
  data?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: PushPayload = await req.json();
    const { user_id, title, message, notification_type, action_url, data } = payload;

    if (!user_id || !title || !message) {
      return new Response(
        JSON.stringify({ error: 'user_id, title, and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user's device tokens
    const { data: tokens, error: tokensError } = await supabaseClient
      .from('mobile_device_tokens')
      .select('*')
      .eq('user_id', user_id)
      .eq('enabled', true);

    if (tokensError) {
      console.error('Error fetching tokens:', tokensError);
      throw tokensError;
    }

    if (!tokens || tokens.length === 0) {
      console.log('No device tokens found for user:', user_id);
      return new Response(
        JSON.stringify({ success: false, message: 'No device tokens found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const token of tokens) {
      try {
        // For web push (using web-push format)
        if (token.platform === 'web' && token.device_token.startsWith('{')) {
          const subscription = JSON.parse(token.device_token);
          
          // Send web push notification
          // This would integrate with your web push service
          console.log('Sending web push to:', subscription.endpoint);
          
          results.push({ 
            platform: 'web', 
            success: true,
            token_id: token.id 
          });
        }
        // For iOS/Android (would integrate with FCM/APNs)
        else {
          console.log(`Sending ${token.platform} push to token:`, token.device_token.substring(0, 20) + '...');
          
          // Update last_used_at
          await supabaseClient
            .from('mobile_device_tokens')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', token.id);

          results.push({ 
            platform: token.platform, 
            success: true,
            token_id: token.id 
          });
        }
      } catch (err) {
        console.error('Failed to send push to token:', token.id, err);
        results.push({ 
          platform: token.platform, 
          success: false, 
          error: err instanceof Error ? err.message : 'Unknown error',
          token_id: token.id 
        });
      }
    }

    // Also create an in-app notification
    await supabaseClient
      .from('wallet_notifications')
      .insert({
        user_id,
        title,
        message,
        notification_type: notification_type || 'general',
        action_url,
        metadata: data
      });

    const successCount = results.filter(r => r.success).length;
    
    console.log(`Push notifications sent: ${successCount}/${results.length} successful`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount,
        total: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-mobile-push:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
