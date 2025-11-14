import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MilestoneNotification {
  userId: string;
  milestoneType: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, milestoneType, title, body, data }: MilestoneNotification =
      await req.json();

    if (!userId || !milestoneType || !title || !body) {
      throw new Error("Missing required fields");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if user has push subscriptions
    const { data: subscriptions } = await supabaseClient
      .from("push_subscriptions")
      .select("id")
      .eq("user_id", userId);

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`User ${userId} has no push subscriptions, skipping notification`);
      return new Response(
        JSON.stringify({
          success: true,
          message: "User has no push subscriptions",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Queue notification
    const { data: notification, error } = await supabaseClient
      .from("notification_queue")
      .insert({
        user_id: userId,
        notification_type: milestoneType,
        title,
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: data || {},
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`Queued notification for user ${userId}:`, notification);

    // Trigger send-push-notification function
    const { error: invokeError } = await supabaseClient.functions.invoke(
      "send-push-notification"
    );

    if (invokeError) {
      console.error("Error invoking send-push-notification:", invokeError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        notification,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in queue-milestone-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
