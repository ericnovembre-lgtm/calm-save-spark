import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getRandomGradient } from "@/lib/pot-gradients";
import { useUnsplashFetch } from "@/hooks/useUnsplashImage";

interface GeneratedPot {
  item_name: string;
  category: string;
  suggested_amount: number;
  icon: string;
  image_query: string;
  color_theme: string;
  reasoning: string;
}

export const usePotGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { fetchRandomImage } = useUnsplashFetch();
  
  const generatePot = async (dreamText: string) => {
    if (!dreamText.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      // Call AI generation edge function
      const { data, error } = await supabase.functions.invoke('generate-pot', {
        body: { dreamText }
      });
      
      if (error) throw error;
      
      const generatedPot: GeneratedPot = data;
      
      // Fetch Unsplash image via proper API
      const unsplashImage = await fetchRandomImage(generatedPot.image_query, 'landscape');
      const imageUrl = unsplashImage?.url || null;
      
      // Create the pot with generated data
      const { error: insertError } = await supabase
        .from('pots')
        .insert([{
          user_id: user.id,
          name: generatedPot.item_name,
          target_amount: generatedPot.suggested_amount,
          notes: `${generatedPot.reasoning}\n\nGenerated from: "${dreamText}"`,
          color: generatedPot.color_theme,
          image_url: imageUrl
        }]);
      
      if (insertError) throw insertError;
      
      // Refresh pots list
      queryClient.invalidateQueries({ queryKey: ['pots'] });
      
      toast({
        title: "✨ Dream Generated!",
        description: generatedPot.reasoning,
      });
      
      return generatedPot;
    } catch (error: any) {
      toast({
        title: "Failed to generate pot",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };
  
  return { generatePot, isGenerating };
};
