import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface MarketplaceTemplate {
  id: string;
  template_id: string | null;
  author_id: string | null;
  title: string;
  description: string | null;
  preview_image_url: string | null;
  tags: string[];
  downloads_count: number;
  rating_average: number;
  rating_count: number;
  featured: boolean;
  author_name: string | null;
  income_level: string | null;
  household_type: string | null;
  published_at: string;
  template?: {
    category_mappings: Record<string, any>;
  };
}

export interface TemplateRating {
  id: string;
  marketplace_id: string;
  user_id: string;
  rating: number;
  review: string | null;
  created_at: string;
}

export interface MarketplaceFilters {
  search?: string;
  tags?: string[];
  incomeLevel?: string;
  householdType?: string;
  sortBy?: "downloads" | "rating" | "recent";
  featured?: boolean;
}

export const useTemplateMarketplace = (filters: MarketplaceFilters = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch marketplace templates
  const templatesQuery = useQuery({
    queryKey: ["template-marketplace", filters],
    queryFn: async (): Promise<MarketplaceTemplate[]> => {
      let query = supabase.from("template_marketplace" as any).select("*") as any;

      if (filters.featured) {
        query = query.eq("featured", true);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps("tags", filters.tags);
      }

      if (filters.incomeLevel) {
        query = query.eq("income_level", filters.incomeLevel);
      }

      if (filters.householdType) {
        query = query.eq("household_type", filters.householdType);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case "downloads":
          query = query.order("downloads_count", { ascending: false });
          break;
        case "rating":
          query = query.order("rating_average", { ascending: false });
          break;
        case "recent":
        default:
          query = query.order("published_at", { ascending: false });
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return (data || []) as MarketplaceTemplate[];
    },
  });

  // Fetch featured templates
  const featuredQuery = useQuery({
    queryKey: ["template-marketplace-featured"],
    queryFn: async (): Promise<MarketplaceTemplate[]> => {
      const { data, error } = await (supabase
        .from("template_marketplace" as any)
        .select("*")
        .eq("featured", true)
        .order("rating_average", { ascending: false })
        .limit(6) as any);

      if (error) throw error;
      return (data || []) as MarketplaceTemplate[];
    },
  });

  // Fetch user's ratings
  const userRatingsQuery = useQuery({
    queryKey: ["template-ratings", user?.id],
    queryFn: async (): Promise<Record<string, TemplateRating>> => {
      if (!user) return {};

      const { data, error } = await (supabase
        .from("template_ratings" as any)
        .select("*")
        .eq("user_id", user.id) as any);

      if (error) return {};

      const ratingsMap: Record<string, TemplateRating> = {};
      (data || []).forEach((r: any) => {
        ratingsMap[r.marketplace_id] = r as TemplateRating;
      });
      return ratingsMap;
    },
    enabled: !!user,
  });

  // Download/apply template mutation
  const downloadTemplate = useMutation({
    mutationFn: async (templateId: string): Promise<MarketplaceTemplate> => {
      // Increment download count
      await supabase.rpc("increment_template_downloads", { template_id: templateId });

      // Get template data
      const { data: marketplace, error } = await (supabase
        .from("template_marketplace" as any)
        .select("*")
        .eq("id", templateId)
        .single() as any);

      if (error) throw error;
      return marketplace as MarketplaceTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template-marketplace"] });
      toast.success("Template downloaded successfully!");
    },
    onError: () => {
      toast.error("Failed to download template");
    },
  });

  // Rate template mutation
  const rateTemplate = useMutation({
    mutationFn: async ({
      marketplaceId,
      rating,
      review,
    }: {
      marketplaceId: string;
      rating: number;
      review?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("template_ratings" as any)
        .upsert(
          {
            marketplace_id: marketplaceId,
            user_id: user.id,
            rating,
            review: review || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "marketplace_id,user_id" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template-marketplace"] });
      queryClient.invalidateQueries({ queryKey: ["template-ratings"] });
      toast.success("Rating submitted!");
    },
    onError: () => {
      toast.error("Failed to submit rating");
    },
  });

  // Publish template to marketplace
  const publishTemplate = useMutation({
    mutationFn: async ({
      templateId,
      title,
      description,
      tags,
      incomeLevel,
      householdType,
    }: {
      templateId: string;
      title: string;
      description: string;
      tags: string[];
      incomeLevel?: string;
      householdType?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const { data, error } = await supabase
        .from("template_marketplace" as any)
        .insert({
          template_id: templateId,
          author_id: user.id,
          title,
          description,
          tags,
          income_level: incomeLevel || null,
          household_type: householdType || null,
          author_name: profile?.full_name || "Anonymous",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template-marketplace"] });
      toast.success("Template published to marketplace!");
    },
    onError: () => {
      toast.error("Failed to publish template");
    },
  });

  // Get available tags
  const tagsQuery = useQuery({
    queryKey: ["template-marketplace-tags"],
    queryFn: async () => {
      const { data } = await supabase
        .from("template_marketplace" as any)
        .select("tags");

      const allTags = new Set<string>();
      (data || []).forEach((t: any) => {
        (t.tags || []).forEach((tag: string) => allTags.add(tag));
      });

      return Array.from(allTags).sort();
    },
    staleTime: 1000 * 60 * 10,
  });

  return {
    templates: templatesQuery.data || [],
    featured: featuredQuery.data || [],
    userRatings: userRatingsQuery.data || {},
    availableTags: tagsQuery.data || [],
    isLoading: templatesQuery.isLoading,
    downloadTemplate,
    rateTemplate,
    publishTemplate,
  };
};
