import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, ChevronRight, ChevronLeft, Check, DollarSign, PiggyBank, CreditCard } from 'lucide-react';
import { useBudgetOptimization, BudgetCategory, ZeroBasedAllocation } from '@/hooks/useBudgetOptimization';

interface ZeroBasedBudgetWizardProps {
  onComplete?: (allocations: ZeroBasedAllocation[]) => void;
}

export function ZeroBasedBudgetWizard({ onComplete }: ZeroBasedBudgetWizardProps) {
  const [step, setStep] = useState(1);
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [savingsGoal, setSavingsGoal] = useState(500);
  const [debtPayments, setDebtPayments] = useState(0);
  const [categories, setCategories] = useState<BudgetCategory[]>([
    { name: 'Housing', currentBudget: 1500, actualSpend: 1500, isEssential: true },
    { name: 'Utilities', currentBudget: 200, actualSpend: 180, isEssential: true },
    { name: 'Groceries', currentBudget: 400, actualSpend: 450, isEssential: true },
    { name: 'Transportation', currentBudget: 300, actualSpend: 280, isEssential: true },
    { name: 'Insurance', currentBudget: 200, actualSpend: 200, isEssential: true },
    { name: 'Dining Out', currentBudget: 200, actualSpend: 300, isEssential: false },
    { name: 'Entertainment', currentBudget: 150, actualSpend: 200, isEssential: false },
    { name: 'Shopping', currentBudget: 200, actualSpend: 350, isEssential: false },
    { name: 'Subscriptions', currentBudget: 100, actualSpend: 120, isEssential: false },
  ]);

  const { optimizeBudget, isOptimizing, result } = useBudgetOptimization();

  const totalBudget = categories.reduce((sum, c) => sum + c.currentBudget, 0);
  const allocated = totalBudget + savingsGoal + debtPayments;
  const remaining = monthlyIncome - allocated;

  const handleOptimize = () => {
    optimizeBudget({
      monthlyIncome,
      currentBudgets: categories,
      savingsGoal,
      debtPayments,
      optimizationType: 'zero_based',
    });
    setStep(4);
  };

  const steps = [
    { number: 1, title: 'Income', icon: DollarSign },
    { number: 2, title: 'Fixed Costs', icon: CreditCard },
    { number: 3, title: 'Categories', icon: PiggyBank },
    { number: 4, title: 'AI Optimization', icon: Brain },
  ];

  return (
    <Card className="p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, index) => (
          <div key={s.number} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                step >= s.number
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > s.number ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
            </div>
            <span className={`ml-2 text-sm ${step >= s.number ? 'font-medium' : 'text-muted-foreground'}`}>
              {s.title}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-4 ${step > s.number ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Income */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold">Let's start with your income</h2>
              <p className="text-muted-foreground mt-1">
                Enter your monthly take-home pay (after taxes)
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Monthly Income</Label>
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="pl-9 text-2xl font-bold h-14"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} className="gap-2">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Fixed Costs */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold">Fixed obligations</h2>
              <p className="text-muted-foreground mt-1">
                Set your savings goal and debt payments first
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Monthly Savings Goal</Label>
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={savingsGoal}
                    onChange={(e) => setSavingsGoal(Number(e.target.value))}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label>Debt Payments</Label>
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={debtPayments}
                    onChange={(e) => setDebtPayments(Number(e.target.value))}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <Card className="p-4 bg-muted/30">
              <div className="flex items-center justify-between text-sm">
                <span>Available for categories</span>
                <span className="font-semibold">${(monthlyIncome - savingsGoal - debtPayments).toLocaleString()}</span>
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="gap-2">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Categories */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold">Review your categories</h2>
              <p className="text-muted-foreground mt-1">
                Adjust budgets or let AI optimize for you
              </p>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {categories.map((category, index) => (
                <Card key={category.name} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={category.isEssential ? "default" : "secondary"}>
                        {category.isEssential ? 'Essential' : 'Discretionary'}
                      </Badge>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Actual: ${category.actualSpend}</span>
                      <Input
                        type="number"
                        value={category.currentBudget}
                        onChange={(e) => {
                          const newCategories = [...categories];
                          newCategories[index].currentBudget = Number(e.target.value);
                          setCategories(newCategories);
                        }}
                        className="w-24 h-8 text-right"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className={`p-4 ${remaining >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              <div className="flex items-center justify-between">
                <span>Remaining to allocate</span>
                <span className={`text-xl font-bold ${remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${remaining.toLocaleString()}
                </span>
              </div>
              <Progress value={Math.min(100, (allocated / monthlyIncome) * 100)} className="mt-2" />
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              <Button onClick={handleOptimize} className="gap-2" disabled={isOptimizing}>
                {isOptimizing ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    AI Optimize
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: AI Results */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {isOptimizing ? (
              <div className="text-center py-12">
                <motion.div
                  className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Brain className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold mt-4">Deepseek Reasoner Analyzing...</h3>
                <p className="text-muted-foreground mt-2">
                  Creating your optimized zero-based budget
                </p>
              </div>
            ) : result ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Your Optimized Budget</h2>
                    <p className="text-muted-foreground mt-1">
                      AI-generated zero-based budget allocations
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    <Brain className="w-3 h-3 mr-1" />
                    Deepseek Reasoner
                  </Badge>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {result.zeroBasedBudget?.allocations?.map((alloc, index) => (
                    <motion.div
                      key={alloc.category}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                              {alloc.priority}
                            </span>
                            <span className="font-medium">{alloc.category}</span>
                            <Badge variant={alloc.isEssential ? "default" : "secondary"} className="text-xs">
                              {alloc.percentage.toFixed(0)}%
                            </Badge>
                          </div>
                          <span className="font-semibold">${alloc.amount.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 pl-9">{alloc.rationale}</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Allocated</p>
                      <p className="text-lg font-bold">${result.zeroBasedBudget?.totalAllocated?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Savings</p>
                      <p className="text-lg font-bold text-green-500">${result.zeroBasedBudget?.savingsAllocation?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Monthly Increase</p>
                      <p className="text-lg font-bold text-emerald-500">+${result.savingsProjection?.monthlyIncrease?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(3)} className="gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Adjust
                  </Button>
                  <Button 
                    onClick={() => onComplete?.(result.zeroBasedBudget?.allocations || [])} 
                    className="gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Apply Budget
                  </Button>
                </div>
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
