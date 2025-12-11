import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TRIGGER_SECRET_KEY = Deno.env.get("TRIGGER_SECRET_KEY");
const TRIGGER_API_URL = "https://api.trigger.dev/api/v1";

interface JobPayload {
  type: string;
  data: Record<string, unknown>;
  priority?: "low" | "normal" | "high";
  metadata?: Record<string, unknown>;
}

interface TriggerRequest {
  action: "submit" | "status" | "cancel";
  payload?: JobPayload;
  jobId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!TRIGGER_SECRET_KEY) {
      console.error("TRIGGER_SECRET_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Trigger.dev not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: TriggerRequest = await req.json();
    const { action, payload, jobId } = body;

    const headers = {
      "Authorization": `Bearer ${TRIGGER_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    switch (action) {
      case "submit": {
        if (!payload) {
          return new Response(
            JSON.stringify({ error: "Payload is required for submit action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Map job types to Trigger.dev task identifiers
        const taskId = `save-plus/${payload.type}`;

        const response = await fetch(`${TRIGGER_API_URL}/runs`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            taskIdentifier: taskId,
            payload: payload.data,
            options: {
              queue: {
                name: payload.priority === "high" ? "high-priority" : "default",
              },
              metadata: payload.metadata,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Trigger.dev submit failed:", errorText);
          return new Response(
            JSON.stringify({ error: "Failed to submit job", details: errorText }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const result = await response.json();
        console.log("Job submitted successfully:", result.id);

        return new Response(
          JSON.stringify({ success: true, jobId: result.id }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "status": {
        if (!jobId) {
          return new Response(
            JSON.stringify({ error: "jobId is required for status action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const response = await fetch(`${TRIGGER_API_URL}/runs/${jobId}`, {
          method: "GET",
          headers,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Trigger.dev status failed:", errorText);
          return new Response(
            JSON.stringify({ error: "Failed to get job status", details: errorText }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const result = await response.json();

        // Map Trigger.dev status to our format
        const statusMap: Record<string, string> = {
          PENDING: "pending",
          QUEUED: "pending",
          EXECUTING: "running",
          COMPLETED: "completed",
          FAILED: "failed",
          CANCELED: "failed",
        };

        return new Response(
          JSON.stringify({
            status: {
              id: result.id,
              status: statusMap[result.status] || "pending",
              progress: result.output?.progress,
              result: result.output?.result,
              error: result.error?.message,
              createdAt: result.createdAt,
              updatedAt: result.updatedAt,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "cancel": {
        if (!jobId) {
          return new Response(
            JSON.stringify({ error: "jobId is required for cancel action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const response = await fetch(`${TRIGGER_API_URL}/runs/${jobId}/cancel`, {
          method: "POST",
          headers,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Trigger.dev cancel failed:", errorText);
          return new Response(
            JSON.stringify({ error: "Failed to cancel job", details: errorText }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("Job cancelled successfully:", jobId);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("trigger-job error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
