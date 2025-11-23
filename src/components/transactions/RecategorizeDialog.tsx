import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Loader2 } from "lucide-react";
import { useTransactionEnrichment } from "@/hooks/useTransactionEnrichment";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface RecategorizeDialogProps {
  transaction: {
    id: string;
    merchant: string;
    category: string;
    amount: number;
    description?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

interface CategorySuggestion {
  category: string;
  confidence: number;
  reasoning?: string;
}

const CATEGORIES = [
  'Groceries',
  'Dining',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Other',
];

export function RecategorizeDialog({ transaction, isOpen, onClose }: RecategorizeDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState(transaction.category);
  const [applyToSimilar, setApplyToSimilar] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<CategorySuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { recategorize, isRecategorizing } = useTransactionEnrichment();

  useEffect(() => {
    if (isOpen && transaction.merchant) {
      fetchCategorySuggestions();
    }
  }, [isOpen, transaction.merchant]);

  const fetchCategorySuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-category-suggest', {
        body: {
          merchantName: transaction.merchant,
          amount: Math.abs(transaction.amount),
          description: transaction.description,
        },
      });

      if (error) throw error;
      
      if (data) {
        setAiSuggestions([
          {
            category: data.category,
            confidence: data.confidence,
            reasoning: data.reasoning,
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch category suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleRecategorize = async () => {
    recategorize(
      { transactionId: transaction.id, category: selectedCategory },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Recategorize Transaction
          </DialogTitle>
          <DialogDescription>
            Update the category for this transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Category */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Current Category</Label>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="font-semibold">{transaction.category}</p>
            </div>
          </div>

          {/* AI Suggestions */}
          {isLoadingSuggestions ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : aiSuggestions.length > 0 ? (
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                AI Recommendation
              </Label>
              {aiSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(suggestion.category)}
                  className={cn(
                    "w-full p-3 rounded-lg border text-left transition-colors",
                    selectedCategory === suggestion.category
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/50"
                  )}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{suggestion.category}</span>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(suggestion.confidence * 100)}% confident
                    </Badge>
                  </div>
                  {suggestion.reasoning && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {suggestion.reasoning}
                    </p>
                  )}
                </button>
              ))}
            </div>
          ) : null}

          {/* Category Selector */}
          <div className="space-y-2">
            <Label>Select Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Apply to Similar */}
          <div className="flex items-center gap-2 p-3 rounded-lg border border-border">
            <Checkbox
              checked={applyToSimilar}
              onCheckedChange={(checked) => setApplyToSimilar(checked as boolean)}
            />
            <label className="text-sm cursor-pointer" onClick={() => setApplyToSimilar(!applyToSimilar)}>
              Apply to all future transactions from "{transaction.merchant}"
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isRecategorizing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRecategorize}
            disabled={isRecategorizing || selectedCategory === transaction.category}
          >
            {isRecategorizing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Category'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
