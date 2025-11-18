import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";

interface SmartCategorySelectorProps {
  merchantName?: string;
  amount?: number;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  categories: Array<{ code: string; name: string }>;
}

export function SmartCategorySelector({
  merchantName,
  amount,
  description,
  value,
  onChange,
  categories
}: SmartCategorySelectorProps) {
  const [suggestion, setSuggestion] = useState<any>(null);

  const { data: aiSuggestion, isLoading } = useQuery({
    queryKey: ['category_suggestion', merchantName, amount],
    queryFn: async () => {
      if (!merchantName) return null;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase.functions.invoke('smart-category-suggest', {
        body: { merchantName, amount, description }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!merchantName && amount !== undefined,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  useEffect(() => {
    if (aiSuggestion && aiSuggestion.confidence > 0.6) {
      setSuggestion(aiSuggestion);
      // Auto-select if high confidence and no value set
      if (aiSuggestion.confidence > 0.8 && !value) {
        onChange(aiSuggestion.categoryCode);
      }
    }
  }, [aiSuggestion]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Category</label>
        {isLoading && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            AI analyzing...
          </div>
        )}
        {suggestion && !isLoading && (
          <Badge variant="outline" className="gap-1 text-xs">
            <Sparkles className="w-3 h-3" />
            {suggestion.confidence > 0.8 ? 'High' : suggestion.confidence > 0.6 ? 'Medium' : 'Low'} confidence
          </Badge>
        )}
      </div>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {suggestion && (
            <>
              <SelectItem value={suggestion.categoryCode} className="bg-primary/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {categories.find(c => c.code === suggestion.categoryCode)?.name || suggestion.categoryCode}
                  <span className="text-xs text-muted-foreground">(AI Suggested)</span>
                </div>
              </SelectItem>
              <div className="h-px bg-border my-1" />
            </>
          )}
          {categories.map((category) => (
            <SelectItem key={category.code} value={category.code}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {suggestion?.reasoning && (
        <p className="text-xs text-muted-foreground">
          💡 {suggestion.reasoning}
        </p>
      )}
    </div>
  );
}
