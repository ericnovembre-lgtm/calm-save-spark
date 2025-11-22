import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  TrendingUp, 
  AlertCircle, 
  Lightbulb,
  Target,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Insight {
  type: 'opportunity' | 'alert' | 'achievement' | 'suggestion';
  title: string;
  description: string;
  confidence: number;
  action?: string;
  actionUrl?: string;
}

interface SmartInsightsSidebarProps {
  insights: Insight[];
  isLoading?: boolean;
  className?: string;
}

const getInsightIcon = (type: Insight['type']) => {
  switch (type) {
    case 'opportunity':
      return <TrendingUp className="w-5 h-5 text-green-500" />;
    case 'alert':
      return <AlertCircle className="w-5 h-5 text-destructive" />;
    case 'achievement':
      return <Target className="w-5 h-5 text-primary" />;
    case 'suggestion':
      return <Lightbulb className="w-5 h-5 text-accent" />;
  }
};

const getInsightColor = (type: Insight['type']) => {
  switch (type) {
    case 'opportunity':
      return 'from-green-500/10 to-green-500/5 border-green-500/20';
    case 'alert':
      return 'from-destructive/10 to-destructive/5 border-destructive/20';
    case 'achievement':
      return 'from-primary/10 to-primary/5 border-primary/20';
    case 'suggestion':
      return 'from-accent/10 to-accent/5 border-accent/20';
  }
};

export function SmartInsightsSidebar({ 
  insights, 
  isLoading = false,
  className 
}: SmartInsightsSidebarProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <>
      {/* Desktop & Tablet: Fixed Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isMinimized ? '48px' : '320px',
          opacity: isMinimized ? 0.8 : 1
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "hidden md:block fixed right-0 top-20 bottom-0 z-30",
          "bg-background/80 backdrop-blur-xl border-l border-border/50",
          "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
          className
        )}
      >
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMinimized(!isMinimized)}
          className="absolute -left-4 top-4 w-8 h-8 rounded-full bg-card border border-border shadow-lg hover:bg-accent z-10"
        >
          {isMinimized ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>

        <AnimatePresence mode="wait">
          {!isMinimized && (
            <motion.div
              key="sidebar-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Smart Insights</h2>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className="h-24 rounded-lg bg-muted/50 animate-pulse"
                    />
                  ))}
                </div>
              )}

              {/* Insights List */}
              {!isLoading && insights.length > 0 && (
                <motion.div 
                  className="space-y-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                >
                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                    >
                      <Card 
                        className={cn(
                          "p-4 bg-gradient-to-br border",
                          "hover:shadow-lg transition-all duration-300",
                          "cursor-pointer group",
                          getInsightColor(insight.type)
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getInsightIcon(insight.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <h3 className="font-semibold text-sm leading-tight">
                                {insight.title}
                              </h3>
                              <Badge 
                                variant="outline" 
                                className="text-xs shrink-0"
                              >
                                {Math.round(insight.confidence * 100)}%
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                              {insight.description}
                            </p>
                            {insight.action && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="w-full text-xs h-7 group-hover:bg-background/80"
                              >
                                {insight.action}
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Empty State */}
              {!isLoading && insights.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Sparkles className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No insights available yet.
                    <br />
                    Add more budgets to get started.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimized State Icon */}
        {isMinimized && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <div className="flex flex-col gap-2">
              {insights.slice(0, 3).map((insight, i) => (
                <div 
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary/50"
                />
              ))}
            </div>
          </div>
        )}
      </motion.aside>

      {/* Mobile: Bottom Sheet (Placeholder for future enhancement) */}
      <div className="md:hidden">
        {/* Mobile bottom sheet would go here */}
      </div>
    </>
  );
}
