import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import { useTransactionEnrichment } from "@/hooks/useTransactionEnrichment";

interface EnrichmentReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: {
    id: string;
    merchant: string;
    category: string;
    enrichment_metadata?: any;
  };
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

export function EnrichmentReviewDialog({ 
  open, 
  onOpenChange, 
  transaction 
}: EnrichmentReviewDialogProps) {
  const metadata = transaction.enrichment_metadata as { 
    ai_cleaned?: boolean; 
    confidence?: number; 
    original_merchant?: string;
  } | undefined;
  
  const [selectedCategory, setSelectedCategory] = useState(transaction.category);
  const { recategorize, isRecategorizing } = useTransactionEnrichment();

  const handleApprove = () => {
    if (selectedCategory !== transaction.category) {
      recategorize({ 
        transactionId: transaction.id, 
        category: selectedCategory 
      });
    }
    onOpenChange(false);
  };

  const handleReject = () => {
    // Could implement feedback mechanism here
    onOpenChange(false);
  };

  const confidence = metadata?.confidence || 0;
  const confidencePercent = Math.round(confidence * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Review AI Enrichment
          </DialogTitle>
          <DialogDescription>
            Review and adjust the AI-suggested categorization
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Original vs Cleaned */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Original Data</Label>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-mono text-sm text-muted-foreground">
                {metadata?.original_merchant || transaction.merchant}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">AI Cleaned Name</Label>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="font-semibold">{transaction.merchant}</p>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <span className="text-sm text-muted-foreground">AI Confidence</span>
            <Badge variant="secondary" className="text-sm">
              {confidencePercent}% confident
            </Badge>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category">
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
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={isRecategorizing}
          >
            <ThumbsDown className="w-4 h-4 mr-2" />
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isRecategorizing}
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
