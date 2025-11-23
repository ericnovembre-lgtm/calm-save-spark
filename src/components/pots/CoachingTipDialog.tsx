import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";

interface CoachingTipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tip: string | null;
  isLoading: boolean;
  potName: string;
}

export const CoachingTipDialog = ({
  open,
  onOpenChange,
  tip,
  isLoading,
  potName,
}: CoachingTipDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-background/95 via-background/90 to-primary/5 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Coach's Insight
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="text-sm text-muted-foreground font-medium">
            For: {potName}
          </div>
          
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 space-y-3"
            >
              <div className="relative">
                <Sparkles className="w-8 h-8 text-primary animate-spin" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                />
              </div>
              <p className="text-muted-foreground animate-pulse">
                Analyzing your goal...
              </p>
            </motion.div>
          ) : tip ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-lg blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative p-6 rounded-lg border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
                <TrendingUp className="w-5 h-5 text-primary mb-3" />
                <p className="text-base leading-relaxed text-foreground">
                  {tip}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No tip available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
