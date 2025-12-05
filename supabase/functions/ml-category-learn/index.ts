import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MLLearnRequest {
  feedbackId: string;
  merchantName: string;
  suggestedCategory: string;
  acceptedCategory?: string;
  feedbackType: "accepted" | "corrected" | "rejected";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      feedbackId,
      merchantName,
      suggestedCategory,
      acceptedCategory,
      feedbackType,
    }: MLLearnRequest = await req.json();

    // Normalize merchant name for pattern matching
    const normalizedMerchant = merchantName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim();

    // Extract merchant patterns (e.g., "starbucks" from "STARBUCKS #12345")
    const merchantPatterns = extractMerchantPatterns(normalizedMerchant);

    // Get existing patterns for this merchant
    const { data: existingPatterns } = await supabase
      .from("category_feedback")
      .select("suggested_category, accepted_category, feedback_type")
      .or(merchantPatterns.map((p) => `merchant_name.ilike.%${p}%`).join(","))
      .order("created_at", { ascending: false })
      .limit(100);

    // Calculate category confidence scores based on feedback history
    const categoryScores: Record<string, { score: number; count: number }> = {};

    (existingPatterns || []).forEach((pattern: any) => {
      const category = pattern.accepted_category || pattern.suggested_category;
      if (!categoryScores[category]) {
        categoryScores[category] = { score: 0, count: 0 };
      }

      // Weight feedback types differently
      let weight = 0;
      switch (pattern.feedback_type) {
        case "accepted":
          weight = 1.0;
          break;
        case "corrected":
          // The corrected-to category gets positive weight
          if (pattern.accepted_category) {
            categoryScores[pattern.accepted_category] = categoryScores[pattern.accepted_category] || { score: 0, count: 0 };
            categoryScores[pattern.accepted_category].score += 1.5;
            categoryScores[pattern.accepted_category].count += 1;
          }
          // The originally suggested category gets negative weight
          categoryScores[pattern.suggested_category] = categoryScores[pattern.suggested_category] || { score: 0, count: 0 };
          categoryScores[pattern.suggested_category].score -= 0.5;
          break;
        case "rejected":
          weight = -1.0;
          break;
      }

      categoryScores[category].score += weight;
      categoryScores[category].count += 1;
    });

    // Find the best category based on scores
    let bestCategory = suggestedCategory;
    let bestScore = -Infinity;
    let confidence = 0.5; // Default confidence

    Object.entries(categoryScores).forEach(([category, data]) => {
      const normalizedScore = data.count > 0 ? data.score / data.count : 0;
      if (normalizedScore > bestScore) {
        bestScore = normalizedScore;
        bestCategory = category;
        // Calculate confidence based on consistency and volume
        confidence = Math.min(0.95, 0.5 + (data.count * 0.05) + (normalizedScore * 0.2));
      }
    });

    // Update or create a suggestion entry if we have learned something
    if (feedbackType === "corrected" && acceptedCategory) {
      // Store the learned pattern for future suggestions
      await supabase.from("category_suggestions").upsert(
        {
          merchant_pattern: merchantPatterns[0] || normalizedMerchant,
          suggested_category: acceptedCategory,
          confidence_score: confidence,
          source: "ml_learned",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "merchant_pattern" }
      );
    }

    // Calculate learning metrics
    const totalFeedback = (existingPatterns || []).length;
    const correctionRate =
      totalFeedback > 0
        ? (existingPatterns || []).filter((p: any) => p.feedback_type === "corrected").length / totalFeedback
        : 0;

    // Log the learning event
    console.log("ML Category Learning:", {
      merchantName,
      normalizedMerchant,
      patterns: merchantPatterns,
      feedbackType,
      suggestedCategory,
      acceptedCategory,
      learnedBestCategory: bestCategory,
      confidence,
      totalFeedbackCount: totalFeedback,
      correctionRate,
    });

    return new Response(
      JSON.stringify({
        success: true,
        learned: {
          merchantPattern: merchantPatterns[0],
          bestCategory,
          confidence,
          feedbackCount: totalFeedback,
          correctionRate,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("ML learning error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Extract common merchant name patterns for matching
 */
function extractMerchantPatterns(merchantName: string): string[] {
  const patterns: string[] = [];

  // Full normalized name
  patterns.push(merchantName);

  // Remove trailing numbers and location codes
  const withoutNumbers = merchantName.replace(/\s*#?\d+\s*$/g, "").trim();
  if (withoutNumbers && withoutNumbers !== merchantName) {
    patterns.push(withoutNumbers);
  }

  // Extract first word (often the brand name)
  const words = merchantName.split(/\s+/);
  if (words.length > 1 && words[0].length > 3) {
    patterns.push(words[0]);
  }

  // Common variations
  const variations = [
    merchantName.replace(/\s+/g, ""), // No spaces
    merchantName.replace(/^(the|a)\s+/i, ""), // Remove articles
  ];

  variations.forEach((v) => {
    if (v && v !== merchantName && !patterns.includes(v)) {
      patterns.push(v);
    }
  });

  return patterns.slice(0, 5); // Limit to 5 patterns
}
