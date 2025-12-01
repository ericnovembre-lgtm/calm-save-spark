import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Lightbulb, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Widget {
  id: string;
  name: string;
  description: string;
  icon: string;
  relevanceScore: number;
}

interface SmartWidgetRecommenderProps {
  onAddWidget: (widgetId: string) => void;
  currentWidgets: string[];
}

export function SmartWidgetRecommender({ onAddWidget, currentWidgets }: SmartWidgetRecommenderProps) {
  const [recommendations, setRecommendations] = useState<Widget[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    // AI-powered widget recommendations
    const allWidgets: Widget[] = [
      {
        id: 'spending-tracker',
        name: 'Spending Tracker',
        description: 'Track your daily expenses in real-time',
        icon: '📊',
        relevanceScore: 0.95
      },
      {
        id: 'bill-reminder',
        name: 'Bill Reminders',
        description: 'Never miss a payment deadline',
        icon: '🔔',
        relevanceScore: 0.88
      },
      {
        id: 'investment-dashboard',
        name: 'Investment Dashboard',
        description: 'Monitor your portfolio performance',
        icon: '📈',
        relevanceScore: 0.82
      },
      {
        id: 'savings-streaks',
        name: 'Savings Streaks',
        description: 'Gamify your savings habits',
        icon: '🔥',
        relevanceScore: 0.79
      },
    ];

    // Filter out already added widgets and dismissed ones
    const available = allWidgets
      .filter(w => !currentWidgets.includes(w.id) && !dismissed.includes(w.id))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 2);

    setRecommendations(available);
  }, [currentWidgets, dismissed]);

  const handleDismiss = (widgetId: string) => {
    setDismissed([...dismissed, widgetId]);
    toast.info('Recommendation dismissed. We\'ll learn from this!');
  };

  if (recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
      data-tour="widget-suggestions"
    >
      <div className="bg-gradient-to-br from-accent/10 to-primary/5 rounded-2xl p-6 border border-accent/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-accent/20 rounded-lg">
            <Lightbulb className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Suggested Widgets</h3>
            <p className="text-xs text-muted-foreground">Popular among users like you</p>
          </div>
        </div>

        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {recommendations.map((widget) => (
              <motion.div
                key={widget.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, height: 0 }}
                className="bg-card rounded-xl p-4 border border-border hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-3xl">{widget.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{widget.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{widget.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${widget.relevanceScore * 100}%` }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="h-full bg-gradient-to-r from-accent to-primary"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(widget.relevanceScore * 100)}% match
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleDismiss(widget.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        onAddWidget(widget.id);
                        toast.success(`${widget.name} added to dashboard!`);
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
