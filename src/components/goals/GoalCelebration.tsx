import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Share2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface GoalCelebrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalName: string;
  amount: number;
}

export const GoalCelebration = ({
  open,
  onOpenChange,
  goalName,
  amount,
}: GoalCelebrationProps) => {
  useEffect(() => {
    if (open) {
      // Trigger confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#d6c8a2', '#faf8f2', '#0a0a0a'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#d6c8a2', '#faf8f2', '#0a0a0a'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex justify-center mb-4"
          >
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
          </motion.div>
          <DialogTitle className="text-center text-2xl">
            🎉 Goal Achieved!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Congratulations on reaching your <strong>{goalName}</strong> goal of ${amount.toLocaleString()}!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-accent/10 rounded-lg p-4 text-center"
          >
            <p className="text-sm text-muted-foreground mb-2">
              You've saved
            </p>
            <p className="text-3xl font-bold text-primary">
              ${amount.toLocaleString()}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-2"
          >
            <Button variant="outline" className="flex-1 gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <TrendingUp className="h-4 w-4" />
              New Goal
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button 
              onClick={() => onOpenChange(false)} 
              className="w-full"
            >
              Continue
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
