import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Brain, Calculator, Calendar, Wallet, TrendingUp, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useRetirementPlanner, RetirementInput } from '@/hooks/useRetirementPlanner';
import { SocialSecurityOptimizer } from '@/components/retirement/SocialSecurityOptimizer';
import { WithdrawalStrategyPanel } from '@/components/retirement/WithdrawalStrategyPanel';
import { RetirementMonteCarloChart } from '@/components/retirement/RetirementMonteCarloChart';

export default function RetirementPlanner() {
  const [showReasoning, setShowReasoning] = useState(false);
  const [input, setInput] = useState<RetirementInput>({
    currentAge: 35,
    retirementAge: 65,
    currentSavings: 100000,
    monthlyContribution: 1000,
    targetRetirementIncome: 60000,
    socialSecurityEstimate: 2000,
    riskTolerance: 'moderate',
    taxBracket: 24,
    accountBalances: {
      traditional401k: 80000,
      rothIra: 15000,
      taxable: 5000,
    },
  });

  const { calculatePlan, isCalculating, result, savedPlan, planLoading } = useRetirementPlanner();

  const handleCalculate = () => {
    calculatePlan(input);
  };

  const updateInput = (field: keyof RetirementInput, value: any) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  const updateAccountBalance = (field: keyof typeof input.accountBalances, value: number) => {
    setInput(prev => ({
      ...prev,
      accountBalances: { ...prev.accountBalances, [field]: value },
    }));
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Calculator className="w-8 h-8 text-primary" />
                Retirement Planner
              </h1>
              <p className="text-muted-foreground mt-1">
                AI-powered retirement planning with Monte Carlo simulations
              </p>
            </div>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              <Brain className="w-3 h-3 mr-1" />
              Deepseek Reasoner
            </Badge>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Personal Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Current Age</Label>
                    <Input
                      type="number"
                      value={input.currentAge}
                      onChange={(e) => updateInput('currentAge', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Retirement Age</Label>
                    <Input
                      type="number"
                      value={input.retirementAge}
                      onChange={(e) => updateInput('retirementAge', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Risk Tolerance</Label>
                  <Select
                    value={input.riskTolerance}
                    onValueChange={(v) => updateInput('riskTolerance', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tax Bracket (%)</Label>
                  <Input
                    type="number"
                    value={input.taxBracket}
                    onChange={(e) => updateInput('taxBracket', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Account Balances
              </h2>
              <div className="space-y-4">
                <div>
                  <Label>Traditional 401(k)/IRA</Label>
                  <Input
                    type="number"
                    value={input.accountBalances.traditional401k}
                    onChange={(e) => updateAccountBalance('traditional401k', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Roth IRA</Label>
                  <Input
                    type="number"
                    value={input.accountBalances.rothIra}
                    onChange={(e) => updateAccountBalance('rothIra', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Taxable Brokerage</Label>
                  <Input
                    type="number"
                    value={input.accountBalances.taxable}
                    onChange={(e) => updateAccountBalance('taxable', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Contributions & Goals
              </h2>
              <div className="space-y-4">
                <div>
                  <Label>Monthly Contribution</Label>
                  <Input
                    type="number"
                    value={input.monthlyContribution}
                    onChange={(e) => updateInput('monthlyContribution', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Target Annual Income (Retirement)</Label>
                  <Input
                    type="number"
                    value={input.targetRetirementIncome}
                    onChange={(e) => updateInput('targetRetirementIncome', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Est. Social Security (at 67)</Label>
                  <Input
                    type="number"
                    value={input.socialSecurityEstimate}
                    onChange={(e) => updateInput('socialSecurityEstimate', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            <Button onClick={handleCalculate} className="w-full gap-2" size="lg" disabled={isCalculating}>
              {isCalculating ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  Calculating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Calculate Retirement Plan
                </>
              )}
            </Button>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="monte-carlo">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="monte-carlo">Monte Carlo</TabsTrigger>
                <TabsTrigger value="social-security">Social Security</TabsTrigger>
                <TabsTrigger value="withdrawal">Withdrawal Strategy</TabsTrigger>
              </TabsList>

              <TabsContent value="monte-carlo" className="mt-6">
                <RetirementMonteCarloChart
                  results={result?.monteCarloResults}
                  retirementAge={input.retirementAge}
                  isLoading={isCalculating}
                />
              </TabsContent>

              <TabsContent value="social-security" className="mt-6">
                <SocialSecurityOptimizer
                  analysis={result?.socialSecurityAnalysis}
                  isLoading={isCalculating}
                />
              </TabsContent>

              <TabsContent value="withdrawal" className="mt-6">
                <WithdrawalStrategyPanel
                  strategy={result?.withdrawalStrategy}
                  isLoading={isCalculating}
                />
              </TabsContent>
            </Tabs>

            {/* Recommendations */}
            {result?.recommendations && result.recommendations.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">AI Recommendations</h3>
                <div className="space-y-3">
                  {result.recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-4 bg-muted/30">
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {rec.priority}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium">{rec.action}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>Impact: {rec.impact}</span>
                              <span>Timeline: {rec.timeline}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}

            {/* AI Reasoning */}
            {result?.reasoning && (
              <Card className="p-4">
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between"
                  onClick={() => setShowReasoning(!showReasoning)}
                >
                  <span className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Show AI Mathematical Reasoning
                  </span>
                  {showReasoning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                {showReasoning && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-4 p-4 rounded-lg bg-muted/50 text-sm font-mono whitespace-pre-wrap max-h-96 overflow-y-auto"
                  >
                    {result.chainOfThought || result.reasoning}
                  </motion.div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
