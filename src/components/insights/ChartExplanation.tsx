import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lightbulb, Copy, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartExplanationProps {
  explanation: string | null;
  isLoading: boolean;
  onGenerate: () => void;
  onClose: () => void;
}

export function ChartExplanation({ 
  explanation, 
  isLoading, 
  onGenerate,
  onClose 
}: ChartExplanationProps) {
  const prefersReducedMotion = useReducedMotion();

  const handleCopy = () => {
    if (explanation) {
      navigator.clipboard.writeText(explanation);
      toast.success('Explanation copied to clipboard');
    }
  };

  if (!explanation && !isLoading) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onGenerate}
        className="gap-2"
      >
        <Lightbulb className="w-4 h-4" />
        Explain This Chart
      </Button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-4 bg-accent/10 border-accent">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-accent/20">
              <Lightbulb className="w-5 h-5 text-accent" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground mb-2">AI Insight</h4>
              
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              ) : (
                <p className="text-sm text-foreground leading-relaxed">{explanation}</p>
              )}
            </div>

            <div className="flex items-center gap-1">
              {!isLoading && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="h-8 w-8"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onGenerate}
                    className="h-8 w-8"
                    title="Regenerate"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
                title="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
