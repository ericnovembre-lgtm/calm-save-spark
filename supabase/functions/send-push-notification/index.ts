import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
}

const sendPushNotification = async (
  subscription: PushSubscription,
  payload: NotificationPayload
) => {
  // In a production environment, you would use web-push library with VAPID keys
  // For now, we'll use a placeholder implementation
  console.log("Sending push notification:", {
    endpoint: subscription.endpoint,
    payload,
  });

  // TODO: Implement actual web-push sending
  // This requires:
  // 1. npm:web-push library
  // 2. VAPID keys (public/private)
  // 3. Proper payload encryption

  return { success: true };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Process pending notifications
    const { data: pendingNotifications, error: fetchError } = await supabaseClient
      .from("notification_queue")
      .select(`
        *,
        push_subscriptions!inner(
          endpoint,
          p256dh,
          auth
        )
      `)
      .eq("status", "pending")
      .limit(100);

    if (fetchError) {
      console.error("Error fetching notifications:", fetchError);
      throw fetchError;
    }

    console.log(`Processing ${pendingNotifications?.length || 0} pending notifications`);

    const results = [];

    for (const notification of pendingNotifications || []) {
      try {
        const payload: NotificationPayload = {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || "/icon-192.png",
          badge: notification.badge || "/icon-192.png",
          data: notification.data || {},
        };

        // Send to all user's subscriptions
        const subscriptions = Array.isArray(notification.push_subscriptions)
          ? notification.push_subscriptions
          : [notification.push_subscriptions];

        for (const subscription of subscriptions) {
          if (subscription) {
            await sendPushNotification(subscription, payload);
          }
        }

        // Mark as sent
        await supabaseClient
          .from("notification_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", notification.id);

        results.push({ id: notification.id, status: "sent" });
      } catch (error: any) {
        console.error(`Error sending notification ${notification.id}:`, error);

        // Mark as failed
        await supabaseClient
          .from("notification_queue")
          .update({
            status: "failed",
            error_message: error.message,
          })
          .eq("id", notification.id);

        results.push({ id: notification.id, status: "failed", error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in send-push-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
