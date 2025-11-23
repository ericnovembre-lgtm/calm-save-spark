import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddNoteDialogProps {
  transaction: {
    id: string;
    merchant: string;
    category: string;
    amount: number;
    description?: string | null;
    tags?: string[] | null;
  };
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_TAGS = ['business', 'tax-deductible', 'reimbursable', 'personal', 'gift', 'recurring'];

export function AddNoteDialog({ transaction, isOpen, onClose }: AddNoteDialogProps) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState(transaction.description || '');
  const [tags, setTags] = useState<string[]>(transaction.tags || []);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (isOpen && !transaction.description) {
      fetchNoteSuggestions();
    }
  }, [isOpen]);

  const fetchNoteSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-transaction-note', {
        body: {
          merchant: transaction.merchant,
          category: transaction.category,
          amount: Math.abs(transaction.amount),
        },
      });

      if (error) throw error;
      if (data?.suggestions) {
        setAiSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Failed to fetch note suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const updateNoteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('transactions')
        .update({ 
          description: note.trim() || null, 
          tags: tags.length > 0 ? tags : null 
        })
        .eq('id', transaction.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Note saved successfully');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      onClose();
    },
    onError: (error) => {
      console.error('Failed to save note:', error);
      toast.error('Failed to save note');
    },
  });

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-accent" />
            Add Note
          </DialogTitle>
          <DialogDescription>
            {transaction.merchant} • ${Math.abs(transaction.amount).toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* AI Suggestions */}
          {isLoadingSuggestions ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : aiSuggestions.length > 0 && !note ? (
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Suggested Notes
              </Label>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setNote(suggestion)}
                    className="w-full p-3 text-sm text-left rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Note Input */}
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this transaction..."
              className="min-h-[120px]"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {note.length}/500 characters
            </div>
          </div>

          {/* Tag Selector */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </Label>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-full border transition-colors",
                    tags.includes(tag)
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border hover:border-accent/50 hover:bg-accent/5"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={updateNoteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => updateNoteMutation.mutate()}
            disabled={updateNoteMutation.isPending || (!note.trim() && tags.length === 0)}
          >
            {updateNoteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Note'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
