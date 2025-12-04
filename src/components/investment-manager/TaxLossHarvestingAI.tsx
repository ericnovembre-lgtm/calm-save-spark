import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Receipt, Brain, ChevronDown, ChevronUp, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { usePortfolioOptimization, TaxLossHarvestingAction } from '@/hooks/usePortfolioOptimization';
import { formatDistanceToNow } from 'date-fns';

interface TaxLossHarvestingAIProps {
  holdings: any[];
  taxBracket?: number;
}

export function TaxLossHarvestingAI({ holdings, taxBracket = 24 }: TaxLossHarvestingAIProps) {
  const [showReasoning, setShowReasoning] = useState(false);
  const { optimizePortfolio, isOptimizing, result } = usePortfolioOptimization();

  const handleAnalyze = () => {
    const formattedHoldings = holdings.map(h => ({
      symbol: h.symbol || h.ticker,
      shares: h.quantity || h.shares || 0,
      costBasis: h.cost_basis || h.shares * h.average_cost || 0,
      currentPrice: h.current_price || h.market_value / h.shares || 0,
      purchaseDate: h.purchase_date || new Date().toISOString(),
      accountType: (h.account_type as 'taxable' | 'ira' | 'roth') || 'taxable',
    }));

    optimizePortfolio({
      holdings: formattedHoldings,
      riskTolerance: 'moderate',
      taxBracket,
      optimizationType: 'tax_loss_harvest',
    });
  };

  const tlhActions = result?.taxLossHarvestingActions || [];
  const taxAnalysis = result?.taxAnalysis;

  if (!result && !isOptimizing) {
    return (
      <Card className="p-6 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border-emerald-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              AI Tax-Loss Harvesting Analysis
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                Deepseek Reasoner
              </Badge>
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Use advanced AI reasoning to identify tax-loss harvesting opportunities with wash sale compliance.
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
                  Analyze Portfolio
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
          className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Brain className="w-8 h-8 text-white" />
        </motion.div>
        <h3 className="text-lg font-semibold mt-4">Deepseek Reasoner Analyzing...</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Running mathematical analysis on your portfolio for optimal tax-loss harvesting strategies.
        </p>
      </Card>
    );
  }

  if (tlhActions.length === 0) {
    return (
      <Card className="p-12 text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 mx-auto text-green-600" />
        <div>
          <h3 className="text-lg font-semibold">All Clear!</h3>
          <p className="text-muted-foreground mt-2">
            No tax-loss harvesting opportunities detected at this time.
          </p>
        </div>
        <Button variant="outline" onClick={handleAnalyze} className="gap-2">
          <Sparkles className="w-4 h-4" />
          Re-analyze
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="p-6 bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
        <div className="flex items-start gap-4">
          <Receipt className="w-8 h-8 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Potential Tax Savings Available</h3>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                Deepseek Reasoner
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              We've identified {tlhActions.length} tax-loss harvesting opportunities that could save you{' '}
              <span className="font-bold text-green-600">
                ${tlhActions.reduce((sum, a) => sum + a.taxSavings, 0).toLocaleString()}
              </span>{' '}
              in taxes this year.
            </p>
            {taxAnalysis && (
              <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <p className="text-muted-foreground">Unrealized Gains</p>
                  <p className="font-semibold text-green-600">${taxAnalysis.totalUnrealizedGains.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10">
                  <p className="text-muted-foreground">Unrealized Losses</p>
                  <p className="font-semibold text-red-600">${taxAnalysis.totalUnrealizedLosses.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10">
                  <p className="text-muted-foreground">Tax Savings</p>
                  <p className="font-semibold text-emerald-600">${taxAnalysis.potentialTaxSavings.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* TLH Actions */}
      <div className="grid gap-4">
        <AnimatePresence>
          {tlhActions.map((action, index) => (
            <motion.div
              key={action.sellSymbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-semibold">{action.sellSymbol}</h4>
                      {new Date(action.washSaleDate) > new Date() && (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Wash Sale Risk
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center gap-4">
                        <p className="text-muted-foreground">
                          Sell <span className="font-semibold text-foreground">{action.sellShares} shares</span>
                        </p>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        {action.replacementSymbol && (
                          <p className="text-muted-foreground">
                            Replace with <span className="font-semibold text-foreground">{action.replacementSymbol}</span>
                            {action.correlation > 0 && (
                              <span className="text-xs ml-1">({Math.round(action.correlation * 100)}% correlation)</span>
                            )}
                          </p>
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        Estimated Tax Savings:{' '}
                        <span className="font-semibold text-green-600">
                          ${action.taxSavings.toLocaleString()}
                        </span>
                      </p>
                      {new Date(action.washSaleDate) > new Date() && (
                        <div className="flex items-center gap-2 text-yellow-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">
                            Wait until {new Date(action.washSaleDate).toLocaleDateString()} to repurchase (
                            {formatDistanceToNow(new Date(action.washSaleDate), { addSuffix: true })})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button size="sm" className="gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Execute Harvest
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* AI Reasoning Panel */}
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
          <AnimatePresence>
            {showReasoning && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-4 rounded-lg bg-muted/50 text-sm font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {result.chainOfThought || result.reasoning}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}
    </div>
  );
}
