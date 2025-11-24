import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TokenHolding {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  change24h: number;
  isStablecoin?: boolean;
}

interface RiskAnalysis {
  riskLevel: 'low' | 'medium' | 'high';
  volatilePercent: number;
  stablePercent: number;
  assessment: string;
  tip: string;
  concentrationWarning?: string;
}

interface PortfolioRiskAnalystProps {
  tokens: TokenHolding[];
}

export function PortfolioRiskAnalyst({ tokens }: PortfolioRiskAnalystProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);

  const analyzePortfolio = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('wallet-ai-assistant', {
        body: { action: 'analyze_portfolio', tokens }
      });

      if (error) throw error;
      setAnalysis(data);
    } catch (error) {
      console.error('Failed to analyze portfolio:', error);
      toast.error('Failed to analyze portfolio');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return CheckCircle;
      case 'medium': return AlertTriangle;
      case 'high': return AlertTriangle;
      default: return Brain;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Portfolio Risk Analyst</h3>
            <p className="text-sm text-muted-foreground">AI-powered risk assessment</p>
          </div>
        </div>
        <Button
          onClick={analyzePortfolio}
          disabled={isAnalyzing}
          size="sm"
          className="gap-2"
        >
          {isAnalyzing ? (
            <>
              <Brain className="w-4 h-4 animate-pulse" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Scan
            </>
          )}
        </Button>
      </div>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {/* Risk Level Gauge */}
          <div className="flex items-center gap-4 p-4 bg-background/50 rounded-xl">
            {(() => {
              const RiskIcon = getRiskIcon(analysis.riskLevel);
              return <RiskIcon className={`w-6 h-6 ${getRiskColor(analysis.riskLevel)}`} />;
            })()}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Risk Level</span>
                <span className={`text-sm font-bold uppercase ${getRiskColor(analysis.riskLevel)}`}>
                  {analysis.riskLevel}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: analysis.riskLevel === 'low' ? '33%' : 
                           analysis.riskLevel === 'medium' ? '66%' : '100%' 
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full ${
                    analysis.riskLevel === 'low' ? 'bg-green-500' :
                    analysis.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Asset Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="text-2xl font-bold text-red-500">{analysis.volatilePercent}%</div>
              <div className="text-xs text-muted-foreground">Volatile Assets</div>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="text-2xl font-bold text-green-500">{analysis.stablePercent}%</div>
              <div className="text-xs text-muted-foreground">Stable Assets</div>
            </div>
          </div>

          {/* AI Assessment */}
          <div className="p-4 bg-background/50 rounded-xl space-y-3">
            <div className="flex items-start gap-2">
              <Brain className="w-4 h-4 text-primary mt-1 shrink-0" />
              <p className="text-sm text-foreground leading-relaxed">{analysis.assessment}</p>
            </div>
            
            <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-primary mb-1">Diversification Tip</div>
                <p className="text-xs text-muted-foreground">{analysis.tip}</p>
              </div>
            </div>

            {analysis.concentrationWarning && (
              <div className="flex items-start gap-2 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                <p className="text-xs text-yellow-600 dark:text-yellow-400">{analysis.concentrationWarning}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
