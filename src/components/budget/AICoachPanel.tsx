import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, TrendingDown, PiggyBank, Target, X } from "lucide-react";
import { useBudgetAICoach } from "@/hooks/useBudgetAICoach";
import { fadeInUp } from "@/lib/motion-variants";
import { useState } from "react";

interface AICoachPanelProps {
  budgets: any[];
  spending: Record<string, any>;
}

const ADVICE_TYPES = [
  { id: 'general', label: 'General Tips', icon: Sparkles },
  { id: 'savings', label: 'Save Money', icon: PiggyBank },
  { id: 'overspending', label: 'Fix Overspending', icon: TrendingDown },
  { id: 'optimization', label: 'Optimize Budget', icon: Target },
] as const;

export function AICoachPanel({ budgets, spending }: AICoachPanelProps) {
  const { loading, advice, getAdvice, clearAdvice } = useBudgetAICoach();
  const [selectedType, setSelectedType] = useState<typeof ADVICE_TYPES[number]['id']>('general');

  const handleGetAdvice = () => {
    getAdvice(budgets, spending, selectedType);
  };

  return (
    <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">AI Budget Coach</h3>
          <p className="text-sm text-muted-foreground">Get personalized financial advice</p>
        </div>
        {advice && (
          <Button variant="ghost" size="icon" onClick={clearAdvice}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!advice ? (
          <motion.div
            key="selector"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-2">
              {ADVICE_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  disabled={loading}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedType === type.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <type.icon className={`w-5 h-5 mb-1 ${
                    selectedType === type.id ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <p className="text-sm font-medium text-foreground">{type.label}</p>
                </button>
              ))}
            </div>

            <Button
              onClick={handleGetAdvice}
              disabled={loading || budgets.length === 0}
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Getting advice...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Get AI Advice
                </>
              )}
            </Button>

            {budgets.length === 0 && (
              <p className="text-xs text-center text-muted-foreground">
                Create a budget first to get personalized advice
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="advice"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-4"
          >
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {advice}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={clearAdvice} className="flex-1">
                Close
              </Button>
              <Button onClick={handleGetAdvice} disabled={loading} className="flex-1 gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Get New Advice
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
