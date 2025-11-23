import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSavingsCoach = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const getCoachingTip = async (pot: {
    id: string;
    name: string;
    current_amount: number;
    target_amount: number;
    notes?: string | null;
    created_at: string;
  }): Promise<string | null> => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('savings-coach', {
        body: {
          potName: pot.name,
          currentAmount: pot.current_amount,
          targetAmount: pot.target_amount,
          notes: pot.notes,
          createdAt: pot.created_at,
        }
      });

      if (error) {
        console.error('Error getting coaching tip:', error);
        toast({
          title: "Couldn't generate tip",
          description: "Try again in a moment",
          variant: "destructive",
        });
        return null;
      }

      return data.tip;
    } catch (error) {
      console.error('Error calling coaching function:', error);
      toast({
        title: "Error",
        description: "Failed to get coaching tip",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { getCoachingTip, isGenerating };
};
