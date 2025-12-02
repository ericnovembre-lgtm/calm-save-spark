import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TransformedRecommendation {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  impact: number;
  actionLabel: string;
  actionLink: string;
}

// Map recommendation text to priority and action links
const inferRecommendationDetails = (text: string, index: number): TransformedRecommendation => {
  const lowerText = text.toLowerCase();
  
  // Determine priority and impact based on content
  let priority: "high" | "medium" | "low" = "medium";
  let impact = 5;
  let actionLink = "/financial-health";
  let actionLabel = "Take Action";

  if (lowerText.includes('credit')) {
    priority = "high";
    impact = 15;
    actionLink = "/credit";
    actionLabel = "View Credit Report";
  } else if (lowerText.includes('debt')) {
    priority = "high";
    impact = 12;
    actionLink = "/debts";
    actionLabel = "Manage Debts";
  } else if (lowerText.includes('emergency')) {
    priority = "high";
    impact = 10;
    actionLink = "/goals";
    actionLabel = "Build Emergency Fund";
  } else if (lowerText.includes('goal') || lowerText.includes('saving')) {
    priority = "medium";
    impact = 8;
    actionLink = "/goals";
    actionLabel = "Review Goals";
  }

  return {
    id: `rec-${index}-${Date.now()}`,
    title: text.split('.')[0] || text,
    description: text,
    priority,
    impact,
    actionLabel,
    actionLink,
  };
};

export const useFinancialHealth = () => {
  return useQuery({
    queryKey: ['financial_health'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-financial-health`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to calculate financial health');
      
      const data = await response.json();
      
      // Transform the response to match expected frontend format
      const transformedRecommendations: TransformedRecommendation[] = 
        (data.recommendations || []).map((rec: string | TransformedRecommendation, index: number) => {
          // Handle both string recommendations and already-transformed objects
          if (typeof rec === 'string') {
            return inferRecommendationDetails(rec, index);
          }
          return rec;
        });

      return {
        overallScore: data.score,
        components: data.components,
        recommendations: transformedRecommendations,
      };
    },
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });
};
