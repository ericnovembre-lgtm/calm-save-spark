import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

interface SaveReportDialogProps {
  query: string;
  filters: any;
  transactionCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export function SaveReportDialog({
  query,
  filters,
  transactionCount,
  isOpen,
  onClose,
}: SaveReportDialogProps) {
  const queryClient = useQueryClient();
  const [templateName, setTemplateName] = useState('');
  const [category, setCategory] = useState('expense');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id);
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNameSuggestions();
    }
  }, [isOpen]);

  const fetchNameSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-report-name', {
        body: {
          query,
          filters,
          category,
        },
      });

      if (error) throw error;
      if (data?.suggestions) {
        setAiSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Failed to fetch name suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const saveTemplateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('report_templates')
        .insert({
          template_name: templateName,
          category,
          description: description || null,
          template_config: {
            filters,
            query,
            columns: ['merchant', 'amount', 'category', 'date'],
          },
          is_public: isPublic,
          user_id: userId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Report template saved');
      queryClient.invalidateQueries({ queryKey: ['report-templates'] });
      onClose();
      setTemplateName('');
      setDescription('');
    },
    onError: (error) => {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5 text-accent" />
            Save Report Template
          </DialogTitle>
          <DialogDescription>
            Save this search as a reusable report template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* AI Name Suggestions */}
          {isLoadingSuggestions ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : aiSuggestions.length > 0 && !templateName ? (
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Suggested Names
              </Label>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.map((name, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTemplateName(name)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Monthly Dining Expenses"
              maxLength={100}
            />
          </div>

          {/* Category Selector */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense Report</SelectItem>
                <SelectItem value="income">Income Report</SelectItem>
                <SelectItem value="tax">Tax Report</SelectItem>
                <SelectItem value="monthly">Monthly Summary</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this report for?"
              rows={3}
              maxLength={300}
            />
          </div>

          {/* Report Preview */}
          <div className="p-3 bg-muted/30 rounded-lg border border-border">
            <div className="text-sm font-semibold mb-2">Report Preview</div>
            <div className="text-xs space-y-1 text-muted-foreground">
              <div>• Query: "{query}"</div>
              <div>• Filters: {Object.keys(filters).length} active</div>
              <div>• Transactions: {transactionCount} matching</div>
              <div>
                • Time period:{' '}
                {filters.startDate && filters.endDate
                  ? `${format(new Date(filters.startDate), 'MMM dd')} - ${format(new Date(filters.endDate), 'MMM dd, yyyy')}`
                  : 'All time'}
              </div>
            </div>
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <div className="font-medium text-sm">Share with community</div>
              <div className="text-xs text-muted-foreground">
                Make this template available to other users
              </div>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saveTemplateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => saveTemplateMutation.mutate()}
            disabled={!templateName.trim() || saveTemplateMutation.isPending}
          >
            {saveTemplateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
