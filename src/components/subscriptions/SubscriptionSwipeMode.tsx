import { useState } from 'react';
import { Subscription } from '@/hooks/useSubscriptions';
import { SwipeableSubscriptionCard } from './SwipeableSubscriptionCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Check, Undo } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SubscriptionSwipeModeProps {
  subscriptions: Subscription[];
  onKeep: (id: string) => void;
  onMarkForCancellation: (id: string) => void;
  onExit: () => void;
}

interface SwipeDecision {
  subscription: Subscription;
  decision: 'keep' | 'cancel';
}

export function SubscriptionSwipeMode({
  subscriptions,
  onKeep,
  onMarkForCancellation,
  onExit,
}: SubscriptionSwipeModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<SwipeDecision[]>([]);

  const currentSubscription = subscriptions[currentIndex];
  const progress = ((currentIndex + history.length) / subscriptions.length) * 100;

  const handleKeep = () => {
    if (currentSubscription) {
      setHistory(prev => [...prev, { subscription: currentSubscription, decision: 'keep' }]);
      onKeep(currentSubscription.id);
      handleNext();
    }
  };

  const handleCancel = () => {
    if (currentSubscription) {
      setHistory(prev => [...prev, { subscription: currentSubscription, decision: 'cancel' }]);
      onMarkForCancellation(currentSubscription.id);
      handleNext();
    }
  };

  const handleNext = () => {
    if (currentIndex < subscriptions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onExit();
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const lastDecision = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      
      // Revert the action
      if (lastDecision.decision === 'keep') {
        onMarkForCancellation(lastDecision.subscription.id);
      } else {
        onKeep(lastDecision.subscription.id);
      }
      
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  if (!currentSubscription) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Check className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold mb-2">Review Complete!</h2>
            <p className="text-muted-foreground mb-6">
              You've reviewed all {subscriptions.length} subscriptions
            </p>
            <Button onClick={onExit} size="lg">
              Done
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onExit}>
              <X className="w-5 h-5" />
            </Button>
            <div className="text-sm font-medium">
              {currentIndex + 1} of {subscriptions.length}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={history.length === 0}
          >
            <Undo className="w-4 h-4 mr-2" />
            Undo
          </Button>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Card Stack */}
      <div className="absolute inset-0 flex items-center justify-center p-6 pt-32">
        <div className="relative w-full max-w-md h-[500px]">
          <AnimatePresence>
            {currentSubscription && (
              <SwipeableSubscriptionCard
                key={currentSubscription.id}
                subscription={currentSubscription}
                onKeep={handleKeep}
                onMarkForCancellation={handleCancel}
                onSwipeComplete={handleNext}
                style={{
                  zIndex: 3,
                }}
              />
            )}
            {subscriptions[currentIndex + 1] && (
              <motion.div
                key={subscriptions[currentIndex + 1].id}
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 0.95, y: 20 }}
                className="absolute inset-0 opacity-50 pointer-events-none"
                style={{ zIndex: 2 }}
              >
                <Card className="h-full p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="text-2xl font-bold">
                      {subscriptions[currentIndex + 1].merchant}
                    </div>
                    <div className="text-3xl font-bold text-primary">
                      ${Number(subscriptions[currentIndex + 1].amount).toFixed(2)}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-center gap-6">
        <Button
          variant="outline"
          size="lg"
          className="w-24 h-24 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          onClick={handleCancel}
        >
          <X className="w-8 h-8" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-24 h-24 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
          onClick={handleKeep}
        >
          <Check className="w-8 h-8" />
        </Button>
      </div>
    </div>
  );
}
