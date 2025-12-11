import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlgoliaRecord {
  objectID: string;
  [key: string]: unknown;
}

interface IndexRequest {
  action: "index" | "delete" | "bulk_sync" | "clear";
  indexName: string;
  records?: AlgoliaRecord[];
  objectIDs?: string[];
}

async function algoliaRequest(
  appId: string,
  adminKey: string,
  indexName: string,
  endpoint: string,
  method: string,
  body?: unknown
): Promise<Response> {
  const url = `https://${appId}-dsn.algolia.net/1/indexes/${indexName}${endpoint}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      "X-Algolia-API-Key": adminKey,
      "X-Algolia-Application-Id": appId,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return response;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ALGOLIA_APP_ID = Deno.env.get("ALGOLIA_APP_ID");
    const ALGOLIA_ADMIN_API_KEY = Deno.env.get("ALGOLIA_ADMIN_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_API_KEY) {
      console.error("Algolia not configured");
      return new Response(
        JSON.stringify({
          error: "Algolia not configured",
          message: "Please add ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY secrets",
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, indexName, records, objectIDs }: IndexRequest = await req.json();

    if (!indexName) {
      return new Response(
        JSON.stringify({ error: "indexName is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result;

    switch (action) {
      case "index": {
        if (!records || records.length === 0) {
          return new Response(
            JSON.stringify({ error: "records array is required for index action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Add user_id to each record for security
        const securedRecords = records.map(record => ({
          ...record,
          user_id: user.id,
        }));

        const response = await algoliaRequest(
          ALGOLIA_APP_ID,
          ALGOLIA_ADMIN_API_KEY,
          indexName,
          "/batch",
          "POST",
          {
            requests: securedRecords.map(record => ({
              action: "updateObject",
              body: record,
            })),
          }
        );

        result = await response.json();
        console.log(`Indexed ${records.length} records to ${indexName}`);
        break;
      }

      case "delete": {
        if (!objectIDs || objectIDs.length === 0) {
          return new Response(
            JSON.stringify({ error: "objectIDs array is required for delete action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const response = await algoliaRequest(
          ALGOLIA_APP_ID,
          ALGOLIA_ADMIN_API_KEY,
          indexName,
          "/batch",
          "POST",
          {
            requests: objectIDs.map(objectID => ({
              action: "deleteObject",
              body: { objectID },
            })),
          }
        );

        result = await response.json();
        console.log(`Deleted ${objectIDs.length} records from ${indexName}`);
        break;
      }

      case "bulk_sync": {
        // Sync user's transactions to Algolia
        if (indexName === "transactions") {
          const { data: transactions, error: txError } = await supabase
            .from("transactions")
            .select("id, merchant, description, amount, category, transaction_date, account_id")
            .eq("user_id", user.id)
            .limit(1000);

          if (txError) {
            throw txError;
          }

          if (transactions && transactions.length > 0) {
            const algoliaRecords = transactions.map(tx => ({
              objectID: tx.id,
              merchant: tx.merchant,
              description: tx.description,
              amount: tx.amount,
              category: tx.category,
              transaction_date: tx.transaction_date,
              account_id: tx.account_id,
              user_id: user.id,
            }));

            const response = await algoliaRequest(
              ALGOLIA_APP_ID,
              ALGOLIA_ADMIN_API_KEY,
              indexName,
              "/batch",
              "POST",
              {
                requests: algoliaRecords.map(record => ({
                  action: "updateObject",
                  body: record,
                })),
              }
            );

            result = await response.json();
            console.log(`Bulk synced ${transactions.length} transactions for user ${user.id}`);
          } else {
            result = { message: "No transactions to sync" };
          }
        }
        // Sync user's goals to Algolia
        else if (indexName === "goals") {
          const { data: goals, error: goalsError } = await supabase
            .from("goals")
            .select("id, goal_name, description, target_amount, current_amount, target_date, category, is_active")
            .eq("user_id", user.id);

          if (goalsError) {
            throw goalsError;
          }

          if (goals && goals.length > 0) {
            const algoliaRecords = goals.map(goal => ({
              objectID: goal.id,
              goal_name: goal.goal_name,
              description: goal.description,
              target_amount: goal.target_amount,
              current_amount: goal.current_amount,
              target_date: goal.target_date,
              category: goal.category,
              is_active: goal.is_active,
              user_id: user.id,
            }));

            const response = await algoliaRequest(
              ALGOLIA_APP_ID,
              ALGOLIA_ADMIN_API_KEY,
              indexName,
              "/batch",
              "POST",
              {
                requests: algoliaRecords.map(record => ({
                  action: "updateObject",
                  body: record,
                })),
              }
            );

            result = await response.json();
            console.log(`Bulk synced ${goals.length} goals for user ${user.id}`);
          } else {
            result = { message: "No goals to sync" };
          }
        } else {
          return new Response(
            JSON.stringify({ error: `Bulk sync not supported for index: ${indexName}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        break;
      }

      case "clear": {
        // Clear all user's records from the index (by deleting with filter)
        // Note: This requires the index to have user_id as a filterable attribute
        const response = await algoliaRequest(
          ALGOLIA_APP_ID,
          ALGOLIA_ADMIN_API_KEY,
          indexName,
          "/deleteByQuery",
          "POST",
          {
            filters: `user_id:${user.id}`,
          }
        );

        result = await response.json();
        console.log(`Cleared records for user ${user.id} from ${indexName}`);
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Algolia admin error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
