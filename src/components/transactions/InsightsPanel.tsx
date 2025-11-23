import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InsightCard } from "./InsightCard";
import { useGenerativeInsights } from "@/hooks/useGenerativeInsights";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface InsightsPanelProps {
  userId: string;
  className?: string;
}

export function InsightsPanel({ userId, className }: InsightsPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const { insights, isLoading, refetch } = useGenerativeInsights(userId);

  // Auto-refresh insights every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Rotate insights
  useEffect(() => {
    if (insights.length <= 3) return;
    
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % Math.ceil(insights.length / 3));
    }, 10000);
    
    return () => clearInterval(interval);
  }, [insights.length]);

  const visibleInsights = insights.slice(currentPage * 3, (currentPage + 1) * 3);
  const hasMultiplePages = insights.length > 3;

  return (
    <motion.aside
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed right-4 top-24 w-80 max-h-[calc(100vh-200px)]",
        "bg-glass border border-glass-border rounded-2xl p-4",
        "backdrop-blur-glass shadow-glass-elevated z-40",
        "transition-all duration-300",
        isCollapsed && "w-12 p-2",
        "hidden lg:block",
        className
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center gap-2 mb-4",
        isCollapsed && "justify-center mb-0"
      )}>
        {!isCollapsed && (
          <>
            <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
            <h3 className="text-sm font-bold text-foreground">Smart Insights</h3>
            {isLoading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-3 h-3 text-accent" />
              </motion.div>
            )}
          </>
        )}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn("ml-auto h-7 w-7", isCollapsed && "ml-0")}
          aria-label={isCollapsed ? "Expand insights panel" : "Collapse insights panel"}
        >
          {isCollapsed ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          {/* Insights carousel */}
          <div className="space-y-3 mb-4 min-h-[200px]">
            <AnimatePresence mode="wait">
              {visibleInsights.length > 0 ? (
                <motion.div
                  key={currentPage}
                  initial={prefersReducedMotion ? undefined : { opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  {visibleInsights.map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </motion.div>
              ) : isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-6 h-6 text-accent" />
                  </motion.div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Sparkles className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No insights yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Check back soon!
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Pagination dots */}
          {hasMultiplePages && (
            <div className="flex items-center justify-center gap-1 mb-4">
              {Array.from({ length: Math.ceil(insights.length / 3) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    i === currentPage ? "bg-accent" : "bg-muted"
                  )}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Quick AI input */}
          <div className="pt-4 border-t border-glass-border">
            <Input
              placeholder="Ask AI about spending..."
              className="text-xs h-8"
              disabled
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-center">
              Coming soon
            </p>
          </div>
        </>
      )}
    </motion.aside>
  );
}
