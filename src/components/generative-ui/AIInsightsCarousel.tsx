import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, AlertTriangle, Lightbulb, Target } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'tip' | 'achievement';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
  impact?: 'high' | 'medium' | 'low';
  category?: string;
}

interface AIInsightsCarouselProps {
  insights: Insight[];
  title?: string;
  autoRotate?: boolean;
}

export function AIInsightsCarousel({
  insights,
  title = "AI Insights",
  autoRotate = false,
}: AIInsightsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'tip':
        return <Lightbulb className="w-5 h-5" />;
      case 'achievement':
        return <Target className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity':
        return 'bg-primary/10 border-primary/30 text-primary';
      case 'warning':
        return 'bg-warning/10 border-warning/30 text-warning';
      case 'tip':
        return 'bg-accent/10 border-accent/30 text-accent-foreground';
      case 'achievement':
        return 'bg-primary/10 border-primary/30 text-primary';
    }
  };

  const getImpactBadge = (impact?: Insight['impact']) => {
    if (!impact) return null;
    const colors = {
      high: 'bg-primary/20 text-primary',
      medium: 'bg-accent/20 text-accent-foreground',
      low: 'bg-muted/50 text-muted-foreground',
    };
    return (
      <span className={cn('px-2 py-0.5 rounded text-xs font-medium', colors[impact])}>
        {impact.charAt(0).toUpperCase() + impact.slice(1)} Impact
      </span>
    );
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + insights.length) % insights.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  if (insights.length === 0) {
    return (
      <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 text-center">
        <div className="flex flex-col items-center gap-3 py-8">
          <Sparkles className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No insights available yet. Keep using $ave+ to unlock personalized insights!
          </p>
        </div>
      </Card>
    );
  }

  const currentInsight = insights[currentIndex];

  return (
    <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground text-base">{title}</h3>
        </div>
        <div className="text-xs text-muted-foreground">
          {currentIndex + 1} of {insights.length}
        </div>
      </div>

      {/* Carousel */}
      <div className="relative min-h-[200px] mb-4">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
            }}
            className="absolute inset-0"
          >
            <div
              className={cn(
                'h-full p-6 rounded-lg border space-y-4',
                getInsightColor(currentInsight.type)
              )}
            >
              {/* Icon and Type */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getInsightIcon(currentInsight.type)}
                  <span className="text-sm font-medium capitalize">
                    {currentInsight.type}
                  </span>
                </div>
                {getImpactBadge(currentInsight.impact)}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-foreground">
                  {currentInsight.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentInsight.description}
                </p>
              </div>

              {/* Category */}
              {currentInsight.category && (
                <div className="text-xs text-muted-foreground">
                  Category: {currentInsight.category}
                </div>
              )}

              {/* Action Button */}
              {currentInsight.action && (
                <Button
                  onClick={currentInsight.action.onClick}
                  size="sm"
                  className="w-full mt-4"
                >
                  {currentInsight.action.label}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          onClick={handlePrev}
          variant="outline"
          size="sm"
          disabled={insights.length <= 1}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {insights.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                i === currentIndex
                  ? 'bg-primary w-6'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Go to insight ${i + 1}`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          variant="outline"
          size="sm"
          disabled={insights.length <= 1}
          className="gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
