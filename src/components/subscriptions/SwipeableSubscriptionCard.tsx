import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Subscription } from '@/hooks/useSubscriptions';
import { MerchantLogo } from './MerchantLogo';
import { Card } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SwipeableSubscriptionCardProps {
  subscription: Subscription;
  onKeep: () => void;
  onMarkForCancellation: () => void;
  onSwipeComplete: () => void;
  style?: any;
}

export function SwipeableSubscriptionCard({
  subscription,
  onKeep,
  onMarkForCancellation,
  onSwipeComplete,
  style,
}: SwipeableSubscriptionCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);
  
  const leftOpacity = useTransform(x, [-150, 0], [1, 0]);
  const rightOpacity = useTransform(x, [0, 150], [0, 1]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 150) {
      if (info.offset.x < 0) {
        onMarkForCancellation();
      } else {
        onKeep();
      }
      onSwipeComplete();
    }
  };

  if (prefersReducedMotion) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <MerchantLogo merchant={subscription.merchant} size="lg" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{subscription.merchant}</h3>
            <p className="text-muted-foreground">${Number(subscription.amount).toFixed(2)} / {subscription.frequency}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onKeep}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Keep
            </button>
            <button
              onClick={onMarkForCancellation}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{
        x,
        rotate,
        opacity,
        ...style,
      }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <Card className="h-full p-8 relative overflow-hidden">
        {/* Left swipe indicator (Cancel) */}
        <motion.div
          style={{ opacity: leftOpacity }}
          className="absolute inset-0 bg-red-500/10 flex items-center justify-start px-12"
        >
          <div className="flex items-center gap-3 text-red-600">
            <X className="w-12 h-12" />
            <span className="text-2xl font-bold">Cancel</span>
          </div>
        </motion.div>

        {/* Right swipe indicator (Keep) */}
        <motion.div
          style={{ opacity: rightOpacity }}
          className="absolute inset-0 bg-green-500/10 flex items-center justify-end px-12"
        >
          <div className="flex items-center gap-3 text-green-600">
            <span className="text-2xl font-bold">Keep</span>
            <Check className="w-12 h-12" />
          </div>
        </motion.div>

        {/* Card content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <MerchantLogo merchant={subscription.merchant} size="lg" className="w-24 h-24" />
          
          <div>
            <h2 className="text-3xl font-bold mb-2">{subscription.merchant}</h2>
            <p className="text-5xl font-bold text-primary mb-2">
              ${Number(subscription.amount).toFixed(2)}
            </p>
            <p className="text-xl text-muted-foreground">per {subscription.frequency}</p>
          </div>

          {subscription.category && (
            <div className="px-4 py-2 bg-muted rounded-full">
              <span className="text-sm font-medium">{subscription.category}</span>
            </div>
          )}

          {subscription.confidence && (
            <div className="text-sm text-muted-foreground">
              Confidence: {Math.round(subscription.confidence * 100)}%
            </div>
          )}

          <p className="text-sm text-muted-foreground max-w-md">
            Swipe left to mark for cancellation or right to keep this subscription
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
