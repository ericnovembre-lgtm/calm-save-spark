import { Sparkles, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface AIConfidenceIndicatorProps {
  confidence: number;
  originalMerchant?: string;
  cleanedName: string;
  onReview?: () => void;
}

export function AIConfidenceIndicator({ 
  confidence, 
  originalMerchant, 
  cleanedName,
  onReview 
}: AIConfidenceIndicatorProps) {
  const confidencePercent = Math.round(confidence * 100);
  
  const getConfidenceColor = () => {
    if (confidence >= 0.9) return 'text-green-500';
    if (confidence >= 0.7) return 'text-amber-500';
    return 'text-orange-500';
  };

  const getConfidenceLabel = () => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReview?.();
            }}
            className="flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <Sparkles className={`w-4 h-4 ${getConfidenceColor()}`} />
            <Badge variant="secondary" className="text-xs">
              AI {confidencePercent}%
            </Badge>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <p className="font-semibold">AI Enrichment</p>
            </div>
            
            <div className="space-y-1 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Original:</p>
                <p className="font-mono text-xs truncate">{originalMerchant || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-muted-foreground text-xs">Cleaned:</p>
                <p className="font-semibold">{cleanedName}</p>
              </div>
              
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <span className="text-xs text-muted-foreground">Confidence:</span>
                <span className={`text-xs font-semibold ${getConfidenceColor()}`}>
                  {getConfidenceLabel()} ({confidencePercent}%)
                </span>
              </div>
            </div>
            
            {onReview && (
              <p className="text-xs text-muted-foreground pt-1 border-t border-border">
                Click to review and approve
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
