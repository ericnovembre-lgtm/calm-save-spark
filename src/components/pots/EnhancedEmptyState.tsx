import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Sparkles, Plus, Zap } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface EnhancedEmptyStateProps {
  onQuickCreate: (dream: string) => void;
}

const QUICK_DREAMS = [
  { icon: "🏝️", text: "Vacation to Hawaii", amount: 5000 },
  { icon: "💻", text: "New MacBook", amount: 2500 },
  { icon: "🚗", text: "Car down payment", amount: 10000 },
  { icon: "🎓", text: "Education fund", amount: 15000 },
];

export const EnhancedEmptyState = ({ onQuickCreate }: EnhancedEmptyStateProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Hero Message */}
      <div className="text-center py-12">
        <motion.div
          initial={prefersReducedMotion ? false : { scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-block mb-6"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
        </motion.div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Start Your First Savings Vault
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
          Watch your dreams materialize as your savings grow. Each vault gets its own visual progress tracker.
        </p>
      </div>

      {/* Quick Create Suggestions */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Quick Start Ideas</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_DREAMS.map((dream, index) => (
            <motion.div
              key={dream.text}
              initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                onClick={() => onQuickCreate(dream.text)}
                className="p-4 cursor-pointer border-border/40 bg-glass-subtle hover:bg-glass hover:border-primary/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{dream.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {dream.text}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ~${dream.amount.toLocaleString()}
                    </p>
                  </div>
                  <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Instruction Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-6">
        <Card className="p-4 bg-glass-subtle border-border/40">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">AI-Powered</p>
              <p className="text-xs text-muted-foreground">
                Type your dream and AI will suggest an amount and find a perfect image
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-glass-subtle border-border/40">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Manual Control</p>
              <p className="text-xs text-muted-foreground">
                Click "+ Manual" for precise control over every detail
              </p>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};
