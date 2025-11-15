import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, TrendingUp, Target, Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface CoachInsight {
  id: string;
  type: 'tip' | 'achievement' | 'suggestion';
  title: string;
  description: string;
  action?: {
    label: string;
    path: string;
  };
  priority: 'high' | 'medium' | 'low';
}

// Sample insights (would come from API/analytics in production)
const sampleInsights: CoachInsight[] = [
  {
    id: '1',
    type: 'suggestion',
    title: 'Create Your First Goal',
    description: 'Set a savings goal to start tracking your progress and stay motivated.',
    action: { label: 'Create Goal', path: '/goals' },
    priority: 'high',
  },
  {
    id: '2',
    type: 'tip',
    title: 'Enable Auto-Save',
    description: 'Round up your purchases and automatically save the difference.',
    action: { label: 'Set Up', path: '/automations' },
    priority: 'medium',
  },
  {
    id: '3',
    type: 'achievement',
    title: 'Welcome to $ave+!',
    description: 'You\'ve taken the first step towards better financial habits.',
    priority: 'low',
  },
];

const iconMap = {
  tip: Lightbulb,
  achievement: Sparkles,
  suggestion: Target,
};

const priorityColors = {
  high: 'text-red-500 dark:text-red-400',
  medium: 'text-yellow-500 dark:text-yellow-400',
  low: 'text-green-500 dark:text-green-400',
};

/**
 * SaveplusCoachWidget - AI-powered financial coaching insights
 * Shows personalized tips, achievements, and suggestions
 */
export function SaveplusCoachWidget() {
  const [insights, setInsights] = useState<CoachInsight[]>(sampleInsights);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const navigate = useNavigate();

  const currentInsight = insights[currentIndex];

  const dismissInsight = () => {
    const newInsights = insights.filter((_, i) => i !== currentIndex);
    setInsights(newInsights);
    
    // Reset to first insight if we dismissed the last one
    if (currentIndex >= newInsights.length) {
      setCurrentIndex(Math.max(0, newInsights.length - 1));
    }
  };

  const nextInsight = () => {
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  };

  const previousInsight = () => {
    setCurrentIndex((prev) => (prev - 1 + insights.length) % insights.length);
  };

  const handleAction = () => {
    if (currentInsight?.action) {
      navigate(currentInsight.action.path);
    }
  };

  if (insights.length === 0) {
    return null;
  }

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3 py-2 bg-primary/90 text-primary-foreground rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105 backdrop-blur-sm opacity-90 hover:opacity-100"
        aria-label="Open coach widget"
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-medium">Coach ({insights.length})</span>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-40 w-full max-w-[280px]"
    >
      <Card className="shadow-md border border-primary/10 bg-background/90 backdrop-blur-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">$ave+ Coach</CardTitle>
                <CardDescription className="text-[10px]">
                  {insights.length} insight{insights.length !== 1 ? 's' : ''} for you
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="h-8 w-8"
                aria-label="Minimize"
              >
                <TrendingUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={dismissInsight}
                className="h-8 w-8"
                aria-label="Dismiss insight"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentInsight.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Insight type badge */}
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = iconMap[currentInsight.type];
                  return <Icon className={`w-4 h-4 ${priorityColors[currentInsight.priority]}`} />;
                })()}
                <Badge variant="outline" className="text-xs capitalize">
                  {currentInsight.type}
                </Badge>
              </div>

              {/* Insight content */}
              <div>
                <h3 className="font-semibold text-sm mb-1">
                  {currentInsight.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {currentInsight.description}
                </p>
              </div>

              {/* Action button */}
              {currentInsight.action && (
                <Button
                  onClick={handleAction}
                  className="w-full group"
                  size="sm"
                >
                  {currentInsight.action.label}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {insights.length > 1 && (
            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={previousInsight}
                disabled={insights.length === 1}
              >
                Previous
              </Button>
              <div className="text-xs text-muted-foreground">
                {currentIndex + 1} / {insights.length}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextInsight}
                disabled={insights.length === 1}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
