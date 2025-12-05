import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Edit2, Brain, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoryFeedback } from "@/hooks/useCategoryFeedback";
import { cn } from "@/lib/utils";

interface CategorySuggestionFeedbackProps {
  merchantName: string;
  suggestedCategory: string;
  confidence: number;
  reasoning?: string;
  categories: Array<{ code: string; name: string }>;
  onCategoryConfirmed: (category: string) => void;
  suggestionId?: string;
  compact?: boolean;
}

export const CategorySuggestionFeedback: React.FC<CategorySuggestionFeedbackProps> = ({
  merchantName,
  suggestedCategory,
  confidence,
  reasoning,
  categories,
  onCategoryConfirmed,
  suggestionId,
  compact = false,
}) => {
  const [mode, setMode] = useState<"idle" | "correcting" | "submitted">("idle");
  const [correctedCategory, setCorrectedCategory] = useState<string>("");
  const { submitFeedback } = useCategoryFeedback();

  const confidenceLevel = confidence > 0.8 ? "high" : confidence > 0.6 ? "medium" : "low";
  const confidenceColor = {
    high: "text-emerald-500",
    medium: "text-amber-500",
    low: "text-rose-500",
  }[confidenceLevel];

  const handleAccept = async () => {
    setMode("submitted");
    await submitFeedback.mutateAsync({
      merchantName,
      suggestedCategory,
      acceptedCategory: suggestedCategory,
      feedbackType: "accepted",
      confidenceBefore: confidence,
      suggestionId,
    });
    onCategoryConfirmed(suggestedCategory);
  };

  const handleReject = async () => {
    setMode("submitted");
    await submitFeedback.mutateAsync({
      merchantName,
      suggestedCategory,
      feedbackType: "rejected",
      confidenceBefore: confidence,
      suggestionId,
    });
  };

  const handleCorrect = async () => {
    if (!correctedCategory) return;
    
    setMode("submitted");
    await submitFeedback.mutateAsync({
      merchantName,
      suggestedCategory,
      acceptedCategory: correctedCategory,
      feedbackType: "corrected",
      confidenceBefore: confidence,
      suggestionId,
    });
    onCategoryConfirmed(correctedCategory);
  };

  if (mode === "submitted") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Brain className="w-4 h-4 text-primary" />
        <span>Thanks! AI is learning from your feedback.</span>
      </motion.div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={cn("gap-1 text-xs", confidenceColor)}>
          <Sparkles className="w-3 h-3" />
          {Math.round(confidence * 100)}%
        </Badge>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={handleAccept}
            disabled={submitFeedback.isPending}
          >
            <Check className="w-3 h-3 text-emerald-500" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => setMode("correcting")}
          >
            <Edit2 className="w-3 h-3 text-amber-500" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={handleReject}
            disabled={submitFeedback.isPending}
          >
            <X className="w-3 h-3 text-rose-500" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3 rounded-lg bg-muted/50 border border-border/50">
      {/* AI Suggestion Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">AI Suggestion</span>
        </div>
        <Badge variant="outline" className={cn("gap-1", confidenceColor)}>
          {confidenceLevel === "high" && "High confidence"}
          {confidenceLevel === "medium" && "Medium confidence"}
          {confidenceLevel === "low" && "Low confidence"}
          <span className="ml-1 opacity-75">{Math.round(confidence * 100)}%</span>
        </Badge>
      </div>

      {/* Suggested Category */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Suggested:</span>
        <Badge variant="secondary">
          {categories.find((c) => c.code === suggestedCategory)?.name || suggestedCategory}
        </Badge>
      </div>

      {/* Reasoning */}
      {reasoning && (
        <p className="text-xs text-muted-foreground">
          💡 {reasoning}
        </p>
      )}

      <AnimatePresence mode="wait">
        {mode === "idle" && (
          <motion.div
            key="actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-2"
          >
            <Button
              size="sm"
              variant="default"
              className="flex-1 gap-1"
              onClick={handleAccept}
              disabled={submitFeedback.isPending}
            >
              {submitFeedback.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Check className="w-3 h-3" />
              )}
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1"
              onClick={() => setMode("correcting")}
            >
              <Edit2 className="w-3 h-3" />
              Correct
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1"
              onClick={handleReject}
              disabled={submitFeedback.isPending}
            >
              <X className="w-3 h-3" />
            </Button>
          </motion.div>
        )}

        {mode === "correcting" && (
          <motion.div
            key="correcting"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <Select value={correctedCategory} onValueChange={setCorrectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select correct category" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((c) => c.code !== suggestedCategory)
                  .map((category) => (
                    <SelectItem key={category.code} value={category.code}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                className="flex-1"
                onClick={handleCorrect}
                disabled={!correctedCategory || submitFeedback.isPending}
              >
                {submitFeedback.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : null}
                Save Correction
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setMode("idle");
                  setCorrectedCategory("");
                }}
              >
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              <Brain className="w-3 h-3 inline mr-1" />
              Your correction helps train the AI to be more accurate.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
