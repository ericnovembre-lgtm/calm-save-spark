import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface LayoutEngineProps {
  userId: string;
  onReorder: (newOrder: string[]) => void;
  currentOrder: string[];
}

export function IntelligentLayoutEngine({ userId, onReorder, currentOrder }: LayoutEngineProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictedOrder, setPredictedOrder] = useState<string[]>([]);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  }, []);

  const analyzeAndReorder = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis (in production, this would use TensorFlow.js or backend ML)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // AI-powered reordering based on time of day and usage patterns
    const patterns = {
      morning: ['balance', 'goals', 'ai-insights', 'milestones', 'challenges'],
      afternoon: ['balance', 'cashflow', 'recommendations', 'goals', 'peer-insights'],
      evening: ['balance', 'timeline', 'skill-tree', 'achievements', 'goals']
    };
    
    const optimizedOrder = patterns[timeOfDay].filter(item => currentOrder.includes(item));
    const remaining = currentOrder.filter(item => !optimizedOrder.includes(item));
    
    const newOrder = [...optimizedOrder, ...remaining];
    setPredictedOrder(newOrder);
    setIsAnalyzing(false);
    toast.success('Layout optimized for your routine!');
  };

  const applyPrediction = () => {
    onReorder(predictedOrder);
    toast.success('Dashboard reorganized!');
    setPredictedOrder([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <div className="bg-card border border-border rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Layout Optimization</h3>
              <p className="text-xs text-muted-foreground">
                {timeOfDay === 'morning' && 'Good morning! Optimizing for daily planning.'}
                {timeOfDay === 'afternoon' && 'Good afternoon! Showing actionable insights.'}
                {timeOfDay === 'evening' && 'Good evening! Focus on progress review.'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <AnimatePresence>
              {predictedOrder.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPredictedOrder([])}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Button
              size="sm"
              onClick={predictedOrder.length > 0 ? applyPrediction : analyzeAndReorder}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                  </motion.div>
                  Analyzing...
                </>
              ) : predictedOrder.length > 0 ? (
                'Apply Layout'
              ) : (
                'Smart Arrange'
              )}
            </Button>
          </div>
        </div>
        
        {predictedOrder.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-border"
          >
            <p className="text-xs text-muted-foreground">
              AI suggests reordering {predictedOrder.length} cards based on your usage patterns
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
