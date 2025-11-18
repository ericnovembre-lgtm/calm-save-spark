import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReceiptAnalysisResult {
  amount: number;
  merchant: string;
  date: string;
  category?: string;
  items?: Array<{ name: string; price: number }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { imagePath } = await req.json();

    // Get the image from storage
    const { data: imageData, error: downloadError } = await supabaseClient.storage
      .from("receipts")
      .download(imagePath);

    if (downloadError) throw downloadError;

    // Convert image to base64
    const arrayBuffer = await imageData.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Use Lovable AI to analyze the receipt
    const { data: analysis, error: aiError } = await supabaseClient.functions.invoke(
      "lovable-ai",
      {
        body: {
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze this receipt image and extract the following information in JSON format:
                  {
                    "amount": <total amount as number>,
                    "merchant": "<merchant/store name>",
                    "date": "<date in YYYY-MM-DD format>",
                    "category": "<best guess category: groceries, dining, shopping, transportation, entertainment, utilities, healthcare, other>",
                    "items": [{"name": "<item name>", "price": <price>}]
                  }
                  Return ONLY the JSON object, no additional text.`,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
        },
      }
    );

    if (aiError) throw aiError;

    // Parse the AI response
    const responseText = analysis.choices[0].message.content;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("Could not parse receipt data from AI response");
    }

    const result: ReceiptAnalysisResult = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Receipt analysis error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
