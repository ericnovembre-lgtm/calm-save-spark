import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, TrendingDown, ChevronDown, ChevronUp, Target, Lightbulb, Zap } from 'lucide-react';
import { useBudgetOptimization, CategoryOptimization } from '@/hooks/useBudgetOptimization';

interface CategorySpendOptimizerProps {
  budgets: any[];
  spending: Record<string, any>;
  monthlyIncome: number;
}

export function CategorySpendOptimizer({ budgets, spending, monthlyIncome }: CategorySpendOptimizerProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { optimizeBudget, isOptimizing, result } = useBudgetOptimization();

  const handleAnalyze = () => {
    const categories = budgets.map(b => ({
      name: b.category || b.name,
      currentBudget: Number(b.total_limit) || Number(b.amount) || 0,
      actualSpend: spending[b.id]?.spent_amount || 0,
      isEssential: ['housing', 'utilities', 'groceries', 'transportation', 'insurance'].includes(
        (b.category || b.name || '').toLowerCase()
      ),
    }));

    optimizeBudget({
      monthlyIncome,
      currentBudgets: categories,
      savingsGoal: monthlyIncome * 0.2,
      debtPayments: 0,
      optimizationType: 'category_optimization',
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'hard': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted';
    }
  };

  const optimizations = result?.categoryOptimizations || [];
  const quickWins = result?.quickWins || [];
  const longTermChanges = result?.longTermChanges || [];
  const totalSavings = optimizations.reduce((sum, o) => sum + o.savingsOpportunity, 0);

  if (!result && !isOptimizing) {
    return (
      <Card className="p-6 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border-amber-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              AI Category Optimization
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                Deepseek Reasoner
              </Badge>
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Get AI-powered insights on where to cut spending and optimize each category.
            </p>
            <Button onClick={handleAnalyze} className="mt-4 gap-2" disabled={isOptimizing}>
              {isOptimizing ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Spending
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (isOptimizing) {
    return (
      <Card className="p-8 text-center">
        <motion.div
          className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Brain className="w-8 h-8 text-white" />
        </motion.div>
        <h3 className="text-lg font-semibold mt-4">Analyzing Your Spending...</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Deepseek Reasoner is finding optimization opportunities
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6 bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Savings Potential</p>
            <p className="text-3xl font-bold text-green-500">${totalSavings.toLocaleString()}/mo</p>
            <p className="text-sm text-muted-foreground mt-1">
              ${(totalSavings * 12).toLocaleString()}/year
            </p>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            <Brain className="w-3 h-3 mr-1" />
            AI Optimized
          </Badge>
        </div>
      </Card>

      {/* Quick Wins */}
      {quickWins.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold">Quick Wins</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickWins.map((win, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-3 bg-yellow-500/5 border-yellow-500/20">
                  <p className="text-sm font-medium">{win.action}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className={getDifficultyColor(win.effort)}>
                      {win.effort} effort
                    </Badge>
                    <span className="text-green-500 font-semibold">${win.savings}/mo</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Category Optimizations */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Category Analysis</h3>
        </div>
        <div className="space-y-3">
          {optimizations.map((opt, index) => (
            <motion.div
              key={opt.category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden">
                <button
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedCategory(expandedCategory === opt.category ? null : opt.category)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{opt.category}</span>
                    <Badge variant="outline" className={getDifficultyColor(opt.difficulty)}>
                      {opt.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        ${opt.currentSpend} → ${opt.suggestedBudget}
                      </p>
                      <p className="text-sm font-semibold text-green-500">
                        Save ${opt.savingsOpportunity}
                      </p>
                    </div>
                    {expandedCategory === opt.category ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedCategory === opt.category && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 space-y-4">
                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Spending vs Suggested</span>
                            <span className="font-medium">
                              {Math.round((opt.suggestedBudget / opt.currentSpend) * 100)}%
                            </span>
                          </div>
                          <Progress value={(opt.suggestedBudget / opt.currentSpend) * 100} />
                        </div>

                        {/* Benchmark */}
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Benchmark</p>
                          <p className="text-sm">{opt.benchmark}</p>
                        </div>

                        {/* Tactics */}
                        <div>
                          <p className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                            Tactics to reduce spending
                          </p>
                          <ul className="space-y-2">
                            {opt.tactics.map((tactic, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-primary mt-0.5">•</span>
                                <span>{tactic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Long Term Changes */}
      {longTermChanges.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold">Long-Term Opportunities</h3>
          </div>
          <div className="space-y-3">
            {longTermChanges.map((change, index) => (
              <Card key={index} className="p-4 bg-yellow-500/5 border-yellow-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{change.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">{change.timeframe}</p>
                  </div>
                  <span className="text-green-500 font-semibold">${change.savings}/mo</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Re-analyze Button */}
      <Button variant="outline" onClick={handleAnalyze} className="w-full gap-2">
        <Sparkles className="w-4 h-4" />
        Re-analyze Spending
      </Button>
    </div>
  );
}
