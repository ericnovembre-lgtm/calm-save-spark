import { useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Share2 } from "lucide-react";
import confetti from "canvas-confetti";

interface NegotiationSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant: string;
  monthlySavings: number;
  yearlySavings: number;
}

export function NegotiationSuccessDialog({
  open,
  onOpenChange,
  merchant,
  monthlySavings,
  yearlySavings,
}: NegotiationSuccessDialogProps) {
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
          origin: { x: 0, y: 0.6 },
          colors: ['#22d3ee', '#10b981', '#f59e0b'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#22d3ee', '#10b981', '#f59e0b'],
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
      <DialogContent className="max-w-md bg-slate-900 border-emerald-500/50">
        <div className="text-center space-y-6 py-6">
          {/* Trophy Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="mx-auto w-24 h-24 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center"
          >
            <Trophy className="w-12 h-12 text-white" />
          </motion.div>

          {/* Success Message */}
          <div className="space-y-2">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-foreground"
            >
              Victory!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground"
            >
              Successfully negotiated lower rates with {merchant}
            </motion.p>
          </div>

          {/* Savings Stamp */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: -5 }}
            transition={{ 
              delay: 0.4,
              type: "spring",
              stiffness: 200,
            }}
            className="inline-block p-6 bg-emerald-950/50 border-4 border-emerald-500 rounded-lg rotate-[-5deg]"
          >
            <div className="text-center space-y-1">
              <div className="text-xs font-bold text-emerald-400 tracking-wider">
                ANNUAL SAVINGS
              </div>
              <div className="text-5xl font-bold text-emerald-400 font-mono">
                ${yearlySavings}
              </div>
              <div className="text-sm text-emerald-300">
                ${monthlySavings}/mo saved
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="p-4 bg-slate-800 rounded-lg">
              <TrendingUp className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground font-mono">
                {((monthlySavings / 100) * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">Reduction</div>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg">
              <Trophy className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground font-mono">1</div>
              <div className="text-xs text-muted-foreground">Victory</div>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button
              variant="outline"
              className="w-full border-slate-600"
              onClick={() => {
                const text = `Just saved $${yearlySavings}/year by negotiating my ${merchant} bill! 💪`;
                if (navigator.share) {
                  navigator.share({ text });
                } else {
                  navigator.clipboard.writeText(text);
                }
              }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Success
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-500"
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
