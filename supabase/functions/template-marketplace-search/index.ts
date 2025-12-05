import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchRequest {
  query?: string;
  tags?: string[];
  incomeLevel?: string;
  householdType?: string;
  sortBy?: "downloads" | "rating" | "recent" | "relevance";
  limit?: number;
  offset?: number;
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
      query,
      tags = [],
      incomeLevel,
      householdType,
      sortBy = "relevance",
      limit = 20,
      offset = 0,
    }: SearchRequest = await req.json();

    // Build the base query
    let dbQuery = supabase
      .from("template_marketplace")
      .select(`
        *,
        template:template_id (
          category_mappings
        )
      `, { count: "exact" });

    // Apply filters
    if (tags.length > 0) {
      dbQuery = dbQuery.overlaps("tags", tags);
    }

    if (incomeLevel) {
      dbQuery = dbQuery.eq("income_level", incomeLevel);
    }

    if (householdType) {
      dbQuery = dbQuery.eq("household_type", householdType);
    }

    // Apply search query
    if (query && query.trim()) {
      const searchTerms = query.toLowerCase().trim();
      dbQuery = dbQuery.or(`title.ilike.%${searchTerms}%,description.ilike.%${searchTerms}%,author_name.ilike.%${searchTerms}%`);
    }

    // Apply sorting
    switch (sortBy) {
      case "downloads":
        dbQuery = dbQuery.order("downloads_count", { ascending: false });
        break;
      case "rating":
        dbQuery = dbQuery.order("rating_average", { ascending: false });
        break;
      case "recent":
        dbQuery = dbQuery.order("published_at", { ascending: false });
        break;
      case "relevance":
      default:
        // For relevance, prioritize featured, then by a combination of downloads and rating
        dbQuery = dbQuery
          .order("featured", { ascending: false })
          .order("rating_average", { ascending: false })
          .order("downloads_count", { ascending: false });
        break;
    }

    // Apply pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data: templates, error, count } = await dbQuery;

    if (error) {
      throw error;
    }

    // Calculate relevance scores for each result
    const scoredTemplates = (templates || []).map((template: any) => {
      let relevanceScore = 0;

      // Base score from rating and downloads
      relevanceScore += (template.rating_average || 0) * 10;
      relevanceScore += Math.log10((template.downloads_count || 0) + 1) * 5;

      // Boost for featured
      if (template.featured) {
        relevanceScore += 20;
      }

      // Boost for matching filters exactly
      if (incomeLevel && template.income_level === incomeLevel) {
        relevanceScore += 10;
      }
      if (householdType && template.household_type === householdType) {
        relevanceScore += 10;
      }

      // Boost for tag matches
      if (tags.length > 0) {
        const matchingTags = (template.tags || []).filter((t: string) =>
          tags.includes(t)
        );
        relevanceScore += matchingTags.length * 5;
      }

      // Search term matching in title gets higher boost
      if (query) {
        const lowerQuery = query.toLowerCase();
        if (template.title?.toLowerCase().includes(lowerQuery)) {
          relevanceScore += 15;
        }
        if (template.description?.toLowerCase().includes(lowerQuery)) {
          relevanceScore += 5;
        }
      }

      return {
        ...template,
        _relevanceScore: relevanceScore,
      };
    });

    // Sort by relevance if that's the selected sort
    if (sortBy === "relevance") {
      scoredTemplates.sort((a: any, b: any) => b._relevanceScore - a._relevanceScore);
    }

    // Get popular tags for faceted filtering
    const { data: allTemplates } = await supabase
      .from("template_marketplace")
      .select("tags");

    const tagCounts: Record<string, number> = {};
    (allTemplates || []).forEach((t: any) => {
      (t.tags || []).forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const popularTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    return new Response(
      JSON.stringify({
        templates: scoredTemplates,
        total: count || 0,
        limit,
        offset,
        facets: {
          tags: popularTags,
          incomeLevels: ["low", "medium", "high", "very_high"],
          householdTypes: ["single", "couple", "family", "roommates"],
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Template search error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
