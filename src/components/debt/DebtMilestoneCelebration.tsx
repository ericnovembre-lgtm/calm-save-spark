import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingDown, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useCelebrationSounds } from '@/hooks/useCelebrationSounds';

interface DebtMilestoneCelebrationProps {
  milestone: {
    debtId: string;
    debtName: string;
    percentage: 25 | 50 | 75 | 100;
    currentBalance: number;
    originalBalance: number;
  } | null;
  onDismiss: () => void;
}

const milestoneConfig = {
  25: {
    title: 'First Quarter Conquered! 🎯',
    message: 'You\'ve paid off 25% of this debt. Momentum is building!',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20'
  },
  50: {
    title: 'Halfway There! 🚀',
    message: 'You\'ve crushed 50% of this debt. The summit is in sight!',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20'
  },
  75: {
    title: 'Three Quarters Done! ⭐',
    message: 'You\'ve demolished 75% of this debt. Victory is near!',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20'
  },
  100: {
    title: 'DEBT ELIMINATED! 🎉',
    message: 'You\'ve completely destroyed this debt. Freedom achieved!',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20'
  }
};

export const DebtMilestoneCelebration = ({ milestone, onDismiss }: DebtMilestoneCelebrationProps) => {
  const { playSuccessChime, playConfettiPop } = useCelebrationSounds();

  useEffect(() => {
    if (milestone) {
      playSuccessChime();
      playConfettiPop();

      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }

      const duration = milestone.percentage === 100 ? 5000 : 3000;
      const end = Date.now() + duration;

      const colors = milestone.percentage === 100 
        ? ['#10b981', '#34d399', '#6ee7b7']
        : ['#d6c8a2', '#faf8f2', '#0a0a0a'];

      const frame = () => {
        confetti({
          particleCount: milestone.percentage === 100 ? 5 : 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: milestone.percentage === 100 ? 5 : 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [milestone, playSuccessChime, playConfettiPop]);

  if (!milestone) return null;

  const config = milestoneConfig[milestone.percentage];
  const paidOff = milestone.originalBalance - milestone.currentBalance;

  return (
    <Dialog open={!!milestone} onOpenChange={onDismiss}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            <DialogHeader>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2, duration: 0.5 }}
                className="flex justify-center mb-4"
              >
                <div className={`h-20 w-20 rounded-full ${config.bgColor} flex items-center justify-center border-2 ${config.borderColor}`}>
                  {milestone.percentage === 100 ? (
                    <Trophy className={`h-10 w-10 ${config.color}`} />
                  ) : (
                    <Target className={`h-10 w-10 ${config.color}`} />
                  )}
                </div>
              </motion.div>
              <DialogTitle className="text-center text-2xl">
                {config.title}
              </DialogTitle>
              <p className="text-center text-muted-foreground">
                {config.message}
              </p>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`p-4 rounded-lg ${config.bgColor} border ${config.borderColor}`}
              >
                <div className="text-center mb-2">
                  <p className="text-sm text-muted-foreground">Progress on</p>
                  <p className="text-lg font-bold text-foreground">{milestone.debtName}</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-center">
                  <TrendingDown className={`h-5 w-5 ${config.color}`} />
                  <div>
                    <p className={`text-3xl font-bold ${config.color}`}>
                      {milestone.percentage}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${paidOff.toLocaleString()} paid off
                    </p>
                  </div>
                </div>
              </motion.div>

              {milestone.percentage < 100 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center text-sm text-muted-foreground"
                >
                  <p>Keep going! Only ${milestone.currentBalance.toLocaleString()} left to conquer.</p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button onClick={onDismiss} className="w-full">
                  {milestone.percentage === 100 ? 'Celebrate Victory!' : 'Continue Climbing!'}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
