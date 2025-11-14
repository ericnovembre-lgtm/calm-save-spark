import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { NeutralConfetti } from './NeutralConfetti';
import { useCelebrationSounds } from '@/hooks/useCelebrationSounds';
import { haptics } from '@/lib/haptics';
import { type Milestone } from '@/hooks/useMilestoneDetector';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface MilestoneCelebrationProps {
  milestone: Milestone | null;
  onDismiss: () => void;
}

const confettiConfig = {
  bronze: { count: 30, duration: 2500 },
  silver: { count: 40, duration: 3000 },
  gold: { count: 50, duration: 3500 },
  diamond: { count: 60, duration: 4000 },
  rainbow: { count: 80, duration: 5000 },
};

export function MilestoneCelebration({ milestone, onDismiss }: MilestoneCelebrationProps) {
  const { playSuccessChime, playConfettiPop } = useCelebrationSounds();

  useEffect(() => {
    if (milestone) {
      // Trigger celebration effects
      playSuccessChime();
      setTimeout(() => playConfettiPop(), 300);
      haptics.achievementUnlocked();
    }
  }, [milestone, playSuccessChime, playConfettiPop]);

  const handleShare = () => {
    if (!milestone) return;

    const text = `🎉 I just saved $${milestone.amount.toLocaleString()} with $ave+! ${milestone.message}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Milestone Achieved: ${milestone.label}`,
        text,
        url: window.location.origin
      }).catch(() => {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    }
  };

  if (!milestone) return null;

  const config = confettiConfig[milestone.confettiType];

  return (
    <AnimatePresence>
      <Dialog open={!!milestone} onOpenChange={onDismiss}>
        <DialogContent className="sm:max-w-md overflow-hidden border-2 border-primary/20">
          {/* Confetti */}
          <NeutralConfetti 
            show={!!milestone} 
            duration={config.duration}
            count={config.count}
          />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.5, 
              ease: [0.22, 1, 0.36, 1],
              delay: 0.2 
            }}
            className="text-center space-y-6 py-8"
          >
            {/* Trophy Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                duration: 0.6, 
                ease: [0.34, 1.56, 0.64, 1],
                delay: 0.3 
              }}
              className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
            >
              <Trophy className="w-12 h-12 text-primary" />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                {milestone.label}!
              </h2>
              <p className="text-lg text-muted-foreground">
                {milestone.message}
              </p>
            </motion.div>

            {/* Amount Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="inline-block px-8 py-4 bg-primary/10 rounded-2xl border border-primary/20"
            >
              <p className="text-4xl font-display font-bold text-primary">
                ${milestone.amount.toLocaleString()}
              </p>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex gap-3 justify-center"
            >
              <Button
                onClick={handleShare}
                variant="default"
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Achievement
              </Button>
              <Button
                onClick={onDismiss}
                variant="outline"
                size="icon"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
}
