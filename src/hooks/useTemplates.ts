import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: 'savings' | 'micro-savings' | 'optimization' | 'protection';
  trigger_config: any;
  action_config: any;
  popularity_score: number | null;
  is_premium: boolean | null;
  created_at: string;
}

export function useTemplates(category?: string) {
  return useQuery({
    queryKey: ['automation-templates', category],
    queryFn: async () => {
      let query = supabase
        .from('automation_templates')
        .select('*')
        .order('popularity_score', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AutomationTemplate[];
    },
  });
}
