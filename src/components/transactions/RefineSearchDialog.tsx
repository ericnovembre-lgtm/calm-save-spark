import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Filter, DollarSign, Calendar, Store, Tag as TagIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface RefineSearchDialogProps {
  query: string;
  currentFilters: any;
  transactionCount: number;
  isOpen: boolean;
  onClose: () => void;
  onApplyRefinement: (newFilters: any) => void;
}

interface AISuggestion {
  description: string;
  filters: any;
  estimatedCount: number;
}

export function RefineSearchDialog({
  query,
  currentFilters,
  transactionCount,
  isOpen,
  onClose,
  onApplyRefinement,
}: RefineSearchDialogProps) {
  const [refinedFilters, setRefinedFilters] = useState(currentFilters);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRefinementSuggestions();
    }
  }, [isOpen]);

  const fetchRefinementSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('refine-search', {
        body: {
          query,
          currentFilters,
          transactionCount,
        },
      });

      if (error) throw error;
      if (data?.suggestions) {
        setAiSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Failed to fetch refinement suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleApply = () => {
    onApplyRefinement(refinedFilters);
    onClose();
  };

  const handleReset = () => {
    setRefinedFilters(currentFilters);
  };

  const applySuggestion = (suggestion: AISuggestion) => {
    setRefinedFilters({ ...refinedFilters, ...suggestion.filters });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-accent" />
            Refine Search
          </DialogTitle>
          <DialogDescription>
            Currently showing {transactionCount} transactions for "{query}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* AI Suggestions */}
          {isLoadingSuggestions ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : aiSuggestions.length > 0 ? (
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                AI Suggestions
              </Label>
              {aiSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => applySuggestion(suggestion)}
                  className="w-full p-3 text-left rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors"
                >
                  <div className="font-medium text-sm mb-1">{suggestion.description}</div>
                  <div className="text-xs text-muted-foreground">
                    Would show ~{suggestion.estimatedCount} transactions
                  </div>
                </button>
              ))}
            </div>
          ) : null}

          {/* Filter Builder */}
          <Tabs defaultValue="amount" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="amount" className="text-xs">
                <DollarSign className="w-3 h-3 mr-1" />
                Amount
              </TabsTrigger>
              <TabsTrigger value="date" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                Date
              </TabsTrigger>
              <TabsTrigger value="merchant" className="text-xs">
                <Store className="w-3 h-3 mr-1" />
                Merchant
              </TabsTrigger>
              <TabsTrigger value="category" className="text-xs">
                <TagIcon className="w-3 h-3 mr-1" />
                Category
              </TabsTrigger>
            </TabsList>

            <TabsContent value="amount" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="amount-range" className="text-sm">Amount Range</Label>
                <Slider
                  id="amount-range"
                  min={0}
                  max={1000}
                  step={10}
                  value={[
                    refinedFilters.minAmount || 0,
                    refinedFilters.maxAmount || 1000
                  ]}
                  onValueChange={([min, max]) => {
                    setRefinedFilters({
                      ...refinedFilters,
                      minAmount: min,
                      maxAmount: max,
                    });
                  }}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>${refinedFilters.minAmount || 0}</span>
                  <span>${refinedFilters.maxAmount || 1000}+</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="date" className="mt-4">
              <div className="p-4 bg-muted/30 rounded-lg text-center text-sm text-muted-foreground">
                Date range filtering available in main search filters
              </div>
            </TabsContent>

            <TabsContent value="merchant" className="mt-4">
              <div className="p-4 bg-muted/30 rounded-lg text-center text-sm text-muted-foreground">
                Merchant filtering available in main search filters
              </div>
            </TabsContent>

            <TabsContent value="category" className="mt-4">
              <div className="p-4 bg-muted/30 rounded-lg text-center text-sm text-muted-foreground">
                Category filtering available in main search filters
              </div>
            </TabsContent>
          </Tabs>

          {/* Preview */}
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div className="text-sm">
              <span className="font-semibold">Preview:</span> Showing transactions
              {refinedFilters.minAmount > 0 && (
                <> between ${refinedFilters.minAmount} and ${refinedFilters.maxAmount || '1000+'}</>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply Refinement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
